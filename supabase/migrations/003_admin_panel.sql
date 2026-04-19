-- ============================================================
-- Baby Bites — Panel de administración
-- ============================================================

-- ─── video_url en recetas ─────────────────────────────────────
ALTER TABLE recetas ADD COLUMN IF NOT EXISTS video_url TEXT;

-- ─── Tabla admins ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins ven su propio registro"
  ON admins FOR SELECT
  USING (auth.uid() = user_id);

-- ─── Función helper: ¿el usuario actual es admin? ─────────────
CREATE OR REPLACE FUNCTION es_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
$$;

-- ─── Función de setup: registrar el primer admin ──────────────
-- Solo funciona si la tabla admins está vacía (primer uso).
CREATE OR REPLACE FUNCTION registrar_primer_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM admins) > 0 THEN
    RETURN FALSE;
  END IF;
  INSERT INTO admins (user_id) VALUES (auth.uid());
  RETURN TRUE;
END;
$$;

-- ─── Políticas de recetas para admin ─────────────────────────
-- Admin ve TODAS las recetas (incluso inactivas y premium)
CREATE POLICY "admin ve todas las recetas"
  ON recetas FOR SELECT
  USING (es_admin());

-- Admin puede actualizar recetas
CREATE POLICY "admin puede actualizar recetas"
  ON recetas FOR UPDATE
  USING (es_admin());

-- ─── Función de estadísticas del panel ────────────────────────
CREATE OR REPLACE FUNCTION stats_admin()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resultado JSON;
BEGIN
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT json_build_object(
    'total_usuarios',     (SELECT COUNT(*)::INT FROM auth.users),
    'total_recetas',      (SELECT COUNT(*)::INT FROM recetas),
    'recetas_activas',    (SELECT COUNT(*)::INT FROM recetas WHERE activa = TRUE),
    'recetas_premium',    (SELECT COUNT(*)::INT FROM recetas WHERE es_premium = TRUE),
    'recetas_sin_video',  (SELECT COUNT(*)::INT FROM recetas WHERE video_url IS NULL OR video_url = ''),
    'total_favoritos',    (SELECT COUNT(*)::INT FROM favoritos)
  ) INTO resultado;

  RETURN resultado;
END;
$$;
