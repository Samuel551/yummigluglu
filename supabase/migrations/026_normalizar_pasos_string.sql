-- ============================================================
-- 026 — NORMALIZAR `pasos`: arrays de strings -> arrays de objetos
-- Fecha: 2026-07-20
--
-- QUÉ ARREGLA
-- El campo `pasos` (jsonb) de `public.recetas` convivía en DOS formatos:
--
--   (a) CORRECTO — 197 filas: array de objetos
--       [{"orden": 1, "descripcion": "...", "duracion_min": 5}, ...]
--
--   (b) ROTO — 10 filas: array de strings planos
--       ["Disolver la avena...", "Agregar la leche...", ...]
--
-- El tipo del cliente (`PasoReceta` en types/index.ts) declara
-- { orden: number; descripcion: string; duracion_min: number }, así que
-- el formato (b) rompe la app en dos lugares concretos:
--
--   * app/receta/[id].tsx  — `receta.pasos.map((paso) => ...)` lee
--     `paso.orden` y `paso.descripcion`. Sobre un string ambos son
--     undefined => la sección PREPARACIÓN se renderiza VACÍA y el número
--     del paso sale como "un" (String(undefined).padStart(2, '0')).
--
--   * app/admin/receta-form.tsx — `pasos.filter((p) => p.descripcion.trim())`
--     tira TypeError: si el owner abría una de esas 10 para editar, la
--     pantalla crasheaba.
--
-- DE DÓNDE SALIERON
-- El panel admin SIEMPRE escribe el formato correcto. Estas 10 entraron
-- por el dashboard de Supabase o un script suelto, en el lote del
-- 2026-04-27, y son parte de las 22 recetas que existían solo en la DB
-- (las respaldadas en la migración 025).
--
-- ENCADENAMIENTO CON LA 025 (importante)
-- La 025 respalda esas 10 recetas CON EL FORMATO ROTO, a propósito: un
-- respaldo debe ser fiel al origen. Como esta 026 corre DESPUÉS y es
-- idempotente, al reconstruir la DB desde cero el orden 025 -> 026 deja
-- los datos correctos. NO tocar la 025 para "arreglar" el respaldo.
--
-- SEGURIDAD / IDEMPOTENCIA
-- El WHERE filtra por `jsonb_typeof(pasos->0) = 'string'`, así que:
--   * Las 197 filas sanas NO se tocan (su pasos->0 es 'object').
--   * Correr esta migración dos veces es un no-op: después de la primera
--     pasada ya no queda ninguna fila cuyo primer elemento sea string.
--   * Filas con `pasos` nulo o array vacío quedan fuera (pasos->0 es NULL
--     => jsonb_typeof devuelve NULL, que no matchea 'string').
--
-- DECISIONES DE CONVERSIÓN
--   * `orden`        -> posición en el array (WITH ORDINALITY), base 1.
--     jsonb_array_elements_text NO garantiza orden por sí solo; la
--     ordinalidad es lo que preserva la secuencia original del array.
--   * `descripcion`  -> el string con trim(). Se inspeccionaron las 10
--     recetas ANTES de escribir esto: los strings son prosa limpia, sin
--     numeración embebida ("1. ", "Paso 1:", etc.), así que NO se aplica
--     ningún regex de limpieza. Meter un strip preventivo tipo
--     '^\d+[\.\)]\s*' sería peor que el problema: mutilaría descripciones
--     legítimas que empiecen con un número.
--   * `duracion_min` -> 0. El tipo `PasoReceta` lo declara REQUERIDO
--     (number, no opcional), así que omitirlo dejaría objetos que no
--     cumplen el contrato del cliente. Se usa 0 y no un número estimado
--     porque 0 es honesto ("no se sabe"): esa data nunca existió en el
--     formato original. Inventar "5 min" sería inventar información
--     nutricional//de preparación que nadie escribió. El owner puede
--     completar las duraciones reales desde el panel admin.
-- ============================================================

update public.recetas r
set pasos = sub.pasos_normalizados
from (
  select
    r2.id,
    jsonb_agg(
      jsonb_build_object(
        'orden', elem.ord,
        'descripcion', trim(elem.texto),
        'duracion_min', 0
      )
      order by elem.ord
    ) as pasos_normalizados
  from public.recetas r2
  cross join lateral jsonb_array_elements_text(r2.pasos)
    with ordinality as elem(texto, ord)
  where jsonb_typeof(r2.pasos->0) = 'string'
  group by r2.id
) as sub
where r.id = sub.id
  and jsonb_typeof(r.pasos->0) = 'string';
