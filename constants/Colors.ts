export const Colors = {
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

export type ColorKey = keyof typeof Colors;
