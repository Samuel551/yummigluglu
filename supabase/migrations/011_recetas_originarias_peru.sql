-- ============================================================
-- Yummi Glu Glu — 20 recetas originarias de PERÚ 🇵🇪
-- Distribución pareja por etapa:
--   INICIO (6-11m):       7 recetas — con ingredientes andinos (quínoa, kiwicha, camote)
--   TRANSICION (12-23m):  7 recetas — clásicos peruanos adaptados a textura blanda
--   PREESCOLAR (24m+):    6 recetas — platos icónicos en versión baby-friendly
--
-- Todas FREE, sin sal ni azúcar agregada (donde aplica).
-- Idempotente: ON CONFLICT (slug) DO NOTHING.
-- Tags: 'peru' + 'latam' + categorías específicas.
-- ============================================================

-- ─── INICIO (6-11m) ──────────────────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('crema-zapallo-loche-peru', 'Crema de zapallo loche', 'Crema sedosa de zapallo loche, un zapallo único del norte peruano, dulce y aromático.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 20, 2, ARRAY[]::text[], 95, 2, 20, 0.6, 0.7,
'[{"id":"zapallo-loche","nombre":"Zapallo loche (o zapallo macre)","cantidad":180,"unidad":"g","calorias_por_100g":28},{"id":"papa","nombre":"Papa amarilla","cantidad":60,"unidad":"g","calorias_por_100g":77},{"id":"agua","nombre":"Agua","cantidad":150,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Pela el zapallo loche y la papa amarilla, córtalos en cubos pequeños.","duracion_min":4},{"orden":2,"descripcion":"Cocina ambos en agua durante 15 minutos hasta que estén bien tiernos.","duracion_min":15},{"orden":3,"descripcion":"Procesa con un poco de agua de cocción hasta obtener una crema sedosa.","duracion_min":2}]'::jsonb,
ARRAY['peru','latam','andino','zapallo-loche','vegetariano','primera-papilla'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('papilla-quinoa-leche-canela-peru', 'Papilla de quínoa con leche y canela', 'Papilla peruana de quínoa cocida con leche y un toque de canela. Aroma andino tradicional.', ARRAY['desayuno','snack'], ARRAY['inicio'], 22, 2, ARRAY['lactosa']::text[], 145, 6, 22, 3, 1.8,
'[{"id":"quinoa","nombre":"Quínoa blanca","cantidad":40,"unidad":"g","calorias_por_100g":368},{"id":"leche","nombre":"Leche entera","cantidad":150,"unidad":"ml","calorias_por_100g":61},{"id":"canela","nombre":"Canela en polvo","cantidad":1,"unidad":"pizca","calorias_por_100g":247}]'::jsonb,
'[{"orden":1,"descripcion":"Lava bien la quínoa hasta que el agua salga clara.","duracion_min":2},{"orden":2,"descripcion":"Cocina la quínoa en agua durante 12 minutos hasta que abra los granos.","duracion_min":12},{"orden":3,"descripcion":"Agrega la leche y la pizca de canela, cocina 6 minutos más a fuego bajo.","duracion_min":6},{"orden":4,"descripcion":"Procesa hasta lograr la textura suave para bebé.","duracion_min":1}]'::jsonb,
ARRAY['peru','latam','andino','quinoa','desayuno','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-camote-platano-selva-peru', 'Puré de camote y plátano de la selva', 'Combinación dulce natural del camote peruano con plátano de la selva. Mucha energía.', ARRAY['almuerzo','snack'], ARRAY['inicio'], 18, 2, ARRAY[]::text[], 130, 1.8, 30, 0.4, 0.6,
'[{"id":"camote","nombre":"Camote naranjo","cantidad":150,"unidad":"g","calorias_por_100g":86},{"id":"platano","nombre":"Plátano de la selva (o plátano común maduro)","cantidad":0.5,"unidad":"unidad","calorias_por_100g":89},{"id":"agua","nombre":"Agua","cantidad":50,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Pela y corta el camote en cubos pequeños.","duracion_min":3},{"orden":2,"descripcion":"Cocina al vapor durante 12 minutos hasta estar bien blando.","duracion_min":12},{"orden":3,"descripcion":"Pisa el camote junto con el plátano maduro hasta obtener una crema suave.","duracion_min":2}]'::jsonb,
ARRAY['peru','latam','camote','platano','selva','vegetariano','dulce-natural'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('compota-aguaymanto-manzana-peru', 'Compota de aguaymanto y manzana', 'Compota agridulce con aguaymanto, fruta andina rica en vitamina A. Sin azúcar agregada.', ARRAY['snack','desayuno'], ARRAY['inicio'], 15, 2, ARRAY[]::text[], 85, 0.7, 21, 0.3, 0.4,
'[{"id":"aguaymanto","nombre":"Aguaymanto fresco","cantidad":80,"unidad":"g","calorias_por_100g":53},{"id":"manzana","nombre":"Manzana","cantidad":1,"unidad":"unidad","calorias_por_100g":52},{"id":"agua","nombre":"Agua","cantidad":50,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Lava bien los aguaymantos y pélales la cobertura externa.","duracion_min":3},{"orden":2,"descripcion":"Pela y corta la manzana en cubos pequeños.","duracion_min":2},{"orden":3,"descripcion":"Cocina ambos con el agua tapado a fuego bajo durante 10 minutos.","duracion_min":10},{"orden":4,"descripcion":"Procesa hasta obtener una compota suave (cuela si hay semillas duras).","duracion_min":2}]'::jsonb,
ARRAY['peru','latam','andino','aguaymanto','fruta','sin-azucar'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-habas-tiernas-choclo-peru', 'Puré de habas tiernas con choclo serrano', 'Mezcla nutritiva con habas tiernas peladas y choclo serrano. Proteína y dulzura natural.', ARRAY['almuerzo','cena'], ARRAY['inicio'], 20, 2, ARRAY[]::text[], 115, 7, 19, 1.2, 1.5,
'[{"id":"habas","nombre":"Habas tiernas peladas","cantidad":80,"unidad":"g","calorias_por_100g":88},{"id":"choclo","nombre":"Choclo serrano desgranado","cantidad":80,"unidad":"g","calorias_por_100g":86},{"id":"papa","nombre":"Papa amarilla","cantidad":50,"unidad":"g","calorias_por_100g":77}]'::jsonb,
'[{"orden":1,"descripcion":"Pela las habas retirando la piel externa para que queden bien suaves.","duracion_min":5},{"orden":2,"descripcion":"Cocina habas, choclo y papa en agua durante 14 minutos.","duracion_min":14},{"orden":3,"descripcion":"Procesa todo junto hasta obtener un puré cremoso verde-amarillo.","duracion_min":2}]'::jsonb,
ARRAY['peru','latam','andino','habas','choclo','proteina-vegetal'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('papilla-kiwicha-pera-peru', 'Papilla de kiwicha con pera', 'Papilla con kiwicha (amaranto andino) y pera. La kiwicha es uno de los granos más nutritivos del mundo.', ARRAY['desayuno','snack'], ARRAY['inicio'], 18, 2, ARRAY[]::text[], 135, 5, 26, 1.5, 2.4,
'[{"id":"kiwicha","nombre":"Kiwicha (amaranto)","cantidad":30,"unidad":"g","calorias_por_100g":371},{"id":"pera","nombre":"Pera madura","cantidad":1,"unidad":"unidad","calorias_por_100g":57},{"id":"agua","nombre":"Agua","cantidad":200,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Lava la kiwicha bajo agua hasta que el agua salga clara.","duracion_min":2},{"orden":2,"descripcion":"Cocina la kiwicha en agua durante 15 minutos hasta espesar.","duracion_min":15},{"orden":3,"descripcion":"Pela y ralla la pera, mézclala con la kiwicha caliente para que se entibie.","duracion_min":2}]'::jsonb,
ARRAY['peru','latam','andino','kiwicha','amaranto','desayuno','sin-gluten'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('pure-chirimoya-platano-peru', 'Puré de chirimoya y plátano', 'Puré tropical sin cocción con chirimoya peruana y plátano. Dulzura natural y cremoso.', ARRAY['snack'], ARRAY['inicio'], 5, 1, ARRAY[]::text[], 110, 1.5, 27, 0.4, 0.3,
'[{"id":"chirimoya","nombre":"Chirimoya madura","cantidad":100,"unidad":"g","calorias_por_100g":75},{"id":"platano","nombre":"Plátano maduro","cantidad":0.5,"unidad":"unidad","calorias_por_100g":89}]'::jsonb,
'[{"orden":1,"descripcion":"Parte la chirimoya por la mitad y extrae la pulpa con una cuchara.","duracion_min":2},{"orden":2,"descripcion":"Retira con cuidado todas las semillas de la chirimoya.","duracion_min":2},{"orden":3,"descripcion":"Pisa la chirimoya con el plátano hasta lograr una crema suave.","duracion_min":1}]'::jsonb,
ARRAY['peru','latam','tropical','chirimoya','fruta','sin-coccion'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── TRANSICION (12-23m) ─────────────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('chupe-papa-amarilla-peru', 'Chupe verde de papa amarilla', 'Versión baby del chupe peruano. Sopa cremosa con papa amarilla, leche, queso y un toque de huacatay.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 30, 3, ARRAY['lactosa']::text[], 195, 8, 28, 6, 1.4,
'[{"id":"papa-amarilla","nombre":"Papa amarilla","cantidad":200,"unidad":"g","calorias_por_100g":77},{"id":"leche","nombre":"Leche","cantidad":150,"unidad":"ml","calorias_por_100g":61},{"id":"queso-fresco","nombre":"Queso fresco","cantidad":30,"unidad":"g","calorias_por_100g":264},{"id":"huacatay","nombre":"Hojas de huacatay","cantidad":2,"unidad":"hojas","calorias_por_100g":15},{"id":"cebolla","nombre":"Cebolla","cantidad":30,"unidad":"g","calorias_por_100g":40}]'::jsonb,
'[{"orden":1,"descripcion":"Pela la papa amarilla y córtala en cubos pequeños.","duracion_min":3},{"orden":2,"descripcion":"Cocina la papa con la cebolla picada y el huacatay en agua durante 18 minutos.","duracion_min":18},{"orden":3,"descripcion":"Agrega la leche y deja que tome temperatura sin hervir.","duracion_min":4},{"orden":4,"descripcion":"Procesa parte del caldo y agrega el queso desmenuzado al final.","duracion_min":3}]'::jsonb,
ARRAY['peru','latam','chupe','andino','sopa','queso'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('sopa-quinoa-verduras-peru', 'Sopa de quínoa con verduras peruana', 'Sopa nutritiva al estilo peruano con quínoa, zapallo, arvejas y zanahoria. Plato completo en cuchara.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 28, 3, ARRAY[]::text[], 160, 7, 28, 2.5, 2.6,
'[{"id":"quinoa","nombre":"Quínoa","cantidad":50,"unidad":"g","calorias_por_100g":368},{"id":"zapallo","nombre":"Zapallo","cantidad":80,"unidad":"g","calorias_por_100g":26},{"id":"zanahoria","nombre":"Zanahoria","cantidad":60,"unidad":"g","calorias_por_100g":41},{"id":"arvejas","nombre":"Arvejas","cantidad":40,"unidad":"g","calorias_por_100g":81},{"id":"cebolla","nombre":"Cebolla","cantidad":30,"unidad":"g","calorias_por_100g":40}]'::jsonb,
'[{"orden":1,"descripcion":"Lava la quínoa bajo agua corriente hasta que el agua salga clara.","duracion_min":2},{"orden":2,"descripcion":"Dora la cebolla picada fina en una olla, agrega zapallo y zanahoria en cubos.","duracion_min":5},{"orden":3,"descripcion":"Suma la quínoa, las arvejas y el agua (3 tazas), cocina 18 minutos.","duracion_min":18},{"orden":4,"descripcion":"Pisa ligeramente para textura blanda apta para bebés.","duracion_min":2}]'::jsonb,
ARRAY['peru','latam','quinoa','sopa','andino','vegetariano'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('ajiaco-papa-peru-baby', 'Ajiaco peruano de papa baby', 'Versión baby del ajiaco peruano: papa amarilla guisada con cebolla, ajo y un punto de queso. Suave y reconfortante.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 25, 3, ARRAY['lactosa']::text[], 175, 7, 28, 4.5, 1.3,
'[{"id":"papa-amarilla","nombre":"Papa amarilla","cantidad":250,"unidad":"g","calorias_por_100g":77},{"id":"cebolla","nombre":"Cebolla roja","cantidad":50,"unidad":"g","calorias_por_100g":40},{"id":"queso-fresco","nombre":"Queso fresco","cantidad":30,"unidad":"g","calorias_por_100g":264},{"id":"leche","nombre":"Leche","cantidad":80,"unidad":"ml","calorias_por_100g":61},{"id":"perejil","nombre":"Perejil picado","cantidad":2,"unidad":"hojas","calorias_por_100g":36}]'::jsonb,
'[{"orden":1,"descripcion":"Pela las papas y córtalas en cubos pequeños.","duracion_min":3},{"orden":2,"descripcion":"Dora la cebolla picada fina hasta transparentar.","duracion_min":4},{"orden":3,"descripcion":"Agrega la papa y agua justa para cubrir. Cocina 15 minutos hasta que se deshaga.","duracion_min":15},{"orden":4,"descripcion":"Suma la leche y el queso desmenuzado, mezcla con perejil al final.","duracion_min":3}]'::jsonb,
ARRAY['peru','latam','ajiaco','andino','papa-amarilla','queso'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('causa-peruana-baby', 'Causa peruana baby', 'Versión baby del icónico plato peruano: capas de papa amarilla suave con palta y pollo desmenuzado.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 35, 2, ARRAY[]::text[], 230, 16, 30, 6, 1.6,
'[{"id":"papa-amarilla","nombre":"Papa amarilla","cantidad":250,"unidad":"g","calorias_por_100g":77},{"id":"pollo","nombre":"Pechuga de pollo cocida","cantidad":80,"unidad":"g","calorias_por_100g":165},{"id":"palta","nombre":"Palta madura","cantidad":0.5,"unidad":"unidad","calorias_por_100g":160},{"id":"limon","nombre":"Jugo de limón","cantidad":5,"unidad":"ml","calorias_por_100g":29},{"id":"aceite","nombre":"Aceite de oliva","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina las papas con cáscara, pélalas y písalas hasta puré suave con el aceite.","duracion_min":20},{"orden":2,"descripcion":"Desmenuza el pollo cocido en hebras muy finas.","duracion_min":3},{"orden":3,"descripcion":"Pisa la palta con unas gotas de jugo de limón hasta crema.","duracion_min":2},{"orden":4,"descripcion":"Arma capas en un molde pequeño: papa, pollo, papa, palta, papa. Refrigera 10 minutos.","duracion_min":12}]'::jsonb,
ARRAY['peru','latam','causa','iconico','tradicional','papa-amarilla','palta'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('arroz-verde-pollo-peru-baby', 'Arroz verde con pollo peruano baby', 'Adaptación baby del arroz con pollo peruano: arroz cocido con culantro suave y pollo desmenuzado.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 35, 3, ARRAY[]::text[], 220, 16, 30, 4, 1.5,
'[{"id":"arroz","nombre":"Arroz blanco","cantidad":80,"unidad":"g","calorias_por_100g":130},{"id":"pollo","nombre":"Pechuga de pollo","cantidad":120,"unidad":"g","calorias_por_100g":165},{"id":"culantro","nombre":"Culantro fresco","cantidad":10,"unidad":"g","calorias_por_100g":23},{"id":"espinacas","nombre":"Espinacas blanqueadas","cantidad":30,"unidad":"g","calorias_por_100g":23},{"id":"arvejas","nombre":"Arvejas","cantidad":40,"unidad":"g","calorias_por_100g":81},{"id":"zanahoria","nombre":"Zanahoria","cantidad":40,"unidad":"g","calorias_por_100g":41}]'::jsonb,
'[{"orden":1,"descripcion":"Procesa culantro y espinacas con un poco de agua hasta obtener un licuado verde.","duracion_min":3},{"orden":2,"descripcion":"Dora el pollo cortado en cubos chicos hasta sellar.","duracion_min":5},{"orden":3,"descripcion":"Agrega el arroz, las arvejas, zanahoria y el licuado verde. Suma agua y cocina 22 minutos.","duracion_min":22},{"orden":4,"descripcion":"Desmenuza el pollo con dos tenedores antes de servir.","duracion_min":2}]'::jsonb,
ARRAY['peru','latam','arroz-verde','iconico','tradicional','culantro','pollo'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('tacu-tacu-suave-peru-baby', 'Tacu tacu suave para bebés', 'Versión baby del tacu tacu peruano: mezcla suave de frijoles canarios y arroz cocido, sin freír.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 30, 2, ARRAY[]::text[], 215, 9, 38, 2.5, 2.3,
'[{"id":"frijoles","nombre":"Frijoles canarios cocidos","cantidad":120,"unidad":"g","calorias_por_100g":127},{"id":"arroz","nombre":"Arroz blanco cocido","cantidad":100,"unidad":"g","calorias_por_100g":130},{"id":"cebolla","nombre":"Cebolla roja","cantidad":40,"unidad":"g","calorias_por_100g":40},{"id":"ajo","nombre":"Ajo","cantidad":1,"unidad":"diente","calorias_por_100g":149},{"id":"aceite","nombre":"Aceite","cantidad":5,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Dora la cebolla y el ajo picados muy finos en una sartén con aceite.","duracion_min":4},{"orden":2,"descripcion":"Aplasta los frijoles cocidos con un tenedor hasta formar un puré.","duracion_min":3},{"orden":3,"descripcion":"Mezcla los frijoles con el arroz cocido y la cebolla dorada.","duracion_min":2},{"orden":4,"descripcion":"Calienta la mezcla en la sartén 5 minutos revolviendo, sin freír de un lado.","duracion_min":5}]'::jsonb,
ARRAY['peru','latam','tacu-tacu','tradicional','frijoles','arroz'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('olluco-carne-suave-peru', 'Olluco con carne suave', 'Versión bebé del clásico olluco peruano. El olluco es un tubérculo andino único, gelatinoso y nutritivo.', ARRAY['almuerzo','cena'], ARRAY['transicion'], 35, 3, ARRAY[]::text[], 195, 13, 24, 5, 1.7,
'[{"id":"olluco","nombre":"Olluco fresco","cantidad":200,"unidad":"g","calorias_por_100g":62},{"id":"carne","nombre":"Carne molida magra","cantidad":80,"unidad":"g","calorias_por_100g":250},{"id":"cebolla","nombre":"Cebolla","cantidad":40,"unidad":"g","calorias_por_100g":40},{"id":"tomate","nombre":"Tomate","cantidad":60,"unidad":"g","calorias_por_100g":18},{"id":"papa","nombre":"Papa amarilla","cantidad":50,"unidad":"g","calorias_por_100g":77}]'::jsonb,
'[{"orden":1,"descripcion":"Lava y corta el olluco en tiras finas, ponlo a hervir en agua 8 minutos.","duracion_min":10},{"orden":2,"descripcion":"Dora la cebolla y el tomate picados, agrega la carne y cocina hasta que pierda el rosa.","duracion_min":8},{"orden":3,"descripcion":"Suma el olluco escurrido y la papa rallada, cocina 12 minutos más.","duracion_min":12},{"orden":4,"descripcion":"Tritura levemente con tenedor para que quede una textura blanda.","duracion_min":2}]'::jsonb,
ARRAY['peru','latam','olluco','andino','tradicional','carne'], false, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── PREESCOLAR (24m+) ───────────────────────────────────────

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('papa-huancaina-baby-peru', 'Papa a la huancaína baby', 'Icono peruano en versión baby: papa amarilla con salsa cremosa de queso fresco SIN ají picante.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 25, 2, ARRAY['lactosa','huevo']::text[], 280, 11, 32, 12, 1.4,
'[{"id":"papa-amarilla","nombre":"Papa amarilla","cantidad":250,"unidad":"g","calorias_por_100g":77},{"id":"queso-fresco","nombre":"Queso fresco","cantidad":80,"unidad":"g","calorias_por_100g":264},{"id":"leche","nombre":"Leche evaporada","cantidad":60,"unidad":"ml","calorias_por_100g":134},{"id":"galletas","nombre":"Galletas sin sal","cantidad":3,"unidad":"unidades","calorias_por_100g":430},{"id":"huevo-duro","nombre":"Huevo duro","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"aceite","nombre":"Aceite","cantidad":10,"unidad":"ml","calorias_por_100g":884}]'::jsonb,
'[{"orden":1,"descripcion":"Hierve las papas con cáscara durante 20 minutos hasta que estén tiernas.","duracion_min":20},{"orden":2,"descripcion":"Pélalas y córtalas en rodajas medianas.","duracion_min":2},{"orden":3,"descripcion":"Licúa el queso, la leche, las galletas y el aceite hasta obtener una salsa cremosa amarilla.","duracion_min":3},{"orden":4,"descripcion":"Vierte la salsa sobre las papas y decora con rodajas de huevo duro.","duracion_min":2}]'::jsonb,
ARRAY['peru','latam','huancaina','iconico','tradicional','papa-amarilla','queso'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('lomo-saltado-baby-peru', 'Lomo saltado baby (sin sal)', 'Versión baby del icónico lomo saltado peruano: tiras de carne suaves con cebolla, tomate y papas al horno.', ARRAY['almuerzo','cena'], ARRAY['preescolar'], 30, 3, ARRAY[]::text[], 295, 22, 24, 12, 2.5,
'[{"id":"carne","nombre":"Lomo de res cortado en tiras finas","cantidad":150,"unidad":"g","calorias_por_100g":250},{"id":"cebolla","nombre":"Cebolla roja","cantidad":80,"unidad":"g","calorias_por_100g":40},{"id":"tomate","nombre":"Tomate","cantidad":100,"unidad":"g","calorias_por_100g":18},{"id":"papa","nombre":"Papa para freír","cantidad":150,"unidad":"g","calorias_por_100g":77},{"id":"aceite","nombre":"Aceite de oliva","cantidad":15,"unidad":"ml","calorias_por_100g":884},{"id":"culantro","nombre":"Culantro picado","cantidad":2,"unidad":"hojas","calorias_por_100g":23}]'::jsonb,
'[{"orden":1,"descripcion":"Corta la papa en bastones y hornéalos a 200°C durante 20 minutos volteándolos.","duracion_min":20},{"orden":2,"descripcion":"Saltea la carne en tiras a fuego alto con poco aceite, retira y reserva.","duracion_min":4},{"orden":3,"descripcion":"En la misma sartén dora cebolla y tomate en gajos durante 4 minutos.","duracion_min":4},{"orden":4,"descripcion":"Junta carne, verduras, papas al horno y culantro. Sirve enseguida.","duracion_min":2}]'::jsonb,
ARRAY['peru','latam','lomo-saltado','iconico','tradicional','carne'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('mazamorra-morada-peru-baby', 'Mazamorra morada peruana baby', 'Postre icónico peruano con maíz morado, frutas y un toque de canela. Sin azúcar añadida, dulzura natural.', ARRAY['snack'], ARRAY['preescolar'], 50, 4, ARRAY[]::text[], 130, 1.8, 30, 0.4, 0.9,
'[{"id":"maiz-morado","nombre":"Maíz morado","cantidad":150,"unidad":"g","calorias_por_100g":86},{"id":"pina","nombre":"Piña","cantidad":80,"unidad":"g","calorias_por_100g":50},{"id":"manzana","nombre":"Manzana","cantidad":1,"unidad":"unidad","calorias_por_100g":52},{"id":"membrillo","nombre":"Membrillo","cantidad":0.5,"unidad":"unidad","calorias_por_100g":57},{"id":"canela","nombre":"Canela en rama","cantidad":1,"unidad":"rama","calorias_por_100g":247},{"id":"chuno","nombre":"Chuño o harina de camote","cantidad":15,"unidad":"g","calorias_por_100g":323},{"id":"agua","nombre":"Agua","cantidad":600,"unidad":"ml","calorias_por_100g":0}]'::jsonb,
'[{"orden":1,"descripcion":"Hierve el maíz morado con la canela y la cáscara de piña durante 30 minutos.","duracion_min":30},{"orden":2,"descripcion":"Cuela el líquido morado y descarta los sólidos.","duracion_min":2},{"orden":3,"descripcion":"Devuelve el líquido a la olla con manzana y membrillo picados, cocina 10 minutos.","duracion_min":10},{"orden":4,"descripcion":"Disuelve el chuño en agua fría, agrégalo y cocina revolviendo hasta espesar.","duracion_min":6}]'::jsonb,
ARRAY['peru','latam','mazamorra-morada','iconico','postre','tradicional','sin-azucar'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('picarones-horno-light-peru', 'Picarones al horno light', 'Versión saludable de los picarones peruanos: aros suaves al horno de zapallo y camote con miel de chancaca.', ARRAY['snack'], ARRAY['preescolar'], 45, 4, ARRAY['gluten','huevo']::text[], 175, 5, 32, 3.5, 1,
'[{"id":"zapallo","nombre":"Zapallo cocido","cantidad":150,"unidad":"g","calorias_por_100g":26},{"id":"camote","nombre":"Camote cocido","cantidad":100,"unidad":"g","calorias_por_100g":86},{"id":"harina","nombre":"Harina","cantidad":80,"unidad":"g","calorias_por_100g":364},{"id":"huevo","nombre":"Huevo","cantidad":1,"unidad":"unidad","calorias_por_100g":155},{"id":"chancaca","nombre":"Chancaca rallada","cantidad":20,"unidad":"g","calorias_por_100g":380},{"id":"naranja","nombre":"Cáscara de naranja","cantidad":1,"unidad":"trozo","calorias_por_100g":47}]'::jsonb,
'[{"orden":1,"descripcion":"Procesa zapallo y camote cocidos hasta puré liso.","duracion_min":3},{"orden":2,"descripcion":"Mezcla el puré con harina y huevo hasta formar una masa suave.","duracion_min":3},{"orden":3,"descripcion":"Forma pequeños aros con las manos y hornea a 180°C durante 22 minutos.","duracion_min":22},{"orden":4,"descripcion":"Aparte derrite la chancaca con cáscara de naranja en poco agua hasta hacer un almíbar suave.","duracion_min":8}]'::jsonb,
ARRAY['peru','latam','picarones','iconico','postre','tradicional','horneado'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('arroz-con-leche-canela-clavo-peru', 'Arroz con leche peruano con canela y clavo', 'Versión peruana del arroz con leche: aromatizado con canela, clavo de olor y cáscara de naranja.', ARRAY['snack','desayuno'], ARRAY['preescolar'], 35, 3, ARRAY['lactosa']::text[], 175, 5, 30, 3.5, 0.5,
'[{"id":"arroz","nombre":"Arroz blanco","cantidad":50,"unidad":"g","calorias_por_100g":130},{"id":"leche","nombre":"Leche entera","cantidad":300,"unidad":"ml","calorias_por_100g":61},{"id":"canela","nombre":"Canela en rama","cantidad":1,"unidad":"rama","calorias_por_100g":247},{"id":"clavo","nombre":"Clavo de olor","cantidad":2,"unidad":"unidades","calorias_por_100g":274},{"id":"naranja","nombre":"Cáscara de naranja","cantidad":1,"unidad":"trozo","calorias_por_100g":47},{"id":"pasas","nombre":"Pasas (opcional, retirar para menores de 3 años)","cantidad":10,"unidad":"g","calorias_por_100g":299}]'::jsonb,
'[{"orden":1,"descripcion":"Cocina el arroz en agua con canela, clavo y cáscara de naranja durante 15 minutos.","duracion_min":15},{"orden":2,"descripcion":"Retira las especias y la cáscara, agrega la leche y cocina otros 15 minutos a fuego bajo.","duracion_min":15},{"orden":3,"descripcion":"Revuelve constantemente hasta que tome consistencia cremosa.","duracion_min":3},{"orden":4,"descripcion":"Espolvorea canela en polvo al servir. Las pasas son opcionales.","duracion_min":2}]'::jsonb,
ARRAY['peru','latam','arroz-con-leche','postre','tradicional','dulce-natural'], false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recetas (slug, nombre, descripcion, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa) VALUES
('crema-volteada-peru-light', 'Crema volteada peruana light', 'Versión light del clásico flan peruano con leche evaporada y un toque de vainilla. Al baño maría.', ARRAY['snack'], ARRAY['preescolar'], 50, 4, ARRAY['lactosa','huevo']::text[], 165, 8, 18, 6, 0.6,
'[{"id":"huevos","nombre":"Huevos","cantidad":3,"unidad":"unidades","calorias_por_100g":155},{"id":"leche-evaporada","nombre":"Leche evaporada","cantidad":200,"unidad":"ml","calorias_por_100g":134},{"id":"leche","nombre":"Leche fresca","cantidad":100,"unidad":"ml","calorias_por_100g":61},{"id":"vainilla","nombre":"Esencia de vainilla","cantidad":5,"unidad":"gotas","calorias_por_100g":0},{"id":"miel-membrillo","nombre":"Almíbar de membrillo casero","cantidad":15,"unidad":"ml","calorias_por_100g":280}]'::jsonb,
'[{"orden":1,"descripcion":"Cubre el fondo de moldes pequeños con almíbar de membrillo casero.","duracion_min":3},{"orden":2,"descripcion":"Bate los huevos con las dos leches y la vainilla hasta integrar sin formar espuma.","duracion_min":3},{"orden":3,"descripcion":"Vierte sobre el almíbar y hornea a baño maría a 160°C durante 40 minutos.","duracion_min":40},{"orden":4,"descripcion":"Deja enfriar antes de desmoldar. Sirve volteado en plato hondo.","duracion_min":4}]'::jsonb,
ARRAY['peru','latam','crema-volteada','postre','tradicional','horneado'], false, true)
ON CONFLICT (slug) DO NOTHING;
