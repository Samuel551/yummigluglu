-- ─── Migración 021 — Gate premium para cantidad de perfiles_hijos ────────────
--
-- Free: hasta 2 perfiles_hijos por usuario.
-- Premium: ilimitados.
--
-- Defensa en profundidad: el cliente (store/usePerfilStore.ts y
-- app/(tabs)/perfil.tsx) ya chequea esPremium antes de mostrar el botón y
-- antes del insert. Este trigger es la defensa de servidor contra clientes
-- modificados o llamadas directas a la API.
--
-- Reusa public.user_es_premium(uuid) definida en 017_recordatorios.sql.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.check_limite_perfiles_free()
returns trigger
language plpgsql
security definer
as $$
declare
  cantidad_actuales int;
  es_user_premium boolean;
begin
  -- Solo aplica en INSERT — los UPDATE/DELETE no necesitan límite
  if tg_op <> 'INSERT' then
    return new;
  end if;

  es_user_premium := public.user_es_premium(new.user_id);

  -- Premium: pasar sin restricción
  if es_user_premium then
    return new;
  end if;

  -- Free: contar perfiles existentes
  select count(*) into cantidad_actuales
  from public.perfiles_hijos
  where user_id = new.user_id;

  if cantidad_actuales >= 2 then
    raise exception 'Plan gratuito: máximo 2 perfiles (% actuales)', cantidad_actuales
      using errcode = 'P0001',
            hint = 'Activa Premium para perfiles ilimitados.';
  end if;

  return new;
end;
$$;

drop trigger if exists trigger_limite_perfiles_insert on public.perfiles_hijos;
create trigger trigger_limite_perfiles_insert
  before insert on public.perfiles_hijos
  for each row execute function public.check_limite_perfiles_free();

-- Refrescar el cache del schema de PostgREST (convención del proyecto)
notify pgrst, 'reload schema';
