import { EtapaAlimentaria } from '@/types';

export interface EtapaInfo {
  id: EtapaAlimentaria;
  nombre: string;
  descripcion: string;
  edadMin: number; // meses
  edadMax: number; // meses (999 = sin límite)
  emoji: string;
  color: string;
}

export const ETAPAS: EtapaInfo[] = [
  {
    id: 'inicio',
    nombre: 'Primeros alimentos',
    descripcion: 'Papillas y purés suaves',
    edadMin: 6,
    edadMax: 11,
    emoji: '🌱',
    color: '#A8D8A8',
  },
  {
    id: 'transicion',
    nombre: 'Bebé en crecimiento',
    descripcion: 'Texturas variadas y trozos pequeños',
    edadMin: 12,
    edadMax: 23,
    emoji: '🌿',
    color: '#FFD08A',
  },
  {
    id: 'preescolar',
    nombre: 'Preescolar',
    descripcion: 'Platos completos y variados',
    edadMin: 24,
    edadMax: 999,
    emoji: '🌳',
    color: '#A8C8FF',
  },
];

/** Calcula la etapa alimentaria según la edad en meses */
export const calcularEtapaPorEdad = (edadMeses: number): EtapaAlimentaria => {
  if (edadMeses <= 11) return 'inicio';
  if (edadMeses <= 23) return 'transicion';
  return 'preescolar';
};

/** Formatea la edad en texto legible: "1 año y 5 meses", "8 meses", "2 años" */
export const formatearEdad = (fechaNacimiento: string): string => {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  const años = hoy.getFullYear() - nac.getFullYear();
  const meses = hoy.getMonth() - nac.getMonth() + años * 12;
  const añosExactos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;

  if (añosExactos === 0) return `${meses} meses`;
  if (mesesRestantes === 0) return añosExactos === 1 ? '1 año' : `${añosExactos} años`;
  const parteAños = añosExactos === 1 ? '1 año' : `${añosExactos} años`;
  const parteMeses = mesesRestantes === 1 ? '1 mes' : `${mesesRestantes} meses`;
  return `${parteAños} y ${parteMeses}`;
};

export const getEtapaInfo = (etapa: EtapaAlimentaria): EtapaInfo =>
  ETAPAS.find((e) => e.id === etapa)!;

export const COLOR_ETAPA: Record<string, { bg: string; text: string }> = {
  inicio: { bg: '#FFF7ED', text: '#C2410C' },
  transicion: { bg: '#F0FDF4', text: '#15803D' },
  preescolar: { bg: '#EFF6FF', text: '#1D4ED8' },
};

/** Etiqueta corta para badges en cards */
export const ETAPA_BADGE: Record<string, string> = {
  inicio: '6-11m',
  transicion: '12-23m',
  preescolar: '2a+',
};

/** Etiqueta completa para pantallas de detalle */
export const ETAPA_LABEL: Record<string, string> = {
  inicio: '6–11 meses',
  transicion: '12–23 meses',
  preescolar: '2 años o más',
};
