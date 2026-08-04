-- ============================================================
-- 034 — Hardening: listado del bucket público y fuga de estado premium
--
-- Dos ajustes de mínimo privilegio, ambos verificados contra el uso real
-- antes de escribirlos. Ninguno cambia el comportamiento de la app.
-- ============================================================

-- ── 1. Bucket `recetas-imagenes`: quitar el SELECT abierto ──────────────────
--
-- La policy daba `SELECT` sobre `storage.objects` al rol `public`, lo que además
-- de servir las imágenes permitía **LISTAR todos los archivos del bucket**.
--
-- Para servir imágenes NO hace falta: en un bucket público, el endpoint
-- `/storage/v1/object/public/...` no evalúa RLS. Verificado antes de borrarla:
--   · las 207 recetas guardan una URL `/object/public/` (0 firmadas, 0 externas)
--   · `lib/storage.ts` usa `getPublicUrl()`, que arma el string en el cliente
--     y ni siquiera hace una request
--   · la subida del admin usa `upsert: false` → INSERT puro, no necesita SELECT
--
-- Las policies de INSERT/UPDATE/DELETE de admins quedan intactas.
drop policy if exists "publico lee imagenes recetas" on storage.objects;

-- ── 2. `user_es_premium(uuid)`: sacarla de la API pública ───────────────────
--
-- Era invocable por `anon` vía `/rest/v1/rpc/user_es_premium`. Con la anon key
-- (pública, viaja dentro del APK) cualquiera podía preguntar si un `user_id`
-- dado es premium. No es crítico —hay que conocer el UUID, que no es
-- enumerable— pero es una fuga de estado de pago que no le sirve a nadie.
--
-- Verificado que es seguro revocar: no la referencia NINGUNA policy ni vista
-- (consultado `pg_policies` y `pg_views`). Sus dos únicos llamadores son:
--   · la Edge Function `nutribot`, que usa `service_role`
--   · los triggers `check_limite_perfiles_free` / `check_limite_recordatorios_free`,
--     que son SECURITY DEFINER y corren como el owner
--
-- El `grant` explícito a `service_role` NO es decorativo: `revoke ... from public`
-- le saca el permiso que ese rol heredaba de PUBLIC. Sin esta línea, NutriBot
-- dejaría de poder verificar la suscripción.
revoke execute on function public.user_es_premium(uuid) from public;
revoke execute on function public.user_es_premium(uuid) from anon;
revoke execute on function public.user_es_premium(uuid) from authenticated;
grant execute on function public.user_es_premium(uuid) to service_role;
