-- ============================================================
-- Yummi Glu Glu — Modo notificación vs alarma
-- ============================================================
-- Agregar campo modo_notificacion a recordatorios para que el user
-- pueda elegir entre:
--   'notificacion': sonido corto, banner normal (Android channel HIGH)
--   'alarma': bypass DND, sticky, vibración larga, sonido de alarma
--             del sistema + reprogramación de N notifs seguidas para
--             simular sonido continuo (Android channel MAX + AudioUsage.ALARM)
-- ============================================================

ALTER TABLE public.recordatorios
  ADD COLUMN IF NOT EXISTS modo_notificacion text NOT NULL DEFAULT 'notificacion'
  CHECK (modo_notificacion IN ('notificacion', 'alarma'));

-- Comentario para que quede claro en futuras consultas al schema
COMMENT ON COLUMN public.recordatorios.modo_notificacion IS
  'Tipo de aviso: "notificacion" (banner normal) o "alarma" (sticky + AudioUsage.ALARM + bypass DND).';

-- Invalidar schema cache de PostgREST para que la API vea la nueva columna.
-- Sin esto, los inserts fallan con "Could not find the 'modo_notificacion' column in the schema cache".
NOTIFY pgrst, 'reload schema';
