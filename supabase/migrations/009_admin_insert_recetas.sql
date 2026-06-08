-- ============================================================
-- Yummi Glu Glu — INSERT policy de recetas para admin
-- ============================================================
-- La migración 003_admin_panel.sql dio al admin SELECT + UPDATE
-- en recetas, pero olvidó INSERT. Sin esta policy, el panel admin
-- no puede crear recetas nuevas — RLS rechaza el insert.
--
-- Esta migración cierra esa brecha. Solo admins (función es_admin())
-- pueden insertar. La policy WITH CHECK aplica al nuevo registro.
-- ============================================================

CREATE POLICY "admin puede insertar recetas"
  ON recetas FOR INSERT
  WITH CHECK (es_admin());
