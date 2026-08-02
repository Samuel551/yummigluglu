-- ============================================================
-- Videos premium: selección balanceada + rotación mensual
--
-- PROBLEMA: había 2 videos premium de 207. El modelo freemium no tenía nada
-- que vender y la etapa `preescolar` (94 recetas, la más grande) tenía CERO
-- premium — un padre con un niño de esa edad nunca se cruzaba con un paywall.
--
-- RECORDATORIO CLAVE: `es_premium` gatea SOLO EL VIDEO. La receta (foto,
-- ingredientes, pasos, nutrición) es siempre gratis, y el usuario puede
-- desbloquear un video 24h viendo un anuncio recompensado. Por eso un 50%
-- premium no es un muro: nadie pierde acceso a una receta.
-- ============================================================

-- ── 1. Grupo de rotación ────────────────────────────────────────────────────
--
-- Modelo de dos capas:
--   grupo 0        → SIEMPRE free. El "imán" de marketing, nunca se bloquea.
--   grupos 1, 2, 3 → rotativos: cada mes UNO es free, los otros dos premium.
--
-- Resultado: ~104 free / ~103 premium en cualquier momento, y cada receta
-- rotativa está gratis 1 de cada 3 meses.
alter table public.recetas
  add column if not exists rotacion_grupo smallint not null default 0;

comment on column public.recetas.rotacion_grupo is
  'Capa de rotación del video: 0 = siempre free; 1..3 = rotativo (uno free por mes). Lo consume rotar_videos_premium().';

-- ── 2. Asignación de grupos ─────────────────────────────────────────────────
--
-- `ntile(4)` sobre un hash determinístico del id, particionado por etapa
-- primaria. La etapa es el filtro principal del catálogo, así que balancearla
-- explícitamente es lo que más importa; el hash reparte de forma pareja dentro
-- de cada etapa, lo que equilibra momento del día y país por probabilidad.
--
-- Verificado por simulación contra los datos reales antes de aplicar:
--   etapa   49.4% – 52.1%     momento  49.4% – 51.0%     país  44.4% – 56.5%
--
-- Es determinístico: recalcularlo da exactamente el mismo reparto.
with asignacion as (
  select id,
         ntile(4) over (
           partition by etapas_compatibles[1]
           order by md5(id::text)
         ) - 1 as grupo
  from public.recetas
  where activa
)
update public.recetas r
set rotacion_grupo = a.grupo
from asignacion a
where r.id = a.id;

create index if not exists idx_recetas_rotacion_grupo
  on public.recetas (rotacion_grupo);

-- ── 3. Función de rotación ──────────────────────────────────────────────────
--
-- Un video queda FREE si su grupo es 0 (fijo) o si es el grupo activo del mes.
-- Todo lo demás, premium.
--
-- El grupo activo cicla 2 → 3 → 1 → 2 ... con el número de mes. No importa por
-- cuál arranca: lo que importa es que rote y que el ciclo cierre en 3 meses.
--
-- IDEMPOTENTE: correrla N veces en el mismo mes da el mismo resultado.
--
-- `SET search_path` fijo por la convención de la migración 031 — sin eso, una
-- función SECURITY DEFINER es vulnerable a escalada de privilegios.
create or replace function public.rotar_videos_premium()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  grupo_activo smallint;
  afectadas integer;
begin
  grupo_activo := (extract(month from now())::int % 3) + 1;

  update public.recetas
  set es_premium = not (rotacion_grupo = 0 or rotacion_grupo = grupo_activo)
  where activa
    and es_premium is distinct from
        not (rotacion_grupo = 0 or rotacion_grupo = grupo_activo);

  get diagnostics afectadas = row_count;
  return afectadas;
end;
$$;

comment on function public.rotar_videos_premium() is
  'Recalcula recetas.es_premium según rotacion_grupo y el mes actual. Idempotente. La ejecuta un job de pg_cron el día 1 de cada mes.';

-- Solo el cron (postgres) y el service_role deberían invocarla.
revoke execute on function public.rotar_videos_premium() from anon;
revoke execute on function public.rotar_videos_premium() from authenticated;
revoke execute on function public.rotar_videos_premium() from public;

-- ── 4. Estado inicial ───────────────────────────────────────────────────────
-- Se ejecuta acá para que el primer ciclo quede activo de inmediato: los
-- testers de la prueba cerrada ven la mezcla free/premium sin esperar al día 1.
select public.rotar_videos_premium();
