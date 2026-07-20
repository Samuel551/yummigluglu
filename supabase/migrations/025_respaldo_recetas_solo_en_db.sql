-- ============================================================
-- 025 — RESPALDO: recetas que existían SOLO en la base de datos
-- Fecha: 2026-07-20
--
-- POR QUÉ EXISTE ESTE ARCHIVO
-- Al 2026-07-20 la tabla `recetas` tenía 207 filas, pero las migraciones
-- del repo (005, 010–015, 020) solo insertaban 185. Las 22 restantes
-- fueron cargadas a mano (panel admin / dashboard de Supabase) y NO
-- existían en ninguna migración: si la DB se reseteaba, se recreaba el
-- proyecto o se corrompía, se perdían para siempre.
--
-- Este archivo es el RESPALDO de esas 22 recetas, volcado directamente
-- desde la DB de producción (proyecto uoqzkbbnesmvmgbjikrn).
--
-- NO hace falta aplicarlo contra la DB actual — las recetas YA están ahí.
-- Sirve para poder reconstruir el catálogo completo desde cero.
--
-- NOTAS TÉCNICAS
--   * Se preservan los `id` (uuid) ORIGINALES a propósito: están
--     referenciados por `favoritos`, `desbloqueos_temporales` y el plan
--     semanal. Si cambian los ids, se rompen esas relaciones.
--   * Idempotente: `on conflict (id) do nothing`. Re-correrlo no duplica
--     ni explota. Ojo: la tabla también tiene UNIQUE en `slug`, así que
--     si una fila existe con OTRO id pero el mismo slug, este insert
--     fallará por la constraint de slug (comportamiento deseado: avisa
--     de una divergencia real en lugar de tragársela).
--   * `ingredientes` y `pasos` son JSONB; `momento_dia`,
--     `etapas_compatibles`, `alergenos` y `tags` son text[] (con índices
--     GIN). Los casts explícitos están puestos para que no dependa de
--     la inferencia de tipos.
--   * Contenido de catálogo únicamente. No hay datos de usuarios,
--     credenciales ni secretos en este archivo.
--
-- ANOMALÍAS DETECTADAS AL HACER EL VOLCADO (ver reporte)
--   * `pasos` viene en DOS formatos distintos: objetos
--     {orden, descripcion, duracion_min} en el lote del 2026-04-05, y
--     strings planos en el lote del 2026-04-27 (el cargado por admin).
--   * El lote del 2026-04-27 tiene toda la info nutricional en NULL y
--     los ingredientes sin `id` ni `calorias_por_100g`.
--   * `milanesa-pollo-horno` y `milanesas-pollo-horno` son casi
--     duplicados. Igual `pasta-salsa-tomate` (acá) vs
--     `pasta-con-salsa-de-tomate` (migración 005).
--   Se respaldan TAL CUAL están en la DB — este archivo es un respaldo
--   fiel, no el lugar para corregir datos.
-- ============================================================

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '380b316a-6a07-468b-87d7-0064e6d2bbb1'::uuid, 'arroz-espinaca', 'Arroz Cremoso con Espinaca', 'Arroz suave con espinaca licuada. Excelente fuente de hierro y fácil de comer para bebés que están aprendiendo texturas.', NULL,
  '{almuerzo,cena}'::text[], '{inicio,transicion}'::text[], '30'::int, '2'::int, '{}'::text[],
  '110'::numeric, '3.2'::numeric, '22.5'::numeric, '1.0'::numeric, '2.1'::numeric,
  '[{"id": 1, "nombre": "Arroz blanco", "unidad": "g", "cantidad": 60, "calorias_por_100g": 130}, {"id": 2, "nombre": "Espinaca fresca", "unidad": "g", "cantidad": 80, "calorias_por_100g": 23}, {"id": 3, "nombre": "Caldo de verduras bajo en sodio", "unidad": "ml", "cantidad": 300, "calorias_por_100g": 5}, {"id": 4, "nombre": "Aceite de oliva", "unidad": "ml", "cantidad": 5, "calorias_por_100g": 884}]'::jsonb,
  '[{"orden": 1, "descripcion": "Lavar el arroz y cocinarlo en el caldo por 20 minutos a fuego bajo.", "duracion_min": 20}, {"orden": 2, "descripcion": "Agregar la espinaca los últimos 5 minutos de cocción y mezclar.", "duracion_min": 5}, {"orden": 3, "descripcion": "Procesar todo junto hasta obtener la textura deseada. Agregar aceite de oliva al final.", "duracion_min": 3}]'::jsonb,
  '{chile,venezuela,mexico,verduras,sin-gluten,hierro,vegano,peru,argentina,sin-lactosa,latam,colombia}'::text[], 'f'::boolean, 't'::boolean, '2026-04-05 05:38:22.186337+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  'b1e8465a-575d-433b-a908-ca875b08e3bb'::uuid, 'atole-de-avena', 'Atole de avena', 'Bebida caliente tradicional mexicana perfecta para bebés. Avena con leche, vainilla y un toque de canela: el desayuno más nutritivo.', NULL,
  '{desayuno,snack}'::text[], '{inicio}'::text[], '15'::int, '1'::int, '{gluten,leche}'::text[],
  NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric,
  '[{"nombre": "Avena en hojuelas finas", "unidad": "g", "cantidad": 40}, {"nombre": "Leche entera", "unidad": "ml", "cantidad": 250}, {"nombre": "Agua", "unidad": "ml", "cantidad": 100}, {"nombre": "Extracto de vainilla", "unidad": "ml", "cantidad": 2}, {"nombre": "Canela molida", "unidad": "g", "cantidad": 1}]'::jsonb,
  '["Disolver la avena en el agua fría dentro de una olla pequeña.", "Agregar la leche y la canela. Llevar a fuego medio revolviendo constantemente.", "Cocinar 8 a 10 minutos hasta que espese a la consistencia deseada.", "Retirar del fuego, agregar la vainilla. Enfriar a temperatura adecuada antes de ofrecer al bebé."]'::jsonb,
  '{mexico}'::text[], 'f'::boolean, 't'::boolean, '2026-04-27 20:13:00.42955+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  'c52cb944-d820-4efd-983a-b7b566f0b017'::uuid, 'budin-pan-vainilla', 'Budín de pan con vainilla', 'Postre casero argentino que aprovecha el pan del día anterior. Suave, nutritivo y sin azúcar agregada.', NULL,
  '{desayuno,snack}'::text[], '{transicion,preescolar}'::text[], '45'::int, '1'::int, '{gluten,huevo,leche}'::text[],
  NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric,
  '[{"nombre": "Pan sin sal del día anterior", "unidad": "g", "cantidad": 100}, {"nombre": "Leche entera", "unidad": "ml", "cantidad": 200}, {"nombre": "Huevo", "unidad": "g", "cantidad": 120}, {"nombre": "Extracto de vainilla", "unidad": "ml", "cantidad": 3}]'::jsonb,
  '["Romper el pan en trozos y remojar en la leche durante 10 minutos hasta que se ablande.", "Batir los huevos con la vainilla. Mezclar bien con el pan remojado.", "Verter en molde engrasado. Hornear 35 minutos a 170°C hasta que esté firme al centro.", "Dejar enfriar completamente. Cortar en cubos pequeños para servir."]'::jsonb,
  '{argentina}'::text[], 'f'::boolean, 't'::boolean, '2026-04-27 20:13:00.42955+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '2d1c511b-c450-40e9-b35c-89d654980744'::uuid, 'caldo-tlalpeno-suave', 'Caldo tlalpeño suave', 'Versión suave del tradicional caldo mexicano de pollo con garbanzos. Sin especias fuertes, ideal para bebés desde los 9 meses.', NULL,
  '{almuerzo,cena}'::text[], '{transicion,preescolar}'::text[], '35'::int, '1'::int, '{}'::text[],
  NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric,
  '[{"nombre": "Pechuga de pollo", "unidad": "g", "cantidad": 120}, {"nombre": "Garbanzos cocidos", "unidad": "g", "cantidad": 50}, {"nombre": "Zanahoria", "unidad": "g", "cantidad": 60}, {"nombre": "Apio", "unidad": "g", "cantidad": 20}, {"nombre": "Caldo de pollo bajo en sodio", "unidad": "ml", "cantidad": 400}]'::jsonb,
  '["Hervir la pechuga en el caldo durante 20 minutos. Retirar y desmenuzar finamente.", "En el mismo caldo agregar la zanahoria y el apio en trozos pequeños. Hervir 10 minutos.", "Incorporar los garbanzos y el pollo desmenuzado. Calentar 3 minutos más.", "Servir el caldo con los trozos. Para bebés de inicio, licuar todo junto hasta obtener crema."]'::jsonb,
  '{mexico}'::text[], 'f'::boolean, 't'::boolean, '2026-04-27 20:13:00.42955+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '98f7fd77-fae4-44bb-b69a-ef13e5ff590d'::uuid, 'compota-manzana-pera', 'Compota de Manzana y Pera', 'Compota dulce y suave con dos frutas. Ideal como primer postre o merienda. Fácil digestión y sabor que los bebés aman.', NULL,
  '{desayuno,snack}'::text[], '{inicio,transicion}'::text[], '15'::int, '2'::int, '{}'::text[],
  '55'::numeric, '0.3'::numeric, '14.0'::numeric, '0.2'::numeric, '0.3'::numeric,
  '[{"id": 1, "nombre": "Manzana verde", "unidad": "g", "cantidad": 120, "calorias_por_100g": 52}, {"id": 2, "nombre": "Pera", "unidad": "g", "cantidad": 120, "calorias_por_100g": 57}, {"id": 3, "nombre": "Agua", "unidad": "ml", "cantidad": 50, "calorias_por_100g": 0}]'::jsonb,
  '[{"orden": 1, "descripcion": "Pelar, descorazonar y cortar las frutas en trozos pequeños.", "duracion_min": 5}, {"orden": 2, "descripcion": "Cocinar en ollita con el agua a fuego bajo, tapado, por 10 minutos hasta que ablanden.", "duracion_min": 10}, {"orden": 3, "descripcion": "Aplastar con tenedor para textura rústica o mixer para textura lisa. Dejar enfriar antes de servir.", "duracion_min": 2}]'::jsonb,
  '{digestivo,chile,venezuela,mexico,sin-gluten,postre,vegano,peru,frutas,argentina,sin-lactosa,latam,colombia}'::text[], 'f'::boolean, 't'::boolean, '2026-04-05 05:38:22.186337+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '539e1049-8af4-48fb-8b1e-fdd9bbd47727'::uuid, 'frijoles-de-olla', 'Frijoles de olla', 'Pilar de la alimentación mexicana. Frijoles negros cocidos a fuego lento, ricos en hierro y proteína vegetal. Perfectos en puré o enteros.', NULL,
  '{almuerzo,cena}'::text[], '{inicio,transicion}'::text[], '90'::int, '1'::int, '{}'::text[],
  NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric,
  '[{"nombre": "Frijoles negros secos", "unidad": "g", "cantidad": 100}, {"nombre": "Cebolla", "unidad": "g", "cantidad": 20}, {"nombre": "Ajo", "unidad": "g", "cantidad": 2}, {"nombre": "Agua", "unidad": "ml", "cantidad": 600}, {"nombre": "Aceite de maíz", "unidad": "ml", "cantidad": 5}]'::jsonb,
  '["Remojar los frijoles 8 horas. Escurrir y enjuagar bien.", "Colocar en olla con agua fresca, cebolla, ajo y aceite. Llevar a hervor.", "Bajar el fuego y cocinar tapado 60 a 90 minutos hasta que estén muy blandos.", "Para inicio: licuar con su caldo de cocción. Para transición: ofrecer enteros o semimachacados con tenedor."]'::jsonb,
  '{mexico}'::text[], 'f'::boolean, 't'::boolean, '2026-04-27 20:13:00.42955+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  'f29f7ad9-ed3d-48f3-aa4e-4d3eecc59f40'::uuid, 'lentejas-cremosas', 'Lentejas Cremosas', 'Lentejas suaves con verduras. Una de las mejores fuentes de hierro vegetal para bebés. Receta rendidora y muy nutritiva.', NULL,
  '{almuerzo,cena}'::text[], '{transicion,preescolar}'::text[], '40'::int, '3'::int, '{}'::text[],
  '130'::numeric, '9.0'::numeric, '20.0'::numeric, '1.5'::numeric, '3.3'::numeric,
  '[{"id": 1, "nombre": "Lentejas rojas", "unidad": "g", "cantidad": 100, "calorias_por_100g": 116}, {"id": 2, "nombre": "Zanahoria", "unidad": "g", "cantidad": 80, "calorias_por_100g": 41}, {"id": 3, "nombre": "Cebolla", "unidad": "g", "cantidad": 50, "calorias_por_100g": 40}, {"id": 4, "nombre": "Tomate", "unidad": "g", "cantidad": 80, "calorias_por_100g": 18}, {"id": 5, "nombre": "Aceite de oliva", "unidad": "ml", "cantidad": 8, "calorias_por_100g": 884}]'::jsonb,
  '[{"orden": 1, "descripcion": "Remojar las lentejas 30 minutos antes si son verdes o pardas. Las rojas no necesitan remojo.", "duracion_min": 2}, {"orden": 2, "descripcion": "Rehogar cebolla y zanahoria en aceite de oliva a fuego bajo por 5 minutos.", "duracion_min": 5}, {"orden": 3, "descripcion": "Agregar tomate y lentejas. Cubrir con agua o caldo y cocinar 30 minutos.", "duracion_min": 30}, {"orden": 4, "descripcion": "Procesar parcial o totalmente según la textura que tolere el bebé.", "duracion_min": 3}]'::jsonb,
  '{chile,venezuela,mexico,sin-gluten,hierro,vegano,peru,argentina,sin-lactosa,latam,rendidor,colombia,proteinas-vegetales}'::text[], 'f'::boolean, 't'::boolean, '2026-04-05 05:38:22.186337+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '110dd4bf-3bf1-46d0-ba24-de94c440308d'::uuid, 'locro-suave-bebes', 'Locro suave para bebés', 'Guiso tradicional argentino adaptado para bebés. Maíz, zapallo y porotos en preparación cremosa sin condimentos fuertes.', NULL,
  '{almuerzo,cena}'::text[], '{preescolar}'::text[], '40'::int, '1'::int, '{}'::text[],
  NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric,
  '[{"nombre": "Maíz blanco partido", "unidad": "g", "cantidad": 50}, {"nombre": "Zapallo", "unidad": "g", "cantidad": 100}, {"nombre": "Papa", "unidad": "g", "cantidad": 80}, {"nombre": "Porotos alubias cocidos", "unidad": "g", "cantidad": 40}, {"nombre": "Caldo de verduras bajo en sodio", "unidad": "ml", "cantidad": 300}, {"nombre": "Aceite de girasol", "unidad": "ml", "cantidad": 5}]'::jsonb,
  '["Remojar el maíz 8 horas o usar instantáneo. Hervir 20 minutos con el caldo a fuego medio.", "Incorporar el zapallo y la papa cortados en cubos pequeños. Cocinar 15 minutos más hasta que ablanden.", "Agregar los porotos ya cocidos y el aceite. Mezclar bien.", "Pisar con tenedor o mixer hasta obtener consistencia suave y cremosa. Servir tibio."]'::jsonb,
  '{argentina}'::text[], 'f'::boolean, 't'::boolean, '2026-04-27 20:13:00.42955+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '3d60e241-4634-46bf-bb20-a05da45d932a'::uuid, 'mazamorra-con-leche', 'Mazamorra con leche', 'Postre tradicional argentino de maíz blanco cocido en leche. Textura cremosa y reconfortante, sin azúcar, ideal como snack nutritivo.', NULL,
  '{desayuno,snack}'::text[], '{transicion,preescolar}'::text[], '40'::int, '1'::int, '{leche}'::text[],
  NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric,
  '[{"nombre": "Maíz blanco partido", "unidad": "g", "cantidad": 60}, {"nombre": "Leche entera", "unidad": "ml", "cantidad": 300}, {"nombre": "Agua", "unidad": "ml", "cantidad": 200}, {"nombre": "Extracto de vainilla", "unidad": "ml", "cantidad": 2}]'::jsonb,
  '["Lavar y remojar el maíz 6 horas. Escurrir bien.", "Hervir el maíz en el agua 30 minutos revolviendo ocasionalmente hasta que ablande.", "Incorporar la leche y la vainilla. Cocinar a fuego muy bajo 10 minutos más revolviendo para evitar que se pegue.", "Servir tibio o frío. La consistencia debe ser cremosa y sin grumos."]'::jsonb,
  '{argentina}'::text[], 'f'::boolean, 't'::boolean, '2026-04-27 20:13:00.42955+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '27002df5-2102-4663-ab87-6efb3c92a1e1'::uuid, 'milanesa-pollo-horno', 'Milanesa de pollo al horno', 'El clásico de la mesa argentina en versión saludable al horno. Ideal para que el bebé coma con las manos de forma independiente.', NULL,
  '{almuerzo,cena}'::text[], '{preescolar}'::text[], '30'::int, '1'::int, '{huevo,gluten}'::text[],
  NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric,
  '[{"nombre": "Pechuga de pollo", "unidad": "g", "cantidad": 150}, {"nombre": "Huevo", "unidad": "g", "cantidad": 60}, {"nombre": "Pan rallado integral", "unidad": "g", "cantidad": 40}, {"nombre": "Aceite de girasol", "unidad": "ml", "cantidad": 10}]'::jsonb,
  '["Cortar la pechuga en filetes finos. Golpear levemente para ablandar.", "Pasar cada filete por huevo batido y luego por pan rallado, presionando para que adhiera.", "Colocar en bandeja aceitada. Hornear 20 minutos a 180°C, dando vuelta a mitad del tiempo.", "Dejar enfriar. Cortar en tiras finas para facilitar el agarre del bebé."]'::jsonb,
  '{argentina}'::text[], 'f'::boolean, 't'::boolean, '2026-04-27 20:13:00.42955+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  'f73bd564-c89b-4558-9b75-cb968bf52b59'::uuid, 'milanesas-pollo-horno', 'Mini Milanesas de Pollo al Horno', 'Milanesas crujientes por fuera y tiernas por dentro, sin fritura. Fáciles de agarrar con la mano, perfectas para que el bebé coma solo.', NULL,
  '{almuerzo,cena}'::text[], '{preescolar}'::text[], '30'::int, '3'::int, '{gluten,huevo}'::text[],
  '185'::numeric, '22.0'::numeric, '10.0'::numeric, '6.0'::numeric, '1.2'::numeric,
  '[{"id": 1, "nombre": "Pechuga de pollo", "unidad": "g", "cantidad": 200, "calorias_por_100g": 165}, {"id": 2, "nombre": "Pan rallado", "unidad": "g", "cantidad": 60, "calorias_por_100g": 395}, {"id": 3, "nombre": "Huevo", "unidad": "unidad", "cantidad": 1, "calorias_por_100g": 155}, {"id": 4, "nombre": "Limón", "unidad": "unidad", "cantidad": 0.5, "calorias_por_100g": 29}, {"id": 5, "nombre": "Aceite de oliva", "unidad": "ml", "cantidad": 10, "calorias_por_100g": 884}]'::jsonb,
  '[{"orden": 1, "descripcion": "Precalentar el horno a 200°C. Cortar el pollo en escalopas finas de 1cm.", "duracion_min": 5}, {"orden": 2, "descripcion": "Pasar cada pieza primero por huevo batido y luego por pan rallado, presionando bien.", "duracion_min": 8}, {"orden": 3, "descripcion": "Colocar en fuente con aceite de oliva y hornear 10 minutos por lado hasta dorar.", "duracion_min": 20}, {"orden": 4, "descripcion": "Dejar entibiar y cortar en trozos pequeños o servir enteras para finger food.", "duracion_min": 3}]'::jsonb,
  '{mexico,proteinas,peru,horno,argentina,sin-lactosa,latam,colombia,finger-food,chile,venezuela,crujiente}'::text[], 'f'::boolean, 't'::boolean, '2026-04-05 05:38:22.186337+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  'a6753742-2637-43e6-8e52-918ae936c3db'::uuid, 'omelette-espinaca-queso', 'Omelette de Espinaca y Queso', 'Omelette tierno y nutritivo. Excelente fuente de proteínas, calcio y hierro. Textura perfecta para bebés que ya manejan trozos blandos.', NULL,
  '{desayuno,almuerzo}'::text[], '{preescolar}'::text[], '10'::int, '1'::int, '{huevo,lacteos}'::text[],
  '175'::numeric, '13.0'::numeric, '2.5'::numeric, '12.5'::numeric, '2.2'::numeric,
  '[{"id": 1, "nombre": "Huevo", "unidad": "unidad", "cantidad": 2, "calorias_por_100g": 155}, {"id": 2, "nombre": "Espinaca fresca", "unidad": "g", "cantidad": 40, "calorias_por_100g": 23}, {"id": 3, "nombre": "Queso rallado", "unidad": "g", "cantidad": 20, "calorias_por_100g": 402}, {"id": 4, "nombre": "Aceite de oliva", "unidad": "ml", "cantidad": 5, "calorias_por_100g": 884}]'::jsonb,
  '[{"orden": 1, "descripcion": "Picar la espinaca muy finamente o saltearla 2 minutos para ablandarla.", "duracion_min": 2}, {"orden": 2, "descripcion": "Batir los huevos en un bol y agregar la espinaca y el queso rallado. Mezclar.", "duracion_min": 2}, {"orden": 3, "descripcion": "Calentar aceite en sartén a fuego medio-bajo. Volcar la mezcla y cocinar tapado 4 minutos.", "duracion_min": 4}, {"orden": 4, "descripcion": "Doblar el omelette a la mitad y servir cortado en trozos pequeños para el bebé.", "duracion_min": 1}]'::jsonb,
  '{rapido,chile,venezuela,calcio,mexico,sin-gluten,hierro,proteinas,peru,argentina,latam,colombia}'::text[], 'f'::boolean, 't'::boolean, '2026-04-05 05:38:22.186337+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  'ad65c764-1c69-43c1-b6ce-5a065877cfd7'::uuid, 'pancitos-banana-avena', 'Pancitos de Banana y Avena', 'Pancitos sin azúcar hechos con banana y avena. Dulces naturalmente, perfectos para el desayuno o merienda. Ideal para finger food.', NULL,
  '{desayuno,snack}'::text[], '{transicion,preescolar}'::text[], '20'::int, '8'::int, '{gluten,huevo}'::text[],
  '95'::numeric, '2.5'::numeric, '16.0'::numeric, '2.5'::numeric, '0.8'::numeric,
  '[{"id": 1, "nombre": "Banana madura", "unidad": "unidad", "cantidad": 2, "calorias_por_100g": 89}, {"id": 2, "nombre": "Avena fina", "unidad": "g", "cantidad": 100, "calorias_por_100g": 389}, {"id": 3, "nombre": "Huevo", "unidad": "unidad", "cantidad": 1, "calorias_por_100g": 155}, {"id": 4, "nombre": "Canela", "unidad": "pizca", "cantidad": 1, "calorias_por_100g": 247}]'::jsonb,
  '[{"orden": 1, "descripcion": "Precalentar el horno a 180°C. Machacar las bananas con un tenedor hasta obtener puré.", "duracion_min": 3}, {"orden": 2, "descripcion": "Mezclar el puré de banana con la avena, el huevo y la canela hasta formar masa.", "duracion_min": 2}, {"orden": 3, "descripcion": "Formar bolitas del tamaño de una nuez y aplanarlas levemente sobre papel de horno.", "duracion_min": 5}, {"orden": 4, "descripcion": "Hornear 12 minutos hasta que estén dorados. Dejar enfriar antes de dar al bebé.", "duracion_min": 12}]'::jsonb,
  '{mexico,vegano-adaptable,peru,argentina,sin-lactosa,latam,dulce-natural,colombia,sin-azucar,finger-food,chile,venezuela}'::text[], 'f'::boolean, 't'::boolean, '2026-04-05 05:38:22.186337+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '3ff24f4b-a2ec-445e-8b78-92813dfe9a08'::uuid, 'papilla-avena-banana', 'Papilla de Avena con Banana', 'Papilla nutritiva y saciante con avena y banana. Aporte de energía y fibra ideal para el desayuno del bebé.', NULL,
  '{desayuno}'::text[], '{inicio}'::text[], '10'::int, '1'::int, '{gluten}'::text[],
  '120'::numeric, '3.5'::numeric, '22.0'::numeric, '2.1'::numeric, '1.2'::numeric,
  '[{"id": 1, "nombre": "Avena fina", "unidad": "g", "cantidad": 30, "calorias_por_100g": 389}, {"id": 2, "nombre": "Banana madura", "unidad": "g", "cantidad": 60, "calorias_por_100g": 89}, {"id": 3, "nombre": "Agua o leche de fórmula", "unidad": "ml", "cantidad": 120, "calorias_por_100g": 0}]'::jsonb,
  '[{"orden": 1, "descripcion": "Calentar el agua o leche de fórmula en una ollita pequeña.", "duracion_min": 2}, {"orden": 2, "descripcion": "Agregar la avena y cocinar revolviendo constantemente por 5 minutos hasta que espese.", "duracion_min": 5}, {"orden": 3, "descripcion": "Apagar el fuego y agregar la banana pisada con un tenedor. Mezclar bien.", "duracion_min": 1}]'::jsonb,
  '{chile,venezuela,energia,mexico,desayuno-rapido,fibra,peru,argentina,sin-lactosa,latam,colombia}'::text[], 'f'::boolean, 't'::boolean, '2026-04-05 05:38:22.186337+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '53d88067-1f15-4ede-8fd5-c6f656bb362d'::uuid, 'pasta-salsa-tomate', 'Pasta con Salsa de Tomate Casera', 'Pasta corta con salsa suave de tomate natural. Un clásico adaptado para bebés, sin sal añadida y con verduras escondidas.', NULL,
  '{almuerzo,cena}'::text[], '{preescolar}'::text[], '25'::int, '2'::int, '{gluten}'::text[],
  '195'::numeric, '6.5'::numeric, '38.0'::numeric, '2.5'::numeric, '1.5'::numeric,
  '[{"id": 1, "nombre": "Pasta corta (fideos, moñitos)", "unidad": "g", "cantidad": 80, "calorias_por_100g": 371}, {"id": 2, "nombre": "Tomate perita", "unidad": "g", "cantidad": 200, "calorias_por_100g": 18}, {"id": 3, "nombre": "Zanahoria", "unidad": "g", "cantidad": 50, "calorias_por_100g": 41}, {"id": 4, "nombre": "Ajo", "unidad": "diente", "cantidad": 1, "calorias_por_100g": 149}, {"id": 5, "nombre": "Aceite de oliva", "unidad": "ml", "cantidad": 10, "calorias_por_100g": 884}]'::jsonb,
  '[{"orden": 1, "descripcion": "Cocinar el tomate, zanahoria y ajo en aceite de oliva a fuego bajo 15 minutos hasta que ablanden.", "duracion_min": 15}, {"orden": 2, "descripcion": "Procesar la salsa con mixer hasta que quede suave. Dejar en la sartén a fuego mínimo.", "duracion_min": 3}, {"orden": 3, "descripcion": "Hervir la pasta en agua sin sal hasta que esté bien cocida (al dente no aplica para bebés).", "duracion_min": 12}, {"orden": 4, "descripcion": "Mezclar la pasta con la salsa. Cortar en trozos pequeños si es necesario.", "duracion_min": 2}]'::jsonb,
  '{mexico,vegano,peru,carbohidratos,argentina,sin-lactosa,latam,colombia,almuerzo-completo,chile,venezuela}'::text[], 'f'::boolean, 't'::boolean, '2026-04-05 05:38:22.186337+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  'bb4d05dc-e5ec-43f3-b881-c98f57ad2794'::uuid, 'polenta-cremosa-queso', 'Polenta cremosa con queso', 'La polenta es un básico de la cocina argentina con herencia italiana. Rápida, nutritiva y con textura perfecta para bebés.', NULL,
  '{almuerzo,cena}'::text[], '{transicion,preescolar}'::text[], '15'::int, '1'::int, '{leche}'::text[],
  NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric,
  '[{"nombre": "Polenta instantánea", "unidad": "g", "cantidad": 60}, {"nombre": "Leche entera", "unidad": "ml", "cantidad": 150}, {"nombre": "Agua", "unidad": "ml", "cantidad": 200}, {"nombre": "Queso crema", "unidad": "g", "cantidad": 30}, {"nombre": "Aceite de girasol", "unidad": "ml", "cantidad": 5}]'::jsonb,
  '["Llevar el agua con la leche y el aceite a punto de hervor en una olla mediana.", "Agregar la polenta en forma de lluvia, revolviendo constantemente para evitar grumos.", "Cocinar 5 minutos a fuego bajo sin dejar de revolver hasta que espese.", "Retirar del fuego e incorporar el queso crema. Mezclar hasta derretir. Servir tibia."]'::jsonb,
  '{argentina}'::text[], 'f'::boolean, 't'::boolean, '2026-04-27 20:13:00.42955+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  'fdd9c984-d8c9-499f-a967-508572c20965'::uuid, 'pollo-pure-papas', 'Pollo Desmechado con Puré de Papas', 'Combinación clásica y nutritiva: pollo tierno con puré suave. Alto en proteínas para el desarrollo muscular del bebé.', NULL,
  '{almuerzo,cena}'::text[], '{transicion}'::text[], '35'::int, '2'::int, '{}'::text[],
  '165'::numeric, '18.5'::numeric, '15.0'::numeric, '3.2'::numeric, '1.0'::numeric,
  '[{"id": 1, "nombre": "Pechuga de pollo", "unidad": "g", "cantidad": 120, "calorias_por_100g": 165}, {"id": 2, "nombre": "Papa", "unidad": "g", "cantidad": 200, "calorias_por_100g": 77}, {"id": 3, "nombre": "Aceite de oliva", "unidad": "ml", "cantidad": 8, "calorias_por_100g": 884}, {"id": 4, "nombre": "Caldo de pollo bajo en sodio", "unidad": "ml", "cantidad": 200, "calorias_por_100g": 5}]'::jsonb,
  '[{"orden": 1, "descripcion": "Hervir la pechuga en el caldo con agua por 25 minutos hasta que esté cocida por completo.", "duracion_min": 25}, {"orden": 2, "descripcion": "Mientras tanto, pelar y hervir las papas por 20 minutos hasta que estén blandas.", "duracion_min": 20}, {"orden": 3, "descripcion": "Desmechar el pollo con dos tenedores hasta obtener fibras finas.", "duracion_min": 3}, {"orden": 4, "descripcion": "Hacer puré de papas con aceite de oliva. Servir el pollo encima o mezclado.", "duracion_min": 3}]'::jsonb,
  '{venezuela,mexico,sin-gluten,proteinas,peru,argentina,sin-lactosa,latam,colombia,almuerzo-completo,chile}'::text[], 't'::boolean, 't'::boolean, '2026-04-05 05:38:22.186337+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  'd955c1f6-4135-4d36-8f3b-61c8f0d9db2f'::uuid, 'pure-batata', 'Puré de Batata Dulce', 'Puré dulce y cremoso de batata, rico en vitamina C y potasio. De los favoritos entre los bebés por su sabor naturalmente dulce.', NULL,
  '{almuerzo,cena}'::text[], '{inicio,transicion}'::text[], '25'::int, '2'::int, '{}'::text[],
  '86'::numeric, '1.6'::numeric, '20.0'::numeric, '0.1'::numeric, '0.6'::numeric,
  '[{"id": 1, "nombre": "Batata (camote)", "unidad": "g", "cantidad": 250, "calorias_por_100g": 86}, {"id": 2, "nombre": "Aceite de oliva", "unidad": "ml", "cantidad": 5, "calorias_por_100g": 884}]'::jsonb,
  '[{"orden": 1, "descripcion": "Lavar, pelar y cortar la batata en cubos de 2cm.", "duracion_min": 5}, {"orden": 2, "descripcion": "Cocinar al vapor por 20 minutos hasta que esté muy blanda.", "duracion_min": 20}, {"orden": 3, "descripcion": "Machacar con tenedor o mixer. Agregar unas gotas de aceite de oliva y mezclar.", "duracion_min": 2}]'::jsonb,
  '{venezuela,mexico,sin-gluten,vegano,peru,argentina,primer-alimento,sin-lactosa,vitamina-c,latam,colombia,chile}'::text[], 'f'::boolean, 't'::boolean, '2026-04-05 05:38:22.186337+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '5c1c4295-9fc3-4f95-a6ba-ddfb27e16b1b'::uuid, 'pure-zapallo-zanahoria', 'Puré de Zapallo y Zanahoria', 'Primer puré suave y dulce, rico en vitamina A y betacaroteno. Perfecto para las primeras semanas de alimentación complementaria.', NULL,
  '{almuerzo,cena}'::text[], '{inicio}'::text[], '20'::int, '2'::int, '{}'::text[],
  '45'::numeric, '1.2'::numeric, '10.5'::numeric, '0.3'::numeric, '0.8'::numeric,
  '[{"id": 1, "nombre": "Zapallo", "unidad": "g", "cantidad": 150, "calorias_por_100g": 26}, {"id": 2, "nombre": "Zanahoria", "unidad": "g", "cantidad": 80, "calorias_por_100g": 41}, {"id": 3, "nombre": "Agua", "unidad": "ml", "cantidad": 200, "calorias_por_100g": 0}]'::jsonb,
  '[{"orden": 1, "descripcion": "Pelar y cortar el zapallo y la zanahoria en cubos medianos.", "duracion_min": 5}, {"orden": 2, "descripcion": "Hervir o cocinar al vapor hasta que estén muy blandos, aproximadamente 15 minutos.", "duracion_min": 15}, {"orden": 3, "descripcion": "Procesar con mixer hasta obtener una textura muy suave. Agregar agua de cocción si quedó espeso.", "duracion_min": 2}]'::jsonb,
  '{chile,venezuela,mexico,sin-gluten,vegano,vitamina-a,peru,argentina,primer-alimento,sin-lactosa,latam,colombia}'::text[], 'f'::boolean, 't'::boolean, '2026-04-05 05:38:22.186337+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '986cecce-cba8-4a6d-9e3c-117df13bcdce'::uuid, 'quesadilla-frijoles-queso', 'Quesadilla de frijoles y queso', 'El antojo mexicano más popular en versión bebé. Tortilla de maíz con frijoles refritos y queso derretido, fácil de sostener con las manos.', NULL,
  '{almuerzo,cena,snack}'::text[], '{preescolar}'::text[], '10'::int, '1'::int, '{leche}'::text[],
  NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric,
  '[{"nombre": "Tortilla de maíz pequeña", "unidad": "g", "cantidad": 60}, {"nombre": "Frijoles refritos", "unidad": "g", "cantidad": 60}, {"nombre": "Queso Oaxaca o manchego rallado", "unidad": "g", "cantidad": 40}]'::jsonb,
  '["Calentar la tortilla en sartén antiadherente a fuego medio durante 1 minuto por lado.", "Extender los frijoles refritos sobre media tortilla. Agregar el queso rallado encima.", "Doblar la tortilla por la mitad. Dorar 2 minutos por cada lado hasta que el queso se derrita.", "Enfriar completamente antes de servir. Cortar en tiras para facilitar el agarre."]'::jsonb,
  '{mexico}'::text[], 'f'::boolean, 't'::boolean, '2026-04-27 20:13:00.42955+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '40ab56fe-06ab-48c3-8509-92ab8a68b6e2'::uuid, 'sopa-fideos-seca', 'Sopa de fideos seca', 'Clásico mexicano que ningún niño rechaza. Fideos dorados y cocidos en salsa de tomate casera. El almuerzo favorito de México.', NULL,
  '{almuerzo,cena}'::text[], '{transicion,preescolar}'::text[], '20'::int, '1'::int, '{gluten}'::text[],
  NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric,
  '[{"nombre": "Fideos cortos delgados", "unidad": "g", "cantidad": 80}, {"nombre": "Tomate maduro", "unidad": "g", "cantidad": 150}, {"nombre": "Cebolla", "unidad": "g", "cantidad": 30}, {"nombre": "Caldo de pollo bajo en sodio", "unidad": "ml", "cantidad": 200}, {"nombre": "Aceite vegetal", "unidad": "ml", "cantidad": 10}]'::jsonb,
  '["Licuar el tomate con la cebolla hasta obtener una salsa homogénea. Reservar.", "Calentar el aceite a fuego medio. Dorar los fideos revolviendo constantemente hasta que estén levemente tostados.", "Verter la salsa de tomate y el caldo. Mezclar bien.", "Tapar y cocinar a fuego bajo 15 minutos hasta que el caldo se absorba y los fideos estén suaves."]'::jsonb,
  '{mexico}'::text[], 'f'::boolean, 't'::boolean, '2026-04-27 20:13:00.42955+00'::timestamptz, NULL
) on conflict (id) do nothing;

