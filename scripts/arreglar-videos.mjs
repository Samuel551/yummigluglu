/**
 * Arregla lo que encontró `auditar-videos.mjs` en `D:\Proyectos\recetas\videos`.
 *
 * Hace dos cosas, y NINGUNA borra nada:
 *
 *  1. RENOMBRA los mp4 cuyo nombre no coincide con el de su carpeta. Casi todos
 *     vienen truncados por el límite de ruta de Windows al descargarlos
 *     ("...campesi.mp4" en vez de "...campesino.mp4").
 *
 *  2. RESUELVE las carpetas con mas de un mp4:
 *
 *     - Si son RE-EXPORTACIONES del mismo video (`... palta.mp4` y
 *       `... palta(1).mp4`), gana el MAS NUEVO: se re-exporta porque se
 *       corrigio algo. El viejo cae a cuarentena.
 *     - Si alguno es otro video TRASPAPELADO (paso: el de la receta 103 vivia
 *       en la carpeta 102), NO se toca nada y se reporta. Ahi no hay forma de
 *       saber cual sirve.
 *
 *  3. MUEVE a `_revisar-duplicados\` los mp4 de sobra. 🔴 NO los borra: se
 *     comparó byte a byte y NO son copias — tienen distinto tamaño y distinto
 *     hash de contenido. Son renders distintos del mismo video, así que la
 *     decisión de cuál sirve es del owner, no del script.
 *
 * Ademas sincroniza los 2 archivos afectados que ya estaban copiados en
 * `videos free`, para que los nombres queden iguales en los dos lados.
 *
 * Idempotente: si ya se corrió, no hace nada.
 */
import { readdirSync, statSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'D:\\Proyectos\\recetas\\videos';
const DIR_FREE = 'D:\\Proyectos\\recetas\\videos free';
const DIR_DUP = join(DIR, '_revisar-duplicados');

const mb = (b) => (b / 1024 / 1024).toFixed(1);

/**
 * Normaliza el nombre de un mp4 para decidir si es el MISMO video de esta
 * carpeta, exportado de nuevo. Dos cosas lo disfrazan:
 *
 *   1. El separador. El editor exporta con `--`; la convencion usa el guion
 *      LARGO `—`. Ej.: `208 -- Bastones...` dentro de `208 — Bastones...`.
 *   2. El sufijo de re-exportacion: si el archivo ya existia, Windows y CapCut
 *      agregan `(1)`, `(2)`, ... pegado al final del nombre.
 *
 * Solo toca el separador que va DESPUES del numero de receta, para no pisar
 * guiones que formen parte del titulo.
 */
function normalizar(nombreMp4) {
  return nombreMp4
    .replace(/\.mp4$/i, '')
    .replace(/\s*\(\d+\)$/, '')
    .replace(/^(\d+)\s*[-–—]+\s*/, '$1 — ');
}

// ─── 1. Renombrar los que no coinciden con su carpeta ─────────────
const carpetas = readdirSync(DIR).filter((d) => {
  // `_...` son de servicio (`_revisar-duplicados`, `_descartados`) y `....` son
  // de herramientas (`.claude`). Ninguna es una receta.
  if (d.startsWith('_') || d.startsWith('.')) return false;
  return statSync(join(DIR, d)).isDirectory();
});

let renombrados = 0;
const afectados = []; // para sincronizar `videos free`

for (const carpeta of carpetas) {
  const mp4s = readdirSync(join(DIR, carpeta)).filter((f) => f.toLowerCase().endsWith('.mp4'));
  if (mp4s.length !== 1) continue;

  const actual = mp4s[0];
  const esperado = `${carpeta}.mp4`;
  if (actual === esperado) continue;

  const destino = join(DIR, carpeta, esperado);
  if (existsSync(destino)) {
    console.warn(`  [!] ya existe, se saltea: ${esperado}`);
    continue;
  }

  renameSync(join(DIR, carpeta, actual), destino);
  renombrados++;
  afectados.push({ antes: actual, despues: esperado });
  console.warn(`  ${actual}\n    -> ${esperado}`);
}

// ─── 2. Resolver las carpetas con mas de un mp4 ────────────────
let movidos = 0;

for (const carpeta of carpetas) {
  let mp4s = readdirSync(join(DIR, carpeta)).filter((f) => f.toLowerCase().endsWith('.mp4'));
  if (mp4s.length <= 1) continue;

  const canonico = `${carpeta}.mp4`;

  // Si NINGUNO se llama como la carpeta hay dos escenarios, y confundirlos
  // cuesta un video:
  //
  //  (a) Todos normalizan al nombre de la carpeta => son re-exportaciones del
  //      MISMO video (`... palta.mp4` y `... palta(1).mp4`). Se re-exporta
  //      porque se corrigio algo, asi que gana el MAS NUEVO y el viejo cae a
  //      cuarentena.
  //  (b) Alguno NO normaliza => es otro video traspapelado. Paso de verdad: el
  //      video de la receta 103 vivia dentro de la carpeta 102. Ahi no hay
  //      forma de saber cual sirve, y mover a ciegas es peor que no tocar:
  //      lo decide una persona.
  if (!mp4s.includes(canonico)) {
    const ajenos = mp4s.filter((f) => normalizar(f) !== carpeta);

    if (ajenos.length) {
      console.warn(`  [!] ${carpeta}: hay mp4 que no son de esta receta, NO se toca`);
      ajenos.forEach((f) => console.warn(`        ${f}`));
      continue;
    }

    const masNuevo = mp4s
      .map((f) => ({ f, mtime: statSync(join(DIR, carpeta, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)[0].f;

    renameSync(join(DIR, carpeta, masNuevo), join(DIR, carpeta, canonico));
    renombrados++;
    afectados.push({ antes: masNuevo, despues: canonico });
    console.warn(`  ${masNuevo}
    -> ${canonico}  (re-exportacion mas nueva: gana)`);

    mp4s = readdirSync(join(DIR, carpeta)).filter((f) => f.toLowerCase().endsWith('.mp4'));
  }

  const sobrantes = mp4s.filter((f) => f !== canonico);
  if (!sobrantes.length) continue;

  if (!existsSync(DIR_DUP)) mkdirSync(DIR_DUP);

  for (const sobrante of sobrantes) {
    // Se prefija con la carpeta de origen para poder devolverlo si hace falta.
    const nombreDestino = `[de ${carpeta}] ${sobrante}`;
    const destino = join(DIR_DUP, nombreDestino);
    if (existsSync(destino)) continue;

    const tam = statSync(join(DIR, carpeta, sobrante)).size;
    renameSync(join(DIR, carpeta, sobrante), destino);
    movidos++;
    console.warn(`  movido a cuarentena: ${nombreDestino}  (${mb(tam)} MB)`);
  }
}

// ─── 3. Sincronizar `videos free` con los nombres nuevos ──────────
let sincronizados = 0;

if (existsSync(DIR_FREE)) {
  const enFree = new Set(readdirSync(DIR_FREE));
  for (const { antes, despues } of afectados) {
    if (!enFree.has(antes)) continue;
    if (enFree.has(despues)) continue;
    renameSync(join(DIR_FREE, antes), join(DIR_FREE, despues));
    sincronizados++;
    console.warn(`  [videos free] ${antes}\n    -> ${despues}`);
  }
}

console.warn(`\nRESUMEN`);
console.warn(`  renombrados en origen : ${renombrados}`);
console.warn(`  movidos a cuarentena  : ${movidos}  (en ${DIR_DUP})`);
console.warn(`  sincronizados en free : ${sincronizados}`);
