-- ============================================================
-- Fase 6 — NutriBot: devolución de crédito
--
-- POR QUÉ:
-- El crédito se descuenta ANTES de llamar a Anthropic, a propósito: así un
-- atacante no puede disparar llamadas sin que se le contabilicen. Pero eso
-- tiene un costo justo: si la llamada falla por algo NUESTRO (Anthropic caído,
-- API key mal cargada, timeout), el usuario perdió un mensaje sin recibir nada.
--
-- Esta función devuelve ese crédito. Se llama solo desde la Edge Function
-- cuando la llamada a Anthropic falla o vuelve vacía.
--
-- NO se llama cuando el modelo rechaza la consulta (`stop_reason: refusal`):
-- eso es una llamada real que Anthropic factura y que disparó el propio
-- contenido del usuario.
-- ============================================================

create or replace function public.devolver_credito_nutribot(p_user_id uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.uso_nutribot
     set mensajes   = greatest(0, mensajes - 1),
         updated_at = now()
   where user_id = p_user_id
     and periodo  = to_char(now() at time zone 'utc', 'YYYY-MM');
$$;

-- Solo la Edge Function. Si `authenticated` pudiera llamarla, un usuario se
-- regalaría mensajes infinitos simplemente invocándola en un bucle.
revoke all on function public.devolver_credito_nutribot(uuid) from public;
revoke all on function public.devolver_credito_nutribot(uuid) from anon;
revoke all on function public.devolver_credito_nutribot(uuid) from authenticated;
grant execute on function public.devolver_credito_nutribot(uuid) to service_role;
