-- ============================================================
-- Baby Bites — Seguridad premium (Fase 7b)
-- ============================================================

-- ─── Fix suscripciones: solo lectura para usuarios ───────────
-- ANTES: FOR ALL permitía que cualquier usuario hiciera
--   UPDATE suscripciones SET plan = 'premium' WHERE user_id = auth.uid()
-- AHORA: solo SELECT. El webhook de RevenueCat (service role)
-- es el ÚNICO que puede escribir en esta tabla.
DROP POLICY IF EXISTS "usuarios ven su propia suscripción" ON suscripciones;

CREATE POLICY "usuarios leen su propia suscripción"
  ON suscripciones FOR SELECT
  USING (auth.uid() = user_id);

-- ─── Fix recetas: agregar check de expires_at ────────────────
-- La política anterior no chequeaba expires_at. Una suscripción
-- vencida con activa=TRUE seguía habilitando acceso premium.
DROP POLICY IF EXISTS "recetas visibles para autenticados" ON recetas;

CREATE POLICY "recetas visibles para autenticados"
  ON recetas FOR SELECT
  USING (
    activa = TRUE
    AND auth.role() = 'authenticated'
    AND (
      es_premium = FALSE
      OR EXISTS (
        SELECT 1 FROM suscripciones
        WHERE user_id = auth.uid()
          AND plan IN ('premium', 'premium_anual')
          AND activa = TRUE
          AND (expires_at IS NULL OR expires_at > NOW())
      )
    )
  );

-- ─── Trigger: crear fila free para nuevos usuarios ───────────
-- Cada usuario nuevo arranca con plan free automáticamente.
CREATE OR REPLACE FUNCTION crear_suscripcion_gratuita()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO suscripciones (user_id, plan, activa)
  VALUES (NEW.id, 'free', true)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_nueva_suscripcion ON auth.users;
CREATE TRIGGER trigger_nueva_suscripcion
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION crear_suscripcion_gratuita();

-- ─── Seed: crear filas free para usuarios existentes ─────────
INSERT INTO suscripciones (user_id, plan, activa)
SELECT id, 'free', true FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
