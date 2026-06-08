-- ============================================================
-- Yummi Glu Glu — 15 recetas originarias de ARGENTINA 🇦🇷 (recetas 168-182)
-- Complementa las 5 ya cargadas (78-82: locro, milanesa horno, budín pan, mazamorra, polenta).
-- Total final Argentina: 20 (7 inicio + 7 transición + 6 preescolar)
--
-- Distribución nuevas:
--   INICIO (6-11m):       7 recetas — calabaza anco, batata, ricota, mate de leche, etc.
--   TRANSICION (12-23m):  4 recetas — clásicos italo-argentinos (ñoquis, pascualina, fideos, lentejas)
--   PREESCOLAR (24m+):    4 recetas — empanada tucumana, pastelitos batata, arroz con leche, dulce de membrillo
--
-- Todas FREE, sin sal ni azúcar agregada.
-- Idempotente: ON CONFLICT (slug) DO NOTHING.
-- Tags: 'argentina' + 'latam' + categorías específicas.
-- ============================================================

-- ─── INICIO (6-11m) — 7 nuevas ───────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-calabaza-anco-perejil-argentina', 'Puré de calabaza anco con perejil', 'Puré sedoso de calabaza anco argentina (variedad cuello largo) con un toque de perejil fresco. Sabor casero del campo.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 20, 2, ARRAY[]::text[], 90, 2, 19, 0.5, 0.6,
'[{"id":"calabaza-anco","nombre":"Calabaza anco","cantidad":180,"unidad":"g","calorias_por_100g":26},{"id":"perejil","nombre":"Perejil fresco","cantidad":3,"unidad":"hojas","calorias_por_100g":36},{"id":"aceite","nombre":"Aceite de oliva","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Pela la calabaza anco y córtala en cubos pequeños.","duracion_min":4},{"orden":2,"descripcion":"Cocínala al vapor durante 15 minutos hasta que esté bien tierna.","duracion_min":15},{"orden":3,"descripcion":"Procesa con un poco de agua de cocción y el aceite de oliva, agrega el perejil picado fino al final.","duracion_min":2}]'::jsonb,
ARRAY['argentina','latam','calabaza-anco','perejil','vegetariano','primera-papilla'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('compota-durazno-mendocino-manzana', 'Compota de durazno mendocino y manzana', 'Compota dulce naturalmente con durazno mendocino, fruta emblemática argentina, y manzana. Sin azúcar agregada.', ARRAY['snack','desayuno'], ARRAY['inicio'], 15, 2, ARRAY[]::text[], 85, 0.8, 21, 0.3, 0.3,
'[{"id":"durazno","nombre":"Durazno maduro","cantidad":1,"unidad":"unidad","calorias_por_100g":39},{"id":"manzana","nombre":"Manzana","cantidad":1,"unidad":"unidad","calorias_por_100g":52},{"id":"agua","nombre":"Agua","cantidad":50,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Pela el durazno, retira el carozo y córtalo en cubos pequeños.","duracion_min":3},{"orden":2,"descripcion":"Pela y corta la manzana en cubos similares.","duracion_min":2},{"orden":3,"descripcion":"Cocina ambas frutas tapado con el agua durante 8 minutos.","duracion_min":8},{"orden":4,"descripcion":"Pisa o procesa hasta obtener una compota suave.","duracion_min":2}]'::jsonb,
ARRAY['argentina','latam','durazno','mendoza','fruta','sin-azucar'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-batata-leche-canela-argentina', 'Puré de batata con leche y canela', 'Puré dulce naturalmente con batata argentina, leche tibia y un toque de canela. Reconfortante y sabroso.', ARRAY['almuerzo','snack'], ARRAY['inicio'], 18, 2, ARRAY['lactosa']::text[], 130, 3, 26, 1.5, 0.8,
'[{"id":"batata","nombre":"Batata","cantidad":150,"unidad":"g","calorias_por_100g":86},{"id":"leche","nombre":"Leche entera","cantidad":80,"unidad":"ml","calorias_por_100g":61},{"id":"canela","nombre":"Canela en polvo","cantidad":1,"unidad":"pizca","calorias_por_100g":247}]'::jsonb,
'[{"orden":1,"descripcion":"Pela la batata y córtala en cubos pequeños.","duracion_min":3},{"orden":2,"descripcion":"Cocínala al vapor durante 13 minutos hasta estar bien tierna.","duracion_min":13},{"orden":3,"descripcion":"Procesa con la leche tibia y una pizca de canela hasta obtener un puré sedoso.","duracion_min":2}]'::jsonb,
ARRAY['argentina','latam','batata','dulce-natural','vegetariano','primera-papilla'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-espinaca-ricota-argentina', 'Puré de espinaca con ricota', 'Puré verde y cremoso con espinaca blanqueada y ricota fresca. Sabor italo-argentino suave y nutritivo.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 12, 2, ARRAY['lactosa']::text[], 110, 8, 6, 6, 2.4,
'[{"id":"espinaca","nombre":"Espinacas frescas","cantidad":100,"unidad":"g","calorias_por_100g":23},{"id":"ricota","nombre":"Ricota fresca","cantidad":60,"unidad":"g","calorias_por_100g":174},{"id":"aceite","nombre":"Aceite de oliva","cantidad":3,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Lava bien las espinacas y blanquéalas en agua hirviendo durante 1 minuto.","duracion_min":4},{"orden":2,"descripcion":"Escúrrelas y exprime el agua sobrante.","duracion_min":2},{"orden":3,"descripcion":"Procesa las espinacas con la ricota y el aceite de oliva hasta obtener un puré verde sedoso.","duracion_min":3}]'::jsonb,
ARRAY['argentina','latam','espinaca','ricota','italo-argentino','hierro'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('compota-manzana-asada-canela-argentina', 'Compota de manzana asada con canela', 'Manzana asada al horno con canela, técnica argentina clásica para potenciar la dulzura natural sin azúcar.', ARRAY['snack','desayuno'], ARRAY['inicio'], 35, 2, ARRAY[]::text[], 85, 0.5, 22, 0.3, 0.2,
'[{"id":"manzana","nombre":"Manzana roja","cantidad":2,"unidad":"unidades","calorias_por_100g":52},{"id":"canela","nombre":"Canela en polvo","cantidad":1,"unidad":"pizca","calorias_por_100g":247},{"id":"agua","nombre":"Agua","cantidad":30,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Lava las manzanas, descorazónalas y colócalas en una asadera con un poco de agua en el fondo.","duracion_min":3},{"orden":2,"descripcion":"Espolvorea canela sobre cada manzana.","duracion_min":1},{"orden":3,"descripcion":"Hornea a 180°C durante 28 minutos hasta que estén muy blandas y aromáticas.","duracion_min":28},{"orden":4,"descripcion":"Extrae la pulpa y pisa hasta lograr una compota suave.","duracion_min":2}]'::jsonb,
ARRAY['argentina','latam','manzana','postre','sin-azucar','horneado'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('mate-leche-harina-tostada-baby-argentina', 'Mate de leche tibia con harina tostada baby', 'Preparación tradicional del norte argentino: leche tibia con harina de maíz tostada. Sin yerba mate, apta para bebés.', ARRAY['desayuno','snack'], ARRAY['inicio'], 12, 2, ARRAY['lactosa']::text[], 135, 5, 22, 3, 1,
'[{"id":"leche","nombre":"Leche entera","cantidad":200,"unidad":"ml","calorias_por_100g":61},{"id":"harina-maiz-tostada","nombre":"Harina de maíz tostada","cantidad":30,"unidad":"g","calorias_por_100g":361},{"id":"canela","nombre":"Canela en rama","cantidad":1,"unidad":"trozo","calorias_por_100g":247}]'::jsonb,
'[{"orden":1,"descripcion":"Calienta la leche con la rama de canela hasta que esté tibia pero sin hervir.","duracion_min":5},{"orden":2,"descripcion":"Retira la canela y agrega la harina de maíz tostada poco a poco mientras revuelves.","duracion_min":3},{"orden":3,"descripcion":"Cocina 4 minutos más a fuego bajo hasta que la harina se integre completamente.","duracion_min":4}]'::jsonb,
ARRAY['argentina','latam','noa','mate-leche','harina-tostada','tradicional','desayuno'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-banana-yogur-natural-argentina', 'Puré de banana con yogur natural', 'Merienda argentina típica: banana pisada con yogur natural sin azúcar. Probióticos para la flora intestinal del bebé.', ARRAY['snack','desayuno'], ARRAY['inicio'], 5, 1, ARRAY['lactosa']::text[], 145, 5, 28, 2, 0.4,
'[{"id":"banana","nombre":"Banana madura","cantidad":1,"unidad":"unidad","calorias_por_100g":89},{"id":"yogur","nombre":"Yogur natural sin azúcar","cantidad":100,"unidad":"g","calorias_por_100g":59}]'::jsonb,
'[{"orden":1,"descripcion":"Pela la banana y aplástala con un tenedor.","duracion_min":2},{"orden":2,"descripcion":"Mezcla la banana pisada con el yogur natural hasta integrar.","duracion_min":2},{"orden":3,"descripcion":"Sirve de inmediato para mejor textura y frescura.","duracion_min":1}]'::jsonb,
ARRAY['argentina','latam','banana','yogur','probioticos','sin-coccion','merienda'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── TRANSICION (12-23m) — 4 nuevas ──────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('noquis-papa-caseros-baby-argentina', 'Ñoquis de papa caseros baby', 'Ñoquis caseros argentinos del 29 hechos con papa y harina, en versión bebé con salsa suave de tomate.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 40, 3, ARRAY['gluten','huevo']::text[], 245, 8, 42, 5, 1.4,
'[{"id":"papa","nombre":"Papa","cantidad":250,"unidad":"g","calorias_por_100g":77},{"id":"harina","nombre":"Harina","cantidad":80,"unidad":"g","calorias_por_100g":364},{"id":"huevo","nombre":"Yema de huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"tomate","nombre":"Tomate","cantidad":100,"unidad":"g","calorias_por_100g":18},{"id":"aceite","nombre":"Aceite de oliva","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Hierve las papas con cáscara durante 20 minutos. Pélalas y písalas en caliente.","duracion_min":22},{"orden":2,"descripcion":"Mezcla el puré frío con la harina y la yema hasta formar una masa lisa.","duracion_min":5},{"orden":3,"descripcion":"Estira bastones del grosor de un dedo y corta en cubos pequeños. Marca con tenedor.","duracion_min":8},{"orden":4,"descripcion":"Hierve los ñoquis 3 minutos hasta que floten. Sirve con salsa suave de tomate procesado.","duracion_min":8}]'::jsonb,
ARRAY['argentina','latam','noquis','italo-argentino','tradicional','29','pasta'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('tarta-pascualina-baby-argentina', 'Tarta pascualina baby', 'Tarta argentina de Pascua con relleno de espinaca, acelga, ricota y huevo. Versión baby al horno.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 50, 4, ARRAY['gluten','huevo','lactosa']::text[], 295, 14, 28, 14, 2.8,
'[{"id":"acelga","nombre":"Acelga","cantidad":150,"unidad":"g","calorias_por_100g":19},{"id":"espinaca","nombre":"Espinaca","cantidad":100,"unidad":"g","calorias_por_100g":23},{"id":"ricota","nombre":"Ricota","cantidad":120,"unidad":"g","calorias_por_100g":174},{"id":"huevo","nombre":"Huevos","cantidad":2,"unidad":"unidades","calorias_por_100g":155},{"id":"masa","nombre":"Masa de tarta hojaldrada","cantidad":2,"unidad":"discos","calorias_por_100g":380},{"id":"cebolla","nombre":"Cebolla","cantidad":40,"unidad":"g","calorias_por_100g":40}]'::jsonb,
'[{"orden":1,"descripcion":"Blanquea acelga y espinaca, escúrrelas bien y pícalas finas.","duracion_min":8},{"orden":2,"descripcion":"Saltea la cebolla picada y agrega las hojas verdes para integrar sabores.","duracion_min":5},{"orden":3,"descripcion":"Mezcla con la ricota y un huevo batido. Vierte el relleno sobre un disco de masa en molde.","duracion_min":5},{"orden":4,"descripcion":"Hace pocitos para el otro huevo entero, cubre con el otro disco y hornea 32 minutos a 180°C.","duracion_min":32}]'::jsonb,
ARRAY['argentina','latam','pascualina','iconico','tradicional','horneado','pascua'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('guiso-lentejas-argentino-baby', 'Guiso de lentejas argentino baby', 'Guiso clásico argentino de invierno con lentejas, zapallo, papa y zanahoria. Sin panceta, baby-friendly.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 45, 3, ARRAY[]::text[], 235, 14, 38, 3.5, 4.2,
'[{"id":"lentejas","nombre":"Lentejas secas","cantidad":100,"unidad":"g","calorias_por_100g":353},{"id":"zapallo","nombre":"Zapallo","cantidad":100,"unidad":"g","calorias_por_100g":26},{"id":"papa","nombre":"Papa","cantidad":80,"unidad":"g","calorias_por_100g":77},{"id":"zanahoria","nombre":"Zanahoria","cantidad":60,"unidad":"g","calorias_por_100g":41},{"id":"cebolla","nombre":"Cebolla","cantidad":40,"unidad":"g","calorias_por_100g":40},{"id":"tomate","nombre":"Tomate triturado","cantidad":80,"unidad":"g","calorias_por_100g":18},{"id":"aceite","nombre":"Aceite","cantidad":8,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Dora la cebolla y la zanahoria picadas finas en una olla con aceite.","duracion_min":6},{"orden":2,"descripcion":"Agrega el tomate triturado y cocina 4 minutos hasta espesar.","duracion_min":4},{"orden":3,"descripcion":"Suma las lentejas lavadas, el zapallo y la papa en cubos. Cubre con agua.","duracion_min":3},{"orden":4,"descripcion":"Cocina tapado a fuego bajo durante 32 minutos hasta que las lentejas estén tiernas.","duracion_min":32}]'::jsonb,
ARRAY['argentina','latam','guiso','lentejas','invierno','tradicional','sin-panceta'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('fideos-tuco-baby-argentina', 'Fideos con tuco baby', 'Pasta argentina con tuco casero: salsa de tomate, carne picada suave, zanahoria y un toque de orégano.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 35, 3, ARRAY['gluten']::text[], 270, 14, 36, 7, 2,
'[{"id":"fideos","nombre":"Fideos cortos","cantidad":100,"unidad":"g","calorias_por_100g":371},{"id":"carne-picada","nombre":"Carne picada magra","cantidad":80,"unidad":"g","calorias_por_100g":250},{"id":"tomate","nombre":"Tomate triturado","cantidad":150,"unidad":"g","calorias_por_100g":18},{"id":"cebolla","nombre":"Cebolla","cantidad":40,"unidad":"g","calorias_por_100g":40},{"id":"zanahoria","nombre":"Zanahoria rallada","cantidad":40,"unidad":"g","calorias_por_100g":41},{"id":"oregano","nombre":"Orégano","cantidad":1,"unidad":"pizca","calorias_por_100g":265},{"id":"aceite","nombre":"Aceite","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Dora la cebolla con la zanahoria rallada hasta transparentar.","duracion_min":5},{"orden":2,"descripcion":"Agrega la carne picada y cocina hasta que pierda el color rosado.","duracion_min":6},{"orden":3,"descripcion":"Vierte el tomate triturado, agrega orégano y cocina 12 minutos a fuego bajo.","duracion_min":12},{"orden":4,"descripcion":"Aparte, hierve los fideos hasta que estén bien blandos. Mezcla con el tuco.","duracion_min":10}]'::jsonb,
ARRAY['argentina','latam','fideos','tuco','italo-argentino','tradicional','carne'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── PREESCOLAR (24m+) — 4 nuevas ────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('empanada-tucumana-baby-argentina', 'Empanada tucumana baby al horno', 'Empanada estilo tucumana baby: relleno de carne cortada a cuchillo, papa picada chica y huevo duro, al horno.', ARRAY['almuerzo','snack'], ARRAY['preescolar'], 55, 4, ARRAY['gluten','huevo']::text[], 265, 13, 30, 9, 1.8,
'[{"id":"harina","nombre":"Harina","cantidad":200,"unidad":"g","calorias_por_100g":364},{"id":"carne","nombre":"Carne cortada a cuchillo (peceto)","cantidad":150,"unidad":"g","calorias_por_100g":250},{"id":"papa","nombre":"Papa hervida","cantidad":100,"unidad":"g","calorias_por_100g":77},{"id":"cebolla","nombre":"Cebolla","cantidad":80,"unidad":"g","calorias_por_100g":40},{"id":"huevo-duro","nombre":"Huevo duro","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"huevo","nombre":"Huevo (para pintar)","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"aceite","nombre":"Aceite","cantidad":15,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Prepara una masa con harina, agua tibia, aceite y una pizca de sal. Reposa 15 minutos.","duracion_min":18},{"orden":2,"descripcion":"Corta la carne a cuchillo en cubos muy chicos (NO molida). Saltea con cebolla picada.","duracion_min":8},{"orden":3,"descripcion":"Mezcla la carne con papa hervida picada y huevo duro picado. Deja enfriar.","duracion_min":5},{"orden":4,"descripcion":"Estira la masa, corta discos, rellena, cierra con repulgue. Pinta con huevo y hornea 22 min a 200°C.","duracion_min":24}]'::jsonb,
ARRAY['argentina','latam','empanada','tucumana','iconico','tradicional','horneado','noroeste'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pastelitos-batata-horno-baby-argentina', 'Pastelitos de batata al horno baby', 'Pastelitos criollos argentinos rellenos de batata, horneados en lugar de fritos. Postre tradicional del 25 de Mayo.', ARRAY['snack'], ARRAY['preescolar'], 45, 4, ARRAY['gluten']::text[], 230, 4, 38, 7, 0.9,
'[{"id":"masa","nombre":"Masa de pastelitos casera o tapa de empanada","cantidad":8,"unidad":"discos","calorias_por_100g":380},{"id":"batata","nombre":"Batata","cantidad":200,"unidad":"g","calorias_por_100g":86},{"id":"panela","nombre":"Panela rallada o azúcar mascabo","cantidad":15,"unidad":"g","calorias_por_100g":380},{"id":"vainilla","nombre":"Esencia de vainilla","cantidad":5,"unidad":"gotas","calorias_por_100g":0},{"id":"mantequilla","nombre":"Mantequilla derretida","cantidad":15,"unidad":"g","calorias_por_100g":717}]'::jsonb,
'[{"orden":1,"descripcion":"Hierve la batata pelada hasta estar muy tierna, escúrrela y písala con la panela y la vainilla.","duracion_min":20},{"orden":2,"descripcion":"Coloca una cucharada de batata pisada en el centro de cada disco de masa.","duracion_min":5},{"orden":3,"descripcion":"Coloca otro disco encima formando un sandwich y presiona los bordes para sellar bien.","duracion_min":3},{"orden":4,"descripcion":"Pinta con mantequilla derretida y hornea a 200°C durante 18 minutos hasta dorar.","duracion_min":18}]'::jsonb,
ARRAY['argentina','latam','pastelitos','criollo','tradicional','postre','horneado','25-de-mayo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('arroz-leche-argentino-limon', 'Arroz con leche argentino con cáscara de limón', 'Arroz con leche al estilo argentino: aromatizado con cáscara de limón y canela. Más denso y cremoso que otras versiones LATAM.', ARRAY['snack','desayuno'], ARRAY['preescolar'], 35, 3, ARRAY['lactosa']::text[], 185, 5, 32, 4, 0.5,
'[{"id":"arroz","nombre":"Arroz blanco","cantidad":60,"unidad":"g","calorias_por_100g":130},{"id":"leche","nombre":"Leche entera","cantidad":350,"unidad":"ml","calorias_por_100g":61},{"id":"limon","nombre":"Cáscara de limón","cantidad":1,"unidad":"trozo grande","calorias_por_100g":29},{"id":"canela","nombre":"Canela en rama","cantidad":1,"unidad":"rama","calorias_por_100g":247},{"id":"vainilla","nombre":"Esencia de vainilla","cantidad":3,"unidad":"gotas","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el arroz en abundante agua durante 12 minutos. Escurre y reserva.","duracion_min":12},{"orden":2,"descripcion":"Calienta la leche con la cáscara de limón y la canela hasta que aromatice.","duracion_min":8},{"orden":3,"descripcion":"Retira las aromáticas y suma el arroz cocido. Cocina a fuego bajo 12 minutos revolviendo.","duracion_min":12},{"orden":4,"descripcion":"Agrega las gotas de vainilla al final. Sirve tibio espolvoreado con un poco de canela.","duracion_min":3}]'::jsonb,
ARRAY['argentina','latam','arroz-con-leche','postre','tradicional','limon'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('dulce-membrillo-casero-baby-argentina', 'Dulce de membrillo casero baby light', 'Dulce sólido cocido de membrillo argentino con muy poca azúcar. Se corta en tajadas, se acompaña con queso fresco.', ARRAY['snack'], ARRAY['preescolar'], 75, 6, ARRAY[]::text[], 110, 0.4, 28, 0.1, 0.3,
'[{"id":"membrillo","nombre":"Membrillos maduros","cantidad":500,"unidad":"g","calorias_por_100g":57},{"id":"panela","nombre":"Panela rallada o azúcar mascabo","cantidad":80,"unidad":"g","calorias_por_100g":380},{"id":"limon","nombre":"Jugo de limón","cantidad":10,"unidad":"ml","calorias_por_100g":29}]'::jsonb,
'[{"orden":1,"descripcion":"Lava los membrillos, córtalos en cuartos, retira las semillas y ponlos en una olla con agua.","duracion_min":5},{"orden":2,"descripcion":"Hierve durante 30 minutos hasta que estén muy blandos. Procesa hasta hacer puré.","duracion_min":33},{"orden":3,"descripcion":"Devuelve el puré a la olla con la panela y el jugo de limón. Cocina a fuego bajo revolviendo.","duracion_min":3},{"orden":4,"descripcion":"Cocina 30 minutos hasta espesar bien (debe despegarse del fondo). Vierte en molde y deja enfriar.","duracion_min":32}]'::jsonb,
ARRAY['argentina','latam','dulce-membrillo','postre','tradicional','sin-azucar-refinada'], false, true)
ON CONFLICT (slug) DO NOTHING;
