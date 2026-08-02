/**
 * Cupos mensuales de NutriBot.
 *
 * ⚠️ ESTOS VALORES SON SOLO PARA LA UI (mostrar "te quedan N mensajes").
 * El límite REAL lo aplica la Edge Function `nutribot` server-side, leyendo
 * las env vars `NUTRIBOT_LIMITE_FREE` / `NUTRIBOT_LIMITE_PREMIUM` de Supabase.
 *
 * Si cambiás los cupos allá, actualizá estos números acá o la UI va a mostrar
 * un contador que no coincide con lo que hace el servidor. La fuente de verdad
 * siempre es el servidor: la respuesta de cada mensaje trae `usados` y `limite`
 * reales, y el store se sincroniza con eso.
 */
export const NUTRIBOT_LIMITE_FREE = 20;
export const NUTRIBOT_LIMITE_PREMIUM = 250;

/** Largo máximo de un mensaje del usuario. Debe coincidir con MAX_CHARS_MENSAJE. */
export const NUTRIBOT_MAX_CHARS = 1500;

/** Cuántos turnos previos se reenvían como contexto. Debe coincidir con MAX_TURNOS_HISTORIAL. */
export const NUTRIBOT_MAX_TURNOS_HISTORIAL = 10;

/** Sugerencias que se muestran en el estado vacío del chat. */
export const NUTRIBOT_SUGERENCIAS = [
  '¿Qué le puedo dar de cena hoy?',
  'Rechaza todas las verduras, ¿qué hago?',
  '¿Cómo introduzco el huevo?',
  '¿Qué texturas van para su edad?',
] as const;
