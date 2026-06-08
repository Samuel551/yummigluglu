-- ============================================================
-- Yummi Glu Glu — Cleanup de momento_dia
-- ============================================================
-- Problema: 22 recetas tienen momento_dia con múltiples momentos
-- (ej. ['desayuno','almuerzo']) lo que ensucia el filtro por momento.
-- El usuario filtra "Desayuno" y se cuelan recetas más típicas de almuerzo.
--
-- Solución: dejar cada receta en SU momento más representativo.
-- Las combinaciones ['almuerzo','cena'] se MANTIENEN — son legítimas
-- (un puré puede ser almuerzo o cena indistintamente).
-- ============================================================

-- ─── [desayuno, almuerzo] → solo desayuno (son desayunos típicos LATAM) ───
UPDATE recetas SET momento_dia = ARRAY['desayuno']
WHERE slug IN (
  'calentado-caleno-baby',       -- Colombia: sobras del día anterior con huevo (clásico de desayuno)
  'perico-baby-venezuela',       -- Venezuela: huevo revuelto = desayuno
  'chilaquiles-dulces-baby-mexico' -- México: chilaquiles dulces = desayuno típico
);

-- ─── [almuerzo, cena, snack] → solo almuerzo (tortillas y empanadas son comida principal) ───
UPDATE recetas SET momento_dia = ARRAY['almuerzo','cena']
WHERE slug IN (
  'mini-tortilla-de-acelga',
  'tortilla-espanola-de-papas',
  'empanadas-de-pino-horneadas',
  'tortilla-de-espinaca-y-queso'
);

-- ─── [desayuno, snack, cena] → solo desayuno (arepa con queso típico de desayuno) ───
UPDATE recetas SET momento_dia = ARRAY['desayuno']
WHERE slug = 'arepa-horno-queso-baby-venezuela';

-- ─── [almuerzo, snack] o [snack, almuerzo] — caso por caso ───
-- Son almuerzo (platos principales sustanciosos)
UPDATE recetas SET momento_dia = ARRAY['almuerzo','cena']
WHERE slug IN (
  'completo-casero-infantil',          -- pancito con vienesa = comida principal
  'empanadas-pino-horno-baby',         -- empanadas chilenas con carne
  'pure-camote-platano-selva-peru',    -- puré principal peruano
  'pure-ahuyama-coco-colombia',        -- puré principal colombiano
  'crema-jojoto-coco-venezuela',       -- crema completa venezolana
  'empanada-tucumana-baby-argentina'   -- empanada tucumana
);

-- Son snack/merienda (untables, postres, acompañamientos)
UPDATE recetas SET momento_dia = ARRAY['snack']
WHERE slug IN (
  'pure-palta-choclo-chile',          -- puré untable (snack)
  'patacones-horno-hogao-colombia',   -- patacones = snack típico
  'pure-batata-leche-canela-argentina', -- puré dulce = merienda
  'pure-aguacate-limon-mexico'        -- guacamole baby = snack
);

-- ─── [snack, cena] → solo snack (son postres/meriendas, no cenas formales) ───
UPDATE recetas SET momento_dia = ARRAY['snack']
WHERE slug IN (
  'budin-de-zapallo',
  'humitas-dulces-baby',
  'mazamorra-maiz-blanco-colombia'
);

-- ─── Validación post-cleanup ───
-- Devuelve recetas con momento_dia que aún tenga combinaciones sospechosas.
-- Las únicas combinaciones esperadas son: [desayuno], [almuerzo], [cena],
-- [snack], [desayuno,snack], [snack,desayuno], [almuerzo,cena], [cena,almuerzo].
DO $$
DECLARE
  cant_sospechosas INT;
BEGIN
  SELECT COUNT(*) INTO cant_sospechosas
  FROM recetas
  WHERE 'desayuno' = ANY(momento_dia) AND 'almuerzo' = ANY(momento_dia)
     OR 'desayuno' = ANY(momento_dia) AND 'cena' = ANY(momento_dia)
     OR array_length(momento_dia, 1) > 2;

  IF cant_sospechosas > 0 THEN
    RAISE NOTICE 'Atención: % recetas con momento_dia sospechoso aún existen.', cant_sospechosas;
  ELSE
    RAISE NOTICE 'Cleanup OK: ya no hay recetas con momento_dia sospechoso.';
  END IF;
END $$;
