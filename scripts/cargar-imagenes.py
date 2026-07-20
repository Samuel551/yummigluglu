#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Carga masiva de imagenes de recetas — Yummi Glu Glu
===================================================

Convierte los PNG locales a WebP, los sube al bucket `recetas-imagenes` de
Supabase Storage y actualiza `public.recetas.imagen_url` con la URL publica.

POR DEFECTO NO TOCA NADA (dry-run). Hay que pasar `--ejecutar` explicitamente.

-----------------------------------------------------------------------------
CREDENCIALES
-----------------------------------------------------------------------------
El script necesita la SERVICE ROLE KEY del proyecto Supabase (subir a Storage y
hacer UPDATE en `recetas` requiere saltear RLS). NO esta hardcodeada ni se lee
de `.env.local` a proposito: se toma de una variable de entorno.

    PowerShell:
        $env:SUPABASE_SERVICE_ROLE_KEY = "eyJ..."

    bash / git bash:
        export SUPABASE_SERVICE_ROLE_KEY="eyJ..."

La key se saca de: Supabase Dashboard -> Project Settings -> API -> service_role.
Es una credencial de administrador total: no la pegues en el repo, ni en un
commit, ni en un log, ni la compartas por chat.

Opcionalmente se puede sobreescribir la URL del proyecto con SUPABASE_URL.

-----------------------------------------------------------------------------
USO
-----------------------------------------------------------------------------
    python scripts/cargar-imagenes.py                  # dry-run (default)
    python scripts/cargar-imagenes.py --ejecutar       # sube y actualiza de verdad
    python scripts/cargar-imagenes.py --ejecutar --solo arroz-con-pollo-suave
    python scripts/cargar-imagenes.py --ejecutar --forzar-conversion
    python scripts/cargar-imagenes.py --ejecutar --limite 5   # prueba acotada

Requisitos: Python 3 + Pillow (`pip install Pillow`). No usa dependencias
externas para HTTP: va con urllib de la stdlib.

-----------------------------------------------------------------------------
IDEMPOTENCIA
-----------------------------------------------------------------------------
- Cada imagen se sube como `{slug}.webp` (nombre estable y derivado del slug),
  con upsert -> re-correr sobrescribe el mismo objeto, nunca duplica.
- Los WebP se cachean en `scripts/salida-webp/`. Si el WebP ya existe y es mas
  nuevo que el PNG de origen, no se reconvierte (usar --forzar-conversion para
  rehacerlo). Asi, si el proceso se corta a mitad, re-correrlo retoma sin
  reconvertir las 200 imagenes de nuevo.
