-- ============================================================
-- Baby Bites — Normalizar momento_dia: 'merienda' → 'snack'
-- ============================================================
-- El seed de 60 recetas LATAM (005_seed_recetas.sql) introdujo
-- 'merienda' en momento_dia, pero el enum MomentoDia solo
-- acepta: desayuno | almuerzo | cena | snack.
--
-- En runtime, store/usePlanStore.ts:generarDias() crasheaba con
-- "Cannot read property 'push' of undefined" al iterar momentos
-- fuera del enum.
--
-- Esta migración normaliza los datos existentes:
--  - recetas con 'merienda' Y 'snack' → solo remover 'merienda'
--  - recetas con 'merienda' SIN 'snack' → reemplazar por 'snack'
--
-- 'snack' cubre semánticamente la merienda (colación entre comidas).
-- ============================================================

-- 1) Recetas que ya tienen 'snack' — solo limpiar 'merienda'
UPDATE recetas
SET momento_dia = array_remove(momento_dia, 'merienda')
WHERE 'merienda' = ANY(momento_dia)
  AND 'snack' = ANY(momento_dia);

-- 2) Recetas que solo tienen 'merienda' — sustituir por 'snack'
UPDATE recetas
SET momento_dia = array_append(array_remove(momento_dia, 'merienda'), 'snack')
WHERE 'merienda' = ANY(momento_dia);

-- 3) Verificación: ya no debería quedar 'merienda' en ninguna receta
DO $$
DECLARE
  v_restantes INT;
BEGIN
  SELECT COUNT(*) INTO v_restantes
  FROM recetas
  WHERE 'merienda' = ANY(momento_dia);

  IF v_restantes > 0 THEN
    RAISE EXCEPTION 'Quedaron % recetas con momento_dia = merienda', v_restantes;
  END IF;
END $$;
