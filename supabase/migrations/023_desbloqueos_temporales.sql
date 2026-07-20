-- ============================================================
-- Yummi Glu Glu — Desbloqueos temporales (rewarded ads)
--
-- Permite que un usuario FREE desbloquee una receta premium por 24h
-- después de ver un anuncio recompensado (rewarded). Dos piezas:
--
--  1. Tabla `desbloqueos_temporales` — un desbloqueo por (user, receta),
--     con expiración. Solo la Edge Function `canjear-desbloqueo`
--     (service_role) puede escribirla; el cliente NO puede auto-regalarse
--     desbloqueos. El usuario solo LEE los suyos (para pintar el estado).
--
--  2. Vista `recetas_teaser` — fuente de lectura user-facing del catálogo
--     y el detalle. Expone las columnas LIVIANAS (teaser) de TODAS las
--     recetas activas (incluidas premium, para que el free las descubra
--     con candado) pero GATEA el contenido pesado (ingredientes, pasos,
--     video, nutrición): solo viaja si el usuario tiene derecho
--     (suscripción premium activa O desbloqueo vigente).
--
-- IMPORTANTE — `security_invoker = false` (definer) es INTENCIONAL:
--   necesitamos que la vista IGNORE la RLS de `recetas` para poder mostrar
--   las premium como teaser. La protección del contenido premium NO depende
--   de la RLS acá, sino del `CASE ... entitled` por columna. El linter de
--   Supabase marcará "security definer view" — es esperado y correcto.
--   NO se toca la RLS existente de `recetas` (002) → el gating pago actual
--   sigue intacto para lecturas directas (admin, videos, plan, etc.).
-- ============================================================

-- ─── 1. Tabla de desbloqueos ─────────────────────────────────
create table if not exists public.desbloqueos_temporales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  receta_id uuid not null references public.recetas(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, receta_id)
);

-- RLS SIEMPRE antes de los grants (regla CLAUDE.md tablas nuevas)
alter table public.desbloqueos_temporales enable row level security;

-- Grants explícitos (Data API change post 30-oct-2026):
-- el usuario solo lee; escribir es exclusivo de la Edge Function (service_role).
grant select on public.desbloqueos_temporales to authenticated;
grant select, insert, update, delete on public.desbloqueos_temporales to service_role;

-- El usuario ve SOLO sus propios desbloqueos (para chequear estado en cliente).
-- Sin policy de INSERT/UPDATE para `authenticated` → no puede auto-regalarse nada.
create policy "usuarios ven sus desbloqueos"
  on public.desbloqueos_temporales for select to authenticated
  using (auth.uid() = user_id);

-- Índice para el chequeo de vigencia (user + receta + no expirado).
create index if not exists idx_desbloqueos_user_receta
  on public.desbloqueos_temporales (user_id, receta_id, expires_at);

-- ─── 2. Vista teaser (fuente de lectura user-facing) ─────────
create or replace view public.recetas_teaser
with (security_invoker = false) as
select
  -- Columnas TEASER: siempre visibles (permiten descubrir la receta premium).
  r.id,
  r.slug,
  r.nombre,
  r.descripcion,
  r.imagen_url,
  r.momento_dia,
  r.etapas_compatibles,
  r.tiempo_preparacion,
  r.porciones_base,
  r.alergenos,
  r.tags,
  r.es_premium,
  r.activa,
  r.created_at,
  -- Columnas de CONTENIDO premium: solo viajan si el usuario tiene derecho.
  case when ent.entitled then r.ingredientes else '[]'::jsonb end as ingredientes,
  case when ent.entitled then r.pasos else '[]'::jsonb end as pasos,
  case when ent.entitled then r.video_url else null end as video_url,
  case when ent.entitled then r.calorias else null end as calorias,
  case when ent.entitled then r.proteinas else null end as proteinas,
  case when ent.entitled then r.carbohidratos else null end as carbohidratos,
  case when ent.entitled then r.grasas else null end as grasas,
  case when ent.entitled then r.hierro else null end as hierro
from public.recetas r
cross join lateral (
  select (
    r.es_premium = false
    or exists (
      select 1 from public.suscripciones s
      where s.user_id = auth.uid()
        and s.plan in ('premium', 'premium_anual')
        and s.activa = true
    )
    or exists (
      select 1 from public.desbloqueos_temporales d
      where d.user_id = auth.uid()
        and d.receta_id = r.id
        and d.expires_at > now()
    )
  ) as entitled
) ent
where r.activa = true;

-- La vista se consume desde el cliente autenticado (catálogo + detalle).
grant select on public.recetas_teaser to authenticated;
