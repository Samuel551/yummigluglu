/**
 * Copia los 53 videos de recetas SIEMPRE GRATIS (`rotacion_grupo = 0`) a
 * `D:\Proyectos\recetas\videos free`, para pasárselos a quien administra las
 * redes (TikTok / Instagram).
 *
 * COPIA, no mueve: el original en `videos/` queda intacto.
 * Es idempotente: si el destino ya tiene el archivo con el mismo tamaño, lo saltea.
 *
 * El matcheo nombre-base ↔ carpeta se validó con `matchear-videos-free.mjs`
 * (51 automáticas + 2 resueltas a mano contra la base, ver OVERRIDES).
 */
import { readdirSync, statSync, copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIR_ORIGEN = 'D:\\Proyectos\\recetas\\videos';
const DIR_DESTINO = 'D:\\Proyectos\\recetas\\videos free';

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

/**
 * Las 2 recetas cuyo nombre en la base no coincide con el de la carpeta.
 * Verificado contra la base: ninguna otra receta reclama estas carpetas.
 */
const OVERRIDES = {
  'Estofado suave de pollo con arroz': '101 — Estofado de pollo con arroz baby',
  'Puré de papa y zanahoria con aceite de oliva': '90 — Puré de papa, zanahoria y aceite de oliva',
};

const normalizar = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

// ─── Índice de carpetas ───────────────────────────────────────────
const carpetas = readdirSync(DIR_ORIGEN)
  .filter((d) => statSync(join(DIR_ORIGEN, d)).isDirectory())
  .map((carpeta) => ({
    carpeta,
    norm: normalizar(carpeta.split('—').slice(1).join('—')),
  }));

// ─── Resolver receta -> archivo de origen ─────────────────────────
const plan = [];
for (const receta of RECETAS_FREE) {
  const carpeta =
    OVERRIDES[receta] ?? carpetas.find((c) => c.norm === normalizar(receta))?.carpeta;

  if (!carpeta) throw new Error(`Sin carpeta para: ${receta}`);

  const mp4s = readdirSync(join(DIR_ORIGEN, carpeta)).filter((f) => f.endsWith('.mp4'));
  if (mp4s.length === 0) throw new Error(`Sin mp4 en: ${carpeta}`);

  // Con varios mp4 gana el que se llama exactamente como la carpeta; las
  // variantes con espacio final, corchete o "(1)" son basura de descarga.
  const archivo = mp4s.length === 1 ? mp4s[0] : (mp4s.find((f) => f === `${carpeta}.mp4`) ?? null);
  if (!archivo) throw new Error(`Varios mp4 y ninguno canonico en: ${carpeta}`);

  plan.push({ receta, carpeta, archivo, descartados: mp4s.length - 1 });
}

// ─── Copiar ───────────────────────────────────────────────────────
let copiados = 0;
let salteados = 0;
let bytes = 0;

for (const p of plan) {
  const origen = join(DIR_ORIGEN, p.carpeta, p.archivo);
  const destino = join(DIR_DESTINO, p.archivo);
  const tam = statSync(origen).size;
  bytes += tam;

  if (existsSync(destino) && statSync(destino).size === tam) {
    salteados++;
    continue;
  }

  copyFileSync(origen, destino);
  copiados++;
  console.warn(`  ${String(copiados).padStart(2)}. ${p.archivo}  (${mb(tam)} MB)`);
}

// ─── Índice para quien administra las redes ───────────────────────
const indice = [
  'VIDEOS GRATIS — Yummi Glu Glu',
  'Las 53 recetas del grupo 0: son gratis SIEMPRE, nunca se bloquean.',
  'Por eso son las que se pueden publicar en redes sin restriccion.',
  '',
  `Generado: ${new Date().toISOString().slice(0, 10)}`,
  '',
  ...plan.map((p, i) => `${String(i + 1).padStart(2, '0')}. ${p.receta}\n    ${p.archivo}`),
].join('\n');

writeFileSync(join(DIR_DESTINO, '_INDICE.txt'), indice, 'utf8');

console.warn(`\nRESUMEN`);
console.warn(`  copiados : ${copiados}`);
console.warn(`  salteados: ${salteados} (ya estaban con el mismo tamano)`);
console.warn(`  total    : ${plan.length} videos, ${mb(bytes)} MB`);
console.warn(`  indice   : _INDICE.txt`);

const ambiguos = plan.filter((p) => p.descartados > 0);
if (ambiguos.length) {
  console.warn(`\n[!] REVISAR A OJO — carpetas con mp4 de sobra:`);
  for (const a of ambiguos) {
    console.warn(`  ${a.carpeta}: se copio "${a.archivo}", se descartaron ${a.descartados}`);
  }
}
