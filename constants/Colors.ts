const light = {
  // Primarios
  verde: '#2D9B5A',
  verdeClaro: '#E8F7EE',
  naranja: '#F28B3B',

  // Neutros
  blanco: '#FFFFFF',
  fondoApp: '#F7F5F0',
  grisClaro: '#EEEBE6',
  grisTexto: '#6B6560',
  negro: '#1A1714',

  // Superficies
  card: '#FFFFFF',
  cardBorde: '#F5F3F1',
  seccion: '#F5F3F1',

  // Semánticos
  error: '#E53935',
  exito: '#2D9B5A',
  advertencia: '#F9A825',
  info: '#1976D2',

  // Etapas
  inicio: '#A8D8A8',
  transicion: '#FFD08A',
  preescolar: '#A8C8FF',

  // Premium
  premium: '#F28B3B',
  premiumFondo: '#FFF4EC',
} as const;

const dark = {
  // Primarios
  verde: '#3DBB6E',
  verdeClaro: '#1A3D28',
  naranja: '#F5A060',

  // Neutros
  blanco: '#1E1E1E',
  fondoApp: '#121212',
  grisClaro: '#2A2A2A',
  grisTexto: '#A0A0A0',
  negro: '#F0EDE8',

  // Superficies
  card: '#1E1E1E',
  cardBorde: '#2A2A2A',
  seccion: '#252525',

  // Semánticos
  error: '#EF5350',
  exito: '#3DBB6E',
  advertencia: '#FFB74D',
  info: '#42A5F5',

  // Etapas
  inicio: '#2E7D32',
  transicion: '#E6A817',
  preescolar: '#5C6BC0',

  // Premium
  premium: '#F5A060',
  premiumFondo: '#2A1F14',
} as const;

export type ThemePalette = { [K in keyof typeof light]: string };
export type ColorKey = keyof ThemePalette;

export const Colors = {
  light,
  dark,
  // Compat: acceso directo a light para código legacy
  ...light,
} as const;
