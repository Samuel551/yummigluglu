-- ============================================================
-- Baby Bites — Seed de 60 recetas reales LATAM/Chile
-- Todas FREE, distribuidas entre inicio (6-11m), transicion (12-23m) y preescolar (24m+)
-- Idempotente: ON CONFLICT (slug) DO NOTHING
--
-- Distribución:
--   Inicio solo:                12
--   Inicio + Transicion:         6
--   Transicion solo:            10
--   Transicion + Preescolar:    10
--   Preescolar solo:            22
--   Total:                      60
-- ============================================================

-- ─── INICIO SOLO (6-11m): papillas y purés suaves ──────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-de-zapallo-y-camote', 'Puré de zapallo y camote', 'Puré suave y dulce ideal para comenzar con sólidos. Rico en vitamina A.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 20, 2, ARRAY[]::text[], 85, 1.8, 18, 0.5, 0.7,
'[{"id":"zapallo","nombre":"Zapallo","cantidad":150,"unidad":"g","calorias_por_100g":26},{"id":"camote","nombre":"Camote","cantidad":100,"unidad":"g","calorias_por_100g":86},{"id":"agua","nombre":"Agua hervida","cantidad":50,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Pela el zapallo y el camote, y córtalos en cubos pequeños.","duracion_min":5},{"orden":2,"descripcion":"Cocina al vapor durante 15 minutos hasta que estén blandos.","duracion_min":15},{"orden":3,"descripcion":"Procesa con un poco de agua de cocción hasta obtener un puré liso.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','primera-papilla','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-de-manzana-y-platano', 'Puré de manzana y plátano', 'Compota dulce natural, sin azúcar agregada. Perfecta para postre o merienda.', ARRAY['snack','desayuno'], ARRAY['inicio'], 10, 2, ARRAY[]::text[], 95, 0.6, 24, 0.3, 0.3,
'[{"id":"manzana","nombre":"Manzana","cantidad":1,"unidad":"unidad","calorias_por_100g":52},{"id":"platano","nombre":"Plátano","cantidad":1,"unidad":"unidad","calorias_por_100g":89}]'::jsonb,
'[{"orden":1,"descripcion":"Pela y corta la manzana en trozos pequeños.","duracion_min":3},{"orden":2,"descripcion":"Cocina la manzana al vapor o en olla con un poco de agua por 8 minutos.","duracion_min":8},{"orden":3,"descripcion":"Pisa la manzana cocida con el plátano maduro hasta obtener un puré.","duracion_min":2}]'::jsonb,
ARRAY['latam','primera-papilla','fruta','dulce'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('papilla-de-arroz-con-zapallo', 'Papilla de arroz con zapallo', 'Papilla suave, fácil de digerir. El arroz aporta energía y el zapallo fibra.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 25, 2, ARRAY[]::text[], 120, 2.5, 26, 0.8, 0.6,
'[{"id":"arroz","nombre":"Arroz blanco","cantidad":30,"unidad":"g","calorias_por_100g":130},{"id":"zapallo","nombre":"Zapallo","cantidad":100,"unidad":"g","calorias_por_100g":26},{"id":"agua","nombre":"Agua","cantidad":200,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Lava bien el arroz y cocínalo en agua durante 20 minutos hasta que esté muy blando.","duracion_min":20},{"orden":2,"descripcion":"Cocina el zapallo al vapor por 10 minutos y pisa con tenedor.","duracion_min":10},{"orden":3,"descripcion":"Mezcla el arroz con el zapallo y procesa hasta obtener una papilla homogénea.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','primera-papilla','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-de-zanahoria-y-papa', 'Puré de zanahoria y papa', 'Clásico de las primeras papillas. La zanahoria aporta betacarotenos.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 20, 2, ARRAY[]::text[], 90, 2, 20, 0.4, 0.5,
'[{"id":"zanahoria","nombre":"Zanahoria","cantidad":100,"unidad":"g","calorias_por_100g":41},{"id":"papa","nombre":"Papa","cantidad":150,"unidad":"g","calorias_por_100g":77}]'::jsonb,
'[{"orden":1,"descripcion":"Pela y corta la zanahoria y la papa en cubos chicos.","duracion_min":5},{"orden":2,"descripcion":"Hiérvelas juntas hasta que estén muy blandas, unos 15 minutos.","duracion_min":15},{"orden":3,"descripcion":"Procesa con un poco de agua de cocción hasta obtener un puré cremoso.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','primera-papilla','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('compota-de-pera-y-manzana', 'Compota de pera y manzana', 'Compota natural sin azúcar, suave para el estómago de tu bebé.', ARRAY['snack','desayuno'], ARRAY['inicio'], 15, 2, ARRAY[]::text[], 80, 0.5, 21, 0.2, 0.2,
'[{"id":"pera","nombre":"Pera","cantidad":1,"unidad":"unidad","calorias_por_100g":57},{"id":"manzana","nombre":"Manzana","cantidad":1,"unidad":"unidad","calorias_por_100g":52},{"id":"agua","nombre":"Agua","cantidad":50,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Pela y corta ambas frutas en cubos pequeños.","duracion_min":3},{"orden":2,"descripcion":"Cocina a fuego bajo con el agua durante 10 minutos, tapado.","duracion_min":10},{"orden":3,"descripcion":"Pisa o procesa hasta la textura que prefieras para tu bebé.","duracion_min":2}]'::jsonb,
ARRAY['latam','primera-papilla','fruta','sin-azucar'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-de-palta-y-platano', 'Puré de palta y plátano', 'Mezcla energética con grasas buenas del aguacate. Ideal sin cocción.', ARRAY['snack','desayuno'], ARRAY['inicio'], 5, 1, ARRAY[]::text[], 180, 2.5, 20, 11, 0.5,
'[{"id":"palta","nombre":"Palta madura","cantidad":0.5,"unidad":"unidad","calorias_por_100g":160},{"id":"platano","nombre":"Plátano maduro","cantidad":0.5,"unidad":"unidad","calorias_por_100g":89}]'::jsonb,
'[{"orden":1,"descripcion":"Extrae la pulpa de la palta con una cuchara.","duracion_min":1},{"orden":2,"descripcion":"Pisa la palta junto con el plátano hasta obtener una crema suave.","duracion_min":2},{"orden":3,"descripcion":"Sirve de inmediato para evitar que se oxide.","duracion_min":1}]'::jsonb,
ARRAY['chile','latam','sin-coccion','grasas-buenas'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('papilla-de-avena-con-manzana', 'Papilla de avena con manzana', 'Desayuno tibio y reconfortante. La avena aporta fibra y hierro.', ARRAY['desayuno','snack'], ARRAY['inicio'], 10, 1, ARRAY['gluten']::text[], 140, 4, 25, 2.5, 1.8,
'[{"id":"avena","nombre":"Avena en hojuelas","cantidad":30,"unidad":"g","calorias_por_100g":389},{"id":"manzana","nombre":"Manzana","cantidad":0.5,"unidad":"unidad","calorias_por_100g":52},{"id":"agua","nombre":"Agua","cantidad":150,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Ralla finamente la manzana pelada.","duracion_min":2},{"orden":2,"descripcion":"Cocina la avena con el agua a fuego bajo durante 5 minutos, revolviendo.","duracion_min":5},{"orden":3,"descripcion":"Incorpora la manzana rallada y cocina 2 minutos más.","duracion_min":2}]'::jsonb,
ARRAY['latam','desayuno','fibra','hierro'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-de-betarraga-y-papa', 'Puré de betarraga y papa', 'Puré de lindo color morado. La betarraga aporta hierro y fibra.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 30, 2, ARRAY[]::text[], 95, 2.3, 21, 0.3, 0.9,
'[{"id":"betarraga","nombre":"Betarraga cocida","cantidad":80,"unidad":"g","calorias_por_100g":43},{"id":"papa","nombre":"Papa","cantidad":120,"unidad":"g","calorias_por_100g":77}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina la betarraga entera con piel hasta que esté blanda, unos 25 minutos.","duracion_min":25},{"orden":2,"descripcion":"En paralelo hierve la papa pelada y cortada en cubos.","duracion_min":15},{"orden":3,"descripcion":"Pela la betarraga y procesa junto con la papa hasta obtener un puré suave.","duracion_min":3}]'::jsonb,
ARRAY['chile','latam','hierro','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('crema-de-zapallo-italiano', 'Crema de zapallo italiano', 'Crema suave de zucchini con un toque de papa. Ligera y digestiva.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 20, 2, ARRAY[]::text[], 70, 2, 14, 0.5, 0.5,
'[{"id":"zapallo-italiano","nombre":"Zapallo italiano","cantidad":150,"unidad":"g","calorias_por_100g":17},{"id":"papa","nombre":"Papa","cantidad":80,"unidad":"g","calorias_por_100g":77},{"id":"agua","nombre":"Agua","cantidad":200,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Corta el zapallo italiano y la papa en cubos pequeños.","duracion_min":3},{"orden":2,"descripcion":"Cocina ambos en el agua durante 15 minutos.","duracion_min":15},{"orden":3,"descripcion":"Procesa todo hasta obtener una crema bien lisa.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','vegetariano','liviano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-de-lentejas-con-zapallo', 'Puré de lentejas con zapallo', 'Puré con proteína vegetal y hierro. Gran opción para introducir legumbres.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 40, 2, ARRAY[]::text[], 160, 9, 28, 1, 3.5,
'[{"id":"lentejas","nombre":"Lentejas rojas","cantidad":50,"unidad":"g","calorias_por_100g":116},{"id":"zapallo","nombre":"Zapallo","cantidad":100,"unidad":"g","calorias_por_100g":26},{"id":"zanahoria","nombre":"Zanahoria","cantidad":50,"unidad":"g","calorias_por_100g":41}]'::jsonb,
'[{"orden":1,"descripcion":"Remoja las lentejas en agua por al menos 2 horas.","duracion_min":5},{"orden":2,"descripcion":"Cocina las lentejas con la zanahoria y el zapallo en agua durante 30 minutos.","duracion_min":30},{"orden":3,"descripcion":"Procesa todo hasta obtener un puré sin grumos.","duracion_min":3}]'::jsonb,
ARRAY['latam','hierro','legumbres','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('papilla-de-quinoa-con-manzana', 'Papilla de quinoa con manzana', 'Quinoa andina con fruta dulce. Aporta proteína completa y hierro.', ARRAY['desayuno','snack'], ARRAY['inicio'], 25, 2, ARRAY[]::text[], 130, 4.5, 24, 2, 1.5,
'[{"id":"quinoa","nombre":"Quinoa","cantidad":40,"unidad":"g","calorias_por_100g":368},{"id":"manzana","nombre":"Manzana","cantidad":1,"unidad":"unidad","calorias_por_100g":52},{"id":"agua","nombre":"Agua","cantidad":120,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Lava la quinoa varias veces hasta que el agua salga transparente.","duracion_min":3},{"orden":2,"descripcion":"Cocina la quinoa con el agua durante 18 minutos a fuego bajo.","duracion_min":18},{"orden":3,"descripcion":"Mezcla con la manzana rallada o cocida y procesa hasta obtener la papilla.","duracion_min":3}]'::jsonb,
ARRAY['latam','andino','hierro','proteina-vegetal'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-de-brocoli-y-papa', 'Puré de brócoli y papa', 'Introducción suave al brócoli mezclado con papa. Muy nutritivo.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 20, 2, ARRAY[]::text[], 85, 3, 17, 0.5, 0.8,
'[{"id":"brocoli","nombre":"Brócoli","cantidad":80,"unidad":"g","calorias_por_100g":34},{"id":"papa","nombre":"Papa","cantidad":120,"unidad":"g","calorias_por_100g":77}]'::jsonb,
'[{"orden":1,"descripcion":"Separa el brócoli en florcitas y pela la papa cortándola en cubos.","duracion_min":4},{"orden":2,"descripcion":"Cocina al vapor durante 12 minutos hasta que estén blandos.","duracion_min":12},{"orden":3,"descripcion":"Procesa con un poco de agua hasta la textura ideal para tu bebé.","duracion_min":2}]'::jsonb,
ARRAY['latam','verdura-verde','vegetariano','vitamina-c'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── INICIO + TRANSICION: 6 recetas para el salto de textura ────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-de-pollo-con-papa-y-zanahoria', 'Puré de pollo con papa y zanahoria', 'Primera comida con proteína animal. Pollo tierno con verduras dulces.', ARRAY['almuerzo','cena'], ARRAY['inicio','transicion'], 30, 2, ARRAY[]::text[], 175, 14, 20, 4, 1.2,
'[{"id":"pollo","nombre":"Pechuga de pollo","cantidad":80,"unidad":"g","calorias_por_100g":165},{"id":"papa","nombre":"Papa","cantidad":100,"unidad":"g","calorias_por_100g":77},{"id":"zanahoria","nombre":"Zanahoria","cantidad":60,"unidad":"g","calorias_por_100g":41}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina la pechuga de pollo en agua hirviendo durante 20 minutos.","duracion_min":20},{"orden":2,"descripcion":"En otra olla hierve la papa y la zanahoria cortadas en cubos.","duracion_min":15},{"orden":3,"descripcion":"Procesa todo junto con un poco de caldo de pollo hasta obtener la textura deseada.","duracion_min":3}]'::jsonb,
ARRAY['latam','chile','proteina','hierro'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-de-pescado-con-camote', 'Puré de pescado con camote', 'Introducción al pescado blanco. Merluza suave con camote dulce.', ARRAY['almuerzo','cena'], ARRAY['inicio','transicion'], 25, 2, ARRAY['pescado']::text[], 160, 15, 19, 3, 0.7,
'[{"id":"merluza","nombre":"Filete de merluza","cantidad":80,"unidad":"g","calorias_por_100g":92},{"id":"camote","nombre":"Camote","cantidad":120,"unidad":"g","calorias_por_100g":86},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el camote al vapor en cubos durante 15 minutos.","duracion_min":15},{"orden":2,"descripcion":"Cocina la merluza al vapor 8 minutos, revisando que no tenga espinas.","duracion_min":8},{"orden":3,"descripcion":"Desmenuza el pescado y procesa con el camote y el aceite.","duracion_min":3}]'::jsonb,
ARRAY['latam','chile','omega-3','pescado-blanco'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('papilla-de-porotos-con-zapallo', 'Papilla de porotos con zapallo', 'Legumbres suaves pasadas por cedazo, combinadas con zapallo.', ARRAY['almuerzo','cena'], ARRAY['inicio','transicion'], 45, 2, ARRAY[]::text[], 170, 9, 30, 1, 2.8,
'[{"id":"porotos","nombre":"Porotos blancos cocidos","cantidad":80,"unidad":"g","calorias_por_100g":139},{"id":"zapallo","nombre":"Zapallo","cantidad":120,"unidad":"g","calorias_por_100g":26},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina los porotos previamente remojados hasta que estén muy blandos.","duracion_min":40},{"orden":2,"descripcion":"Cocina el zapallo al vapor en paralelo.","duracion_min":12},{"orden":3,"descripcion":"Procesa los porotos pasándolos por cedazo para quitar las pieles, luego mezcla con el zapallo.","duracion_min":5}]'::jsonb,
ARRAY['chile','latam','legumbres','hierro'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-de-espinaca-con-papa', 'Puré de espinaca con papa', 'Puré verde rico en hierro. La papa suaviza el sabor de la espinaca.', ARRAY['almuerzo','cena'], ARRAY['inicio','transicion'], 20, 2, ARRAY[]::text[], 90, 3.5, 18, 0.5, 2,
'[{"id":"espinaca","nombre":"Espinaca fresca","cantidad":80,"unidad":"g","calorias_por_100g":23},{"id":"papa","nombre":"Papa","cantidad":150,"unidad":"g","calorias_por_100g":77},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Lava muy bien la espinaca y cocínala al vapor durante 5 minutos.","duracion_min":5},{"orden":2,"descripcion":"Hierve la papa pelada y cortada en cubos durante 15 minutos.","duracion_min":15},{"orden":3,"descripcion":"Procesa todo junto con el aceite de oliva hasta obtener un puré cremoso.","duracion_min":3}]'::jsonb,
ARRAY['latam','verdura-verde','hierro','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('compota-de-durazno-y-manzana', 'Compota de durazno y manzana', 'Compota dulce con duraznos de estación. Perfecta para postre.', ARRAY['snack','desayuno'], ARRAY['inicio','transicion'], 15, 2, ARRAY[]::text[], 85, 0.7, 22, 0.3, 0.3,
'[{"id":"durazno","nombre":"Durazno","cantidad":1,"unidad":"unidad","calorias_por_100g":39},{"id":"manzana","nombre":"Manzana","cantidad":1,"unidad":"unidad","calorias_por_100g":52},{"id":"canela","nombre":"Canela (opcional)","cantidad":0.5,"unidad":"g","calorias_por_100g":247}]'::jsonb,
'[{"orden":1,"descripcion":"Pela el durazno y la manzana y córtalos en trozos pequeños.","duracion_min":3},{"orden":2,"descripcion":"Cocina a fuego bajo con un poco de agua durante 10 minutos.","duracion_min":10},{"orden":3,"descripcion":"Pisa o procesa según la textura que quieras ofrecer.","duracion_min":2}]'::jsonb,
ARRAY['latam','fruta','postre','sin-azucar'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-de-arvejas-con-zapallo', 'Puré de arvejas con zapallo', 'Combinación dulce y suave de arvejas con zapallo. Alto en proteína vegetal.', ARRAY['almuerzo','cena'], ARRAY['inicio','transicion'], 20, 2, ARRAY[]::text[], 110, 5, 22, 0.8, 1.5,
'[{"id":"arvejas","nombre":"Arvejas frescas o congeladas","cantidad":80,"unidad":"g","calorias_por_100g":81},{"id":"zapallo","nombre":"Zapallo","cantidad":120,"unidad":"g","calorias_por_100g":26}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina las arvejas en agua hirviendo durante 10 minutos.","duracion_min":10},{"orden":2,"descripcion":"Cocina el zapallo al vapor durante 12 minutos.","duracion_min":12},{"orden":3,"descripcion":"Procesa todo y cuela para eliminar las pieles de las arvejas.","duracion_min":3}]'::jsonb,
ARRAY['chile','latam','legumbres','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── TRANSICION SOLO (12-23m): texturas variadas y trozos pequeños ─────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('mini-tortilla-de-acelga', 'Mini tortilla de acelga', 'Tortilla suave horneada en molde chico. Fácil de tomar con la mano.', ARRAY['almuerzo','cena','snack'], ARRAY['transicion'], 20, 2, ARRAY['huevo']::text[], 150, 11, 6, 9, 1.8,
'[{"id":"huevo","nombre":"Huevo","cantidad":2,"unidad":"unidad","calorias_por_100g":155},{"id":"acelga","nombre":"Acelga","cantidad":60,"unidad":"g","calorias_por_100g":19},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Lava y pica finamente la acelga, luego saltéala en una sartén con una gota de aceite.","duracion_min":5},{"orden":2,"descripcion":"Bate los huevos y mézclalos con la acelga fría.","duracion_min":2},{"orden":3,"descripcion":"Cocina en sartén a fuego bajo con tapa por 8 minutos, dando vuelta con cuidado.","duracion_min":10}]'::jsonb,
ARRAY['latam','chile','bls','huevo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('picadillo-de-pollo-con-quinoa', 'Picadillo de pollo con quinoa', 'Pollo desmenuzado con quinoa y vegetales en trocitos chicos.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 30, 2, ARRAY[]::text[], 220, 18, 26, 5, 2.2,
'[{"id":"pollo","nombre":"Pechuga de pollo","cantidad":80,"unidad":"g","calorias_por_100g":165},{"id":"quinoa","nombre":"Quinoa cocida","cantidad":80,"unidad":"g","calorias_por_100g":120},{"id":"zanahoria","nombre":"Zanahoria","cantidad":40,"unidad":"g","calorias_por_100g":41},{"id":"arvejas","nombre":"Arvejas","cantidad":30,"unidad":"g","calorias_por_100g":81}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina la pechuga hervida y desmenúzala en hebras finas.","duracion_min":15},{"orden":2,"descripcion":"Saltea la zanahoria en cubitos pequeños con las arvejas.","duracion_min":8},{"orden":3,"descripcion":"Mezcla todo con la quinoa cocida y sirve tibio.","duracion_min":2}]'::jsonb,
ARRAY['latam','andino','proteina','hierro'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('arroz-con-pollo-suave', 'Arroz con pollo suave', 'Clásico latino en versión suave. Arroz tierno con pollo deshilachado.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 35, 2, ARRAY[]::text[], 280, 18, 40, 5, 1.5,
'[{"id":"arroz","nombre":"Arroz blanco","cantidad":60,"unidad":"g","calorias_por_100g":130},{"id":"pollo","nombre":"Pechuga de pollo","cantidad":80,"unidad":"g","calorias_por_100g":165},{"id":"cebolla","nombre":"Cebolla","cantidad":30,"unidad":"g","calorias_por_100g":40},{"id":"zanahoria","nombre":"Zanahoria","cantidad":40,"unidad":"g","calorias_por_100g":41}]'::jsonb,
'[{"orden":1,"descripcion":"Sofríe la cebolla picada fina y la zanahoria rallada por 5 minutos.","duracion_min":5},{"orden":2,"descripcion":"Agrega el pollo en cubos pequeños y cocínalo hasta que esté dorado.","duracion_min":8},{"orden":3,"descripcion":"Incorpora el arroz y el doble de agua, cocina 20 minutos a fuego bajo.","duracion_min":20}]'::jsonb,
ARRAY['latam','chile','clasico','proteina'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pasta-con-salsa-de-tomate', 'Pasta con salsa de tomate', 'Pastita corta con salsa casera de tomate sin condimentos fuertes.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 20, 2, ARRAY['gluten']::text[], 240, 8, 45, 3, 1.2,
'[{"id":"pasta","nombre":"Pasta corta (codito o tornillo)","cantidad":60,"unidad":"g","calorias_por_100g":371},{"id":"tomate","nombre":"Tomate maduro","cantidad":100,"unidad":"g","calorias_por_100g":18},{"id":"cebolla","nombre":"Cebolla","cantidad":20,"unidad":"g","calorias_por_100g":40},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Pela y ralla el tomate. Pica la cebolla finamente.","duracion_min":5},{"orden":2,"descripcion":"Sofríe la cebolla en aceite y agrega el tomate, cocina 10 minutos.","duracion_min":10},{"orden":3,"descripcion":"Cocina la pasta en agua hirviendo, escurre y mezcla con la salsa.","duracion_min":8}]'::jsonb,
ARRAY['latam','pasta','bls','bebe-grande'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('mini-panqueques-de-avena', 'Mini panqueques de avena', 'Panqueques chicos y esponjosos, ideales para el desayuno.', ARRAY['desayuno','snack'], ARRAY['transicion'], 15, 2, ARRAY['gluten','huevo','lacteos']::text[], 210, 9, 30, 6, 1.6,
'[{"id":"avena","nombre":"Avena en hojuelas","cantidad":40,"unidad":"g","calorias_por_100g":389},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"platano","nombre":"Plátano maduro","cantidad":0.5,"unidad":"unidad","calorias_por_100g":89},{"id":"leche","nombre":"Leche entera","cantidad":50,"unidad":"ml","calorias_por_100g":61}]'::jsonb,
'[{"orden":1,"descripcion":"Procesa la avena hasta convertirla en harina fina.","duracion_min":2},{"orden":2,"descripcion":"Mezcla con el huevo, el plátano pisado y la leche hasta obtener una masa.","duracion_min":3},{"orden":3,"descripcion":"Cocina cucharadas en sartén antiadherente 2 minutos por lado.","duracion_min":8}]'::jsonb,
ARRAY['latam','desayuno','bls','sin-azucar'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('albondigas-de-pollo-al-vapor', 'Albóndigas de pollo al vapor', 'Albóndigas suaves de pollo, perfectas para manos pequeñas.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 25, 2, ARRAY['gluten']::text[], 200, 22, 10, 7, 1.8,
'[{"id":"pollo-molido","nombre":"Pollo molido","cantidad":150,"unidad":"g","calorias_por_100g":165},{"id":"pan-rallado","nombre":"Pan rallado","cantidad":20,"unidad":"g","calorias_por_100g":395},{"id":"zanahoria","nombre":"Zanahoria rallada","cantidad":30,"unidad":"g","calorias_por_100g":41},{"id":"perejil","nombre":"Perejil","cantidad":5,"unidad":"g","calorias_por_100g":36}]'::jsonb,
'[{"orden":1,"descripcion":"Mezcla el pollo molido con el pan rallado, la zanahoria y el perejil.","duracion_min":5},{"orden":2,"descripcion":"Forma pequeñas bolitas del tamaño de una nuez.","duracion_min":5},{"orden":3,"descripcion":"Cocina al vapor durante 15 minutos hasta que estén bien cocidas.","duracion_min":15}]'::jsonb,
ARRAY['latam','bls','proteina','freezer-friendly'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('sopita-de-fideos-con-pollo', 'Sopita de fideos con pollo', 'Caldo reconfortante con fideos cabello de ángel y pollo desmenuzado.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 25, 2, ARRAY['gluten']::text[], 180, 14, 25, 3, 1.2,
'[{"id":"fideos","nombre":"Fideos cabello de ángel","cantidad":40,"unidad":"g","calorias_por_100g":371},{"id":"pollo","nombre":"Pechuga de pollo","cantidad":60,"unidad":"g","calorias_por_100g":165},{"id":"zanahoria","nombre":"Zanahoria","cantidad":30,"unidad":"g","calorias_por_100g":41},{"id":"apio","nombre":"Apio","cantidad":20,"unidad":"g","calorias_por_100g":16}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina la pechuga con la zanahoria y el apio en agua durante 20 minutos.","duracion_min":20},{"orden":2,"descripcion":"Retira el pollo, desmenúzalo y reserva el caldo colado.","duracion_min":3},{"orden":3,"descripcion":"Vuelve el caldo al fuego, agrega los fideos y cocina 3 minutos. Reincorpora el pollo.","duracion_min":5}]'::jsonb,
ARRAY['latam','chile','sopa','reconfortante'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('muffin-de-platano-y-avena', 'Muffin de plátano y avena', 'Muffins caseros sin azúcar añadida, endulzados naturalmente con plátano.', ARRAY['desayuno','snack'], ARRAY['transicion'], 30, 6, ARRAY['gluten','huevo']::text[], 140, 4, 22, 4, 1,
'[{"id":"platano","nombre":"Plátano maduro","cantidad":2,"unidad":"unidad","calorias_por_100g":89},{"id":"avena","nombre":"Avena en hojuelas","cantidad":100,"unidad":"g","calorias_por_100g":389},{"id":"huevo","nombre":"Huevo","cantidad":2,"unidad":"unidad","calorias_por_100g":155},{"id":"aceite","nombre":"Aceite","cantidad":15,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Pisa los plátanos y mezcla con el huevo batido y el aceite.","duracion_min":3},{"orden":2,"descripcion":"Incorpora la avena y deja reposar 5 minutos.","duracion_min":5},{"orden":3,"descripcion":"Reparte en moldes de muffin y hornea a 180°C durante 20 minutos.","duracion_min":20}]'::jsonb,
ARRAY['latam','desayuno','merienda','sin-azucar'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('crepe-de-manzana', 'Crepe de manzana', 'Crepe delgado relleno de manzana cocida con canela. Perfecto para el postre.', ARRAY['snack','desayuno'], ARRAY['transicion'], 20, 2, ARRAY['gluten','huevo','lacteos']::text[], 190, 6, 28, 6, 0.8,
'[{"id":"harina","nombre":"Harina","cantidad":40,"unidad":"g","calorias_por_100g":364},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"leche","nombre":"Leche entera","cantidad":80,"unidad":"ml","calorias_por_100g":61},{"id":"manzana","nombre":"Manzana","cantidad":1,"unidad":"unidad","calorias_por_100g":52}]'::jsonb,
'[{"orden":1,"descripcion":"Mezcla la harina, el huevo y la leche hasta obtener una mezcla líquida.","duracion_min":3},{"orden":2,"descripcion":"Cocina los crepes en sartén antiadherente con poco aceite.","duracion_min":8},{"orden":3,"descripcion":"Rellena con manzana rallada cocida con canela y enrolla.","duracion_min":5}]'::jsonb,
ARRAY['latam','postre','merienda','fruta'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-rustico-de-choclo', 'Puré rústico de choclo', 'Puré de choclo con pequeños trocitos. Dulce y típico chileno.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 20, 2, ARRAY[]::text[], 140, 4, 28, 2, 0.6,
'[{"id":"choclo","nombre":"Choclo desgranado","cantidad":150,"unidad":"g","calorias_por_100g":86},{"id":"papa","nombre":"Papa","cantidad":80,"unidad":"g","calorias_por_100g":77},{"id":"albahaca","nombre":"Albahaca fresca","cantidad":3,"unidad":"g","calorias_por_100g":22}]'::jsonb,
'[{"orden":1,"descripcion":"Hierve el choclo con la papa en cubos durante 15 minutos.","duracion_min":15},{"orden":2,"descripcion":"Escurre y pisa dejando algunos trocitos visibles.","duracion_min":3},{"orden":3,"descripcion":"Agrega la albahaca picada muy fina al final.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','choclo','rustico'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── TRANSICION + PREESCOLAR: 10 platos tradicionales suaves ───────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('causa-limena-de-pollo', 'Causa limeña de pollo', 'Clásico peruano: puré de papa amarilla con pollo desmenuzado y palta.', ARRAY['almuerzo','cena'], ARRAY['transicion','preescolar'], 35, 2, ARRAY[]::text[], 310, 18, 38, 10, 1.8,
'[{"id":"papa-amarilla","nombre":"Papa amarilla","cantidad":200,"unidad":"g","calorias_por_100g":77},{"id":"pollo","nombre":"Pechuga de pollo","cantidad":100,"unidad":"g","calorias_por_100g":165},{"id":"palta","nombre":"Palta","cantidad":50,"unidad":"g","calorias_por_100g":160},{"id":"limon","nombre":"Limón (jugo)","cantidad":10,"unidad":"ml","calorias_por_100g":29}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina y pisa la papa hasta obtener un puré suave. Agrega un toque de limón.","duracion_min":20},{"orden":2,"descripcion":"Cocina y desmenuza el pollo, mézclalo con palta pisada.","duracion_min":12},{"orden":3,"descripcion":"Arma capas: puré de papa, relleno de pollo y palta, otra capa de puré.","duracion_min":3}]'::jsonb,
ARRAY['peru','latam','clasico','sin-gluten'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('ajiaco-santafereno-suave', 'Ajiaco santafereño suave', 'Versión infantil del clásico bogotano: sopa con tres papas y pollo.', ARRAY['almuerzo','cena'], ARRAY['transicion','preescolar'], 45, 2, ARRAY[]::text[], 290, 20, 38, 6, 1.5,
'[{"id":"pollo","nombre":"Pechuga de pollo","cantidad":100,"unidad":"g","calorias_por_100g":165},{"id":"papa","nombre":"Papa amarilla y blanca","cantidad":200,"unidad":"g","calorias_por_100g":77},{"id":"choclo","nombre":"Choclo","cantidad":50,"unidad":"g","calorias_por_100g":86},{"id":"cilantro","nombre":"Cilantro","cantidad":3,"unidad":"g","calorias_por_100g":23}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el pollo en agua con cilantro durante 20 minutos.","duracion_min":20},{"orden":2,"descripcion":"Agrega las papas peladas en cubos y el choclo desgranado.","duracion_min":20},{"orden":3,"descripcion":"Desmenuza el pollo y sirve en el plato con la sopa.","duracion_min":5}]'::jsonb,
ARRAY['colombia','latam','sopa','clasico'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pollo-al-limon-con-papas', 'Pollo al limón con papas doradas', 'Pollo jugoso con un toque cítrico, acompañado de papas al horno.', ARRAY['almuerzo','cena'], ARRAY['transicion','preescolar'], 40, 2, ARRAY[]::text[], 340, 25, 35, 9, 1.6,
'[{"id":"pollo","nombre":"Pechuga de pollo","cantidad":150,"unidad":"g","calorias_por_100g":165},{"id":"papa","nombre":"Papa","cantidad":200,"unidad":"g","calorias_por_100g":77},{"id":"limon","nombre":"Limón (jugo)","cantidad":15,"unidad":"ml","calorias_por_100g":29},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":10,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Corta las papas en cubos y hornea 25 minutos con aceite a 200°C.","duracion_min":25},{"orden":2,"descripcion":"Adoba el pollo con jugo de limón y aceite, déjalo reposar 10 minutos.","duracion_min":10},{"orden":3,"descripcion":"Cocina el pollo a la plancha 6 minutos por lado y sirve con las papas.","duracion_min":12}]'::jsonb,
ARRAY['latam','chile','proteina','familiar'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pastel-de-papas-casero', 'Pastel de papas casero', 'Pastel al horno de papa y carne molida. Receta suave y familiar.', ARRAY['almuerzo','cena'], ARRAY['transicion','preescolar'], 50, 3, ARRAY[]::text[], 320, 18, 32, 12, 2.5,
'[{"id":"papa","nombre":"Papa","cantidad":500,"unidad":"g","calorias_por_100g":77},{"id":"carne","nombre":"Carne molida","cantidad":200,"unidad":"g","calorias_por_100g":250},{"id":"cebolla","nombre":"Cebolla","cantidad":60,"unidad":"g","calorias_por_100g":40},{"id":"aceite","nombre":"Aceite","cantidad":10,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina las papas y pisa con un poco de leche hasta obtener un puré suave.","duracion_min":20},{"orden":2,"descripcion":"Sofríe la cebolla picada y agrega la carne molida hasta que esté dorada.","duracion_min":10},{"orden":3,"descripcion":"En una fuente, pon la carne abajo, cubre con puré y hornea 15 minutos a 200°C.","duracion_min":15}]'::jsonb,
ARRAY['chile','latam','familiar','horno'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('tallarines-con-pollo-y-verduras', 'Tallarines con pollo y verduras', 'Tallarines con pollo desmenuzado y verduras suaves. Plato completo.', ARRAY['almuerzo','cena'], ARRAY['transicion','preescolar'], 25, 2, ARRAY['gluten']::text[], 310, 18, 45, 5, 1.8,
'[{"id":"tallarines","nombre":"Tallarines","cantidad":80,"unidad":"g","calorias_por_100g":371},{"id":"pollo","nombre":"Pechuga de pollo","cantidad":100,"unidad":"g","calorias_por_100g":165},{"id":"zapallo-italiano","nombre":"Zapallo italiano","cantidad":60,"unidad":"g","calorias_por_100g":17},{"id":"zanahoria","nombre":"Zanahoria","cantidad":40,"unidad":"g","calorias_por_100g":41}]'::jsonb,
'[{"orden":1,"descripcion":"Cuece los tallarines en agua hirviendo según las instrucciones del paquete.","duracion_min":10},{"orden":2,"descripcion":"Saltea el pollo en cubos con las verduras ralladas por 10 minutos.","duracion_min":10},{"orden":3,"descripcion":"Mezcla la pasta escurrida con el salteado y sirve tibio.","duracion_min":2}]'::jsonb,
ARRAY['latam','pasta','familiar','proteina'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('arepa-de-queso', 'Arepa de queso', 'Arepa blanda hecha con harina de maíz precocida y queso fresco.', ARRAY['desayuno','snack'], ARRAY['transicion','preescolar'], 20, 2, ARRAY['lacteos']::text[], 260, 10, 40, 7, 0.8,
'[{"id":"harina-maiz","nombre":"Harina de maíz precocida","cantidad":80,"unidad":"g","calorias_por_100g":362},{"id":"agua","nombre":"Agua tibia","cantidad":100,"unidad":"ml","calorias_por_100g":0},{"id":"queso","nombre":"Queso fresco","cantidad":40,"unidad":"g","calorias_por_100g":264}]'::jsonb,
'[{"orden":1,"descripcion":"Mezcla la harina con el agua tibia hasta formar una masa suave. Deja reposar 5 minutos.","duracion_min":7},{"orden":2,"descripcion":"Forma discos de 1 cm de alto rellenos con queso.","duracion_min":5},{"orden":3,"descripcion":"Cocina en sartén caliente 4 minutos por lado hasta dorar.","duracion_min":8}]'::jsonb,
ARRAY['venezuela','colombia','latam','bls'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('guiso-de-lentejas-con-arroz', 'Guiso de lentejas con arroz', 'Guiso tradicional de lentejas con verduras, servido con arroz blanco.', ARRAY['almuerzo','cena'], ARRAY['transicion','preescolar'], 45, 3, ARRAY[]::text[], 340, 15, 62, 4, 4,
'[{"id":"lentejas","nombre":"Lentejas","cantidad":80,"unidad":"g","calorias_por_100g":116},{"id":"arroz","nombre":"Arroz","cantidad":50,"unidad":"g","calorias_por_100g":130},{"id":"zanahoria","nombre":"Zanahoria","cantidad":60,"unidad":"g","calorias_por_100g":41},{"id":"cebolla","nombre":"Cebolla","cantidad":40,"unidad":"g","calorias_por_100g":40}]'::jsonb,
'[{"orden":1,"descripcion":"Remoja las lentejas por 2 horas.","duracion_min":5},{"orden":2,"descripcion":"Sofríe cebolla y zanahoria, agrega lentejas y cocina 30 minutos con agua.","duracion_min":35},{"orden":3,"descripcion":"En paralelo cocina el arroz y sirve el guiso sobre el arroz.","duracion_min":20}]'::jsonb,
ARRAY['latam','chile','legumbres','hierro'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('sopa-de-pollo-y-fideos', 'Sopa de pollo y fideos', 'Sopa casera con fideos, pollo y verduras frescas. Ideal para días fríos.', ARRAY['almuerzo','cena'], ARRAY['transicion','preescolar'], 35, 3, ARRAY['gluten']::text[], 220, 16, 28, 4, 1.3,
'[{"id":"pollo","nombre":"Pollo con hueso","cantidad":200,"unidad":"g","calorias_por_100g":165},{"id":"fideos","nombre":"Fideos","cantidad":60,"unidad":"g","calorias_por_100g":371},{"id":"zanahoria","nombre":"Zanahoria","cantidad":60,"unidad":"g","calorias_por_100g":41},{"id":"apio","nombre":"Apio","cantidad":30,"unidad":"g","calorias_por_100g":16}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el pollo con las verduras en agua durante 30 minutos.","duracion_min":30},{"orden":2,"descripcion":"Retira el pollo, desmenúzalo y cuela el caldo.","duracion_min":5},{"orden":3,"descripcion":"Cocina los fideos en el caldo 3 minutos y reincorpora el pollo.","duracion_min":5}]'::jsonb,
ARRAY['latam','chile','sopa','reconfortante'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('tortilla-espanola-de-papas', 'Tortilla de papas', 'Tortilla esponjosa al estilo español, con papas tiernas y huevo.', ARRAY['almuerzo','cena','snack'], ARRAY['transicion','preescolar'], 35, 3, ARRAY['huevo']::text[], 280, 12, 25, 15, 1.8,
'[{"id":"papa","nombre":"Papa","cantidad":300,"unidad":"g","calorias_por_100g":77},{"id":"huevo","nombre":"Huevo","cantidad":4,"unidad":"unidad","calorias_por_100g":155},{"id":"cebolla","nombre":"Cebolla","cantidad":60,"unidad":"g","calorias_por_100g":40},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":20,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Corta las papas en láminas finas y cocínalas en aceite a fuego bajo 20 minutos.","duracion_min":20},{"orden":2,"descripcion":"Bate los huevos y mezcla con las papas tibias y la cebolla pochada.","duracion_min":3},{"orden":3,"descripcion":"Vuelca en sartén y cocina 5 minutos por lado cuajando suavemente.","duracion_min":10}]'::jsonb,
ARRAY['latam','chile','huevo','familiar'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pandebono', 'Pandebono', 'Pancitos de queso redonditos y tibios. Clásico colombiano sin gluten.', ARRAY['desayuno','snack'], ARRAY['transicion','preescolar'], 30, 6, ARRAY['lacteos','huevo']::text[], 180, 7, 26, 5, 0.7,
'[{"id":"almidon-yuca","nombre":"Almidón de yuca","cantidad":150,"unidad":"g","calorias_por_100g":340},{"id":"queso","nombre":"Queso fresco","cantidad":100,"unidad":"g","calorias_por_100g":264},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155}]'::jsonb,
'[{"orden":1,"descripcion":"Mezcla el almidón con el queso rallado y el huevo hasta formar una masa.","duracion_min":5},{"orden":2,"descripcion":"Forma bolitas del tamaño de una nuez.","duracion_min":5},{"orden":3,"descripcion":"Hornea a 200°C durante 15 minutos hasta que estén doraditos.","duracion_min":15}]'::jsonb,
ARRAY['colombia','latam','sin-gluten','merienda'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── PREESCOLAR SOLO (24m+): platos completos y tradicionales ──────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('cazuela-de-ave', 'Cazuela de ave', 'Clásico chileno: caldo con pollo, zapallo, papa, choclo y arroz.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 60, 3, ARRAY[]::text[], 380, 25, 48, 7, 2,
'[{"id":"pollo","nombre":"Presa de pollo","cantidad":200,"unidad":"g","calorias_por_100g":165},{"id":"zapallo","nombre":"Zapallo","cantidad":150,"unidad":"g","calorias_por_100g":26},{"id":"papa","nombre":"Papa","cantidad":150,"unidad":"g","calorias_por_100g":77},{"id":"choclo","nombre":"Choclo","cantidad":1,"unidad":"unidad","calorias_por_100g":86},{"id":"arroz","nombre":"Arroz","cantidad":30,"unidad":"g","calorias_por_100g":130},{"id":"zanahoria","nombre":"Zanahoria","cantidad":50,"unidad":"g","calorias_por_100g":41}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el pollo con zanahoria y cebolla en agua durante 30 minutos.","duracion_min":30},{"orden":2,"descripcion":"Agrega el zapallo, la papa y el choclo en rodajas. Cocina 20 minutos más.","duracion_min":20},{"orden":3,"descripcion":"Incorpora el arroz y cocina 15 minutos finales.","duracion_min":15}]'::jsonb,
ARRAY['chile','latam','tradicional','sopa'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pastel-de-choclo', 'Pastel de choclo', 'Pastel chileno con pino de carne y pollo cubierto con choclo molido.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 75, 4, ARRAY[]::text[], 420, 22, 50, 14, 2.5,
'[{"id":"choclo","nombre":"Choclo desgranado","cantidad":500,"unidad":"g","calorias_por_100g":86},{"id":"carne","nombre":"Carne molida","cantidad":200,"unidad":"g","calorias_por_100g":250},{"id":"pollo","nombre":"Pollo","cantidad":100,"unidad":"g","calorias_por_100g":165},{"id":"cebolla","nombre":"Cebolla","cantidad":100,"unidad":"g","calorias_por_100g":40},{"id":"albahaca","nombre":"Albahaca","cantidad":5,"unidad":"g","calorias_por_100g":22}]'::jsonb,
'[{"orden":1,"descripcion":"Prepara el pino salteando cebolla, carne molida y pollo en cubos.","duracion_min":20},{"orden":2,"descripcion":"Muele el choclo con albahaca y cocínalo en olla hasta espesar.","duracion_min":20},{"orden":3,"descripcion":"Arma en fuente: pino abajo, choclo encima y hornea 25 minutos a 200°C.","duracion_min":25}]'::jsonb,
ARRAY['chile','tradicional','horno','familiar'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('charquican', 'Charquicán', 'Guiso chileno de carne con zapallo, papa, choclo y porotos verdes.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 50, 3, ARRAY[]::text[], 360, 22, 42, 10, 3,
'[{"id":"carne","nombre":"Carne posta","cantidad":200,"unidad":"g","calorias_por_100g":250},{"id":"papa","nombre":"Papa","cantidad":200,"unidad":"g","calorias_por_100g":77},{"id":"zapallo","nombre":"Zapallo","cantidad":150,"unidad":"g","calorias_por_100g":26},{"id":"choclo","nombre":"Choclo","cantidad":80,"unidad":"g","calorias_por_100g":86},{"id":"porotos-verdes","nombre":"Porotos verdes","cantidad":80,"unidad":"g","calorias_por_100g":31}]'::jsonb,
'[{"orden":1,"descripcion":"Dora la carne en cubos con cebolla picada en una olla.","duracion_min":10},{"orden":2,"descripcion":"Agrega zapallo, papa y cubre con agua. Cocina 25 minutos.","duracion_min":25},{"orden":3,"descripcion":"Incorpora choclo y porotos verdes los últimos 10 minutos. Pisa al final.","duracion_min":10}]'::jsonb,
ARRAY['chile','tradicional','familiar','hierro'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('porotos-con-riendas', 'Porotos con riendas', 'Porotos con tallarines largos, acompañados de longaniza suave. Clásico chileno.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 60, 3, ARRAY['gluten']::text[], 450, 20, 70, 8, 4,
'[{"id":"porotos","nombre":"Porotos burros","cantidad":150,"unidad":"g","calorias_por_100g":139},{"id":"tallarines","nombre":"Tallarines largos","cantidad":80,"unidad":"g","calorias_por_100g":371},{"id":"zapallo","nombre":"Zapallo","cantidad":100,"unidad":"g","calorias_por_100g":26},{"id":"cebolla","nombre":"Cebolla","cantidad":50,"unidad":"g","calorias_por_100g":40}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina los porotos previamente remojados durante 45 minutos.","duracion_min":45},{"orden":2,"descripcion":"Agrega zapallo en cubos y cebolla sofrita. Cocina 10 minutos más.","duracion_min":10},{"orden":3,"descripcion":"Cuece los tallarines aparte y sírvelos encima de los porotos.","duracion_min":8}]'::jsonb,
ARRAY['chile','tradicional','legumbres','pasta'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('empanadas-de-pino-horneadas', 'Empanadas de pino al horno', 'Empanadas caseras de horno con pino de carne suave. Menos picante que las tradicionales.', ARRAY['almuerzo','cena','snack'], ARRAY['preescolar'], 90, 4, ARRAY['gluten','huevo']::text[], 380, 15, 48, 15, 2,
'[{"id":"harina","nombre":"Harina","cantidad":300,"unidad":"g","calorias_por_100g":364},{"id":"carne","nombre":"Carne molida","cantidad":200,"unidad":"g","calorias_por_100g":250},{"id":"cebolla","nombre":"Cebolla","cantidad":150,"unidad":"g","calorias_por_100g":40},{"id":"huevo","nombre":"Huevo duro","cantidad":2,"unidad":"unidad","calorias_por_100g":155},{"id":"manteca","nombre":"Manteca","cantidad":60,"unidad":"g","calorias_por_100g":717}]'::jsonb,
'[{"orden":1,"descripcion":"Prepara la masa con harina, agua tibia y manteca. Deja reposar 30 minutos.","duracion_min":35},{"orden":2,"descripcion":"Sofríe cebolla y carne hasta dorar. Deja enfriar y mezcla con huevo duro picado.","duracion_min":20},{"orden":3,"descripcion":"Arma las empanadas rellenando discos y hornea a 200°C por 20 minutos.","duracion_min":30}]'::jsonb,
ARRAY['chile','tradicional','horno','fiestas-patrias'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pan-amasado', 'Pan amasado', 'Pan chileno casero, ideal para completar cualquier comida.', ARRAY['desayuno','snack'], ARRAY['preescolar'], 90, 8, ARRAY['gluten']::text[], 180, 5, 34, 2, 0.8,
'[{"id":"harina","nombre":"Harina","cantidad":500,"unidad":"g","calorias_por_100g":364},{"id":"levadura","nombre":"Levadura fresca","cantidad":15,"unidad":"g","calorias_por_100g":105},{"id":"agua","nombre":"Agua tibia","cantidad":250,"unidad":"ml","calorias_por_100g":0},{"id":"manteca","nombre":"Manteca","cantidad":30,"unidad":"g","calorias_por_100g":717}]'::jsonb,
'[{"orden":1,"descripcion":"Mezcla harina, levadura disuelta, sal y agua tibia. Amasa 10 minutos.","duracion_min":15},{"orden":2,"descripcion":"Deja leudar tapado en lugar tibio durante 40 minutos.","duracion_min":40},{"orden":3,"descripcion":"Forma panes pequeños redondos y hornea a 200°C durante 25 minutos.","duracion_min":30}]'::jsonb,
ARRAY['chile','tradicional','pan','horno'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('sopaipillas-al-horno', 'Sopaipillas al horno', 'Sopaipillas chilenas más sanas, horneadas en vez de fritas.', ARRAY['snack'], ARRAY['preescolar'], 45, 6, ARRAY['gluten']::text[], 220, 4, 38, 5, 0.8,
'[{"id":"harina","nombre":"Harina","cantidad":300,"unidad":"g","calorias_por_100g":364},{"id":"zapallo","nombre":"Zapallo cocido","cantidad":150,"unidad":"g","calorias_por_100g":26},{"id":"manteca","nombre":"Manteca","cantidad":40,"unidad":"g","calorias_por_100g":717},{"id":"polvo-hornear","nombre":"Polvo de hornear","cantidad":5,"unidad":"g","calorias_por_100g":97}]'::jsonb,
'[{"orden":1,"descripcion":"Mezcla el zapallo pisado con la harina, manteca y polvo de hornear.","duracion_min":10},{"orden":2,"descripcion":"Amasa suavemente y estira hasta 1 cm de grosor. Corta círculos.","duracion_min":10},{"orden":3,"descripcion":"Hornea a 200°C durante 20 minutos hasta que estén doradas.","duracion_min":25}]'::jsonb,
ARRAY['chile','tradicional','merienda','horno'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('humitas', 'Humitas', 'Clásicas humitas chilenas de choclo fresco, sin picante.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 70, 4, ARRAY[]::text[], 250, 6, 40, 8, 1,
'[{"id":"choclo","nombre":"Choclo fresco","cantidad":600,"unidad":"g","calorias_por_100g":86},{"id":"cebolla","nombre":"Cebolla","cantidad":80,"unidad":"g","calorias_por_100g":40},{"id":"albahaca","nombre":"Albahaca","cantidad":10,"unidad":"g","calorias_por_100g":22},{"id":"manteca","nombre":"Manteca","cantidad":30,"unidad":"g","calorias_por_100g":717}]'::jsonb,
'[{"orden":1,"descripcion":"Muele el choclo fresco con albahaca hasta obtener una pasta.","duracion_min":10},{"orden":2,"descripcion":"Sofríe cebolla picada y mezcla con la pasta de choclo.","duracion_min":10},{"orden":3,"descripcion":"Envuelve en hojas de choclo y cocina en agua hirviendo 40 minutos.","duracion_min":45}]'::jsonb,
ARRAY['chile','tradicional','choclo','fiestas-patrias'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('carbonada-chilena', 'Carbonada chilena', 'Sopa chilena con carne, verduras de la huerta y arroz.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 55, 3, ARRAY[]::text[], 350, 22, 44, 8, 2.8,
'[{"id":"carne","nombre":"Carne posta","cantidad":200,"unidad":"g","calorias_por_100g":250},{"id":"papa","nombre":"Papa","cantidad":200,"unidad":"g","calorias_por_100g":77},{"id":"zanahoria","nombre":"Zanahoria","cantidad":80,"unidad":"g","calorias_por_100g":41},{"id":"porotos-verdes","nombre":"Porotos verdes","cantidad":60,"unidad":"g","calorias_por_100g":31},{"id":"arroz","nombre":"Arroz","cantidad":40,"unidad":"g","calorias_por_100g":130}]'::jsonb,
'[{"orden":1,"descripcion":"Dora la carne en cubos con cebolla picada fina.","duracion_min":10},{"orden":2,"descripcion":"Agrega agua y verduras en cubos. Cocina 25 minutos.","duracion_min":25},{"orden":3,"descripcion":"Incorpora el arroz y cocina 15 minutos más.","duracion_min":15}]'::jsonb,
ARRAY['chile','tradicional','sopa','hierro'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('merluza-al-horno-con-pure', 'Merluza al horno con puré', 'Filete de merluza al horno acompañado de puré cremoso de papas.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 35, 2, ARRAY['pescado','lacteos']::text[], 310, 28, 30, 9, 1.2,
'[{"id":"merluza","nombre":"Filete de merluza","cantidad":200,"unidad":"g","calorias_por_100g":92},{"id":"papa","nombre":"Papa","cantidad":300,"unidad":"g","calorias_por_100g":77},{"id":"leche","nombre":"Leche entera","cantidad":50,"unidad":"ml","calorias_por_100g":61},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":10,"unidad":"ml","calorias_por_100g":884},{"id":"limon","nombre":"Limón","cantidad":15,"unidad":"ml","calorias_por_100g":29}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina las papas y pisa con leche y aceite hasta obtener un puré cremoso.","duracion_min":20},{"orden":2,"descripcion":"Rocía la merluza con limón y aceite. Hornea a 200°C por 12 minutos.","duracion_min":12},{"orden":3,"descripcion":"Sirve la merluza sobre el puré y revisa bien que no tenga espinas.","duracion_min":3}]'::jsonb,
ARRAY['chile','latam','pescado','horno'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('arroz-con-leche', 'Arroz con leche', 'Postre clásico de arroz cocido en leche con canela. Cremoso y reconfortante.', ARRAY['snack'], ARRAY['preescolar'], 40, 3, ARRAY['lacteos']::text[], 230, 7, 40, 5, 0.5,
'[{"id":"arroz","nombre":"Arroz","cantidad":80,"unidad":"g","calorias_por_100g":130},{"id":"leche","nombre":"Leche entera","cantidad":500,"unidad":"ml","calorias_por_100g":61},{"id":"canela","nombre":"Canela en rama","cantidad":1,"unidad":"g","calorias_por_100g":247},{"id":"azucar","nombre":"Azúcar","cantidad":20,"unidad":"g","calorias_por_100g":387}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el arroz en agua durante 10 minutos y escurre.","duracion_min":10},{"orden":2,"descripcion":"Pasa el arroz a una olla con leche y canela, cocina 25 minutos a fuego bajo.","duracion_min":25},{"orden":3,"descripcion":"Agrega el azúcar los últimos 5 minutos y sirve tibio o frío.","duracion_min":5}]'::jsonb,
ARRAY['latam','chile','postre','tradicional'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('leche-asada', 'Leche asada', 'Postre chileno al horno, similar al flan pero más firme y con caramelo.', ARRAY['snack'], ARRAY['preescolar'], 70, 4, ARRAY['lacteos','huevo']::text[], 240, 9, 32, 9, 0.8,
'[{"id":"leche","nombre":"Leche entera","cantidad":500,"unidad":"ml","calorias_por_100g":61},{"id":"huevo","nombre":"Huevo","cantidad":4,"unidad":"unidad","calorias_por_100g":155},{"id":"azucar","nombre":"Azúcar","cantidad":100,"unidad":"g","calorias_por_100g":387},{"id":"vainilla","nombre":"Vainilla","cantidad":2,"unidad":"ml","calorias_por_100g":288}]'::jsonb,
'[{"orden":1,"descripcion":"Haz un caramelo con 50 g de azúcar en el fondo de una fuente.","duracion_min":10},{"orden":2,"descripcion":"Bate los huevos con el azúcar, agrega leche y vainilla.","duracion_min":5},{"orden":3,"descripcion":"Vierte sobre el caramelo y hornea a 170°C durante 45 minutos a baño maría.","duracion_min":55}]'::jsonb,
ARRAY['chile','postre','tradicional','horno'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('mote-con-huesillo', 'Mote con huesillo', 'Bebida-postre chilena de durazno deshidratado cocido con trigo mote.', ARRAY['snack'], ARRAY['preescolar'], 60, 4, ARRAY['gluten']::text[], 200, 3, 48, 0.5, 1,
'[{"id":"mote","nombre":"Trigo mote","cantidad":80,"unidad":"g","calorias_por_100g":340},{"id":"huesillos","nombre":"Huesillos (duraznos secos)","cantidad":8,"unidad":"unidad","calorias_por_100g":240},{"id":"azucar","nombre":"Azúcar","cantidad":50,"unidad":"g","calorias_por_100g":387},{"id":"canela","nombre":"Canela","cantidad":1,"unidad":"g","calorias_por_100g":247}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina los huesillos con canela y azúcar durante 40 minutos.","duracion_min":40},{"orden":2,"descripcion":"Hierve el mote aparte hasta que esté blando, unos 30 minutos.","duracion_min":30},{"orden":3,"descripcion":"Enfría y sirve en vaso con mote en el fondo y huesillos con su jugo.","duracion_min":5}]'::jsonb,
ARRAY['chile','tradicional','verano','bebida'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('porotos-granados', 'Porotos granados', 'Porotos frescos de verano con zapallo, choclo y albahaca. Clásico chileno.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 55, 3, ARRAY[]::text[], 320, 14, 58, 4, 3.5,
'[{"id":"porotos-granados","nombre":"Porotos granados frescos","cantidad":200,"unidad":"g","calorias_por_100g":139},{"id":"zapallo","nombre":"Zapallo","cantidad":200,"unidad":"g","calorias_por_100g":26},{"id":"choclo","nombre":"Choclo","cantidad":100,"unidad":"g","calorias_por_100g":86},{"id":"albahaca","nombre":"Albahaca","cantidad":10,"unidad":"g","calorias_por_100g":22},{"id":"cebolla","nombre":"Cebolla","cantidad":50,"unidad":"g","calorias_por_100g":40}]'::jsonb,
'[{"orden":1,"descripcion":"Sofríe cebolla picada en aceite.","duracion_min":5},{"orden":2,"descripcion":"Agrega porotos, zapallo y agua. Cocina 30 minutos hasta que estén blandos.","duracion_min":30},{"orden":3,"descripcion":"Incorpora choclo y albahaca los últimos 10 minutos.","duracion_min":10}]'::jsonb,
ARRAY['chile','tradicional','verano','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('lomo-a-lo-pobre-infantil', 'Lomo a lo pobre infantil', 'Versión infantil del clásico: bistec, huevo revuelto y papas horneadas.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 35, 2, ARRAY['huevo']::text[], 490, 30, 42, 20, 3,
'[{"id":"carne","nombre":"Bistec de vacuno","cantidad":200,"unidad":"g","calorias_por_100g":250},{"id":"papa","nombre":"Papa","cantidad":250,"unidad":"g","calorias_por_100g":77},{"id":"huevo","nombre":"Huevo","cantidad":2,"unidad":"unidad","calorias_por_100g":155},{"id":"cebolla","nombre":"Cebolla","cantidad":50,"unidad":"g","calorias_por_100g":40}]'::jsonb,
'[{"orden":1,"descripcion":"Corta las papas en bastones y hornea 25 minutos con aceite a 200°C.","duracion_min":25},{"orden":2,"descripcion":"Cocina el bistec a la plancha 4 minutos por lado, corta en trozos pequeños.","duracion_min":10},{"orden":3,"descripcion":"Haz un huevo revuelto con cebolla picada y sirve todo junto.","duracion_min":5}]'::jsonb,
ARRAY['chile','tradicional','proteina','hierro'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('completo-casero-infantil', 'Completo casero infantil', 'Versión casera y sin aditivos del clásico chileno: pancito, vienesa y palta.', ARRAY['almuerzo','snack'], ARRAY['preescolar'], 20, 2, ARRAY['gluten']::text[], 380, 15, 40, 18, 1.8,
'[{"id":"pan-hotdog","nombre":"Pan de completo","cantidad":2,"unidad":"unidad","calorias_por_100g":275},{"id":"vienesa","nombre":"Vienesa de pavo","cantidad":2,"unidad":"unidad","calorias_por_100g":190},{"id":"tomate","nombre":"Tomate","cantidad":80,"unidad":"g","calorias_por_100g":18},{"id":"palta","nombre":"Palta","cantidad":60,"unidad":"g","calorias_por_100g":160}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina las vienesas en agua hirviendo durante 5 minutos.","duracion_min":5},{"orden":2,"descripcion":"Tuesta el pan levemente en sartén.","duracion_min":3},{"orden":3,"descripcion":"Arma el completo con vienesa, tomate picado y palta pisada.","duracion_min":5}]'::jsonb,
ARRAY['chile','tradicional','rapido','merienda'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pescado-con-ensalada-chilena', 'Pescado con ensalada chilena', 'Filete de reineta o merluza con ensalada fresca de tomate y cebolla.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 25, 2, ARRAY['pescado']::text[], 270, 25, 12, 14, 1.5,
'[{"id":"reineta","nombre":"Filete de reineta","cantidad":200,"unidad":"g","calorias_por_100g":110},{"id":"tomate","nombre":"Tomate","cantidad":150,"unidad":"g","calorias_por_100g":18},{"id":"cebolla","nombre":"Cebolla","cantidad":40,"unidad":"g","calorias_por_100g":40},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":15,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el pescado a la plancha con un toque de aceite durante 5 minutos por lado.","duracion_min":10},{"orden":2,"descripcion":"Corta tomate en gajos y cebolla en pluma fina. Remoja la cebolla en agua 5 minutos.","duracion_min":7},{"orden":3,"descripcion":"Mezcla la ensalada con aceite de oliva y sirve junto al pescado.","duracion_min":3}]'::jsonb,
ARRAY['chile','latam','pescado','liviano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('arroz-primavera-con-pollo', 'Arroz primavera con pollo', 'Arroz con vegetales de colores y pollo desmenuzado. Colorido y completo.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 30, 3, ARRAY[]::text[], 310, 18, 42, 6, 1.5,
'[{"id":"arroz","nombre":"Arroz","cantidad":100,"unidad":"g","calorias_por_100g":130},{"id":"pollo","nombre":"Pechuga de pollo","cantidad":150,"unidad":"g","calorias_por_100g":165},{"id":"arvejas","nombre":"Arvejas","cantidad":60,"unidad":"g","calorias_por_100g":81},{"id":"zanahoria","nombre":"Zanahoria","cantidad":60,"unidad":"g","calorias_por_100g":41},{"id":"choclo","nombre":"Choclo","cantidad":50,"unidad":"g","calorias_por_100g":86}]'::jsonb,
'[{"orden":1,"descripcion":"Saltea el pollo en cubos con las verduras picadas por 10 minutos.","duracion_min":10},{"orden":2,"descripcion":"Agrega el arroz y el doble de agua. Cocina 18 minutos a fuego bajo.","duracion_min":18},{"orden":3,"descripcion":"Revuelve con tenedor antes de servir para que quede suelto.","duracion_min":2}]'::jsonb,
ARRAY['latam','chile','familiar','completo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('ensalada-mixta-con-atun', 'Ensalada mixta con atún', 'Ensalada fría con atún, lechuga, tomate, huevo y papa. Comida completa.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 25, 2, ARRAY['pescado','huevo']::text[], 260, 20, 22, 10, 2,
'[{"id":"atun","nombre":"Atún en agua","cantidad":120,"unidad":"g","calorias_por_100g":116},{"id":"papa","nombre":"Papa","cantidad":150,"unidad":"g","calorias_por_100g":77},{"id":"lechuga","nombre":"Lechuga","cantidad":60,"unidad":"g","calorias_por_100g":15},{"id":"tomate","nombre":"Tomate","cantidad":80,"unidad":"g","calorias_por_100g":18},{"id":"huevo","nombre":"Huevo duro","cantidad":1,"unidad":"unidad","calorias_por_100g":155}]'::jsonb,
'[{"orden":1,"descripcion":"Hierve la papa y el huevo durante 12 minutos.","duracion_min":15},{"orden":2,"descripcion":"Pica lechuga, tomate, papa enfriada y huevo en cubos.","duracion_min":5},{"orden":3,"descripcion":"Mezcla con el atún escurrido y aliña con aceite de oliva.","duracion_min":3}]'::jsonb,
ARRAY['latam','liviano','pescado','frio'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('quinoto-de-verduras', 'Quinoto de verduras', 'Risotto de quinoa con verduras. Cremoso, nutritivo y sin gluten.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 35, 2, ARRAY['lacteos']::text[], 290, 11, 42, 8, 2.5,
'[{"id":"quinoa","nombre":"Quinoa","cantidad":80,"unidad":"g","calorias_por_100g":368},{"id":"zapallo","nombre":"Zapallo","cantidad":100,"unidad":"g","calorias_por_100g":26},{"id":"champinones","nombre":"Champiñones","cantidad":60,"unidad":"g","calorias_por_100g":22},{"id":"queso","nombre":"Queso parmesano","cantidad":20,"unidad":"g","calorias_por_100g":431},{"id":"cebolla","nombre":"Cebolla","cantidad":40,"unidad":"g","calorias_por_100g":40}]'::jsonb,
'[{"orden":1,"descripcion":"Saltea cebolla, zapallo y champiñones picados finos.","duracion_min":8},{"orden":2,"descripcion":"Agrega la quinoa y el doble de caldo tibio. Cocina 18 minutos.","duracion_min":18},{"orden":3,"descripcion":"Retira del fuego, agrega queso rallado y revuelve hasta cremoso.","duracion_min":3}]'::jsonb,
ARRAY['latam','andino','sin-gluten','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pollo-al-coco-suave', 'Pollo al coco suave', 'Pollo en crema de coco sin picante, inspirado en la cocina caribeña.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 40, 2, ARRAY[]::text[], 380, 25, 20, 22, 1.5,
'[{"id":"pollo","nombre":"Pechuga de pollo","cantidad":200,"unidad":"g","calorias_por_100g":165},{"id":"leche-coco","nombre":"Leche de coco","cantidad":150,"unidad":"ml","calorias_por_100g":230},{"id":"arroz","nombre":"Arroz","cantidad":80,"unidad":"g","calorias_por_100g":130},{"id":"cebolla","nombre":"Cebolla","cantidad":40,"unidad":"g","calorias_por_100g":40}]'::jsonb,
'[{"orden":1,"descripcion":"Sofríe cebolla picada, agrega el pollo en cubos y dóralo 5 minutos.","duracion_min":8},{"orden":2,"descripcion":"Incorpora la leche de coco y cocina a fuego bajo 15 minutos.","duracion_min":15},{"orden":3,"descripcion":"Sirve sobre arroz blanco cocido.","duracion_min":2}]'::jsonb,
ARRAY['latam','caribe','coco','cremoso'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('mazamorra-morada', 'Mazamorra morada', 'Postre peruano de maíz morado con frutas. Dulce y lleno de antioxidantes.', ARRAY['snack'], ARRAY['preescolar'], 50, 4, ARRAY['gluten']::text[], 180, 1.5, 42, 0.5, 0.6,
'[{"id":"maiz-morado","nombre":"Maíz morado","cantidad":200,"unidad":"g","calorias_por_100g":340},{"id":"manzana","nombre":"Manzana","cantidad":1,"unidad":"unidad","calorias_por_100g":52},{"id":"pina","nombre":"Piña","cantidad":100,"unidad":"g","calorias_por_100g":50},{"id":"chuno","nombre":"Chuño o maicena","cantidad":30,"unidad":"g","calorias_por_100g":340},{"id":"azucar","nombre":"Azúcar","cantidad":40,"unidad":"g","calorias_por_100g":387}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el maíz morado en agua durante 30 minutos y cuela el líquido.","duracion_min":35},{"orden":2,"descripcion":"Agrega azúcar, manzana y piña en cubos. Cocina 10 minutos.","duracion_min":10},{"orden":3,"descripcion":"Espesa con el chuño disuelto en agua fría y sirve tibio.","duracion_min":5}]'::jsonb,
ARRAY['peru','latam','postre','fruta'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('tortilla-de-espinaca-y-queso', 'Tortilla de espinaca y queso', 'Tortilla al horno con espinaca y queso rallado. Alta en hierro.', ARRAY['almuerzo','cena','snack'], ARRAY['preescolar'], 25, 2, ARRAY['huevo','lacteos']::text[], 260, 18, 8, 18, 2.5,
'[{"id":"huevo","nombre":"Huevo","cantidad":3,"unidad":"unidad","calorias_por_100g":155},{"id":"espinaca","nombre":"Espinaca","cantidad":100,"unidad":"g","calorias_por_100g":23},{"id":"queso","nombre":"Queso rallado","cantidad":40,"unidad":"g","calorias_por_100g":264},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":10,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Saltea la espinaca en aceite hasta que reduzca. Enfría.","duracion_min":5},{"orden":2,"descripcion":"Bate los huevos con la espinaca y el queso.","duracion_min":3},{"orden":3,"descripcion":"Cocina en sartén tapada 8 minutos por lado o al horno 15 minutos.","duracion_min":15}]'::jsonb,
ARRAY['latam','huevo','verdura-verde','hierro'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('budin-de-zapallo', 'Budín de zapallo', 'Budín tibio y suave, ideal para merienda o acompañamiento.', ARRAY['snack','cena'], ARRAY['preescolar'], 60, 4, ARRAY['huevo','lacteos','gluten']::text[], 220, 8, 28, 8, 1.2,
'[{"id":"zapallo","nombre":"Zapallo cocido","cantidad":300,"unidad":"g","calorias_por_100g":26},{"id":"huevo","nombre":"Huevo","cantidad":2,"unidad":"unidad","calorias_por_100g":155},{"id":"harina","nombre":"Harina","cantidad":40,"unidad":"g","calorias_por_100g":364},{"id":"leche","nombre":"Leche","cantidad":100,"unidad":"ml","calorias_por_100g":61},{"id":"queso","nombre":"Queso rallado","cantidad":30,"unidad":"g","calorias_por_100g":264}]'::jsonb,
'[{"orden":1,"descripcion":"Pisa el zapallo cocido y mezcla con huevo batido y leche.","duracion_min":5},{"orden":2,"descripcion":"Agrega harina y queso, revolviendo para que no queden grumos.","duracion_min":3},{"orden":3,"descripcion":"Hornea en molde enmantecado a 180°C durante 40 minutos.","duracion_min":45}]'::jsonb,
ARRAY['latam','chile','horno','verdura'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('milanesa-napolitana-casera', 'Milanesa napolitana casera', 'Milanesa al horno cubierta con tomate y queso. Menos grasa que la frita.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 35, 2, ARRAY['gluten','huevo','lacteos']::text[], 420, 32, 28, 18, 2.5,
'[{"id":"carne","nombre":"Bistec fino","cantidad":200,"unidad":"g","calorias_por_100g":250},{"id":"pan-rallado","nombre":"Pan rallado","cantidad":60,"unidad":"g","calorias_por_100g":395},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"tomate","nombre":"Salsa de tomate","cantidad":80,"unidad":"g","calorias_por_100g":18},{"id":"queso","nombre":"Queso","cantidad":50,"unidad":"g","calorias_por_100g":264}]'::jsonb,
'[{"orden":1,"descripcion":"Pasa los bistec por huevo batido y luego por pan rallado.","duracion_min":5},{"orden":2,"descripcion":"Hornea a 200°C durante 12 minutos con un toque de aceite.","duracion_min":12},{"orden":3,"descripcion":"Cubre con salsa de tomate y queso, vuelve al horno 8 minutos.","duracion_min":10}]'::jsonb,
ARRAY['latam','argentina','proteina','horno'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pollo-al-horno-con-papas', 'Pollo al horno con papas', 'Presa de pollo jugosa con papas doradas al horno. Receta familiar de siempre.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 55, 3, ARRAY[]::text[], 410, 28, 38, 14, 2,
'[{"id":"pollo","nombre":"Trutros de pollo","cantidad":300,"unidad":"g","calorias_por_100g":165},{"id":"papa","nombre":"Papa","cantidad":400,"unidad":"g","calorias_por_100g":77},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":20,"unidad":"ml","calorias_por_100g":884},{"id":"limon","nombre":"Limón","cantidad":15,"unidad":"ml","calorias_por_100g":29},{"id":"oregano","nombre":"Orégano","cantidad":2,"unidad":"g","calorias_por_100g":265}]'::jsonb,
'[{"orden":1,"descripcion":"Adoba el pollo con aceite, limón y orégano. Deja reposar 15 minutos.","duracion_min":15},{"orden":2,"descripcion":"Coloca pollo y papas en cubos en una fuente con aceite.","duracion_min":5},{"orden":3,"descripcion":"Hornea a 200°C durante 45 minutos, dando vuelta a mitad de cocción.","duracion_min":45}]'::jsonb,
ARRAY['chile','latam','familiar','horno'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('ensalada-de-quinoa-y-palta', 'Ensalada de quinoa y palta', 'Ensalada fría de quinoa con palta, tomate y choclo. Liviana y completa.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 25, 2, ARRAY[]::text[], 280, 8, 38, 12, 2,
'[{"id":"quinoa","nombre":"Quinoa","cantidad":80,"unidad":"g","calorias_por_100g":368},{"id":"palta","nombre":"Palta","cantidad":80,"unidad":"g","calorias_por_100g":160},{"id":"tomate","nombre":"Tomate","cantidad":80,"unidad":"g","calorias_por_100g":18},{"id":"choclo","nombre":"Choclo","cantidad":60,"unidad":"g","calorias_por_100g":86},{"id":"limon","nombre":"Limón","cantidad":10,"unidad":"ml","calorias_por_100g":29}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina la quinoa en agua durante 18 minutos. Escurre y enfría.","duracion_min":20},{"orden":2,"descripcion":"Corta palta, tomate y mezcla con el choclo cocido.","duracion_min":5},{"orden":3,"descripcion":"Junta todo con aceite de oliva y limón. Sirve fría.","duracion_min":2}]'::jsonb,
ARRAY['latam','andino','sin-gluten','fria'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Verificación rápida post-seed (opcional):
-- SELECT COUNT(*) FROM recetas WHERE activa = true;
-- SELECT etapa, COUNT(*) FROM (SELECT unnest(etapas_compatibles) AS etapa FROM recetas WHERE activa=true) t GROUP BY etapa;
-- ============================================================
