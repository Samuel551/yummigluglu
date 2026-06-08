-- ============================================================
-- Yummi Glu Glu — 10 snacks/galletitas extra
-- ============================================================
-- Set de 10 recetas dulces/saladas tipo snack para llenar la
-- categoría "Snack" del catálogo. Distribución:
--   INICIO (6-11m):       3 recetas — sin huevo o muy simples
--   TRANSICION (12-23m):  4 recetas — clásicos de merienda
--   PREESCOLAR (24m+):    3 recetas — incluye miel y opciones premium
--
-- Todas FREE, sin azúcar refinada agregada donde se puede.
-- Idempotente: ON CONFLICT (slug) DO NOTHING.
-- ============================================================

-- ─── INICIO (6-11m) ──────────────────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('galletitas-platano-avena-3-ing', 'Galletitas de plátano y avena (3 ingredientes)', 'Galletitas suaves con solo 3 ingredientes: plátano, avena y canela. Sin huevo, sin azúcar, sin leche.', ARRAY['snack'], ARRAY['inicio','transicion','preescolar'], 25, 4, ARRAY['gluten']::text[], 95, 2.5, 20, 1, 0.8,
'[{"id":"platano","nombre":"Plátano maduro","cantidad":2,"unidad":"unidad","calorias_por_100g":89},{"id":"avena","nombre":"Avena en hojuelas","cantidad":80,"unidad":"g","calorias_por_100g":389},{"id":"canela","nombre":"Canela en polvo","cantidad":1,"unidad":"pizca","calorias_por_100g":247}]'::jsonb,
'[{"orden":1,"descripcion":"Pisa los plátanos maduros con un tenedor hasta hacer un puré.","duracion_min":2},{"orden":2,"descripcion":"Agrega la avena y la canela. Mezcla hasta integrar todo.","duracion_min":3},{"orden":3,"descripcion":"Forma bolitas con las manos y aplástalas en una bandeja con papel manteca.","duracion_min":5},{"orden":4,"descripcion":"Hornea a 180°C durante 12-15 minutos hasta dorar levemente.","duracion_min":15}]'::jsonb,
ARRAY['latam','snack','finger-food','sin-huevo','sin-azucar','sin-lacteos','merienda'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('bocaditos-batata-horno', 'Bocaditos de batata al horno', 'Cubos de batata horneados con un toque de canela. Dulces naturalmente, perfectos para que tu bebé tome con la mano.', ARRAY['snack'], ARRAY['inicio','transicion','preescolar'], 30, 3, ARRAY[]::text[], 110, 1.5, 25, 0.8, 0.7,
'[{"id":"batata","nombre":"Batata","cantidad":300,"unidad":"g","calorias_por_100g":86},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":8,"unidad":"ml","calorias_por_100g":884},{"id":"canela","nombre":"Canela en polvo","cantidad":1,"unidad":"pizca","calorias_por_100g":247}]'::jsonb,
'[{"orden":1,"descripcion":"Pela la batata y córtala en cubos del tamaño de un bocado de bebé.","duracion_min":4},{"orden":2,"descripcion":"Mezcla los cubos con el aceite de oliva y la pizca de canela.","duracion_min":1},{"orden":3,"descripcion":"Distribuye en una bandeja con papel manteca sin que se toquen.","duracion_min":2},{"orden":4,"descripcion":"Hornea a 200°C durante 22 minutos volteándolos a mitad de cocción.","duracion_min":22}]'::jsonb,
ARRAY['latam','snack','finger-food','sin-gluten','sin-huevo','sin-lacteos','sin-azucar','horneado'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('galletitas-zanahoria-manzana', 'Galletitas de zanahoria y manzana', 'Galletitas suaves con zanahoria rallada y manzana. Sin azúcar añadida, endulzadas naturalmente con la fruta.', ARRAY['snack'], ARRAY['inicio','transicion','preescolar'], 30, 4, ARRAY['gluten']::text[], 105, 2.5, 22, 1, 1,
'[{"id":"avena","nombre":"Avena en hojuelas","cantidad":80,"unidad":"g","calorias_por_100g":389},{"id":"zanahoria","nombre":"Zanahoria rallada fina","cantidad":80,"unidad":"g","calorias_por_100g":41},{"id":"manzana","nombre":"Manzana rallada","cantidad":1,"unidad":"unidad","calorias_por_100g":52},{"id":"canela","nombre":"Canela en polvo","cantidad":1,"unidad":"pizca","calorias_por_100g":247}]'::jsonb,
'[{"orden":1,"descripcion":"Ralla la zanahoria y la manzana muy finas.","duracion_min":4},{"orden":2,"descripcion":"Mezcla con la avena y la canela hasta integrar.","duracion_min":2},{"orden":3,"descripcion":"Deja reposar 10 minutos para que la avena absorba la humedad.","duracion_min":10},{"orden":4,"descripcion":"Forma galletitas pequeñas y hornea a 180°C durante 18 minutos.","duracion_min":18}]'::jsonb,
ARRAY['latam','snack','finger-food','sin-huevo','sin-azucar','sin-lacteos','merienda','verdura'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── TRANSICION (12-23m) ─────────────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('galletitas-clasicas-avena-platano', 'Galletitas clásicas de avena y plátano', 'Las galletitas estrella de la merienda: avena, plátano y huevo. Doraditas por fuera y blandas por dentro.', ARRAY['snack'], ARRAY['transicion','preescolar'], 25, 4, ARRAY['gluten','huevo']::text[], 135, 4, 24, 2.5, 1.2,
'[{"id":"avena","nombre":"Avena en hojuelas","cantidad":100,"unidad":"g","calorias_por_100g":389},{"id":"platano","nombre":"Plátano maduro","cantidad":2,"unidad":"unidad","calorias_por_100g":89},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"vainilla","nombre":"Esencia de vainilla","cantidad":3,"unidad":"gotas","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Pisa los plátanos maduros con un tenedor hasta hacer puré.","duracion_min":2},{"orden":2,"descripcion":"Bate el huevo aparte y agrégalo al plátano junto con la vainilla.","duracion_min":2},{"orden":3,"descripcion":"Incorpora la avena y mezcla bien. Deja reposar 10 minutos.","duracion_min":12},{"orden":4,"descripcion":"Forma galletitas en bandeja con papel manteca y hornea a 180°C durante 15 minutos.","duracion_min":15}]'::jsonb,
ARRAY['latam','snack','finger-food','sin-azucar','merienda','clasico'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('bocaditos-manzana-avena-canela', 'Bocaditos de manzana, avena y canela', 'Mini muffins suaves con avena, manzana y canela. Sin azúcar añadida, endulzados solo con la fruta y un toque de pasas.', ARRAY['snack'], ARRAY['transicion','preescolar'], 35, 6, ARRAY['gluten','huevo']::text[], 120, 3.5, 22, 2, 1.4,
'[{"id":"avena","nombre":"Avena en hojuelas","cantidad":120,"unidad":"g","calorias_por_100g":389},{"id":"manzana","nombre":"Manzana rallada","cantidad":2,"unidad":"unidad","calorias_por_100g":52},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"leche","nombre":"Leche","cantidad":60,"unidad":"ml","calorias_por_100g":61},{"id":"canela","nombre":"Canela en polvo","cantidad":2,"unidad":"g","calorias_por_100g":247}]'::jsonb,
'[{"orden":1,"descripcion":"Ralla las manzanas con cáscara y reserva.","duracion_min":3},{"orden":2,"descripcion":"Mezcla la avena con el huevo batido, la leche y la canela.","duracion_min":3},{"orden":3,"descripcion":"Incorpora la manzana rallada y deja reposar 10 minutos para que la avena se hidrate.","duracion_min":10},{"orden":4,"descripcion":"Reparte en moldes de muffin y hornea a 180°C durante 18 minutos.","duracion_min":18}]'::jsonb,
ARRAY['latam','snack','sin-azucar','merienda','manzana'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('tortitas-zapallo-horno', 'Tortitas de zapallo al horno', 'Mini tortitas suaves de zapallo, queso y huevo. Snack salado-dulce ideal para acompañar la merienda.', ARRAY['snack'], ARRAY['transicion','preescolar'], 30, 4, ARRAY['gluten','huevo','lacteos']::text[], 155, 7, 18, 6, 1.5,
'[{"id":"zapallo","nombre":"Zapallo cocido y pisado","cantidad":200,"unidad":"g","calorias_por_100g":26},{"id":"harina","nombre":"Harina","cantidad":50,"unidad":"g","calorias_por_100g":364},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"queso","nombre":"Queso rallado","cantidad":40,"unidad":"g","calorias_por_100g":264},{"id":"aceite-oliva","nombre":"Aceite de oliva","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el zapallo al vapor y písalo hasta hacer un puré liso.","duracion_min":12},{"orden":2,"descripcion":"Mezcla con el huevo batido, la harina y el queso rallado.","duracion_min":3},{"orden":3,"descripcion":"Forma tortitas pequeñas con las manos en bandeja con papel manteca y aceite.","duracion_min":5},{"orden":4,"descripcion":"Hornea a 200°C durante 15 minutos hasta dorar.","duracion_min":15}]'::jsonb,
ARRAY['latam','snack','finger-food','verdura','horneado','merienda'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('galletitas-zanahoria-datiles', 'Galletitas de zanahoria con dátiles', 'Galletitas dulces sin azúcar agregada. Los dátiles dan toda la dulzura natural y la zanahoria suma color y vitaminas.', ARRAY['snack'], ARRAY['transicion','preescolar'], 30, 5, ARRAY['gluten','huevo']::text[], 145, 3.5, 28, 2.5, 1.2,
'[{"id":"avena","nombre":"Avena en hojuelas","cantidad":100,"unidad":"g","calorias_por_100g":389},{"id":"zanahoria","nombre":"Zanahoria rallada","cantidad":100,"unidad":"g","calorias_por_100g":41},{"id":"datiles","nombre":"Dátiles sin carozo, picados","cantidad":60,"unidad":"g","calorias_por_100g":277},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"aceite","nombre":"Aceite","cantidad":10,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Pica los dátiles sin carozo en trocitos muy chicos y déjalos en remojo en agua tibia 5 minutos.","duracion_min":7},{"orden":2,"descripcion":"Ralla la zanahoria fina y mezcla con el huevo batido y el aceite.","duracion_min":3},{"orden":3,"descripcion":"Agrega la avena y los dátiles escurridos. Deja reposar 5 minutos.","duracion_min":7},{"orden":4,"descripcion":"Forma galletitas pequeñas y hornea a 180°C durante 16 minutos hasta dorar.","duracion_min":16}]'::jsonb,
ARRAY['latam','snack','sin-azucar','datiles','merienda','verdura'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── PREESCOLAR (24m+) ───────────────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('galletitas-avena-miel-canela', 'Galletitas de avena con miel y canela', 'Galletitas clásicas hogareñas con avena, miel y canela. La merienda de la abuela hecha en casa, lista en 30 minutos.', ARRAY['snack'], ARRAY['preescolar'], 30, 6, ARRAY['gluten','huevo','lacteos']::text[], 165, 4, 24, 6, 1.2,
'[{"id":"avena","nombre":"Avena en hojuelas","cantidad":150,"unidad":"g","calorias_por_100g":389},{"id":"miel","nombre":"Miel","cantidad":40,"unidad":"g","calorias_por_100g":304},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"mantequilla","nombre":"Mantequilla derretida","cantidad":40,"unidad":"g","calorias_por_100g":717},{"id":"canela","nombre":"Canela en polvo","cantidad":2,"unidad":"g","calorias_por_100g":247}]'::jsonb,
'[{"orden":1,"descripcion":"Derrite la mantequilla y mezcla con la miel y el huevo batido.","duracion_min":3},{"orden":2,"descripcion":"Agrega la avena y la canela. Mezcla hasta formar una masa pegajosa.","duracion_min":3},{"orden":3,"descripcion":"Deja reposar 10 minutos para que la avena absorba humedad.","duracion_min":10},{"orden":4,"descripcion":"Forma galletitas con cuchara en bandeja con papel manteca. Hornea a 180°C 14 minutos.","duracion_min":14}]'::jsonb,
ARRAY['latam','snack','miel','merienda','tradicional','clasico'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('bolitas-energeticas-datiles-avena', 'Bolitas energéticas de dátiles y avena', 'Snack sin cocción: bolitas dulces de dátiles, avena y coco rallado. Energía pura, ideales para la mochila.', ARRAY['snack'], ARRAY['preescolar'], 15, 6, ARRAY['gluten']::text[], 160, 3, 32, 3.5, 1.3,
'[{"id":"datiles","nombre":"Dátiles sin carozo","cantidad":150,"unidad":"g","calorias_por_100g":277},{"id":"avena","nombre":"Avena en hojuelas","cantidad":80,"unidad":"g","calorias_por_100g":389},{"id":"coco-rallado","nombre":"Coco rallado","cantidad":30,"unidad":"g","calorias_por_100g":660},{"id":"agua","nombre":"Agua tibia","cantidad":15,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Pica los dátiles sin carozo lo más fino que puedas (o procésalos).","duracion_min":4},{"orden":2,"descripcion":"Mezcla los dátiles picados con la avena y la mitad del coco rallado.","duracion_min":2},{"orden":3,"descripcion":"Agrega el agua tibia poco a poco hasta lograr una pasta moldeable.","duracion_min":3},{"orden":4,"descripcion":"Forma bolitas con las manos y rebózalas en el coco rallado restante. Refrigera 30 minutos.","duracion_min":6}]'::jsonb,
ARRAY['latam','snack','sin-coccion','sin-azucar','sin-huevo','sin-lacteos','energetico','coco','datiles'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('galletitas-coco-limon', 'Galletitas de coco y limón', 'Galletitas crocantes y aromáticas de coco rallado con ralladura de limón. Sin lácteos, perfumadas y livianas.', ARRAY['snack'], ARRAY['preescolar'], 30, 5, ARRAY['gluten','huevo']::text[], 175, 4, 22, 8, 1,
'[{"id":"avena","nombre":"Avena en hojuelas","cantidad":80,"unidad":"g","calorias_por_100g":389},{"id":"coco-rallado","nombre":"Coco rallado","cantidad":60,"unidad":"g","calorias_por_100g":660},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"miel","nombre":"Miel","cantidad":30,"unidad":"g","calorias_por_100g":304},{"id":"limon","nombre":"Ralladura de limón","cantidad":1,"unidad":"cucharadita","calorias_por_100g":29},{"id":"aceite","nombre":"Aceite","cantidad":15,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Bate el huevo con la miel, el aceite y la ralladura de limón.","duracion_min":3},{"orden":2,"descripcion":"Agrega la avena y el coco rallado. Mezcla hasta integrar bien.","duracion_min":3},{"orden":3,"descripcion":"Deja reposar la masa 10 minutos para hidratar la avena.","duracion_min":10},{"orden":4,"descripcion":"Forma galletitas pequeñas y hornea a 180°C durante 14 minutos hasta dorar.","duracion_min":14}]'::jsonb,
ARRAY['latam','snack','coco','limon','sin-lacteos','merienda','miel'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Reload schema cache para que la API vea las nuevas filas ─────
NOTIFY pgrst, 'reload schema';
