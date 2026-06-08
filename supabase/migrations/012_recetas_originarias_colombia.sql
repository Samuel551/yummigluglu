-- ============================================================
-- Yummi Glu Glu — 20 recetas originarias de COLOMBIA 🇨🇴
-- Distribución pareja por etapa:
--   INICIO (6-11m):       7 recetas — ingredientes colombianos (plátano verde, ahuyama, papa criolla, arracacha)
--   TRANSICION (12-23m):  7 recetas — clásicos colombianos adaptados (ajiaco, changua, sancocho, sudado)
--   PREESCOLAR (24m+):    6 recetas — platos icónicos baby (bandeja paisa, patacones, pandebono)
--
-- Todas FREE, sin sal ni azúcar agregada (donde aplica).
-- Idempotente: ON CONFLICT (slug) DO NOTHING.
-- Tags: 'colombia' + 'latam' + categorías específicas.
-- ============================================================

-- ─── INICIO (6-11m) ──────────────────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-platano-verde-queso-colombia', 'Puré de plátano verde con queso campesino', 'Puré cremoso de plátano verde colombiano con queso campesino. Sabor caribeño suave y nutritivo.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 18, 2, ARRAY['lactosa']::text[], 145, 5, 26, 3, 0.6,
'[{"id":"platano-verde","nombre":"Plátano verde","cantidad":1,"unidad":"unidad","calorias_por_100g":89},{"id":"queso-campesino","nombre":"Queso campesino fresco","cantidad":30,"unidad":"g","calorias_por_100g":264},{"id":"agua","nombre":"Agua","cantidad":150,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Pela el plátano verde y córtalo en rodajas medianas.","duracion_min":3},{"orden":2,"descripcion":"Cocina las rodajas en agua durante 12 minutos hasta que estén tiernas.","duracion_min":12},{"orden":3,"descripcion":"Procesa con un poco de agua de cocción y agrega el queso desmenuzado al final.","duracion_min":3}]'::jsonb,
ARRAY['colombia','latam','platano-verde','queso','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('compota-guayaba-manzana-colombia', 'Compota de guayaba y manzana', 'Compota tropical con guayaba colombiana madura y manzana. Rica en vitamina C natural.', ARRAY['snack','desayuno'], ARRAY['inicio'], 15, 2, ARRAY[]::text[], 90, 1, 22, 0.4, 0.4,
'[{"id":"guayaba","nombre":"Guayaba madura","cantidad":1,"unidad":"unidad","calorias_por_100g":68},{"id":"manzana","nombre":"Manzana","cantidad":1,"unidad":"unidad","calorias_por_100g":52},{"id":"agua","nombre":"Agua","cantidad":50,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Pela la guayaba y retira las semillas con cuidado.","duracion_min":3},{"orden":2,"descripcion":"Pela y corta la manzana en cubos pequeños.","duracion_min":2},{"orden":3,"descripcion":"Cocina ambas frutas con el agua tapado a fuego bajo durante 8 minutos.","duracion_min":8},{"orden":4,"descripcion":"Procesa hasta obtener una compota lisa y cuela si hay semillas duras.","duracion_min":2}]'::jsonb,
ARRAY['colombia','latam','tropical','guayaba','fruta','sin-azucar'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('papilla-yuca-queso-fresco-colombia', 'Papilla de yuca con queso fresco', 'Papilla cremosa de yuca tierna con queso fresco colombiano. Energía y proteína para el bebé.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 22, 2, ARRAY['lactosa']::text[], 165, 5, 32, 2.5, 0.6,
'[{"id":"yuca","nombre":"Yuca tierna","cantidad":150,"unidad":"g","calorias_por_100g":160},{"id":"queso-fresco","nombre":"Queso fresco","cantidad":25,"unidad":"g","calorias_por_100g":264},{"id":"leche","nombre":"Leche","cantidad":50,"unidad":"ml","calorias_por_100g":61}]'::jsonb,
'[{"orden":1,"descripcion":"Pela la yuca y retira el hilo central. Córtala en cubos.","duracion_min":4},{"orden":2,"descripcion":"Hiérvela en agua durante 18 minutos hasta que esté muy blanda.","duracion_min":18},{"orden":3,"descripcion":"Pisa la yuca con la leche y mezcla con el queso desmenuzado hasta obtener una papilla cremosa.","duracion_min":3}]'::jsonb,
ARRAY['colombia','latam','yuca','queso','tropical','tuberculo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-ahuyama-coco-colombia', 'Puré de ahuyama con coco', 'Puré dulce naturalmente con ahuyama (zapallo colombiano) y leche de coco. Toque caribeño.', ARRAY['almuerzo','snack'], ARRAY['inicio'], 20, 2, ARRAY[]::text[], 115, 1.5, 18, 4.5, 0.7,
'[{"id":"ahuyama","nombre":"Ahuyama (zapallo)","cantidad":180,"unidad":"g","calorias_por_100g":26},{"id":"leche-coco","nombre":"Leche de coco natural","cantidad":80,"unidad":"ml","calorias_por_100g":230},{"id":"agua","nombre":"Agua","cantidad":50,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Pela la ahuyama y córtala en cubos pequeños.","duracion_min":3},{"orden":2,"descripcion":"Cocínala al vapor durante 15 minutos hasta estar muy tierna.","duracion_min":15},{"orden":3,"descripcion":"Procesa la ahuyama con la leche de coco hasta obtener un puré sedoso.","duracion_min":2}]'::jsonb,
ARRAY['colombia','latam','tropical','ahuyama','coco','grasas-buenas'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('compota-mango-banano-colombia', 'Compota de mango maduro y banano', 'Compota tropical con mango colombiano y banano. Dulzura natural pura del Caribe.', ARRAY['snack','desayuno'], ARRAY['inicio'], 8, 2, ARRAY[]::text[], 110, 1, 28, 0.3, 0.3,
'[{"id":"mango","nombre":"Mango maduro","cantidad":0.5,"unidad":"unidad","calorias_por_100g":60},{"id":"banano","nombre":"Banano maduro","cantidad":0.5,"unidad":"unidad","calorias_por_100g":89},{"id":"limon","nombre":"Jugo de limón","cantidad":3,"unidad":"gotas","calorias_por_100g":29}]'::jsonb,
'[{"orden":1,"descripcion":"Pela el mango y extrae la pulpa, evitando el hueso.","duracion_min":3},{"orden":2,"descripcion":"Pela el banano y córtalo en rodajas.","duracion_min":1},{"orden":3,"descripcion":"Pisa ambas frutas con un par de gotas de limón hasta lograr una compota suave.","duracion_min":2}]'::jsonb,
ARRAY['colombia','latam','tropical','mango','banano','sin-coccion'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-papa-criolla-cilantro-colombia', 'Puré de papa criolla con cilantro', 'Puré aromático con papa criolla colombiana, dorada como mantequilla, y un toque suave de cilantro.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 20, 2, ARRAY[]::text[], 100, 2.5, 22, 0.5, 0.7,
'[{"id":"papa-criolla","nombre":"Papa criolla","cantidad":200,"unidad":"g","calorias_por_100g":77},{"id":"cilantro","nombre":"Cilantro fresco","cantidad":3,"unidad":"hojas","calorias_por_100g":23},{"id":"aceite","nombre":"Aceite vegetal","cantidad":3,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Lava las papas criollas. No es necesario pelarlas si están tiernas.","duracion_min":2},{"orden":2,"descripcion":"Cocínalas en agua hirviendo durante 15 minutos hasta que se ablanden.","duracion_min":15},{"orden":3,"descripcion":"Pisa con tenedor o procesa con el cilantro picado fino y el aceite.","duracion_min":3}]'::jsonb,
ARRAY['colombia','latam','papa-criolla','cilantro','tradicional','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('papilla-arracacha-colombia', 'Papilla de arracacha', 'Papilla suave de arracacha, tubérculo colombiano único con sabor a apio y zanahoria, muy nutritivo.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 22, 2, ARRAY[]::text[], 115, 2.5, 25, 0.5, 1,
'[{"id":"arracacha","nombre":"Arracacha","cantidad":180,"unidad":"g","calorias_por_100g":104},{"id":"zanahoria","nombre":"Zanahoria","cantidad":40,"unidad":"g","calorias_por_100g":41},{"id":"agua","nombre":"Agua","cantidad":150,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Pela la arracacha y córtala en cubos pequeños junto con la zanahoria.","duracion_min":4},{"orden":2,"descripcion":"Cocina ambas en agua durante 16 minutos hasta estar muy tiernas.","duracion_min":16},{"orden":3,"descripcion":"Procesa con un poco de agua de cocción hasta obtener una papilla suave y cremosa.","duracion_min":2}]'::jsonb,
ARRAY['colombia','latam','arracacha','tuberculo','tradicional','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── TRANSICION (12-23m) ─────────────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('ajiaco-bogotano-baby', 'Ajiaco bogotano baby', 'Versión baby del ajiaco bogotano: sopa con tres papas, pollo desmenuzado, mazorca y guascas suaves.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 50, 3, ARRAY[]::text[], 220, 18, 28, 4, 1.5,
'[{"id":"papa-sabanera","nombre":"Papa sabanera (o blanca)","cantidad":100,"unidad":"g","calorias_por_100g":77},{"id":"papa-pastusa","nombre":"Papa pastusa (o amarilla)","cantidad":80,"unidad":"g","calorias_por_100g":77},{"id":"papa-criolla","nombre":"Papa criolla","cantidad":80,"unidad":"g","calorias_por_100g":77},{"id":"pollo","nombre":"Pechuga de pollo","cantidad":120,"unidad":"g","calorias_por_100g":165},{"id":"mazorca","nombre":"Mazorca tierna","cantidad":1,"unidad":"trozo","calorias_por_100g":86},{"id":"guascas","nombre":"Guascas (hierba colombiana) o cilantro","cantidad":3,"unidad":"hojas","calorias_por_100g":23},{"id":"agua","nombre":"Agua","cantidad":600,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Hierve el pollo entero en agua con las guascas durante 25 minutos.","duracion_min":25},{"orden":2,"descripcion":"Retira el pollo y agrega las tres papas peladas y cortadas en cubos.","duracion_min":3},{"orden":3,"descripcion":"Cocina 15 minutos hasta que las papas se deshagan parcialmente, agregando la mazorca.","duracion_min":15},{"orden":4,"descripcion":"Desmenuza el pollo en hebras finas y devuélvelo al caldo antes de servir.","duracion_min":3}]'::jsonb,
ARRAY['colombia','latam','ajiaco','bogotano','iconico','tradicional','pollo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('changua-suave-colombia', 'Changua suave', 'Versión baby de la changua boyacense: sopa de leche tibia con cebolla larga, huevo escalfado y pan suave.', ARRAY['desayuno'], ARRAY['transicion'], 18, 2, ARRAY['lactosa','huevo','gluten']::text[], 220, 14, 22, 9, 1.8,
'[{"id":"leche","nombre":"Leche entera","cantidad":300,"unidad":"ml","calorias_por_100g":61},{"id":"agua","nombre":"Agua","cantidad":150,"unidad":"ml","calorias_por_100g":0},{"id":"cebolla-larga","nombre":"Cebolla larga (cebollín)","cantidad":15,"unidad":"g","calorias_por_100g":32},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"pan","nombre":"Pan del día anterior","cantidad":30,"unidad":"g","calorias_por_100g":265},{"id":"cilantro","nombre":"Cilantro picado","cantidad":2,"unidad":"hojas","calorias_por_100g":23}]'::jsonb,
'[{"orden":1,"descripcion":"Calienta la leche con el agua y la cebolla larga picada fina hasta que apenas hierva.","duracion_min":8},{"orden":2,"descripcion":"Rompe el huevo directamente sobre el líquido caliente para que se escalfe suavemente.","duracion_min":3},{"orden":3,"descripcion":"Coloca el pan en trozos pequeños dentro del bowl de servir.","duracion_min":2},{"orden":4,"descripcion":"Vierte la sopa con el huevo encima del pan y decora con cilantro fresco.","duracion_min":2}]'::jsonb,
ARRAY['colombia','latam','changua','desayuno','boyacense','tradicional'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('arepa-choclo-baby-colombia', 'Arepa de choclo baby', 'Arepa dulce de mazorca tierna colombiana con queso fresco. Suave, sin sal añadida.', ARRAY['desayuno','snack'], ARRAY['transicion'], 22, 3, ARRAY['lactosa','huevo']::text[], 190, 7, 28, 6, 1,
'[{"id":"mazorca","nombre":"Mazorca tierna desgranada","cantidad":250,"unidad":"g","calorias_por_100g":86},{"id":"queso-fresco","nombre":"Queso fresco","cantidad":50,"unidad":"g","calorias_por_100g":264},{"id":"leche","nombre":"Leche","cantidad":40,"unidad":"ml","calorias_por_100g":61},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"mantequilla","nombre":"Mantequilla","cantidad":10,"unidad":"g","calorias_por_100g":717}]'::jsonb,
'[{"orden":1,"descripcion":"Procesa la mazorca con la leche y el huevo hasta obtener una mezcla espesa.","duracion_min":3},{"orden":2,"descripcion":"Agrega el queso fresco desmenuzado y mezcla bien.","duracion_min":2},{"orden":3,"descripcion":"Calienta una sartén con un poco de mantequilla y vierte porciones pequeñas.","duracion_min":3},{"orden":4,"descripcion":"Cocina 4 minutos por cada lado hasta dorar levemente.","duracion_min":8}]'::jsonb,
ARRAY['colombia','latam','arepa','choclo','iconico','tradicional'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('sancocho-pollo-suave-colombia', 'Sancocho de pollo suave', 'Versión baby del sancocho colombiano: caldo con pollo, plátano, yuca, mazorca y papa criolla.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 55, 4, ARRAY[]::text[], 235, 16, 32, 5, 1.7,
'[{"id":"pollo","nombre":"Pollo en piezas","cantidad":150,"unidad":"g","calorias_por_100g":165},{"id":"platano-verde","nombre":"Plátano verde","cantidad":0.5,"unidad":"unidad","calorias_por_100g":89},{"id":"yuca","nombre":"Yuca","cantidad":80,"unidad":"g","calorias_por_100g":160},{"id":"papa-criolla","nombre":"Papa criolla","cantidad":80,"unidad":"g","calorias_por_100g":77},{"id":"mazorca","nombre":"Mazorca tierna","cantidad":1,"unidad":"rodaja","calorias_por_100g":86},{"id":"cilantro","nombre":"Cilantro","cantidad":3,"unidad":"hojas","calorias_por_100g":23},{"id":"agua","nombre":"Agua","cantidad":700,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el pollo en agua con cilantro durante 25 minutos.","duracion_min":25},{"orden":2,"descripcion":"Agrega el plátano verde en trozos y la mazorca en rodajas, cocina 10 minutos.","duracion_min":10},{"orden":3,"descripcion":"Suma la yuca y la papa criolla peladas, cocina 15 minutos más hasta estar tiernas.","duracion_min":15},{"orden":4,"descripcion":"Desmenuza el pollo y deja todo en el caldo. Sirve los trozos blandos.","duracion_min":5}]'::jsonb,
ARRAY['colombia','latam','sancocho','iconico','tradicional','caribe','pollo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('calentado-caleno-baby', 'Calentado caleño baby', 'Versión baby del calentado caleño: arroz, frijoles rojos y carne suave del día anterior, revueltos cariñosamente.', ARRAY['desayuno','almuerzo'], ARRAY['transicion'], 18, 2, ARRAY[]::text[], 225, 14, 34, 3.5, 2.5,
'[{"id":"arroz","nombre":"Arroz blanco cocido","cantidad":80,"unidad":"g","calorias_por_100g":130},{"id":"frijoles","nombre":"Frijoles rojos cocidos","cantidad":80,"unidad":"g","calorias_por_100g":127},{"id":"carne","nombre":"Carne molida cocida","cantidad":60,"unidad":"g","calorias_por_100g":250},{"id":"cebolla","nombre":"Cebolla","cantidad":30,"unidad":"g","calorias_por_100g":40},{"id":"tomate","nombre":"Tomate","cantidad":40,"unidad":"g","calorias_por_100g":18},{"id":"aceite","nombre":"Aceite","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Dora cebolla y tomate picados muy fino con un poco de aceite.","duracion_min":4},{"orden":2,"descripcion":"Agrega la carne cocida del día anterior y mezcla suavemente.","duracion_min":3},{"orden":3,"descripcion":"Suma el arroz y los frijoles con un poco de su caldo.","duracion_min":3},{"orden":4,"descripcion":"Mezcla todo y calienta 5 minutos manteniendo textura húmeda.","duracion_min":5}]'::jsonb,
ARRAY['colombia','latam','calentado','caleno','tradicional','desayuno'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('atollado-pollo-colombia', 'Atollado de pollo colombiano', 'Arroz cremoso colombiano con pollo desmenuzado, papa, mazorca y un toque de cilantro. Estilo Valle del Cauca.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 40, 3, ARRAY[]::text[], 245, 17, 32, 5, 1.6,
'[{"id":"arroz","nombre":"Arroz blanco","cantidad":80,"unidad":"g","calorias_por_100g":130},{"id":"pollo","nombre":"Pechuga de pollo","cantidad":120,"unidad":"g","calorias_por_100g":165},{"id":"papa","nombre":"Papa","cantidad":80,"unidad":"g","calorias_por_100g":77},{"id":"mazorca","nombre":"Mazorca desgranada","cantidad":60,"unidad":"g","calorias_por_100g":86},{"id":"cebolla","nombre":"Cebolla larga","cantidad":30,"unidad":"g","calorias_por_100g":32},{"id":"cilantro","nombre":"Cilantro picado","cantidad":3,"unidad":"hojas","calorias_por_100g":23},{"id":"agua","nombre":"Agua","cantidad":400,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el pollo en cubos pequeños con la cebolla larga picada hasta que esté tierno.","duracion_min":12},{"orden":2,"descripcion":"Agrega el arroz, la papa cortada en cubos y la mazorca desgranada.","duracion_min":3},{"orden":3,"descripcion":"Vierte el agua y cocina tapado a fuego bajo durante 22 minutos.","duracion_min":22},{"orden":4,"descripcion":"Desmenuza el pollo y mezcla con el cilantro al final.","duracion_min":3}]'::jsonb,
ARRAY['colombia','latam','atollado','valle','tradicional','arroz','pollo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('sudado-pollo-yuca-colombia', 'Sudado de pollo con yuca', 'Estofado colombiano clásico de pollo a fuego bajo con yuca, tomate y cebolla. Cocción lenta para máximo sabor.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 40, 3, ARRAY[]::text[], 250, 18, 26, 7, 1.5,
'[{"id":"pollo","nombre":"Muslos de pollo deshuesados","cantidad":150,"unidad":"g","calorias_por_100g":165},{"id":"yuca","nombre":"Yuca","cantidad":120,"unidad":"g","calorias_por_100g":160},{"id":"tomate","nombre":"Tomate","cantidad":80,"unidad":"g","calorias_por_100g":18},{"id":"cebolla","nombre":"Cebolla","cantidad":50,"unidad":"g","calorias_por_100g":40},{"id":"papa","nombre":"Papa","cantidad":60,"unidad":"g","calorias_por_100g":77},{"id":"cilantro","nombre":"Cilantro","cantidad":3,"unidad":"hojas","calorias_por_100g":23},{"id":"aceite","nombre":"Aceite","cantidad":8,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Dora levemente el pollo en cubos con un poco de aceite.","duracion_min":5},{"orden":2,"descripcion":"Agrega cebolla y tomate picados, cocina 5 minutos hasta soltar líquido.","duracion_min":5},{"orden":3,"descripcion":"Suma yuca y papa peladas en cubos, agrega un poco de agua y tapa.","duracion_min":3},{"orden":4,"descripcion":"Cocina a fuego bajo durante 25 minutos sin destapar. Termina con cilantro fresco.","duracion_min":25}]'::jsonb,
ARRAY['colombia','latam','sudado','tradicional','pollo','yuca'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── PREESCOLAR (24m+) ───────────────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('bandeja-paisa-baby-colombia', 'Bandeja paisa baby', 'Versión simplificada de la bandeja paisa: frijoles rojos, arroz, plátano maduro horneado, huevo y carne molida suave.', ARRAY['almuerzo'], ARRAY['preescolar'], 45, 3, ARRAY['huevo']::text[], 380, 22, 50, 9, 3.5,
'[{"id":"frijoles","nombre":"Frijoles rojos cocidos","cantidad":120,"unidad":"g","calorias_por_100g":127},{"id":"arroz","nombre":"Arroz blanco cocido","cantidad":100,"unidad":"g","calorias_por_100g":130},{"id":"platano-maduro","nombre":"Plátano maduro","cantidad":0.5,"unidad":"unidad","calorias_por_100g":89},{"id":"carne","nombre":"Carne molida magra","cantidad":80,"unidad":"g","calorias_por_100g":250},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"cebolla","nombre":"Cebolla","cantidad":30,"unidad":"g","calorias_por_100g":40}]'::jsonb,
'[{"orden":1,"descripcion":"Calienta los frijoles cocidos con un poco de su caldo hasta espesar.","duracion_min":8},{"orden":2,"descripcion":"Cocina la carne molida con cebolla picada hasta dorar.","duracion_min":7},{"orden":3,"descripcion":"Hornea las rodajas de plátano maduro a 200°C durante 12 minutos hasta caramelizar.","duracion_min":12},{"orden":4,"descripcion":"Cocina el huevo poché o frito con poco aceite. Sirve todos los elementos juntos en el plato.","duracion_min":5}]'::jsonb,
ARRAY['colombia','latam','bandeja-paisa','iconico','tradicional','paisa','plato-completo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('patacones-horno-hogao-colombia', 'Patacones al horno con hogao', 'Versión saludable de los patacones colombianos: rodajas de plátano verde aplastadas y horneadas con hogao casero suave.', ARRAY['snack','almuerzo'], ARRAY['preescolar'], 30, 3, ARRAY[]::text[], 195, 3, 38, 4, 0.8,
'[{"id":"platano-verde","nombre":"Plátano verde","cantidad":1,"unidad":"unidad","calorias_por_100g":89},{"id":"tomate","nombre":"Tomate","cantidad":120,"unidad":"g","calorias_por_100g":18},{"id":"cebolla","nombre":"Cebolla larga","cantidad":40,"unidad":"g","calorias_por_100g":32},{"id":"aceite","nombre":"Aceite","cantidad":10,"unidad":"ml","calorias_por_100g":884},{"id":"cilantro","nombre":"Cilantro picado","cantidad":3,"unidad":"hojas","calorias_por_100g":23}]'::jsonb,
'[{"orden":1,"descripcion":"Pela el plátano verde y córtalo en rodajas gruesas. Hornea 10 minutos a 200°C.","duracion_min":12},{"orden":2,"descripcion":"Aplasta cada rodaja con un vaso o tabla y vuelve al horno otros 8 minutos.","duracion_min":10},{"orden":3,"descripcion":"Aparte, prepara hogao: dora cebolla larga y tomate picados hasta espesar.","duracion_min":10},{"orden":4,"descripcion":"Sirve los patacones crocantes acompañados del hogao tibio con cilantro.","duracion_min":2}]'::jsonb,
ARRAY['colombia','latam','patacones','iconico','tradicional','hogao','horneado'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pandebono-baby-colombia', 'Pandebono baby', 'Versión baby del pandebono caleño: panecillos suaves de queso, yuca y huevo. Sin sal añadida.', ARRAY['desayuno','snack'], ARRAY['preescolar'], 30, 4, ARRAY['lactosa','huevo']::text[], 175, 9, 18, 8, 0.8,
'[{"id":"queso","nombre":"Queso costeño rallado (o feta suave)","cantidad":120,"unidad":"g","calorias_por_100g":264},{"id":"almidon-yuca","nombre":"Almidón de yuca","cantidad":80,"unidad":"g","calorias_por_100g":340},{"id":"harina-maiz","nombre":"Harina de maíz precocida","cantidad":30,"unidad":"g","calorias_por_100g":366},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"leche","nombre":"Leche","cantidad":30,"unidad":"ml","calorias_por_100g":61}]'::jsonb,
'[{"orden":1,"descripcion":"Mezcla el queso, el almidón de yuca y la harina de maíz en un bowl.","duracion_min":3},{"orden":2,"descripcion":"Agrega el huevo y la leche, amasa hasta formar una masa suave y homogénea.","duracion_min":4},{"orden":3,"descripcion":"Forma bolitas pequeñas con las manos.","duracion_min":3},{"orden":4,"descripcion":"Hornea a 200°C durante 15-18 minutos hasta dorar levemente.","duracion_min":18}]'::jsonb,
ARRAY['colombia','latam','pandebono','iconico','tradicional','caleno','horneado'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('mazamorra-maiz-blanco-colombia', 'Mazamorra colombiana de maíz blanco', 'Versión colombiana de la mazamorra: maíz blanco hervido con leche y panela rallada. Postre tradicional paisa.', ARRAY['snack','cena'], ARRAY['preescolar'], 60, 4, ARRAY['lactosa']::text[], 175, 5, 32, 3.5, 1.2,
'[{"id":"maiz-blanco","nombre":"Maíz blanco trillado","cantidad":80,"unidad":"g","calorias_por_100g":361},{"id":"leche","nombre":"Leche","cantidad":300,"unidad":"ml","calorias_por_100g":61},{"id":"panela","nombre":"Panela rallada","cantidad":15,"unidad":"g","calorias_por_100g":380},{"id":"canela","nombre":"Canela en rama","cantidad":1,"unidad":"rama","calorias_por_100g":247}]'::jsonb,
'[{"orden":1,"descripcion":"Remoja el maíz blanco trillado durante 4 horas en agua fría.","duracion_min":2},{"orden":2,"descripcion":"Cocina el maíz en abundante agua con la rama de canela hasta que reviente, unos 40 minutos.","duracion_min":40},{"orden":3,"descripcion":"Agrega la leche y la panela rallada, cocina 12 minutos más a fuego bajo revolviendo.","duracion_min":12},{"orden":4,"descripcion":"Retira la canela y sirve tibio en bowl pequeño.","duracion_min":3}]'::jsonb,
ARRAY['colombia','latam','mazamorra','paisa','tradicional','postre','maiz-blanco'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('tamales-tolimenses-baby-colombia', 'Tamales tolimenses baby light', 'Versión baby del tamal tolimense: masa de maíz con pollo, arvejas y zanahoria envuelta en hoja de plátano.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 90, 3, ARRAY[]::text[], 295, 17, 38, 8, 2,
'[{"id":"masa-maiz","nombre":"Masa de maíz amarillo","cantidad":150,"unidad":"g","calorias_por_100g":361},{"id":"pollo","nombre":"Pollo desmenuzado","cantidad":80,"unidad":"g","calorias_por_100g":165},{"id":"arvejas","nombre":"Arvejas","cantidad":40,"unidad":"g","calorias_por_100g":81},{"id":"zanahoria","nombre":"Zanahoria rallada","cantidad":40,"unidad":"g","calorias_por_100g":41},{"id":"papa","nombre":"Papa en rodajas","cantidad":50,"unidad":"g","calorias_por_100g":77},{"id":"hoja-platano","nombre":"Hoja de plátano","cantidad":3,"unidad":"unidades","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Mezcla la masa de maíz con agua tibia y un poco de aceite hasta formar una pasta suave.","duracion_min":8},{"orden":2,"descripcion":"Lava y entibia las hojas de plátano sobre la llama para que sean flexibles.","duracion_min":5},{"orden":3,"descripcion":"Arma cada tamal: hoja, capa de masa, pollo, arvejas, zanahoria, rodaja de papa, otra capa de masa.","duracion_min":12},{"orden":4,"descripcion":"Cocina los tamales en olla con agua durante 60 minutos a fuego bajo.","duracion_min":60}]'::jsonb,
ARRAY['colombia','latam','tamal','tolimense','tradicional','iconico','pollo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('aborrajados-platano-queso-colombia', 'Aborrajados de plátano y queso al horno', 'Versión saludable de los aborrajados vallecaucanos: plátano maduro relleno con queso y horneado en lugar de frito.', ARRAY['snack'], ARRAY['preescolar'], 30, 3, ARRAY['lactosa','huevo','gluten']::text[], 220, 8, 36, 6, 0.7,
'[{"id":"platano-maduro","nombre":"Plátano maduro","cantidad":1,"unidad":"unidad","calorias_por_100g":89},{"id":"queso-fresco","nombre":"Queso fresco","cantidad":50,"unidad":"g","calorias_por_100g":264},{"id":"harina","nombre":"Harina","cantidad":30,"unidad":"g","calorias_por_100g":364},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"leche","nombre":"Leche","cantidad":20,"unidad":"ml","calorias_por_100g":61}]'::jsonb,
'[{"orden":1,"descripcion":"Pela el plátano maduro y córtalo en rodajas gruesas a lo largo.","duracion_min":3},{"orden":2,"descripcion":"Coloca un trozo de queso fresco entre dos rodajas de plátano formando un sándwich.","duracion_min":4},{"orden":3,"descripcion":"Prepara una mezcla suave de harina, huevo y leche para envolver los aborrajados.","duracion_min":3},{"orden":4,"descripcion":"Pasa cada sándwich por la mezcla y hornea a 200°C durante 15 minutos hasta dorar.","duracion_min":15}]'::jsonb,
ARRAY['colombia','latam','aborrajados','valle','tradicional','postre','horneado'], false, true)
ON CONFLICT (slug) DO NOTHING;
