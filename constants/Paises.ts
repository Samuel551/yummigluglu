export const PAISES = [
  { id: 'todos', nombre: 'Todos', bandera: '🌎', imagen: null },
  { id: 'chile', nombre: 'Chile', bandera: '🇨🇱', imagen: 'https://flagcdn.com/w40/cl.png' },
  { id: 'peru', nombre: 'Perú', bandera: '🇵🇪', imagen: 'https://flagcdn.com/w40/pe.png' },
  { id: 'colombia', nombre: 'Colombia', bandera: '🇨🇴', imagen: 'https://flagcdn.com/w40/co.png' },
  { id: 'venezuela', nombre: 'Venezuela', bandera: '🇻🇪', imagen: 'https://flagcdn.com/w40/ve.png' },
  { id: 'argentina', nombre: 'Argentina', bandera: '🇦🇷', imagen: 'https://flagcdn.com/w40/ar.png' },
  { id: 'mexico', nombre: 'México', bandera: '🇲🇽', imagen: 'https://flagcdn.com/w40/mx.png' },
] as const;

export type PaisId = (typeof PAISES)[number]['id'];

export function getPais(id: PaisId) {
  return PAISES.find((p) => p.id === id) ?? PAISES[0];
}
