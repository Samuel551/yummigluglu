-- ============================================================
-- Baby Bites — Hardening del webhook de RevenueCat
--
-- Crea tabla `webhook_events_procesados` para idempotencia:
-- evita procesar dos veces el mismo evento (replays / retries de RC).
--
-- RLS: tabla cerrada — solo service_role puede leer/escribir.
-- Los clientes anon/authenticated NO tienen acceso.
--
-- TTL: limpieza manual (o vía cron futuro). Eventos > 30 días
-- se pueden borrar sin riesgo: RC no reintenta más allá de ese plazo.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.webhook_events_procesados (
  event_id     text        PRIMARY KEY,
  event_type   text        NOT NULL,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at
  ON public.webhook_events_procesados (processed_at DESC);

ALTER TABLE public.webhook_events_procesados ENABLE ROW LEVEL SECURITY;

-- No hay policies: con RLS habilitado y sin policies, anon/authenticated
-- no pueden ver ni escribir. Solo service_role (bypass RLS) tiene acceso.

COMMENT ON TABLE public.webhook_events_procesados IS
  'Idempotencia para webhook de RevenueCat. event_id como PK previene replays.';