- El UPDATE es idempotente: escribe siempre la misma URL para el mismo slug.
- Los PNG originales NUNCA se modifican ni se mueven; solo se leen.
"""

import argparse
import io
import json
import mimetypes
import os
import sys
import time
import urllib.error
import urllib.request

# --- Configuracion -----------------------------------------------------------

URL_PROYECTO_DEFAULT = "https://uoqzkbbnesmvmgbjikrn.supabase.co"
BUCKET = "recetas-imagenes"

DIR_SCRIPT = os.path.dirname(os.path.abspath(__file__))
RUTA_MAPEO = os.path.join(DIR_SCRIPT, "mapeo-imagenes.json")
DIR_SALIDA = os.path.join(DIR_SCRIPT, "salida-webp")

# Parametros de conversion (acordados con el owner)
LADO_MAYOR = 1200
CALIDAD = 82
METHOD = 6


# --- Utilidades --------------------------------------------------------------

def log(msg):
    print(msg, flush=True)


def mb(n):
    return "%.2f MB" % (n / 1024 / 1024)


def abortar(msg):
    log("\nERROR: " + msg)
    sys.exit(1)


def cargar_mapeo():
    """Lee el mapeo congelado. El script NO adivina: si algo no esta aca, no se sube."""
    if not os.path.exists(RUTA_MAPEO):
        abortar(
            "no encuentro el mapeo en %s.\n"
            "Ese archivo es la fuente de verdad aprobada; sin el, el script no corre."
            % RUTA_MAPEO
        )
    with io.open(RUTA_MAPEO, encoding="utf-8") as f:
        datos = json.load(f)
    entradas = datos.get("entradas", [])
    if not entradas:
        abortar("el mapeo esta vacio.")

    slugs = [e["slug"] for e in entradas]
    if len(slugs) != len(set(slugs)):
        abortar("hay slugs repetidos en el mapeo. Revisalo a mano antes de seguir.")

    log("Mapeo cargado: %d entradas (version %s, generado %s)"
        % (len(entradas), datos.get("version"), datos.get("generado")))
    return datos, entradas


def obtener_credenciales(ejecutar):
    """La service role key solo hace falta si se va a ejecutar de verdad."""
    url = os.environ.get("SUPABASE_URL", URL_PROYECTO_DEFAULT).rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if ejecutar and not key:
        abortar(
            "falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY.\n\n"
            "  PowerShell:  $env:SUPABASE_SERVICE_ROLE_KEY = \"eyJ...\"\n"
            "  bash:        export SUPABASE_SERVICE_ROLE_KEY=\"eyJ...\"\n\n"
            "La sacas de Supabase Dashboard -> Project Settings -> API -> service_role.\n"
            "NO la pegues en el repo ni en .env.local."
        )
    return url, key


# --- Conversion --------------------------------------------------------------

def convertir_a_webp(ruta_png, ruta_webp, forzar=False):
    """
    Convierte un PNG a WebP con el lado mayor en LADO_MAYOR px, preservando el
    aspect ratio. No toca el original. Devuelve (bytes_entrada, bytes_salida, reusado).
    """
    bytes_in = os.path.getsize(ruta_png)

    # Cache: si ya existe y es mas nuevo que el origen, lo reusamos (idempotencia).
    if not forzar and os.path.exists(ruta_webp):
        if os.path.getmtime(ruta_webp) >= os.path.getmtime(ruta_png):
            return bytes_in, os.path.getsize(ruta_webp), True

    from PIL import Image  # import perezoso: dry-run sin Pillow igual reporta

    with Image.open(ruta_png) as im:
        im = im.convert("RGB")
        ancho, alto = im.size
        escala = LADO_MAYOR / float(max(ancho, alto))
        if escala < 1:
            nuevo = (int(round(ancho * escala)), int(round(alto * escala)))
            im = im.resize(nuevo, Image.LANCZOS)
        # Escritura atomica: primero a .tmp y despues rename, para que un corte
        # a mitad de camino no deje un WebP truncado que la cache de por bueno.
        tmp = ruta_webp + ".tmp"
        im.save(tmp, "WEBP", quality=CALIDAD, method=METHOD)
        os.replace(tmp, ruta_webp)

    return bytes_in, os.path.getsize(ruta_webp), False


# --- Supabase ----------------------------------------------------------------

def pedir(url, metodo, key, datos=None, content_type=None, extra=None):
    """Request minimo contra la API de Supabase usando la stdlib."""
    cabeceras = {
        "apikey": key,
        "Authorization": "Bearer " + key,
    }
    if content_type:
        cabeceras["Content-Type"] = content_type
    if extra:
        cabeceras.update(extra)

    req = urllib.request.Request(url, data=datos, headers=cabeceras, method=metodo)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def subir_webp(url_base, key, slug, ruta_webp):
    """
    Sube el WebP como {slug}.webp con upsert (sobrescribe si ya existe).
    Devuelve (ok, detalle).
    """
    destino = "%s/storage/v1/object/%s/%s.webp" % (url_base, BUCKET, slug)
    with open(ruta_webp, "rb") as f:
        cuerpo = f.read()

    estado, respuesta = pedir(
        destino, "POST", key, datos=cuerpo,
        content_type="image/webp",
        # x-upsert hace que re-correr el script sobrescriba en vez de fallar por duplicado
        extra={"x-upsert": "true", "cache-control": "public, max-age=31536000"},
    )
    if estado in (200, 201):
        return True, ""
    return False, "HTTP %s %s" % (estado, respuesta[:300].decode("utf-8", "replace"))


def url_publica(url_base, slug):
    return "%s/storage/v1/object/public/%s/%s.webp" % (url_base, BUCKET, slug)


def actualizar_receta(url_base, key, slug, imagen_url):
    """UPDATE public.recetas SET imagen_url = ... WHERE slug = ... (via PostgREST)."""
    destino = "%s/rest/v1/recetas?slug=eq.%s" % (url_base, urllib.request.quote(slug))
    cuerpo = json.dumps({"imagen_url": imagen_url}).encode("utf-8")
    estado, respuesta = pedir(
        destino, "PATCH", key, datos=cuerpo,
        content_type="application/json",
        extra={"Prefer": "return=representation"},
    )
    if estado not in (200, 204):
        return False, "HTTP %s %s" % (estado, respuesta[:300].decode("utf-8", "replace"))
    # Con return=representation, una lista vacia significa que ningun slug matcheo.
    if estado == 200:
        try:
            filas = json.loads(respuesta.decode("utf-8"))
            if isinstance(filas, list) and len(filas) == 0:
                return False, "ningun registro con slug '%s' (revisa el mapeo)" % slug
        except ValueError:
            pass
    return True, ""


# --- Proceso principal -------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(
        description="Convierte, sube y enlaza las imagenes de recetas. Dry-run por defecto.")
    ap.add_argument("--ejecutar", action="store_true",
                    help="Aplica los cambios de verdad (sube a Storage y hace UPDATE). "
                         "Sin este flag no se toca nada.")
    ap.add_argument("--solo", metavar="SLUG", action="append",
                    help="Procesa solo estos slugs (se puede repetir).")
    ap.add_argument("--limite", type=int, help="Procesa como maximo N entradas.")
    ap.add_argument("--forzar-conversion", action="store_true",
                    help="Reconvierte los WebP aunque ya existan en cache.")
    args = ap.parse_args()

    modo = "EJECUCION REAL" if args.ejecutar else "DRY-RUN (no se modifica nada)"
    log("=" * 70)
    log("  Carga de imagenes de recetas — Yummi Glu Glu")
    log("  Modo: %s" % modo)
    log("=" * 70)

    _, entradas = cargar_mapeo()
    url_base, key = obtener_credenciales(args.ejecutar)

    if args.solo:
        pedidos = set(args.solo)
        entradas = [e for e in entradas if e["slug"] in pedidos]
        faltan = pedidos - {e["slug"] for e in entradas}
        if faltan:
            abortar("estos slugs no estan en el mapeo: %s" % ", ".join(sorted(faltan)))
    if args.limite:
        entradas = entradas[:args.limite]

    if not os.path.isdir(DIR_SALIDA):
        os.makedirs(DIR_SALIDA)

    total = len(entradas)
    log("A procesar: %d recetas\n" % total)

    convertidas = reusadas = subidas = actualizadas = 0
    salteadas, fallidas = [], []
    bytes_in = bytes_out = 0
    t0 = time.time()

    for i, e in enumerate(entradas, 1):
        slug = e["slug"]
        ruta_carpeta = os.path.join(DIRECTORIO_IMAGENES, e["carpeta"])
        prefijo = "[%3d/%d] %-42s" % (i, total, slug[:42])

        # --- carpeta vacia o PNG ausente: se reporta y se saltea, no aborta ---
        if not os.path.isdir(ruta_carpeta):
            log(prefijo + " SALTEADA (no existe la carpeta)")
            salteadas.append((slug, "carpeta inexistente: %s" % e["carpeta"]))
            continue

        nombre_png = e.get("png")
        ruta_png = os.path.join(ruta_carpeta, nombre_png) if nombre_png else None
        if not nombre_png or not os.path.exists(ruta_png):
            # Fallback: cualquier PNG suelto dentro de la carpeta.
            candidatos = sorted(f for f in os.listdir(ruta_carpeta)
                                if f.lower().endswith(".png"))
            if not candidatos:
                log(prefijo + " SALTEADA (carpeta vacia, imagen pendiente)")
                salteadas.append((slug, "carpeta vacia: %s" % e["carpeta"]))
                continue
            ruta_png = os.path.join(ruta_carpeta, candidatos[0])

        ruta_webp = os.path.join(DIR_SALIDA, slug + ".webp")

        # --- conversion ---
        try:
            b_in, b_out, reusado = convertir_a_webp(
                ruta_png, ruta_webp, forzar=args.forzar_conversion)
        except Exception as ex:  # noqa: BLE001 — queremos seguir con el resto
            log(prefijo + " FALLO al convertir: %s" % ex)
            fallidas.append((slug, "conversion: %s" % ex))
            continue

        bytes_in += b_in
        bytes_out += b_out
        if reusado:
            reusadas += 1
        else:
            convertidas += 1

        destino_url = url_publica(url_base, slug)

        if not args.ejecutar:
            log(prefijo + " %8s -> %7s  %s  [dry-run]"
                % (mb(b_in), mb(b_out), "cache" if reusado else "convertida"))
            continue

        # --- subida ---
        ok, detalle = subir_webp(url_base, key, slug, ruta_webp)
        if not ok:
            log(prefijo + " FALLO al subir: %s" % detalle)
            fallidas.append((slug, "subida: %s" % detalle))
            continue
        subidas += 1

        # --- update ---
        ok, detalle = actualizar_receta(url_base, key, slug, destino_url)
        if not ok:
            log(prefijo + " subida OK pero FALLO el UPDATE: %s" % detalle)
            fallidas.append((slug, "update: %s" % detalle))
            continue
        actualizadas += 1
        log(prefijo + " %8s -> %7s  subida + actualizada" % (mb(b_in), mb(b_out)))

    # --- resumen ---
    seg = time.time() - t0
    log("\n" + "=" * 70)
    log("  RESUMEN — %s" % modo)
    log("=" * 70)
    log("  Entradas procesadas ....... %d de %d" % (total - len(salteadas), total))
    log("  Convertidas ............... %d" % convertidas)
    log("  Reusadas de cache ......... %d" % reusadas)
    log("  Subidas a Storage ......... %d" % subidas)
    log("  Recetas actualizadas ...... %d" % actualizadas)
    log("  Salteadas ................. %d" % len(salteadas))
    log("  Fallidas .................. %d" % len(fallidas))
    log("  Peso original ............. %s" % mb(bytes_in))
    log("  Peso tras WebP ............ %s" % mb(bytes_out))
    if bytes_in:
        log("  Reduccion ................. %.1f%%" % (100 * (1 - bytes_out / float(bytes_in))))
    log("  Tiempo .................... %.1f s" % seg)

    if salteadas:
        log("\n  Salteadas (imagen pendiente, no es un error):")
        for slug, motivo in salteadas:
            log("    - %-42s %s" % (slug, motivo))

    if fallidas:
        log("\n  FALLIDAS (re-corre el script para reintentar solo estas):")
        for slug, motivo in fallidas:
            log("    - %-42s %s" % (slug, motivo))
        log("\n    Ejemplo: python scripts/cargar-imagenes.py --ejecutar %s"
            % " ".join("--solo %s" % s for s, _ in fallidas[:5]))

    if not args.ejecutar:
        log("\n  Esto fue un DRY-RUN: no se subio ni se actualizo nada.")
        log("  Para aplicar de verdad: python scripts/cargar-imagenes.py --ejecutar")

    return 1 if fallidas else 0


# Directorio de origen de los PNG: sale del propio mapeo para no duplicar la constante.
def _resolver_directorio_imagenes():
    if os.path.exists(RUTA_MAPEO):
        with io.open(RUTA_MAPEO, encoding="utf-8") as f:
            return json.load(f).get("origen_imagenes", r"D:\Proyectos\recetas\imagenes")
    return r"D:\Proyectos\recetas\imagenes"


DIRECTORIO_IMAGENES = _resolver_directorio_imagenes()


if __name__ == "__main__":
    sys.exit(main())
