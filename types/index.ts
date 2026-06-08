// ─── Enums de dominio ────────────────────────────────────────────────────────

export type EtapaAlimentaria = 'lactancia' | 'inicio' | 'transicion' | 'preescolar';
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
  video_url?: string;
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

// ─── Plan Semanal ─────────────────────────────────────────────────────────────

export type DiaSemana =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

export type DiasPlan = Record<DiaSemana, Record<MomentoDia, string | null>>;

export interface PlanSemanal {
  id: string;
  user_id: string;
  perfil_id: string;
  semana_inicio: string; // ISO date — lunes de la semana
  dias: DiasPlan;
  created_at: string;
  updated_at: string;
}

// ─── Lista de Compras ─────────────────────────────────────────────────────────

export interface ItemCompras {
  nombre: string;
  cantidad: string; // ej: "150g", "2 unidades"
  categoria: string;
  comprado: boolean;
}

export interface ListaCompras {
  id: string;
  user_id: string;
  perfil_id: string;
  plan_id?: string;
  items: ItemCompras[];
  created_at: string;
  updated_at: string;
}

// ─── Diario de Alimentos ──────────────────────────────────────────────────────

export type ReaccionAlimento = 'ninguna' | 'leve' | 'severa';

export interface DiarioAlimento {
  id: string;
  user_id: string;
  perfil_id: string;
  alimento: string;
  fecha_introduccion: string; // ISO date
  reaccion: ReaccionAlimento;
  notas?: string;
  created_at: string;
}

// ─── Recordatorios (Agenda) ───────────────────────────────────────────────────

export type TipoRecordatorio =
  | 'comida'
  | 'hidratacion'
  | 'diario'
  | 'hito'
  | 'control'
  | 'lista_compras';

export type ModoNotificacion = 'notificacion' | 'alarma';

export interface Recordatorio {
  id: string;
  user_id: string;
  perfil_hijo_id: string;
  tipo: TipoRecordatorio;
  titulo: string;
  descripcion?: string;
  fecha_hora?: string; // ISO timestamp — one-shot
  hora_diaria?: string; // HH:MM:SS — recurrente
  dias_semana?: number[]; // 0=domingo, 6=sábado — premium
  modo_notificacion: ModoNotificacion;
  notification_id?: string; // ID local de expo-notifications (o JSON array para alarma)
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecordatorioInput {
  perfil_hijo_id: string;
  tipo: TipoRecordatorio;
  titulo: string;
  descripcion?: string;
  fecha_hora?: string;
  hora_diaria?: string;
  dias_semana?: number[];
  modo_notificacion?: ModoNotificacion;
}

// ─── Filtros de recetas ───────────────────────────────────────────────────────

export interface FiltrosReceta {
  etapa?: EtapaAlimentaria;
  momento?: MomentoDia;
  tiempo_max?: number; // minutos
  excluir_alergenos?: string[];
  solo_sin_premium?: boolean;
  tags?: string[];
  pais?: string; // 'todos' | 'chile' | 'peru' | etc — filtra por tags de país
}
