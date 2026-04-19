import { DiaSemana, MomentoDia } from '@/types';

export const DIAS_SEMANA: DiaSemana[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
];

export const DIAS_LABEL: Record<DiaSemana, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

export const MOMENTOS_DIA: MomentoDia[] = ['desayuno', 'almuerzo', 'snack', 'cena'];

export const MOMENTO_EMOJI: Record<MomentoDia, string> = {
  desayuno: '🌅',
  almuerzo: '☀️',
  snack: '🍪',
  cena: '🌙',
};

export const MOMENTO_LABEL: Record<MomentoDia, string> = {
  desayuno: 'Desayuno',
  almuerzo: 'Almuerzo',
  snack: 'Snack',
  cena: 'Cena',
};

/** Devuelve el ISO date del lunes de la semana que contiene `fecha`. */
export function getLunesDeSemana(fecha = new Date()): string {
  const d = new Date(fecha);
  const dia = d.getDay(); // 0=domingo
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

/** "14 – 20 abr" */
export function formatearRangoSemana(semanaInicio: string): string {
  const lunes = new Date(semanaInicio + 'T12:00:00');
  const domingo = new Date(lunes);
  domingo.setDate(domingo.getDate() + 6);
  const meses = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];
  return `${lunes.getDate()} – ${domingo.getDate()} ${meses[domingo.getMonth()]}`;
}

/** ISO date del miércoles para mostrar el mes del header. */
export function getFechasDeSemana(semanaInicio: string): Date[] {
  const lunes = new Date(semanaInicio + 'T12:00:00');
  return DIAS_SEMANA.map((_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d;
  });
}

export function semanaAnterior(semanaInicio: string): string {
  const d = new Date(semanaInicio + 'T12:00:00');
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
}

export function semanaSiguiente(semanaInicio: string): string {
  const d = new Date(semanaInicio + 'T12:00:00');
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

export function buildGrid(year: number, month: number): (number | null)[][] {
  const primerDia = new Date(year, month, 1).getDay();
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const offset = primerDia === 0 ? 6 : primerDia - 1;
  const flat: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];
  while (flat.length % 7 !== 0) flat.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < flat.length; i += 7) rows.push(flat.slice(i, i + 7));
  return rows;
}
