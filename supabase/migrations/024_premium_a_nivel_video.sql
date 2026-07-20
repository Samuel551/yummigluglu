-- ============================================================
-- Yummi Glu Glu — Premium a nivel VIDEO (no receta)
--
-- Cambio de modelo: `es_premium` ahora significa "el VIDEO de esta receta
-- es premium". Las RECETAS quedan SIEMPRE free (ingredientes, pasos,
-- nutrición, imagen). Solo el `video_url` se gatea (suscripción premium O
-- desbloqueo por anuncio recompensado).
--
-- Motivo: modelo freemium del owner — recetas gratis como imán de marketing,
-- videos premium como monetización. El owner intercala videos free/premium
-- por receta desde el panel admin (toggle "Video Premium").
-- ============================================================

-- 1. RLS: todas las recetas activas visibles para autenticados.
--    (Se quita el gate por es_premium en la fila — el contenido de receta es free.)
drop policy if exists "recetas visibles para autenticados" on public.recetas;
create policy "recetas visibles para autenticados"
  on public.recetas for select
  using (activa = true and auth.role() = 'authenticated');

-- 2. Vista teaser: ahora gatea SOLO `video_url`. Todo lo demás siempre free.
--    security_invoker = false (definer) INTENCIONAL: la vista lee video_url como
--    owner y lo gatea por CASE según entitlement. El linter marca ERROR
--    'security definer view' — esperado y seguro.
--    DROP + CREATE (no REPLACE) porque cambia el orden de columnas de la vista.
drop view if exists public.recetas_teaser;
create view public.recetas_teaser
with (security_invoker = false) as
select
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
  -- Contenido de receta: SIEMPRE free ahora.
  r.ingredientes,
  r.pasos,
  r.calorias,
  r.proteinas,
  r.carbohidratos,
  r.grasas,
  r.hierro,
  -- Video: se muestra si NO es premium, o si el usuario tiene derecho
  -- (suscripción premium activa O desbloqueo vigente por anuncio).
  case when (
    r.es_premium = false
    or r.video_url is null
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
  ) then r.video_url else null end as video_url
from public.recetas r
where r.activa = true;

grant select on public.recetas_teaser to authenticated;

-- 3. Limpieza: una receta marcada premium SIN video ya no tiene sentido
--    (es_premium ahora = "tiene video premium"). Las pasamos a free.
update public.recetas set es_premium = false
where es_premium = true and video_url is null;
