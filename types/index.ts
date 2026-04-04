// ─── Enums de dominio ────────────────────────────────────────────────────────

export type EtapaAlimentaria = 'inicio' | 'transicion' | 'preescolar';
export type MomentoDia = 'desayuno' | 'almuerzo' | 'cena' | 'snack';
export type PlanSuscripcion = 'free' | 'premium' | 'premium_anual';

// ─── Perfil de hijo ───────────────────────────────────────────────────────────

export interface PerfilHijo {
  id: string;
  user_id: string;
  nombre: string;
  fecha_nacimiento: string; // ISO date string
  etapa: EtapaAlimentaria;
  alergias: string[];
  objetivo_nutricional?: string;
  avatar_emoji: string;
  created_at: string;
}

export interface PerfilHijoInput {
  nombre: string;
  fecha_nacimiento: string;
  etapa: EtapaAlimentaria;
  alergias: string[];
  objetivo_nutricional?: string;
  avatar_emoji?: string;
}

// ─── Recetas ──────────────────────────────────────────────────────────────────

export interface Ingrediente {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  calorias_por_100g: number;
}

export interface PasoReceta {
  orden: number;
  descripcion: string;
  duracion_min: number;
}

export interface InfoNutricional {
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  hierro: number;
}

export interface Receta {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  imagen_url?: string;
  momento_dia: MomentoDia[];
  etapas_compatibles: EtapaAlimentaria[];
  tiempo_preparacion: number; // minutos
  porciones_base: number;
  alergenos: string[];
  calorias?: number;
  proteinas?: number;
  carbohidratos?: number;
  grasas?: number;
  hierro?: number;
  ingredientes: Ingrediente[];
  pasos: PasoReceta[];
  tags: string[];
  es_premium: boolean;
  activa: boolean;
  created_at: string;
}

// ─── Favoritos ────────────────────────────────────────────────────────────────

export interface Favorito {
  id: string;
  user_id: string;
  receta_id: string;
  perfil_id?: string;
  created_at: string;
}

// ─── Asistente IA ─────────────────────────────────────────────────────────────

export type RolMensaje = 'user' | 'assistant';

export interface MensajeIA {
  role: RolMensaje;
  content: string;
  timestamp: string;
}

export interface ConversacionIA {
  id: string;
  user_id: string;
  receta_id?: string;
  perfil_id?: string;
  mensajes: MensajeIA[];
  created_at: string;
  updated_at: string;
}

// ─── Suscripción ──────────────────────────────────────────────────────────────

export interface Suscripcion {
  id: string;
  user_id: string;
  plan: PlanSuscripcion;
  activa: boolean;
  expires_at?: string;
  revenuecat_customer_id?: string;
  updated_at: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface Usuario {
  id: string;
  email: string;
  created_at: string;
}

// ─── Filtros de recetas ───────────────────────────────────────────────────────

export interface FiltrosReceta {
  etapa?: EtapaAlimentaria;
  momento?: MomentoDia;
  tiempo_max?: number; // minutos
  excluir_alergenos?: string[];
  solo_sin_premium?: boolean;
  tags?: string[];
}
