-- ============================================================
-- 035 — Métricas de NutriBot en el panel de administración
--
-- Extiende `stats_admin()` con el uso del asistente. Solo AGREGADOS.
--
-- 🔴 LÍNEA QUE NO SE CRUZA: acá NUNCA se expone el contenido de
-- `conversaciones_ia`. La gente le escribe al bot cosas como "mi hija de 8
-- meses vomita cuando come huevo" — son consultas de salud sobre menores.
-- Hoy la RLS impide que nadie más que el dueño las lea, y para que un admin
-- las viera habría que romper esa protección A PROPÓSITO. No hacerlo.
-- Métricas de volumen sí; texto de las conversaciones no.
-- ============================================================

create or replace function public.stats_admin()
returns json
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  resultado json;
  -- Costo por mensaje medido el 2026-08-02 (input + output promedio).
  --
  -- 🔴 Este número CADUCA el 2026-08-31: Claude Sonnet 5 está en precio
  -- introductorio ($2/$10 por millón) y desde el 1 de septiembre pasa a
  -- $3/$15. A partir de esa fecha el valor real ronda los 0.0125.
  -- Si el gasto que muestra el panel deja de cuadrar con la factura de
  -- Anthropic, este es el primer sospechoso.
  costo_por_mensaje constant numeric := 0.0083;
  periodo_actual constant text := to_char(now(), 'YYYY-MM');
begin
  -- La autorización real vive acá dentro, NO en el cliente: la función es
  -- SECURITY DEFINER y sin este guard cualquiera con la anon key leería las
  -- estadísticas del negocio.
  if not es_admin() then
    raise exception 'No autorizado';
  end if;

  select json_build_object(
    'total_usuarios',     (select count(*)::int from auth.users),
    'total_recetas',      (select count(*)::int from recetas),
    'recetas_activas',    (select count(*)::int from recetas where activa = true),
    'recetas_premium',    (select count(*)::int from recetas where es_premium = true),
    'recetas_sin_video',  (select count(*)::int from recetas where video_url is null or video_url = ''),
    'total_favoritos',    (select count(*)::int from favoritos),

    -- ── NutriBot ──────────────────────────────────────────────────────────
    -- `uso_nutribot` tiene una fila por (usuario, periodo), así que contar
    -- filas del periodo actual ES la cantidad de usuarios que lo usaron
    -- este mes. No hace falta un distinct.
    'nutribot_usuarios_mes',
      (select count(*)::int from uso_nutribot where periodo = periodo_actual),
    'nutribot_mensajes_mes',
      (select coalesce(sum(mensajes), 0)::int from uso_nutribot where periodo = periodo_actual),
    'nutribot_mensajes_total',
      (select coalesce(sum(mensajes), 0)::int from uso_nutribot),
    'nutribot_costo_mes',
      (select round(coalesce(sum(mensajes), 0) * costo_por_mensaje, 2)
         from uso_nutribot where periodo = periodo_actual)
  ) into resultado;

  return resultado;
end;
$function$;

-- Sin grants nuevos: la función ya existía y conserva los suyos. El guard
-- `es_admin()` es lo que decide, no el permiso de EXECUTE.
