-- 027_rebalancear_tags_pais.sql
-- Fecha: 2026-07-20
--
-- QUÉ HACE
-- Reclasifica los tags de país (chile, peru, colombia, venezuela, argentina, mexico)
-- de 66 recetas: las 56 que hoy tienen los 6 tags ("universales") y las 10 que no
-- tienen ninguno. Las otras 141 recetas (mono-país, identificadas por slug/nombre)
-- NO se tocan.
--
-- POR QUÉ
-- El filtro por país de la app (store/useRecetasStore.ts) muestra una receta si tiene
-- el tag del país elegido O si tiene los 6. Con 56 universales, cambiar de país movía
-- el contador apenas y el 80% de la lista quedaba idéntica: en etapa 'transicion',
-- Chile daba 36 recetas y Perú 37, compartiendo 29. El filtro "se sentía roto".
--
-- CRITERIO
--   * Universal (6 tags): preparaciones básicas de alimentación complementaria sin
--     identidad nacional (purés simples, compotas, papillas de cereal). Quedan 19.
--   * Compartida (2-4 países): platos que existen genuinamente en varias cocinas.
--     Se usa el ingrediente/nombre como señal (palta vs aguacate, batata vs camote,
--     porotos vs frijoles, choclo vs elote, desmechado, panqueca, etc.).
--   * Mono-país: ya estaban bien clasificadas, no se tocan.
--
-- IDEMPOTENTE
-- Para cada slug: se quitan TODOS los tags de país preservando el orden de los tags
-- que no son de país, y se anexa el set nuevo en orden fijo. Re-correr da el mismo
-- resultado. Los tags que no son de país nunca se pierden.

do $$
declare
  v_paises constant text[] := array['chile','peru','colombia','venezuela','argentina','mexico'];
  v_sin_pais integer;
  v_no_encontrados text;
