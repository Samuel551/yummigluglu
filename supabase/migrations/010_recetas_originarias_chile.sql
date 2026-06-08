-- ============================================================
-- Yummi Glu Glu — 20 recetas originarias de CHILE 🇨🇱
-- Distribución pareja por etapa:
--   INICIO (6-11m):       7 recetas — papillas y purés con ingredientes chilenos
--   TRANSICION (12-23m):  7 recetas — clásicos chilenos adaptados a textura blanda
--   PREESCOLAR (24m+):    6 recetas — platos icónicos en versión baby-friendly
--
-- Todas FREE, sin sal ni azúcar agregada (donde aplica).
-- Idempotente: ON CONFLICT (slug) DO NOTHING.
-- Tags: 'chile' + 'latam' + categorías específicas.
-- ============================================================

-- ─── INICIO (6-11m) ──────────────────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-zapallo-quinoa-chile', 'Puré de zapallo y quínoa', 'Puré nutritivo con quínoa andina y zapallo. La quínoa aporta proteína completa y hierro.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 25, 2, ARRAY[]::text[], 110, 4, 22, 1.5, 1.4,
'[{"id":"zapallo","nombre":"Zapallo","cantidad":150,"unidad":"g","calorias_por_100g":26},{"id":"quinoa","nombre":"Quínoa","cantidad":30,"unidad":"g","calorias_por_100g":368},{"id":"agua","nombre":"Agua","cantidad":150,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Lava bien la quínoa bajo agua corriente hasta que el agua salga clara.","duracion_min":2},{"orden":2,"descripcion":"Pela el zapallo y córtalo en cubos pequeños.","duracion_min":3},{"orden":3,"descripcion":"Cocina la quínoa y el zapallo juntos en agua durante 18 minutos.","duracion_min":18},{"orden":4,"descripcion":"Procesa hasta obtener un puré liso.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','andino','quinoa','vegetariano','sin-gluten'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('papilla-avena-frutilla-sur', 'Papilla de avena con frutilla del sur', 'Desayuno cremoso con avena y frutillas frescas, fruta emblemática del sur chileno.', ARRAY['desayuno','snack'], ARRAY['inicio'], 12, 1, ARRAY['gluten','lactosa']::text[], 145, 5, 22, 3.5, 1.6,
'[{"id":"avena","nombre":"Avena en hojuelas","cantidad":25,"unidad":"g","calorias_por_100g":389},{"id":"leche","nombre":"Leche entera","cantidad":120,"unidad":"ml","calorias_por_100g":61},{"id":"frutillas","nombre":"Frutillas frescas","cantidad":60,"unidad":"g","calorias_por_100g":32}]'::jsonb,
'[{"orden":1,"descripcion":"Lava las frutillas, retira el cabito y córtalas en trocitos pequeños.","duracion_min":2},{"orden":2,"descripcion":"Cocina la avena con la leche a fuego bajo revolviendo hasta espesar.","duracion_min":8},{"orden":3,"descripcion":"Apaga el fuego y agrega las frutillas para que se entibien y suelten su jugo.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','desayuno','fruta','frutilla','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-papa-zanahoria-aceite-chileno', 'Puré de papa y zanahoria con aceite de oliva', 'Combinación clásica chilena, suave y cremosa. Un toque de aceite de oliva chileno suma grasas buenas.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 20, 2, ARRAY[]::text[], 105, 2.2, 22, 2, 0.6,
'[{"id":"papa","nombre":"Papa","cantidad":150,"unidad":"g","calorias_por_100g":77},{"id":"zanahoria","nombre":"Zanahoria","cantidad":100,"unidad":"g","calorias_por_100g":41},{"id":"aceite-oliva","nombre":"Aceite de oliva extra virgen","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Pela y corta la papa y la zanahoria en cubos pequeños.","duracion_min":4},{"orden":2,"descripcion":"Hiérvelas en agua hasta que estén muy blandas, unos 15 minutos.","duracion_min":15},{"orden":3,"descripcion":"Procesa con un chorrito de agua de cocción y agrega el aceite de oliva al final.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','primera-papilla','vegetariano','grasas-buenas'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('compota-manzana-membrillo', 'Compota de manzana y membrillo', 'Compota perfumada con membrillo chileno. Dulzura natural y mucha fibra.', ARRAY['snack','desayuno'], ARRAY['inicio'], 18, 2, ARRAY[]::text[], 75, 0.4, 19, 0.2, 0.3,
'[{"id":"manzana","nombre":"Manzana","cantidad":1,"unidad":"unidad","calorias_por_100g":52},{"id":"membrillo","nombre":"Membrillo maduro","cantidad":0.5,"unidad":"unidad","calorias_por_100g":57},{"id":"agua","nombre":"Agua","cantidad":80,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Pela la manzana y el membrillo, retira las semillas y córtalos en cubos.","duracion_min":5},{"orden":2,"descripcion":"Cocina tapado a fuego bajo con el agua durante 12 minutos.","duracion_min":12},{"orden":3,"descripcion":"Pisa o procesa según la textura que quieras para tu bebé.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','fruta','postre','sin-azucar','membrillo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-zapallo-italiano-choclo', 'Puré de zapallo italiano con choclo', 'Crema verde suave con zapallo italiano y choclo tierno chileno. Sabor casero.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 18, 2, ARRAY[]::text[], 88, 3, 17, 1, 0.6,
'[{"id":"zapallo-italiano","nombre":"Zapallo italiano (zucchini)","cantidad":120,"unidad":"g","calorias_por_100g":17},{"id":"choclo","nombre":"Choclo tierno desgranado","cantidad":80,"unidad":"g","calorias_por_100g":86},{"id":"agua","nombre":"Agua","cantidad":100,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Lava el zapallo italiano y córtalo en cubos pequeños (puedes dejar la cáscara).","duracion_min":3},{"orden":2,"descripcion":"Cocina el zapallo y el choclo juntos en agua durante 12 minutos.","duracion_min":12},{"orden":3,"descripcion":"Procesa hasta obtener una crema suave y verde.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','choclo','vegetariano','primera-papilla'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('papilla-arroz-leche-vainilla', 'Papilla de arroz con leche y vainilla', 'Versión bebé del clásico arroz con leche chileno. Cremoso, sin azúcar agregada.', ARRAY['desayuno','snack'], ARRAY['inicio'], 25, 2, ARRAY['lactosa']::text[], 135, 4, 24, 2.5, 0.5,
'[{"id":"arroz","nombre":"Arroz blanco","cantidad":30,"unidad":"g","calorias_por_100g":130},{"id":"leche","nombre":"Leche entera","cantidad":200,"unidad":"ml","calorias_por_100g":61},{"id":"vainilla","nombre":"Esencia de vainilla","cantidad":2,"unidad":"gotas","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Lava el arroz y cocínalo en agua durante 12 minutos hasta que esté tierno.","duracion_min":12},{"orden":2,"descripcion":"Escurre el agua y agrega la leche junto con la esencia de vainilla.","duracion_min":2},{"orden":3,"descripcion":"Cocina revolviendo a fuego bajo hasta que espese y el arroz esté muy blando.","duracion_min":10},{"orden":4,"descripcion":"Pisa o procesa para que quede una papilla cremosa.","duracion_min":1}]'::jsonb,
ARRAY['chile','latam','desayuno','dulce','postre','tradicional'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-palta-choclo-chile', 'Puré de palta y choclo tierno', 'Mezcla cremosa de palta chilena y choclo tierno, sabor del verano sin necesidad de cocción.', ARRAY['snack','almuerzo'], ARRAY['inicio'], 8, 1, ARRAY[]::text[], 165, 3.5, 17, 10, 0.6,
'[{"id":"palta","nombre":"Palta madura","cantidad":0.5,"unidad":"unidad","calorias_por_100g":160},{"id":"choclo","nombre":"Choclo tierno desgranado","cantidad":60,"unidad":"g","calorias_por_100g":86}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el choclo en agua hirviendo durante 6 minutos hasta que esté tierno.","duracion_min":6},{"orden":2,"descripcion":"Escurre y deja entibiar el choclo.","duracion_min":1},{"orden":3,"descripcion":"Pisa la palta con el choclo hasta formar una crema suave.","duracion_min":1}]'::jsonb,
ARRAY['chile','latam','palta','choclo','grasas-buenas'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── TRANSICION (12-23m) ─────────────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('cazuela-suave-pollo-zapallo', 'Cazuela suave de pollo y zapallo', 'Versión bebé de la cazuela chilena. Caldo nutritivo con pollo desmenuzado, zapallo y choclo.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 45, 3, ARRAY[]::text[], 175, 14, 18, 5, 1.4,
'[{"id":"pollo","nombre":"Pechuga de pollo","cantidad":100,"unidad":"g","calorias_por_100g":165},{"id":"zapallo","nombre":"Zapallo","cantidad":120,"unidad":"g","calorias_por_100g":26},{"id":"papa","nombre":"Papa","cantidad":80,"unidad":"g","calorias_por_100g":77},{"id":"zanahoria","nombre":"Zanahoria","cantidad":50,"unidad":"g","calorias_por_100g":41},{"id":"choclo","nombre":"Choclo en rodaja","cantidad":50,"unidad":"g","calorias_por_100g":86},{"id":"agua","nombre":"Agua","cantidad":500,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Hierve el pollo entero en agua durante 20 minutos.","duracion_min":20},{"orden":2,"descripcion":"Agrega papa, zapallo, zanahoria y choclo cortados en cubos chicos.","duracion_min":3},{"orden":3,"descripcion":"Cocina 20 minutos más hasta que todo esté muy tierno.","duracion_min":20},{"orden":4,"descripcion":"Desmenuza el pollo en hebras finas y devuélvelo al caldo.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','cazuela','tradicional','sopa','pollo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pastel-papas-baby-chile', 'Pastel de papas baby', 'Versión bebé del pastel de papas chileno. Carne suave, cebolla pochada y papas cremosas.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 45, 3, ARRAY['lactosa']::text[], 220, 14, 24, 8, 1.8,
'[{"id":"papa","nombre":"Papa","cantidad":250,"unidad":"g","calorias_por_100g":77},{"id":"carne-molida","nombre":"Carne molida magra","cantidad":120,"unidad":"g","calorias_por_100g":250},{"id":"cebolla","nombre":"Cebolla","cantidad":60,"unidad":"g","calorias_por_100g":40},{"id":"zanahoria","nombre":"Zanahoria","cantidad":40,"unidad":"g","calorias_por_100g":41},{"id":"leche","nombre":"Leche","cantidad":50,"unidad":"ml","calorias_por_100g":61}]'::jsonb,
'[{"orden":1,"descripcion":"Hierve las papas hasta que estén muy blandas, luego pisa con la leche.","duracion_min":18},{"orden":2,"descripcion":"Cocina la cebolla picada fina con la zanahoria rallada hasta que estén transparentes.","duracion_min":6},{"orden":3,"descripcion":"Agrega la carne molida y cocina hasta que pierda el color rosado.","duracion_min":6},{"orden":4,"descripcion":"Coloca la carne en una fuente y cubre con el puré. Hornea 10 minutos a 180°C.","duracion_min":10}]'::jsonb,
ARRAY['chile','latam','pastel','tradicional','carne','horneado'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('charquican-baby', 'Charquicán baby', 'Charquicán chileno clásico con carne picada finita y verduras pisadas. Plato completo y nutritivo.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 35, 3, ARRAY[]::text[], 200, 13, 24, 6, 2,
'[{"id":"papa","nombre":"Papa","cantidad":150,"unidad":"g","calorias_por_100g":77},{"id":"zapallo","nombre":"Zapallo","cantidad":120,"unidad":"g","calorias_por_100g":26},{"id":"carne-picada","nombre":"Carne picada magra","cantidad":80,"unidad":"g","calorias_por_100g":250},{"id":"choclo","nombre":"Choclo desgranado","cantidad":60,"unidad":"g","calorias_por_100g":86},{"id":"zanahoria","nombre":"Zanahoria","cantidad":40,"unidad":"g","calorias_por_100g":41},{"id":"cebolla","nombre":"Cebolla","cantidad":30,"unidad":"g","calorias_por_100g":40}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina papa, zapallo, zanahoria y choclo en agua hasta que estén muy blandos.","duracion_min":18},{"orden":2,"descripcion":"Aparte, dora la cebolla picada fina y agrega la carne hasta que esté cocida.","duracion_min":8},{"orden":3,"descripcion":"Escurre las verduras y písalas con tenedor.","duracion_min":3},{"orden":4,"descripcion":"Mezcla las verduras pisadas con la carne y cocina 2 minutos más.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','charquican','tradicional','carne'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('sopa-tomate-cabello-angel-baby', 'Sopa de tomate con fideos cabello de ángel', 'Sopa de tomate casera con fideos cortados muy chiquitos. Reconfortante y dulce naturalmente.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 25, 2, ARRAY['gluten']::text[], 130, 4, 25, 1.5, 0.9,
'[{"id":"tomate","nombre":"Tomate maduro","cantidad":200,"unidad":"g","calorias_por_100g":18},{"id":"fideos","nombre":"Fideos cabello de ángel","cantidad":30,"unidad":"g","calorias_por_100g":371},{"id":"zanahoria","nombre":"Zanahoria","cantidad":40,"unidad":"g","calorias_por_100g":41},{"id":"agua","nombre":"Agua","cantidad":350,"unidad":"ml","calorias_por_100g":0},{"id":"aceite","nombre":"Aceite de oliva","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Pela los tomates y córtalos en cubos. Ralla la zanahoria.","duracion_min":4},{"orden":2,"descripcion":"Cocina tomate y zanahoria en el agua durante 15 minutos.","duracion_min":15},{"orden":3,"descripcion":"Procesa la sopa hasta que quede lisa y vuelve a la olla.","duracion_min":2},{"orden":4,"descripcion":"Agrega los fideos cortados muy chicos y cocina 4 minutos más con el aceite.","duracion_min":4}]'::jsonb,
ARRAY['chile','latam','sopa','tomate','tradicional'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('porotos-granados-baby', 'Porotos granados con choclo y zapallo', 'Plato típico chileno de verano. Porotos cremosos con choclo, zapallo y un toque de albahaca.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 50, 3, ARRAY[]::text[], 190, 10, 32, 2.5, 3.2,
'[{"id":"porotos","nombre":"Porotos granados frescos","cantidad":120,"unidad":"g","calorias_por_100g":127},{"id":"choclo","nombre":"Choclo molido","cantidad":80,"unidad":"g","calorias_por_100g":86},{"id":"zapallo","nombre":"Zapallo","cantidad":100,"unidad":"g","calorias_por_100g":26},{"id":"cebolla","nombre":"Cebolla","cantidad":30,"unidad":"g","calorias_por_100g":40},{"id":"albahaca","nombre":"Albahaca fresca","cantidad":3,"unidad":"hojas","calorias_por_100g":22}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina los porotos en abundante agua hasta que estén tiernos, unos 30 minutos.","duracion_min":30},{"orden":2,"descripcion":"Aparte, dora la cebolla picada fina y agrega zapallo en cubos chicos.","duracion_min":8},{"orden":3,"descripcion":"Suma el choclo molido y un poco de agua, cocina 5 minutos.","duracion_min":5},{"orden":4,"descripcion":"Junta todo con los porotos, agrega la albahaca picada y cocina 5 minutos más.","duracion_min":5}]'::jsonb,
ARRAY['chile','latam','porotos','tradicional','choclo','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('tortilla-espinacas-queso-baby', 'Tortilla de espinacas y queso fresco', 'Tortilla suave al horno con espinaca picada y queso fresco. Rica en hierro y calcio.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 22, 2, ARRAY['huevo','lactosa']::text[], 180, 14, 4, 12, 2.5,
'[{"id":"huevos","nombre":"Huevos","cantidad":2,"unidad":"unidades","calorias_por_100g":155},{"id":"espinacas","nombre":"Espinacas frescas","cantidad":80,"unidad":"g","calorias_por_100g":23},{"id":"queso-fresco","nombre":"Queso fresco","cantidad":40,"unidad":"g","calorias_por_100g":264},{"id":"aceite","nombre":"Aceite de oliva","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Lava bien las espinacas y blanquéalas en agua hirviendo por 1 minuto.","duracion_min":3},{"orden":2,"descripcion":"Escúrrelas, exprime el agua y pícalas finas.","duracion_min":2},{"orden":3,"descripcion":"Bate los huevos y mezcla con la espinaca y el queso desmenuzado.","duracion_min":2},{"orden":4,"descripcion":"Vierte en una sartén con aceite y cocina tapado a fuego bajo, 8 minutos cada lado.","duracion_min":15}]'::jsonb,
ARRAY['chile','latam','tortilla','espinacas','huevo','hierro'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('estofado-pollo-arroz-baby', 'Estofado suave de pollo con arroz', 'Estofado casero chileno con pollo desmenuzado, verduras y arroz. Plato completo en una olla.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 35, 3, ARRAY[]::text[], 210, 16, 26, 4, 1.6,
'[{"id":"pollo","nombre":"Pechuga de pollo","cantidad":120,"unidad":"g","calorias_por_100g":165},{"id":"arroz","nombre":"Arroz blanco","cantidad":60,"unidad":"g","calorias_por_100g":130},{"id":"tomate","nombre":"Tomate","cantidad":80,"unidad":"g","calorias_por_100g":18},{"id":"cebolla","nombre":"Cebolla","cantidad":40,"unidad":"g","calorias_por_100g":40},{"id":"zanahoria","nombre":"Zanahoria","cantidad":50,"unidad":"g","calorias_por_100g":41},{"id":"agua","nombre":"Agua","cantidad":300,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Corta el pollo en cubos pequeños y dóralo en una olla con aceite.","duracion_min":5},{"orden":2,"descripcion":"Agrega cebolla, zanahoria y tomate picados, cocina 5 minutos.","duracion_min":5},{"orden":3,"descripcion":"Suma el arroz y el agua, tapa y cocina a fuego bajo durante 22 minutos.","duracion_min":22},{"orden":4,"descripcion":"Desmenuza el pollo con dos tenedores antes de servir.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','estofado','pollo','arroz','casero'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── PREESCOLAR (24m+) ───────────────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pastel-choclo-baby', 'Pastel de choclo baby', 'Versión bebé del icónico pastel de choclo chileno. Choclo molido cremoso sobre pollo y carne.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 50, 3, ARRAY['lactosa','huevo']::text[], 280, 16, 36, 8, 1.8,
'[{"id":"choclo","nombre":"Choclo molido","cantidad":300,"unidad":"g","calorias_por_100g":86},{"id":"leche","nombre":"Leche","cantidad":100,"unidad":"ml","calorias_por_100g":61},{"id":"pollo","nombre":"Pechuga de pollo cocida","cantidad":80,"unidad":"g","calorias_por_100g":165},{"id":"carne","nombre":"Carne molida","cantidad":60,"unidad":"g","calorias_por_100g":250},{"id":"cebolla","nombre":"Cebolla","cantidad":40,"unidad":"g","calorias_por_100g":40},{"id":"huevo-duro","nombre":"Huevo duro","cantidad":1,"unidad":"unidad","calorias_por_100g":155}]'::jsonb,
'[{"orden":1,"descripcion":"Dora la cebolla picada fina y agrega la carne hasta que se cocine.","duracion_min":8},{"orden":2,"descripcion":"Mezcla con el pollo desmenuzado y reparte en una fuente.","duracion_min":2},{"orden":3,"descripcion":"Cocina el choclo molido con la leche revolviendo hasta espesar.","duracion_min":10},{"orden":4,"descripcion":"Distribuye el choclo sobre las carnes, decora con rodajas de huevo y hornea 20 minutos a 180°C.","duracion_min":20}]'::jsonb,
ARRAY['chile','latam','pastel-choclo','iconico','tradicional','horneado'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('empanadas-pino-horno-baby', 'Empanadas de pino al horno baby', 'Empanadas chilenas al horno con relleno suave sin pasas ni aceitunas. Para los más chiquitos.', ARRAY['almuerzo','snack'], ARRAY['preescolar'], 55, 4, ARRAY['gluten','huevo']::text[], 250, 11, 30, 9, 1.5,
'[{"id":"harina","nombre":"Harina sin polvos de hornear","cantidad":200,"unidad":"g","calorias_por_100g":364},{"id":"carne","nombre":"Carne molida","cantidad":120,"unidad":"g","calorias_por_100g":250},{"id":"cebolla","nombre":"Cebolla","cantidad":80,"unidad":"g","calorias_por_100g":40},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"aceite","nombre":"Aceite","cantidad":20,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Mezcla harina con aceite, una pizca de sal y agua tibia hasta formar masa lisa. Reposa 15 min.","duracion_min":18},{"orden":2,"descripcion":"Cocina la cebolla picada fina hasta transparentar, agrega la carne y cocina 6 minutos.","duracion_min":10},{"orden":3,"descripcion":"Estira la masa, corta discos y rellena con la mezcla fría. Cierra con los bordes humedecidos.","duracion_min":10},{"orden":4,"descripcion":"Pinta con huevo batido y hornea a 200°C durante 18 minutos hasta dorar.","duracion_min":18}]'::jsonb,
ARRAY['chile','latam','empanada','iconico','tradicional','horneado'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('humitas-dulces-baby', 'Humitas dulces baby', 'Humitas chilenas en versión dulce y baby. Choclo molido cocido con leche y vainilla en hoja.', ARRAY['snack','cena'], ARRAY['preescolar'], 40, 4, ARRAY['lactosa']::text[], 195, 6, 30, 6, 0.8,
'[{"id":"choclo","nombre":"Choclo molido","cantidad":350,"unidad":"g","calorias_por_100g":86},{"id":"leche","nombre":"Leche","cantidad":80,"unidad":"ml","calorias_por_100g":61},{"id":"mantequilla","nombre":"Mantequilla","cantidad":15,"unidad":"g","calorias_por_100g":717},{"id":"vainilla","nombre":"Esencia de vainilla","cantidad":3,"unidad":"gotas","calorias_por_100g":0},{"id":"hojas-choclo","nombre":"Hojas de choclo","cantidad":8,"unidad":"unidades","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el choclo molido con la leche, mantequilla y vainilla hasta espesar bien.","duracion_min":15},{"orden":2,"descripcion":"Lava las hojas de choclo y entibialas en agua caliente.","duracion_min":3},{"orden":3,"descripcion":"Pon una cucharada de la mezcla en cada hoja y envuelve formando paquetitos.","duracion_min":5},{"orden":4,"descripcion":"Cocina las humitas en agua hirviendo durante 18 minutos.","duracion_min":18}]'::jsonb,
ARRAY['chile','latam','humita','tradicional','choclo','dulce'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('caldillo-papa-huevo-baby', 'Caldillo de papa y huevo', 'Caldillo chileno humilde y reconfortante: papa, cebolla y huevo escalfado en caldo casero.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 25, 2, ARRAY['huevo']::text[], 150, 9, 18, 5, 1.4,
'[{"id":"papa","nombre":"Papa","cantidad":200,"unidad":"g","calorias_por_100g":77},{"id":"cebolla","nombre":"Cebolla","cantidad":50,"unidad":"g","calorias_por_100g":40},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"aceite","nombre":"Aceite","cantidad":5,"unidad":"ml","calorias_por_100g":884},{"id":"agua","nombre":"Agua","cantidad":400,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Dora la cebolla picada fina en aceite hasta dorar levemente.","duracion_min":5},{"orden":2,"descripcion":"Agrega papa cortada en cubos pequeños y el agua. Cocina hasta que la papa esté tierna.","duracion_min":15},{"orden":3,"descripcion":"Sirve el caldillo en un bowl y rompe un huevo encima para escalfarlo en el caldo caliente.","duracion_min":3},{"orden":4,"descripcion":"Tapa 2 minutos hasta que la clara esté firme y la yema todavía suave.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','caldillo','tradicional','humilde','huevo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pollo-arroz-jardinera-baby', 'Pollo con arroz a la jardinera', 'Clásico hogareño chileno: pollo guisado con arroz y verduras (arvejas, choclo, zanahoria).', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 35, 3, ARRAY[]::text[], 240, 18, 30, 4, 1.9,
'[{"id":"pollo","nombre":"Trutro de pollo deshuesado","cantidad":150,"unidad":"g","calorias_por_100g":165},{"id":"arroz","nombre":"Arroz blanco","cantidad":80,"unidad":"g","calorias_por_100g":130},{"id":"arvejas","nombre":"Arvejas","cantidad":50,"unidad":"g","calorias_por_100g":81},{"id":"zanahoria","nombre":"Zanahoria","cantidad":50,"unidad":"g","calorias_por_100g":41},{"id":"choclo","nombre":"Choclo desgranado","cantidad":50,"unidad":"g","calorias_por_100g":86},{"id":"cebolla","nombre":"Cebolla","cantidad":40,"unidad":"g","calorias_por_100g":40}]'::jsonb,
'[{"orden":1,"descripcion":"Corta el pollo en cubos y dóralo con la cebolla picada fina.","duracion_min":7},{"orden":2,"descripcion":"Agrega zanahoria, choclo y arvejas. Cocina 4 minutos más.","duracion_min":4},{"orden":3,"descripcion":"Suma el arroz y el doble de agua. Tapa y cocina a fuego bajo 20 minutos.","duracion_min":20},{"orden":4,"descripcion":"Revuelve antes de servir para integrar todo el sabor.","duracion_min":1}]'::jsonb,
ARRAY['chile','latam','arroz-jardinera','casero','pollo','familiar'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('mote-huesillos-baby', 'Mote con huesillos light', 'Versión light del mote con huesillos chileno. Postre tradicional del verano sin azúcar agregada.', ARRAY['snack'], ARRAY['preescolar'], 50, 3, ARRAY['gluten']::text[], 145, 3, 32, 0.5, 1.1,
'[{"id":"mote","nombre":"Mote de trigo cocido","cantidad":80,"unidad":"g","calorias_por_100g":120},{"id":"huesillos","nombre":"Duraznos deshidratados (huesillos)","cantidad":80,"unidad":"g","calorias_por_100g":240},{"id":"canela","nombre":"Canela en rama","cantidad":1,"unidad":"rama","calorias_por_100g":247},{"id":"agua","nombre":"Agua","cantidad":500,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Remoja los huesillos durante 8 horas (o toda la noche) en agua fría.","duracion_min":2},{"orden":2,"descripcion":"Cocina los huesillos en su agua de remojo con canela durante 40 minutos.","duracion_min":40},{"orden":3,"descripcion":"Retira la canela y deja entibiar el jugo (la dulzura viene del durazno).","duracion_min":5},{"orden":4,"descripcion":"Sirve en un vaso con mote cocido en el fondo y los huesillos arriba.","duracion_min":2}]'::jsonb,
ARRAY['chile','latam','mote-huesillos','postre','tradicional','verano'], false, true)
ON CONFLICT (slug) DO NOTHING;
