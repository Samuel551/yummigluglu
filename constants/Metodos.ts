import { MetodoAlimentacion, PreferenciaMetodo } from '@/types';

/**
 * Métodos de alimentación — Fase 11.
 *
 * 🔴 CONTEXTO QUE NO HAY QUE PERDER: esto salió de feedback de usuarias reales
 * (grupos de Facebook, septiembre 2026). Se midió el catálogo y de las 68
 * recetas de la etapa `inicio` (6–11m), 59 eran papilla/puré y solo 3 eran
 * finger food — las tres, snacks. Un bebé que rechaza la cuchara no tenía nada
 * para almorzar.
 *
 * 🔴 EL MODELO ES BLISS, NO BLW A SECAS. BLW puro tiene dos críticas
 * documentadas: déficit de hierro y atragantamiento. BLISS (Baby-Led
 * Introduction to SolidS, Universidad de Otago) las corrige exigiendo, en cada
 * comida: un alimento con hierro, uno con energía, y ninguno que sea riesgo de
 * atragantamiento. Por eso `forma_servido` y `nota_seguridad` son columnas
 * propias con una constraint que las EXIGE — no son un tag ni un texto suelto.
 */

export interface MetodoInfo {
  id: MetodoAlimentacion;
  /** Nombre corto para chips y badges. Neutro: la mayoría no sabe qué es "BLW". */
  nombre: string;
  /** Nombre técnico, para la pantalla educativa. */
  nombreTecnico: string;
  descripcion: string;
  emoji: string;
  color: string;
}

export const METODOS: MetodoInfo[] = [
  {
    id: 'papilla',
    nombre: 'Papillas',
    nombreTecnico: 'Alimentación con cuchara',
    descripcion: 'Purés y texturas suaves que le das tú con cuchara',
    emoji: '🥄',
    color: '#A8D8A8',
  },
  {
    id: 'blw',
    nombre: 'Trocitos',
    nombreTecnico: 'BLW · Alimentación autorregulada',
    descripcion: 'Trozos blandos que el bebé agarra y come solo',
    emoji: '🖐️',
    color: '#FFD08A',
  },
];

/** Opciones para el selector de preferencia (perfil del hijo y filtro del catálogo). */
export const OPCIONES_PREFERENCIA: { id: PreferenciaMetodo; nombre: string; emoji: string }[] = [
  { id: 'ambos', nombre: 'Ambos', emoji: '🍽️' },
  { id: 'papilla', nombre: 'Papillas', emoji: '🥄' },
  { id: 'blw', nombre: 'Trocitos', emoji: '🖐️' },
];

export const getMetodoInfo = (metodo: MetodoAlimentacion): MetodoInfo =>
  METODOS.find((m) => m.id === metodo)!;

/** Colores de badge por método. Mismo formato que COLOR_ETAPA. */
export const COLOR_METODO: Record<MetodoAlimentacion, { bg: string; text: string }> = {
  papilla: { bg: '#F0FDF4', text: '#15803D' },
  blw: { bg: '#FFF7ED', text: '#C2410C' },
};

/** Etiqueta corta para el badge de las cards. */
export const METODO_BADGE: Record<MetodoAlimentacion, string> = {
  papilla: '🥄 Papilla',
  blw: '🖐️ Trocitos',
};

/**
 * Reglas BLISS que se muestran en la pantalla educativa y en el detalle de una
 * receta BLW. Texto en español NEUTRAL (tú), como el resto de la app.
 *
 * ⚠️ NO editar el fondo de estas reglas sin fuente: son las tres condiciones
 * del protocolo BLISS. Se pueden reescribir para que se entiendan mejor, nunca
 * suavizar ni quitar una.
 */
export const REGLAS_BLISS: { emoji: string; titulo: string; texto: string }[] = [
  {
    emoji: '🥩',
    titulo: 'Hierro en cada comida',
    texto:
      'A los 6 meses el bebé agota las reservas de hierro con las que nació. Incluye siempre un alimento rico en hierro: carne, pollo, legumbres, huevo o cereales fortificados.',
  },
  {
    emoji: '🥑',
    titulo: 'Energía en cada comida',
    texto:
      'Los trozos llenan menos que un puré. Suma un alimento con buena densidad energética: palta, aceite de oliva, queso, mantequilla de maní sin azúcar.',
  },
  {
    emoji: '🚫',
    titulo: 'Nada que pueda atragantar',
    texto:
      'Evita frutos secos enteros, uvas y tomates cherry sin partir, zanahoria cruda, palomitas, salchichas en rodajas y trozos duros o redondos.',
  },
];

/**
 * Prueba de textura, la regla de oro del BLW. Se muestra fija en toda receta
 * de trocitos, arriba de la preparación.
 *
 * 🔴 Esto NO es relleno de UI. Es el chequeo que separa un alimento seguro de
 * uno peligroso, y tiene que estar donde la madre lo ve ANTES de cocinar.
 */
export const PRUEBA_TEXTURA =
  'Antes de servir, aplasta el trozo entre el pulgar y el índice. Si no se deshace con facilidad, todavía está muy duro para el bebé.';

/** Recordatorio de supervisión. Va junto a la prueba de textura, siempre. */
export const AVISO_SUPERVISION =
  'Nunca dejes al bebé solo mientras come. Debe estar sentado, erguido y de frente a ti.';

/**
 * Edad mínima recomendada para empezar con trocitos. Se usa para avisar cuando
 * el perfil activo todavía no llegó.
 *
 * ⚠️ Además de la edad, el bebé debe sostener la cabeza y sentarse con poco
 * apoyo. Es un aviso, NO un bloqueo: la app informa, la madre decide.
 */
export const EDAD_MINIMA_BLW_MESES = 6;
