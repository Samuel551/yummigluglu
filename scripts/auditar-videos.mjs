/**
 * Audita las 207 carpetas de `D:\Proyectos\recetas\videos`.
 *
 * La convención es: cada carpeta `NN — Nombre` contiene UN mp4 llamado
 * exactamente `NN — Nombre.mp4`. Este script reporta todo lo que se desvía.
 *
 * SOLO REPORTA. No toca nada — el arreglo va en `arreglar-videos.mjs`.
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'D:\\Proyectos\\recetas\\videos';

// Las carpetas que empiezan con `_` son de servicio (ej. `_revisar-duplicados`,
// `_descartados`) y las que empiezan con `.` son de herramientas (ej. `.claude`).
// Ninguna es una receta ni sigue la convención de nombre.
const carpetas = readdirSync(DIR).filter(
  (d) => !d.startsWith('_') && !d.startsWith('.') && statSync(join(DIR, d)).isDirectory()
);

const sinArchivo = [];
const nombreDistinto = []; // 1 mp4, pero no se llama como la carpeta
const varios = []; // más de 1 mp4
const otrosArchivos = []; // basura que no es mp4

for (const carpeta of carpetas) {
  const todos = readdirSync(join(DIR, carpeta));
  const mp4s = todos.filter((f) => f.toLowerCase().endsWith('.mp4'));
  const resto = todos.filter((f) => !f.toLowerCase().endsWith('.mp4'));

  if (resto.length) otrosArchivos.push({ carpeta, archivos: resto });

  const esperado = `${carpeta}.mp4`;

  if (mp4s.length === 0) {
    sinArchivo.push(carpeta);
  } else if (mp4s.length === 1) {
    if (mp4s[0] !== esperado) {
      nombreDistinto.push({
        carpeta,
        actual: mp4s[0],
        esperado,
        tam: statSync(join(DIR, carpeta, mp4s[0])).size,
      });
    }
  } else {
    varios.push({
      carpeta,
      esperado,
      archivos: mp4s.map((f) => ({ f, tam: statSync(join(DIR, carpeta, f)).size })),
    });
  }
}

const mb = (b) => (b / 1024 / 1024).toFixed(1);

console.warn(`Carpetas auditadas: ${carpetas.length}`);
console.warn(
  `OK (1 mp4, nombre correcto): ${carpetas.length - sinArchivo.length - nombreDistinto.length - varios.length}`
);

if (sinArchivo.length) {
  console.warn(`\n[X] SIN NINGUN MP4 (${sinArchivo.length}):`);
  sinArchivo.forEach((c) => console.warn(`  ${c}`));
}

if (nombreDistinto.length) {
  console.warn(`\n[R] NOMBRE DISTINTO AL DE LA CARPETA (${nombreDistinto.length}):`);
  nombreDistinto.forEach((n) => {
    console.warn(`  carpeta : ${n.carpeta}`);
    console.warn(`  archivo : ${n.actual}  (${mb(n.tam)} MB)`);
    console.warn(`  deberia : ${n.esperado}\n`);
  });
}

if (varios.length) {
  console.warn(`\n[D] VARIOS MP4 (${varios.length}):`);
  varios.forEach((v) => {
    console.warn(`  ${v.carpeta}`);
    v.archivos.forEach((a) => {
      const marca = a.f === v.esperado ? ' <- canonico' : '';
      console.warn(`     ${a.f}  (${mb(a.tam)} MB)${marca}`);
    });
    console.warn('');
  });
}

if (otrosArchivos.length) {
  console.warn(`\n[?] ARCHIVOS QUE NO SON MP4 (${otrosArchivos.length}):`);
  otrosArchivos.forEach((o) => console.warn(`  ${o.carpeta}: ${o.archivos.join(' | ')}`));
}
