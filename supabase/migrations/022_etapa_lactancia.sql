-- Fase: rediseño de rango de edad del onboarding.
-- Agrega la etapa 'lactancia' (bebés 0–5 meses, "solo leche" / pre-alimentación).
-- Antes el onboarding solo permitía 4m–6a; ahora se registra desde el nacimiento
-- y el umbral de inicio de sólidos pasa a los 6 meses (estándar OMS).
-- Ver memoria yummigluglu/onboarding-age-range.

alter table public.perfiles_hijos
  drop constraint if exists perfiles_hijos_etapa_check;

alter table public.perfiles_hijos
  add constraint perfiles_hijos_etapa_check
  check (etapa = any (array['lactancia'::text, 'inicio'::text, 'transicion'::text, 'preescolar'::text]));
