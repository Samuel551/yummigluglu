// Los 8 alérgenos principales más comunes en alimentación infantil

export interface AlergenoInfo {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
}

export const ALERGENOS: AlergenoInfo[] = [
  { id: 'gluten', nombre: 'Gluten', emoji: '🌾', descripcion: 'Trigo, cebada, centeno, avena' },
  { id: 'lacteos', nombre: 'Lácteos', emoji: '🥛', descripcion: 'Leche de vaca y derivados' },
  { id: 'huevo', nombre: 'Huevo', emoji: '🥚', descripcion: 'Huevo y productos con huevo' },
  { id: 'mani', nombre: 'Maní', emoji: '🥜', descripcion: 'Maní y mantequilla de maní' },
  {
    id: 'frutos_secos',
    nombre: 'Frutos secos',
    emoji: '🌰',
    descripcion: 'Nueces, almendras, avellanas',
  },
  { id: 'soja', nombre: 'Soja', emoji: '🫘', descripcion: 'Soja y derivados' },
  { id: 'pescado', nombre: 'Pescado', emoji: '🐟', descripcion: 'Todo tipo de pescado' },
  { id: 'mariscos', nombre: 'Mariscos', emoji: '🦐', descripcion: 'Camarones, ostras, mejillones' },
];

export const ALERGENO_IDS = ALERGENOS.map((a) => a.id);

export const getAlergenoById = (id: string): AlergenoInfo | undefined =>
  ALERGENOS.find((a) => a.id === id);