insert into public.recetas (id, slug, nombre, descripcion, imagen_url, momento_dia, etapas_compatibles, tiempo_preparacion, porciones_base, alergenos, calorias, proteinas, carbohidratos, grasas, hierro, ingredientes, pasos, tags, es_premium, activa, created_at, video_url) values (
  '652abff7-d2d5-4708-b010-baf4a2025150'::uuid, 'yogur-durazno-avena', 'Yogur con Durazno y Avena', 'Merienda cremosa y rápida. El yogur aporta calcio y probióticos, el durazno vitaminas y la avena fibra para una digestión saludable.', NULL,
  '{desayuno,snack}'::text[], '{transicion,preescolar}'::text[], '5'::int, '1'::int, '{lacteos,gluten}'::text[],
  '115'::numeric, '5.5'::numeric, '18.0'::numeric, '2.0'::numeric, '0.5'::numeric,
  '[{"id": 1, "nombre": "Yogur natural entero sin azúcar", "unidad": "g", "cantidad": 120, "calorias_por_100g": 61}, {"id": 2, "nombre": "Durazno maduro", "unidad": "g", "cantidad": 80, "calorias_por_100g": 39}, {"id": 3, "nombre": "Avena fina", "unidad": "g", "cantidad": 15, "calorias_por_100g": 389}]'::jsonb,
  '[{"orden": 1, "descripcion": "Pelar y picar el durazno en trozos pequeños o aplastarlo con un tenedor.", "duracion_min": 2}, {"orden": 2, "descripcion": "Mezclar el yogur con el durazno y la avena en un bowl.", "duracion_min": 1}, {"orden": 3, "descripcion": "Dejar reposar 2 minutos para que la avena se hidrate un poco. Servir frío.", "duracion_min": 2}]'::jsonb,
  '{venezuela,calcio,mexico,probioticos,peru,frutas,argentina,latam,colombia,sin-coccion,rapido,chile}'::text[], 'f'::boolean, 't'::boolean, '2026-04-05 05:38:22.186337+00'::timestamptz, NULL
) on conflict (id) do nothing;
