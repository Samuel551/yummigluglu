-- ============================================================
-- Fase 6 — NutriBot: control de consumo (rate limiting)
--
-- POR QUÉ EXISTE ESTO:
-- Cada mensaje a NutriBot cuesta plata real (Anthropic API). Sin un tope
-- server-side, un solo usuario con un script puede generar miles de mensajes
-- en un día y quemar la cuenta. El límite NO puede vivir en el cliente:
-- el cliente es del atacante.
--
-- DISEÑO:
-- - Cupo MENSUAL (no diario). Un tope diario de N permite N*30 al mes, que
--   para un usuario free es mucho más de lo que jamás compensa la publicidad.
-- - El consumo se descuenta ANTES de llamar a Anthropic, de forma atómica.
-- - Solo la Edge Function (service_role) puede escribir. El usuario lee lo
--   suyo para que la UI pueda mostrar "te quedan N mensajes".
-- ============================================================

create table if not exists public.uso_nutribot (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  periodo    text        not null,           -- 'YYYY-MM' en UTC
  mensajes   integer     not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, periodo),
  constraint uso_nutribot_mensajes_no_negativo check (mensajes >= 0)
);

comment on table public.uso_nutribot is
  'Consumo mensual de mensajes de NutriBot por usuario. Escrita solo por la Edge Function nutribot vía service_role.';

-- 1. RLS SIEMPRE antes de los grants
alter table public.uso_nutribot enable row level security;

-- 2. GRANTs explícitos (obligatorio para tablas nuevas — ver CLAUDE.md § Migraciones)
--    Sin grant a `anon`: esta tabla no tiene nada que hacer sin sesión.
grant select on public.uso_nutribot to authenticated;
grant select, insert, update, delete on public.uso_nutribot to service_role;

-- 3. Policies — el usuario solo LEE su propio consumo. No escribe nunca.
create policy "usuarios leen su propio consumo de nutribot"
  on public.uso_nutribot for select to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Consumo atómico de un crédito.
--
-- Devuelve (permitido, usados, limite). Incrementa el contador SOLO si queda
-- cupo, en una sola sentencia — el UPSERT con WHERE toma un lock de fila, así
-- que dos requests concurrentes del mismo usuario no pueden pasarse del tope.
-- Un check-then-increment en dos pasos SÍ tendría esa carrera.
--
-- Solo service_role puede ejecutarla: si `authenticated` pudiera llamarla,
-- un usuario podría gastar sus propios créditos sin recibir respuesta (DoS a
-- sí mismo), o peor, sondear el estado de otros.
-- ============================================================
create or replace function public.consumir_credito_nutribot(
  p_user_id uuid,
  p_limite  integer
)
returns table (permitido boolean, usados integer, limite integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_periodo text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_usados  integer;
begin
  if p_limite is null or p_limite <= 0 then
    return query select false, 0, coalesce(p_limite, 0);
    return;
  end if;

  insert into public.uso_nutribot as u (user_id, periodo, mensajes, updated_at)
  values (p_user_id, v_periodo, 1, now())
  on conflict (user_id, periodo) do update
     set mensajes   = u.mensajes + 1,
         updated_at = now()
   where u.mensajes < p_limite          -- cupo agotado → no actualiza y no devuelve fila
  returning u.mensajes into v_usados;

  if v_usados is null then
    -- El WHERE bloqueó el incremento: ya estaba en el tope.
    select u2.mensajes into v_usados
      from public.uso_nutribot u2
     where u2.user_id = p_user_id and u2.periodo = v_periodo;
    return query select false, coalesce(v_usados, 0), p_limite;
  else
    return query select true, v_usados, p_limite;
  end if;
end;
$$;

-- Nadie más que la Edge Function.
revoke all on function public.consumir_credito_nutribot(uuid, integer) from public;
revoke all on function public.consumir_credito_nutribot(uuid, integer) from anon;
revoke all on function public.consumir_credito_nutribot(uuid, integer) from authenticated;
grant execute on function public.consumir_credito_nutribot(uuid, integer) to service_role;

-- Índice para el barrido de limpieza de períodos viejos (housekeeping futuro).
create index if not exists uso_nutribot_periodo_idx on public.uso_nutribot (periodo);
