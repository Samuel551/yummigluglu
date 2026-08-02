-- ============================================================
-- Hardening de seguridad — hallazgos de la auditoría del 2026-08-02
--
-- Dos problemas distintos, ambos detectados por el linter de Supabase:
--   1. Enumeración de usuarios vía `verificar_email_registrado`.
--   2. `search_path` mutable en 8 funciones SECURITY DEFINER.
-- ============================================================

-- ── 1. ENUMERACIÓN DE USUARIOS ──────────────────────────────────────────────
--
-- `verificar_email_registrado(text)` devuelve si un email existe en auth.users
-- y NO valida quién la llama. Estaba expuesta a `anon` vía
-- /rest/v1/rpc/verificar_email_registrado, así que cualquiera con la anon key
-- (que es pública y viaja en el APK) podía iterar una lista de emails y sacar
-- el padrón de usuarios de la app.
--
-- En una app de alimentación infantil eso no es un dato neutro: revela que esa
-- persona tiene un hijo pequeño. Es material para phishing dirigido y es
-- tratamiento de datos personales.
--
-- Se usaba en el reset de contraseña para decir "Este correo no está
-- registrado". Esa UX es justamente el antipatrón: convierte el formulario en
-- un buscador de usuarios. El cliente ahora manda el reset siempre y muestra
-- un mensaje neutro (Supabase tampoco revela si el email existe).
--
-- Se REVOCA en vez de DROP: es reversible y no rompe nada que aún la llame.
revoke execute on function public.verificar_email_registrado(text) from anon;
revoke execute on function public.verificar_email_registrado(text) from authenticated;
revoke execute on function public.verificar_email_registrado(text) from public;

-- ── 2. `search_path` MUTABLE EN FUNCIONES SECURITY DEFINER ──────────────────
--
-- Una función SECURITY DEFINER sin `search_path` fijo se ejecuta con el
-- search_path de QUIEN LA LLAMA. Un atacante que pueda crear objetos en un
-- schema que quede antes en ese path logra que la función lea SU tabla en vez
-- de la real — con los privilegios del dueño de la función. Eso es escalada de
-- privilegios.
--
-- `es_admin()` es la más sensible: es la que autoriza TODAS las escrituras
-- sobre `recetas`. Si se la puede engañar, se cae el panel de administración
-- entero.
--
-- Se usa `ALTER FUNCTION ... SET search_path` en vez de reescribir los cuerpos:
-- fija el path sin tocar una línea de lógica, así que el riesgo de regresión es
-- nulo. `pg_temp` va AL FINAL a propósito — si no se nombra, Postgres lo pone
-- primero y un atacante puede shadowear tablas con temporales.
alter function public.es_admin() set search_path = public, pg_temp;
alter function public.stats_admin() set search_path = public, pg_temp;
alter function public.user_es_premium(uuid) set search_path = public, pg_temp;
alter function public.check_limite_perfiles_free() set search_path = public, pg_temp;
alter function public.check_limite_recordatorios_free() set search_path = public, pg_temp;
alter function public.crear_suscripcion_gratuita() set search_path = public, pg_temp;
alter function public.touch_updated_at() set search_path = public, pg_temp;
alter function public.update_updated_at_column() set search_path = public, pg_temp;
alter function public.touch_conversaciones_ia() set search_path = public, pg_temp;

-- ── NO SE TOCA (falsos positivos del linter, verificados) ───────────────────
--
-- `stats_admin()` aparece como "ejecutable por anon", pero valida
-- `IF NOT es_admin() THEN RAISE EXCEPTION` en su primera línea: un anónimo
-- recibe una excepción, no datos.
--
-- `recetas_teaser` sale como ERROR `security_definer_view`. Es INTENCIONAL y
-- está documentado en CLAUDE.md: es lo que permite gatear `video_url` por
-- usuario. NO cambiar a security_invoker.
--
-- `webhook_events_procesados` tiene RLS sin policies. También intencional:
-- solo `service_role` debe tocarla, y sin policies queda cerrada a todo lo demás.
