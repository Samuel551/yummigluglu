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
    nombre: 'Inicio',
    descripcion: 'Primeras papillas y purés',
    edadMin: 6,
    edadMax: 8,
    emoji: '🌱',
    color: '#A8D8A8',
  },
  {
    id: 'transicion',
    nombre: 'Transición',
    descripcion: 'Texturas mixtas y finger foods',
    edadMin: 9,
    edadMax: 12,
    emoji: '🌿',
    color: '#FFD08A',
  },
  {
    id: 'preescolar',
    nombre: 'Preescolar',
    descripcion: 'Platos completos y variados',
    edadMin: 13,
    edadMax: 999,
    emoji: '🌳',
    color: '#A8C8FF',
  },
];

/** Calcula la etapa alimentaria según la edad en meses */
export const calcularEtapaPorEdad = (edadMeses: number): EtapaAlimentaria => {
  if (edadMeses <= 8) return 'inicio';
  if (edadMeses <= 12) return 'transicion';
  return 'preescolar';
};

export const getEtapaInfo = (etapa: EtapaAlimentaria): EtapaInfo =>
  ETAPAS.find((e) => e.id === etapa)!;
