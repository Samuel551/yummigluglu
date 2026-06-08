import { EtapaAlimentaria } from '@/types';

/**
 * Calendario de hitos alimentarios infantiles 6m–5 años.
 * Fuente: guías AAP/OMS de alimentación complementaria adaptadas a LATAM.
 *
 * Cada hito tiene una edad en meses; cuando el bebé está a 1 semana de cumplirla
 * (premium), el scheduler programa una notificación.
 */
export interface HitoAlimentario {
  id: string;
  edad_meses: number;
  etapa: EtapaAlimentaria;
  titulo: string;
  descripcion: string;
  emoji: string;
}

export const HITOS: HitoAlimentario[] = [
  {
    id: 'inicio-solidos',
    edad_meses: 6,
    etapa: 'inicio',
    titulo: 'Hora de los primeros alimentos',
    descripcion: 'Tu bebé ya puede empezar con papillas y purés suaves de verduras y frutas.',
    emoji: '🥄',
  },
  {
    id: 'palta',
    edad_meses: 7,
    etapa: 'inicio',
    titulo: 'Suma la palta',
    descripcion: 'La palta aporta grasas buenas esenciales para el cerebro de tu bebé.',
    emoji: '🥑',
  },
  {
    id: 'yema-huevo',
    edad_meses: 8,
    etapa: 'inicio',
    titulo: 'Introducción de la yema de huevo',
    descripcion: 'Empieza con yema cocida. Observa cualquier reacción durante 3 días.',
    emoji: '🍳',
  },
  {
    id: 'carnes-blancas',
    edad_meses: 9,
    etapa: 'inicio',
    titulo: 'Carnes blancas',
    descripcion: 'Pollo y pavo bien cocidos y procesados — aportan hierro y proteínas.',
    emoji: '🍗',
  },
  {
    id: 'pescado',
    edad_meses: 10,
    etapa: 'inicio',
    titulo: 'Pescado blanco',
    descripcion: 'Merluza o reineta sin espinas. Excelente fuente de omega-3.',
    emoji: '🐟',
  },
  {
    id: 'leche-vaca',
    edad_meses: 12,
    etapa: 'transicion',
    titulo: 'Leche de vaca y miel ya están permitidas',
    descripcion: 'Después del año tu hijo ya puede tomar leche entera y probar miel.',
    emoji: '🥛',
  },
  {
    id: 'texturas-firmes',
    edad_meses: 15,
    etapa: 'transicion',
    titulo: 'Texturas más firmes',
    descripcion: 'Pasa de purés a trozos blandos: pasta, verduras al vapor, frutas en trocitos.',
    emoji: '🍝',
  },
  {
    id: 'autonomia',
    edad_meses: 18,
    etapa: 'transicion',
    titulo: 'Manos a la masa',
    descripcion: 'Deja que tu hijo coma solo con cuchara. Va a ensuciar pero aprende motricidad.',
    emoji: '🍽️',
  },
  {
    id: 'variedad-cultural',
    edad_meses: 24,
    etapa: 'preescolar',
    titulo: 'A explorar el mundo',
    descripcion:
      'Empieza a sumar sabores nuevos: especias suaves, comidas internacionales adaptadas.',
    emoji: '🌎',
  },
  {
    id: 'frutos-secos',
    edad_meses: 36,
    etapa: 'preescolar',
    titulo: 'Frutos secos enteros',
    descripcion: 'Ya pasó el riesgo de atragantamiento. Empieza con almendras y nueces enteras.',
    emoji: '🥜',
  },
  {
    id: 'comida-familia',
    edad_meses: 48,
    etapa: 'preescolar',
    titulo: 'Comida en familia',
    descripcion: 'Tu hijo ya puede comer lo mismo que el resto — adaptando porciones y picante.',
    emoji: '👨‍👩‍👧',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Devuelve la edad del bebé en meses (con 1 decimal de precisión). */
export function calcularEdadMeses(fechaNacimiento: string): number {
  const nac = new Date(fechaNacimiento);
  const hoy = new Date();
  const diffMs = hoy.getTime() - nac.getTime();
  const diffDias = diffMs / (1000 * 60 * 60 * 24);
  return diffDias / 30.44; // promedio de días por mes
}

/**
 * Devuelve los próximos N hitos que el bebé aún no alcanzó.
 * Si N es undefined, devuelve todos los pendientes.
 */
export function proximosHitos(fechaNacimiento: string, n?: number): HitoAlimentario[] {
  const edadActual = calcularEdadMeses(fechaNacimiento);
  const pendientes = HITOS.filter((h) => h.edad_meses > edadActual);
  return n ? pendientes.slice(0, n) : pendientes;
}

/**
 * Devuelve el hito "actual" — el más próximo en el futuro.
 * Si el bebé ya superó todos los hitos, devuelve el último.
 */
export function hitoActual(fechaNacimiento: string): HitoAlimentario | null {
  const proximos = proximosHitos(fechaNacimiento, 1);
  if (proximos.length > 0) return proximos[0];
  return HITOS[HITOS.length - 1] ?? null;
}

/** Fecha exacta en que el bebé cumple la edad del hito (Date object). */
export function fechaHito(fechaNacimiento: string, hito: HitoAlimentario): Date {
  const nac = new Date(fechaNacimiento);
  const fecha = new Date(nac);
  fecha.setMonth(fecha.getMonth() + hito.edad_meses);
  return fecha;
}

/**
 * Texto legible de "cuándo es" un hito relativo a hoy.
 * Ej: "En 2 semanas", "En 3 días", "Mañana", "Hoy".
 */
export function tiempoHastaHito(fechaNacimiento: string, hito: HitoAlimentario): string {
  const fecha = fechaHito(fechaNacimiento, hito);
  const ahora = new Date();
  const diffMs = fecha.getTime() - ahora.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return 'Ya alcanzado';
  if (diffDias === 0) return 'Hoy';
  if (diffDias === 1) return 'Mañana';
  if (diffDias < 7) return `En ${diffDias} días`;
  if (diffDias < 14) return 'En 1 semana';
  if (diffDias < 30) return `En ${Math.round(diffDias / 7)} semanas`;
  if (diffDias < 60) return 'En 1 mes';
  const meses = Math.round(diffDias / 30);
  return `En ${meses} meses`;
}

/**
 * Cuánto falta para un hito en formato preciso "X meses y Y días".
 * Ej: "5 meses y 20 días", "3 días", "2 meses". Usa aritmética de calendario
 * real (no promedios), así el conteo no se desfasa mes a mes.
 */
export function mesesDiasHastaHito(fechaNacimiento: string, hito: HitoAlimentario): string {
  const objetivo = fechaHito(fechaNacimiento, hito);
  const hoy = new Date();
  if (objetivo <= hoy) return 'Ya alcanzado';

  let meses =
    (objetivo.getFullYear() - hoy.getFullYear()) * 12 + (objetivo.getMonth() - hoy.getMonth());
  let dias = objetivo.getDate() - hoy.getDate();
  if (dias < 0) {
    meses -= 1;
    // Días del mes anterior al objetivo, para "pedir prestado" como en una resta.
    const diasMesAnterior = new Date(objetivo.getFullYear(), objetivo.getMonth(), 0).getDate();
    dias += diasMesAnterior;
  }

  const partes: string[] = [];
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? 'mes' : 'meses'}`);
  if (dias > 0) partes.push(`${dias} ${dias === 1 ? 'día' : 'días'}`);
  if (partes.length === 0) return 'Hoy';
  return partes.join(' y ');
}