begin

  with reclasificacion(slug, paises) as (values
    -- ── Etapa inicio (y arrastres a transición) ────────────────────────────────
    ('arroz-espinaca',                     array['chile','peru','colombia']),
    ('compota-de-durazno-y-manzana',       array['chile','argentina']),
    ('compota-de-pera-y-manzana',          array['chile','argentina']),
    ('compota-manzana-pera',               array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('crema-de-zapallo-italiano',          array['chile','peru','argentina']),
    ('papilla-avena-banana',               array['colombia','venezuela','argentina','mexico']),
    ('papilla-de-arroz-con-zapallo',       array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('papilla-de-avena-con-manzana',       array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('papilla-de-porotos-con-zapallo',     array['chile','argentina']),
    ('papilla-de-quinoa-con-manzana',      array['chile','peru','colombia','argentina']),
    ('pure-batata',                        array['colombia','venezuela','argentina']),
    ('pure-de-arvejas-con-zapallo',        array['chile','colombia','argentina']),
    ('pure-de-betarraga-y-papa',           array['chile','peru']),
    ('pure-de-brocoli-y-papa',             array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('pure-de-espinaca-con-papa',          array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('pure-de-lentejas-con-zapallo',       array['chile','peru','argentina']),
    ('pure-de-manzana-y-platano',          array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('pure-de-palta-y-platano',            array['chile','peru','argentina']),
    ('pure-de-pescado-con-camote',         array['chile','peru','mexico']),
    ('pure-de-pollo-con-papa-y-zanahoria', array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('pure-de-zanahoria-y-papa',           array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('pure-de-zapallo-y-camote',           array['chile','peru','mexico']),
    ('pure-zapallo-zanahoria',             array['chile','peru','colombia','venezuela','argentina','mexico']),

    -- ── Etapa transición (y arrastres a preescolar) ────────────────────────────
    ('albondigas-de-pollo-al-vapor',       array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('arroz-con-pollo-suave',              array['peru','colombia','venezuela','mexico']),
    ('crepe-de-manzana',                   array['chile','argentina']),
    ('mini-panqueques-de-avena',           array['chile','venezuela','argentina']),
    ('mini-tortilla-de-acelga',            array['chile','argentina']),
    ('muffin-de-platano-y-avena',          array['peru','colombia','venezuela','mexico']),
    ('pancitos-banana-avena',              array['colombia','venezuela','argentina']),
    ('pasta-con-salsa-de-tomate',          array['chile','venezuela','argentina']),
    ('picadillo-de-pollo-con-quinoa',      array['peru','colombia','argentina']),
    ('pollo-pure-papas',                   array['colombia','venezuela']),
    ('pure-rustico-de-choclo',             array['chile','peru','argentina']),
    ('sopita-de-fideos-con-pollo',         array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('yogur-durazno-avena',                array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('guiso-de-lentejas-con-arroz',        array['chile','peru','argentina']),
    ('lentejas-cremosas',                  array['peru','colombia','mexico']),
    ('pastel-de-papas-casero',             array['chile','argentina']),
    ('pollo-al-limon-con-papas',           array['peru','venezuela','mexico']),
    ('sopa-de-pollo-y-fideos',             array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('tallarines-con-pollo-y-verduras',    array['chile','peru','argentina']),
    ('tortilla-espanola-de-papas',         array['chile','venezuela','argentina']),

    -- ── Etapa preescolar ───────────────────────────────────────────────────────
    ('arroz-con-leche',                    array['chile','colombia','venezuela','mexico']),
    ('arroz-primavera-con-pollo',          array['peru','colombia','venezuela','mexico']),
    ('budin-de-zapallo',                   array['chile','peru','argentina']),
    ('ensalada-de-quinoa-y-palta',         array['chile','peru','colombia']),
    ('ensalada-mixta-con-atun',            array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('merluza-al-horno-con-pure',          array['chile','peru','argentina']),
    ('milanesas-pollo-horno',              array['chile','peru','venezuela']),
    ('omelette-espinaca-queso',            array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('pasta-salsa-tomate',                 array['chile','venezuela','argentina']),
    ('pollo-al-coco-suave',                array['peru','colombia','venezuela','mexico']),
    ('pollo-al-horno-con-papas',           array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('quinoto-de-verduras',                array['chile','peru','colombia','argentina']),
    ('tortilla-de-espinaca-y-queso',       array['chile','venezuela','argentina']),

    -- ── Las 10 que no tenían ningún tag de país (repostería / snacks) ──────────
    ('bocaditos-batata-horno',             array['colombia','venezuela','argentina']),
    ('bocaditos-manzana-avena-canela',     array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('bolitas-energeticas-datiles-avena',  array['chile','argentina','mexico']),
    ('galletitas-avena-miel-canela',       array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('galletitas-clasicas-avena-platano',  array['peru','colombia','venezuela','mexico']),
    ('galletitas-coco-limon',              array['colombia','venezuela','mexico']),
    ('galletitas-platano-avena-3-ing',     array['peru','colombia','venezuela','mexico']),
    ('galletitas-zanahoria-datiles',       array['peru','argentina','mexico']),
    ('galletitas-zanahoria-manzana',       array['chile','peru','colombia','venezuela','argentina','mexico']),
    ('tortitas-zapallo-horno',             array['chile','peru','argentina'])
  )
  update public.recetas r
  set tags = coalesce(
      -- tags que NO son de país, en su orden original
      (
        select array_agg(u.tag order by u.ord)
        from unnest(r.tags) with ordinality as u(tag, ord)
        where not (u.tag = any(v_paises))
      ),
      array[]::text[]
    ) || rc.paises
  from reclasificacion rc
  where r.slug = rc.slug;

  -- Guard 1: ningún slug de la reclasificación quedó sin matchear en la tabla.
  with reclasificacion(slug) as (values
    ('arroz-espinaca'),('compota-de-durazno-y-manzana'),('compota-de-pera-y-manzana'),
    ('compota-manzana-pera'),('crema-de-zapallo-italiano'),('papilla-avena-banana'),
    ('papilla-de-arroz-con-zapallo'),('papilla-de-avena-con-manzana'),
    ('papilla-de-porotos-con-zapallo'),('papilla-de-quinoa-con-manzana'),('pure-batata'),
    ('pure-de-arvejas-con-zapallo'),('pure-de-betarraga-y-papa'),('pure-de-brocoli-y-papa'),
    ('pure-de-espinaca-con-papa'),('pure-de-lentejas-con-zapallo'),('pure-de-manzana-y-platano'),
    ('pure-de-palta-y-platano'),('pure-de-pescado-con-camote'),
    ('pure-de-pollo-con-papa-y-zanahoria'),('pure-de-zanahoria-y-papa'),
    ('pure-de-zapallo-y-camote'),('pure-zapallo-zanahoria'),('albondigas-de-pollo-al-vapor'),
    ('arroz-con-pollo-suave'),('crepe-de-manzana'),('mini-panqueques-de-avena'),
    ('mini-tortilla-de-acelga'),('muffin-de-platano-y-avena'),('pancitos-banana-avena'),
    ('pasta-con-salsa-de-tomate'),('picadillo-de-pollo-con-quinoa'),('pollo-pure-papas'),
    ('pure-rustico-de-choclo'),('sopita-de-fideos-con-pollo'),('yogur-durazno-avena'),
    ('guiso-de-lentejas-con-arroz'),('lentejas-cremosas'),('pastel-de-papas-casero'),
    ('pollo-al-limon-con-papas'),('sopa-de-pollo-y-fideos'),('tallarines-con-pollo-y-verduras'),
    ('tortilla-espanola-de-papas'),('arroz-con-leche'),('arroz-primavera-con-pollo'),
    ('budin-de-zapallo'),('ensalada-de-quinoa-y-palta'),('ensalada-mixta-con-atun'),
    ('merluza-al-horno-con-pure'),('milanesas-pollo-horno'),('omelette-espinaca-queso'),
    ('pasta-salsa-tomate'),('pollo-al-coco-suave'),('pollo-al-horno-con-papas'),
    ('quinoto-de-verduras'),('tortilla-de-espinaca-y-queso'),('bocaditos-batata-horno'),
    ('bocaditos-manzana-avena-canela'),('bolitas-energeticas-datiles-avena'),
    ('galletitas-avena-miel-canela'),('galletitas-clasicas-avena-platano'),
    ('galletitas-coco-limon'),('galletitas-platano-avena-3-ing'),
    ('galletitas-zanahoria-datiles'),('galletitas-zanahoria-manzana'),('tortitas-zapallo-horno')
  )
  select string_agg(rc.slug, ', ')
  into v_no_encontrados
  from reclasificacion rc
  where not exists (select 1 from public.recetas r where r.slug = rc.slug);

  if v_no_encontrados is not null then
    raise exception 'Slugs de la reclasificación que no existen en recetas: %', v_no_encontrados;
  end if;

  -- Guard 2: ninguna receta puede quedar sin ningún tag de país.
  select count(*) into v_sin_pais
  from public.recetas
  where not (tags && v_paises);

  if v_sin_pais > 0 then
    raise exception 'Quedaron % recetas sin ningún tag de país', v_sin_pais;
  end if;

end $$;
