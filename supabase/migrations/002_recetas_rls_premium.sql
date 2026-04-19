-- ============================================================
-- Baby Bites — RLS premium para recetas
-- Reemplaza la política permisiva por una que respeta es_premium.
-- Las recetas premium solo son visibles para usuarios con plan
-- premium o premium_anual activo en la tabla suscripciones.
-- ============================================================

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
      )
    )
  );
