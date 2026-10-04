/**
 * Matchea las 53 recetas de `rotacion_grupo = 0` (las que son SIEMPRE gratis)
 * contra las carpetas de `D:\Proyectos\recetas\videos`, para copiar esos videos
 * a `videos free` y mandárselos a quien administra las redes.
 *
 * Solo REPORTA. No copia nada: la copia va en un segundo paso, y recién cuando
 * el matcheo esté 53/53.
 *
 * Los nombres de la base y los de las carpetas NO son idénticos (acentos,
 * mayúsculas, palabras cambiadas), así que se normaliza y, si no hay match
 * exacto, se busca el más parecido para poder resolverlo a ojo.
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIR_VIDEOS = 'D:\\Proyectos\\recetas\\videos';

// Los 53 nombres salen de: select nombre from recetas where rotacion_grupo = 0
const RECETAS_FREE = [
  'Ajiaco bogotano baby',
  'Ajiaco peruano de papa baby',
  'Ajiaco santafereño suave',
  'Arroz Cremoso con Espinaca',
  'Atol de yuca venezolano',
  'Bolitas energéticas de dátiles y avena',
  'Calabacitas con elote y queso',
  'Caldo tlalpeño suave',
  'Calentado caleño baby',
  'Carbonada chilena',
  'Causa limeña de pollo',
  'Changua suave',
  'Chupe verde de papa amarilla',
  'Compota de aguaymanto y manzana',
  'Compota de durazno y manzana',
  'Compota de mango maduro y banano',
  'Compota de Manzana y Pera',
  'Compota de níspero con manzana',
  'Enchiladas suizas suaves',
  'Estofado suave de pollo con arroz',
  'Fideos con tuco baby',
  'Galletitas de avena con miel y canela',
  'Galletitas de coco y limón',
  'Galletitas de zanahoria con dátiles',
  'Galletitas de zanahoria y manzana',
  'Hervido de pollo con ñame y mapuey',
  'Humitas dulces baby',
  'Mazamorra colombiana de maíz blanco',
  'Mazamorra con leche',
  'Merluza al horno con puré',
  'Milanesa de pollo al horno',
  'Mini panqueques de avena',
  'Mini tortilla de acelga',
  'Pabellón criollo baby',
  'Pan amasado',
  'Papilla de quínoa con leche y canela',
  'Pastel de choclo baby',
  'Pastelitos de batata al horno baby',
  'Porotos con riendas',
  'Puré de aguacate con limón mexicano',
  'Puré de banana con yogur natural',
  'Puré de brócoli y papa',
  'Puré de camote y plátano de la selva',
  'Puré de mamey con plátano',
  'Puré de papa y zanahoria con aceite de oliva',
  'Puré de pescado con camote',
  'Puré de pollo con papa y zanahoria',
  'Quesadilla de frijoles y queso',
  'Quinoto de verduras',
  'Tamales de elote dulces baby',
  'Tamales tolimenses baby light',
  'Tequeños al horno baby',
  'Tortitas de zapallo al horno',
];

/** Quita acentos, baja a minúscula y colapsa todo lo que no sea letra o número. */
const normalizar = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Distancia de Levenshtein, para sugerir el candidato más parecido. */
function distancia(a, b) {
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const fila = [i];
    for (let j = 1; j <= n; j++) {
      fila[j] = Math.min(
        prev[j] + 1,
        fila[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = fila;
  }
  return prev[n];
}

// ─── Leer las carpetas: "NN — Nombre de la receta" ───────────────
const carpetas = readdirSync(DIR_VIDEOS)
  .filter((d) => statSync(join(DIR_VIDEOS, d)).isDirectory())
  .map((carpeta) => {
    // El separador es un guion largo (—), no un guion normal.
    const partes = carpeta.split('—');
    const numero = partes[0].trim();
    const nombre = partes.slice(1).join('—').trim();
    const mp4s = readdirSync(join(DIR_VIDEOS, carpeta)).filter((f) => f.endsWith('.mp4'));
    return { carpeta, numero, nombre, norm: normalizar(nombre), mp4s };
  });

// ─── Matchear ─────────────────────────────────────────────────────
const encontradas = [];
const problemas = [];

for (const receta of RECETAS_FREE) {
  const norm = normalizar(receta);
  const exactas = carpetas.filter((c) => c.norm === norm);

  if (exactas.length === 1) {
    const c = exactas[0];
    // El archivo bueno es el que se llama igual que la carpeta. Las variantes
    // con espacio final, corchete o "(1)" son basura de descarga.
    const exacto = c.mp4s.find((f) => f === `${c.carpeta}.mp4`);
    if (c.mp4s.length === 1) {
      encontradas.push({ receta, carpeta: c.carpeta, archivo: c.mp4s[0] });
    } else if (exacto) {
      encontradas.push({ receta, carpeta: c.carpeta, archivo: exacto, ambiguo: c.mp4s.length });
    } else {
      problemas.push({ receta, tipo: 'VARIOS MP4 Y NINGUNO CANONICO', detalle: c.mp4s.join(' | ') });
    }
    continue;
  }

  if (exactas.length > 1) {
    problemas.push({
      receta,
      tipo: 'VARIAS CARPETAS',
      detalle: exactas.map((c) => c.carpeta).join(' | '),
    });
    continue;
  }

  // Sin match exacto: proponer los 2 más parecidos para resolver a mano.
  const cercanas = carpetas
    .map((c) => ({ c, d: distancia(norm, c.norm) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 2)
    .map(({ c, d }) => `${c.carpeta} (dist ${d})`);
  problemas.push({ receta, tipo: 'SIN MATCH', detalle: cercanas.join('  ||  ') });
}

// ─── Reporte ──────────────────────────────────────────────────────
console.warn(`\nMATCHEADAS: ${encontradas.length} / ${RECETAS_FREE.length}`);
for (const e of encontradas.filter((x) => x.ambiguo)) {
  console.warn(`  [!] ${e.carpeta}: ${e.ambiguo} mp4, se elige el canonico "${e.archivo}"`);
}

if (problemas.length) {
  console.warn(`\nA RESOLVER: ${problemas.length}`);
  for (const p of problemas) {
    console.warn(`  - "${p.receta}"`);
    console.warn(`      ${p.tipo}: ${p.detalle}`);
  }
}

console.warn('\n--- JSON del plan de copia ---');
console.warn(JSON.stringify(encontradas, null, 0));
