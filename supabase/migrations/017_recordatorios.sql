-- ============================================================
-- Yummi Glu Glu — Agenda de recordatorios
-- ============================================================
-- Feature: notificaciones programadas para padres
-- Tipos: comida, hidratacion, diario, hito, control, lista_compras
--
-- Modelo Free/Premium (ver memoria yummigluglu/agenda-premium-model):
--   Free:    máximo 3 activos, solo tipos básicos (comida, control, lista_compras)
--   Premium: ilimitados, todos los tipos, recurrencia personalizada
--
-- Defensa en profundidad: el trigger check_limite_recordatorios_free()
-- rechaza inserts/activaciones que excedan el plan free. El cliente además
-- valida UX-side via useSuscripcionStore.esPremium.
-- ============================================================

-- ─── Tabla recordatorios ──────────────────────────────────────
create table if not exists public.recordatorios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  perfil_hijo_id uuid not null references public.perfiles_hijos(id) on delete cascade,

  tipo text not null check (tipo in (
    'comida', 'hidratacion', 'diario', 'hito', 'control', 'lista_compras'
  )),
  titulo text not null,
  descripcion text,

  -- Recurrencia: o fecha_hora (one-shot) o hora_diaria (recurrente).
  -- dias_semana es opcional sobre hora_diaria (premium): array de 0-6 (0=domingo).
  fecha_hora timestamptz,
  hora_diaria time,
  dias_semana int[],

  -- ID local de expo-notifications para cancelar
  notification_id text,

  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint check_recurrencia check (
    fecha_hora is not null or hora_diaria is not null
  )
);

-- ─── Índices ──────────────────────────────────────────────────
create index if not exists idx_recordatorios_user_activo
  on public.recordatorios (user_id, activo);

create index if not exists idx_recordatorios_perfil
  on public.recordatorios (perfil_hijo_id);

create index if not exists idx_recordatorios_fecha_hora
  on public.recordatorios (fecha_hora)
  where fecha_hora is not null and activo = true;

-- ─── RLS ──────────────────────────────────────────────────────
alter table public.recordatorios enable row level security;

-- ─── GRANTs (convención post-30-oct-2026) ─────────────────────
grant select, insert, update, delete on public.recordatorios to authenticated;
grant select, insert, update, delete on public.recordatorios to service_role;

-- ─── Policies ─────────────────────────────────────────────────
create policy "users seleccionan sus recordatorios"
  on public.recordatorios for select to authenticated
  using (auth.uid() = user_id);

create policy "users insertan sus recordatorios"
  on public.recordatorios for insert to authenticated
  with check (auth.uid() = user_id);

create policy "users actualizan sus recordatorios"
  on public.recordatorios for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users eliminan sus recordatorios"
  on public.recordatorios for delete to authenticated
  using (auth.uid() = user_id);

-- ─── Helper: ¿el user es premium? ─────────────────────────────
-- Reutilizable desde triggers. SECURITY DEFINER porque chequea suscripciones
-- de cualquier user (lo necesita el trigger de límite free).
create or replace function public.user_es_premium(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.suscripciones
    where user_id = uid
      and activa = true
      and plan in ('premium', 'premium_anual')
      and (expires_at is null or expires_at > now())
  );
$$;

-- ─── Trigger: límite free + tipos restringidos ────────────────
create or replace function public.check_limite_recordatorios_free()
returns trigger
language plpgsql
security definer
as $$
declare
  cantidad_activos int;
  es_user_premium boolean;
begin
  -- En UPDATE solo chequeamos si el recordatorio se está activando
  -- (de inactivo → activo). Cualquier otro update pasa sin check.
  if tg_op = 'UPDATE' then
    if old.activo = true or new.activo = false then
      return new;
    end if;
  end if;

  -- Solo aplicamos el check cuando el row queda activo
  if new.activo = false then
    return new;
  end if;

  es_user_premium := public.user_es_premium(new.user_id);

  if es_user_premium then
    return new;
  end if;

  -- ─── Restricciones para users free ───────────────────────────
  -- Tipos disponibles: comida, control, lista_compras
  if new.tipo not in ('comida', 'control', 'lista_compras') then
    raise exception 'El tipo de recordatorio "%" requiere Premium', new.tipo
      using errcode = 'P0001',
            hint = 'Suscribite a Premium para activar hitos, hidratación y diario.';
  end if;

  -- Recurrencia personalizada (dias_semana custom) requiere premium
  if new.dias_semana is not null and array_length(new.dias_semana, 1) > 0 then
    raise exception 'La recurrencia personalizada requiere Premium'
      using errcode = 'P0001',
            hint = 'Premium permite repetir días específicos (ej. lun-mié-vie).';
  end if;

  -- Máximo 3 recordatorios activos
  select count(*) into cantidad_activos
  from public.recordatorios
  where user_id = new.user_id
    and activo = true
    and (tg_op = 'INSERT' or id <> new.id);

  if cantidad_activos >= 3 then
    raise exception 'Plan gratuito: máximo 3 recordatorios activos (% actuales)', cantidad_activos
      using errcode = 'P0001',
            hint = 'Suscribite a Premium para recordatorios ilimitados.';
  end if;

  return new;
end;
$$;

drop trigger if exists trigger_limite_recordatorios_insert on public.recordatorios;
create trigger trigger_limite_recordatorios_insert
  before insert on public.recordatorios
  for each row execute function public.check_limite_recordatorios_free();

drop trigger if exists trigger_limite_recordatorios_update on public.recordatorios;
create trigger trigger_limite_recordatorios_update
  before update on public.recordatorios
  for each row execute function public.check_limite_recordatorios_free();

-- ─── Trigger: updated_at automático ───────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trigger_recordatorios_updated_at on public.recordatorios;
create trigger trigger_recordatorios_updated_at
  before update on public.recordatorios
  for each row execute function public.touch_updated_at();
