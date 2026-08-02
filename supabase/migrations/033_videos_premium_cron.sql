-- ============================================================
-- Job mensual que rota los videos free/premium
--
-- Va en una migración aparte de la 032 a propósito: si `pg_cron` no puede
-- habilitarse (permisos, plan, entorno local), la selección de la 032 ya quedó
-- aplicada y la app funciona igual — solo deja de rotar sola.
-- ============================================================

create extension if not exists pg_cron;

grant usage on schema cron to postgres;

-- Día 1 de cada mes, 03:00 UTC (≈ medianoche en Chile).
--
-- `cron.schedule` hace UPSERT por nombre, así que re-aplicar esta migración no
-- duplica el job.
--
-- La función es SECURITY DEFINER e idempotente: si el job se dispara dos veces
-- el mismo mes, la segunda corrida afecta 0 filas.
select cron.schedule(
  'rotar-videos-premium',
  '0 3 1 * *',
  $$select public.rotar_videos_premium();$$
);

-- Para inspeccionar:  select * from cron.job;
-- Historial de corridas: select * from cron.job_run_details order by start_time desc limit 10;
-- Para desactivar temporalmente: select cron.unschedule('rotar-videos-premium');
