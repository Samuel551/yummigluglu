/**
 * Descarta una receta entera de la produccion de videos, por numero.
 *
 *   node scripts/descartar-receta.mjs 215
 *
 * Mueve a cuarentena todo lo que esa receta tenga en disco:
 *
 *   clips\NNN          ->  clips\_descartados\NNN
 *   videos\NNN — Algo  ->  videos\_descartados\NNN — Algo
 *
 * 🔴 NO BORRA NADA, y es a proposito. Cada clip son 5 s generados con IA que
 * cuestan tiempo y credito, y el resultado no vuelve igual al regenerarlo.
 * Vaciar la cuarentena es un `rm -rf` de una linea que el owner corre cuando ya
 * esta seguro; recuperar un clip borrado no es nada.
 *
 * La UNICA excepcion es una carpeta de video VACIA: ahi no hay nada que
 * preservar, asi que se elimina directo con rmdir.
 *
 * ⚠️ LOS DOS ARBOLES NUMERAN DISTINTO, y hay que resolverlo por VALOR del
 * numero, nunca comparando strings:
 *
 *   clips\   -> con ceros a la izquierda, 3 digitos : `001`, `093`, `215`
 *   videos\  -> sin ceros, y con el titulo pegado   : `93 — Algo`, `215 — Algo`
 *
 * Por eso da igual si le pasas `7`, `07` o `007`. Comparando strings,
 * `'7' === '007'` da false y el script diria "no existe" sobre una receta que SI
 * esta — y el owner creeria que ya la habia descartado.
 *
 * ⚠️ NO toca documentacion. `docs/contenido/recetas-blw-prompts-video.md` y
 * `CLAUDE.md` se editan a mano y los revisa una persona: ahi vive el POR QUE se
 * descarto, y eso no lo puede escribir un script.
 *
 * 🔴 NO RENUMERA las recetas que quedan. El numero es la clave que ata
 * `clips\NNN` <-> `videos\NNN — Algo` <-> el orden del documento. Renumerar para
 * "tapar el hueco" obligaria a renombrar carpetas en los dos arboles y romperia
 * esa correspondencia. El hueco es informacion: dice que ahi hubo una receta y
 * se cayo.
 *
 * Idempotente: si ya se corrio, no hace nada y sale con 0.
 */
import { readdirSync, statSync, renameSync, existsSync, mkdirSync, rmdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR_CLIPS = 'D:\\Proyectos\\recetas\\clips';
const DIR_VIDEOS = 'D:\\Proyectos\\recetas\\videos';

const numero = process.argv[2];

if (!/^\d+$/.test(numero ?? '')) {
  console.error('Uso: node scripts/descartar-receta.mjs <numero>');
  console.error('Ej.: node scripts/descartar-receta.mjs 215');
  process.exit(1);
}

// El numero como VALOR: una sola fuente de verdad para los dos formatos.
const buscado = Number(numero);

const mb = (b) => (b / 1024 / 1024).toFixed(1);

/** Suma el peso de los archivos de un directorio (sin recursion: no hace falta). */
const pesoDe = (dir) =>
  readdirSync(dir).reduce((total, f) => {
    const st = statSync(join(dir, f));
    return total + (st.isFile() ? st.size : 0);
  }, 0);

/** Mueve `origen` dentro de `dirCuarentena`, creandola si no existe. */
function aCuarentena(origen, dirCuarentena, nombreDestino) {
  if (!existsSync(dirCuarentena)) mkdirSync(dirCuarentena);
  const destino = join(dirCuarentena, nombreDestino);
  if (existsSync(destino)) {
    console.warn(`  [!] ya hay algo en cuarentena con ese nombre, se saltea: ${nombreDestino}`);
    return false;
  }
  renameSync(origen, destino);
  return true;
}

/** Subdirectorios de `dir`, salteando los de servicio (`_...`). */
const subdirs = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).filter(
        (d) => !d.startsWith('_') && !d.startsWith('.') && statSync(join(dir, d)).isDirectory()
      )
    : [];

let acciones = 0;

// ─── 1. Los clips ─────────────────────────────────────────────────
// Carpetas con ceros a la izquierda: se matchea por valor, no por string.
const nombreClip = subdirs(DIR_CLIPS).find((d) => /^\d+$/.test(d) && Number(d) === buscado);

if (!nombreClip) {
  console.warn(`clips\\${numero}: no existe (ya descartada, o nunca hubo clips)`);
} else {
  const dirClip = join(DIR_CLIPS, nombreClip);
  const archivos = readdirSync(dirClip);
  const peso = pesoDe(dirClip);

  if (aCuarentena(dirClip, join(DIR_CLIPS, '_descartados'), nombreClip)) {
    acciones++;
    console.warn(`clips\\${nombreClip}  ->  clips\\_descartados\\${nombreClip}`);
    console.warn(`  ${archivos.length} archivo(s), ${mb(peso)} MB`);
    archivos.forEach((f) => console.warn(`    ${f}`));
  }
}

// ─── 2. La carpeta del video armado ───────────────────────────────
// El nombre lleva el titulo completo y el separador es un guion LARGO (—), asi
// que se matchea solo el numero del prefijo, tambien por valor.
const carpetasVideo = subdirs(DIR_VIDEOS).filter((d) => {
  const m = d.match(/^(\d+)\s*[-–—]/);
  return m !== null && Number(m[1]) === buscado;
});

if (carpetasVideo.length === 0) {
  console.warn(`\nvideos\\${numero} — *: no existe (ya descartada)`);
}

for (const carpeta of carpetasVideo) {
  const ruta = join(DIR_VIDEOS, carpeta);
  const archivos = readdirSync(ruta);

  if (archivos.length === 0) {
    rmdirSync(ruta);
    acciones++;
    console.warn(`\nvideos\\${carpeta}: estaba VACIA  ->  eliminada`);
    continue;
  }

  const peso = pesoDe(ruta);
  if (aCuarentena(ruta, join(DIR_VIDEOS, '_descartados'), carpeta)) {
    acciones++;
    console.warn(`\nvideos\\${carpeta}  ->  videos\\_descartados\\${carpeta}`);
    console.warn(`  ${archivos.length} archivo(s), ${mb(peso)} MB`);
    archivos.forEach((f) => console.warn(`    ${f}`));
  }
}

// ─── Resumen ──────────────────────────────────────────────────────
console.warn(`\nRESUMEN`);
console.warn(`  receta descartada : ${numero}`);
console.warn(`  acciones          : ${acciones}`);
if (acciones === 0) console.warn(`  (nada que hacer: ya estaba descartada)`);
console.warn(`\n  Recorda: el documento y CLAUDE.md se editan a mano.`);
