-- ============================================================
-- Yummi Glu Glu — Fase 11: método de alimentación (papilla vs BLW/BLISS)
-- ============================================================
--
-- 🎯 EL AGUJERO QUE CIERRA (medido el 2026-09-04, no supuesto)
--
-- De las 68 recetas activas de la etapa `inicio` (6–11 meses):
--
--   59 de 68  tienen nombre de papilla / puré / crema / compota
--    4 de 68  son bebidas (atoles, mate de leche)
--    3 de 68  son finger food de verdad… y las TRES son `snack`
--
-- O sea: un bebé de 8 meses que rechaza la cuchara —que es común y normal—
-- hoy no tiene NADA para almorzar ni cenar en esta app. El hallazgo vino de
-- feedback de usuarias reales en grupos de Facebook, no de una hipótesis.
--
-- ============================================================
-- 🔴 POR QUÉ BLISS Y NO "BLW" A SECAS — ESTO ES SEGURIDAD, NO TAXONOMÍA
-- ============================================================
--
-- BLW (Baby-Led Weaning) es el concepto popular: el bebé se autoalimenta con
-- trozos enteros desde los ~6 meses. Tiene dos críticas documentadas y serias:
-- **déficit de hierro** (las reservas del bebé se agotan a esa edad, y los
-- trozos aportan menos que una papilla fortificada) y **atragantamiento**.
--
-- BLISS (Baby-Led Introduction to SolidS, Universidad de Otago) es BLW
-- corregido con evidencia. Suma tres reglas a CADA comida:
--
--   1. Un alimento alto en HIERRO
--   2. Un alimento alto en ENERGÍA
--   3. NINGÚN alimento que sea riesgo de atragantamiento
--
-- Por eso `forma_servido` y `nota_seguridad` no son campos decorativos y NO
-- son un tag: son la diferencia entre una receta útil y una peligrosa. Y por
-- eso hay un CHECK que los EXIGE (constraint `recetas_blw_exige_seguridad`,
-- más abajo). La base no deja marcar una receta como BLW sin decir cómo se
-- corta y qué vigilar. Un panel admin se puede completar a las 2 de la mañana
-- con sueño; una constraint no se cansa.
--
-- ============================================================
-- 🧩 POR QUÉ `metodo` ES UN ARRAY Y NO UN VALOR ÚNICO
-- ============================================================
--
-- Porque la MISMA comida sirve para los dos métodos, y esto no es teoría:
--
--   "Puré de brócoli y papa"   -> arbolitos de brócoli al vapor (el brócoli
--                                 es EL alimento BLW canónico: trae mango)
--   "Puré de batata dulce"     -> bastones de batata al horno
--   "Puré de zanahoria y papa" -> bastones de zanahoria al vapor
--   "Puré de palta y plátano"  -> tiras de palta y de plátano
--
-- 61 de las 68 recetas de `inicio` tienen solo 2 o 3 ingredientes, y las de 2
-- son literalmente una verdura sola aplastada. Con un valor único habría que
-- DUPLICAR la receta para servirla de las dos formas: dos filas, dos
-- imágenes, dos videos, dos favoritos distintos para la misma comida.
--
-- ⚠️ Pero NO todas se convierten, así que esto se cura receta por receta y
-- jamás con un UPDATE masivo. "Puré de banana con yogur" no se agarra con la
-- mano; la chirimoya es resbalosa y tiene pepas. El backfill de abajo deja
-- TODO en 'papilla' a propósito: marcar una receta como apta para BLW es una
-- decisión humana, una por una.
-- ============================================================


-- ─── 1. Columnas nuevas en `recetas` ──────────────────────────
--
-- Se agregan como NOT NULL con default para que las 207 filas existentes
-- queden en `{papilla}` sin necesidad de un UPDATE aparte: es exactamente el
-- estado real de hoy y mantiene la app igual que antes de esta migración.

alter table public.recetas
  add column if not exists metodo text[] not null default array['papilla']::text[],
  add column if not exists forma_servido text,
  add column if not exists nota_seguridad text;

comment on column public.recetas.metodo is
  'Métodos de alimentación para los que sirve la receta: papilla y/o blw. Una receta puede servir para ambos (misma comida, distinta preparación final).';

comment on column public.recetas.forma_servido is
  'BLW: cómo se corta y presenta. Obligatorio si metodo contiene blw. Ej: "Bastones de 8 cm, del grosor de un dedo adulto".';

comment on column public.recetas.nota_seguridad is
  'BLW: advertencia de atragantamiento y prueba de textura. Obligatorio si metodo contiene blw. Ej: "Debe aplastarse entre dos dedos sin esfuerzo. Nunca dejes al bebé solo mientras come."';


-- ─── 2. CHECK: valores válidos ────────────────────────────────
--
-- `cardinality()` y NO `array_length()`: con un array vacío `array_length`
-- devuelve NULL, un CHECK que da NULL **pasa**, y `metodo = '{}'` se colaría
-- entero. `cardinality('{}')` devuelve 0 y la constraint lo rechaza. Es la
-- clase de detalle que no falla en dev y aparece meses después con datos raros.

alter table public.recetas
  drop constraint if exists recetas_metodo_valido;

alter table public.recetas
  add constraint recetas_metodo_valido
  check (
    cardinality(metodo) >= 1
    and metodo <@ array['papilla', 'blw']::text[]
  );


-- ─── 3. CHECK: BLW EXIGE los datos de seguridad ───────────────
--
-- 🔴 Esta es la constraint que importa de toda la migración.
--
-- Si `metodo` contiene 'blw', `forma_servido` y `nota_seguridad` tienen que
-- existir y no pueden ser strings vacíos. No hay forma de cargar una receta
-- BLW sin decirle al padre cómo cortarla y qué vigilar.
--
-- ⚠️ Aplica también a recetas con `activa = false`. Es a propósito: un
-- borrador incompleto se guarda dejando `metodo` en `{papilla}` y recién se
-- suma 'blw' cuando la información de seguridad está escrita.

alter table public.recetas
  drop constraint if exists recetas_blw_exige_seguridad;

alter table public.recetas
  add constraint recetas_blw_exige_seguridad
  check (
    not ('blw' = any(metodo))
    or (
      forma_servido is not null and btrim(forma_servido) <> ''
      and nota_seguridad is not null and btrim(nota_seguridad) <> ''
    )
  );


-- ─── 4. Índice GIN ────────────────────────────────────────────
-- Mismo patrón que `etapas_compatibles`, `momento_dia`, `alergenos` y `tags`:
-- el store filtra con `.contains('metodo', [...])`, que en PostgREST se
-- traduce al operador `@>`, y GIN es el índice que ese operador usa.

create index if not exists idx_recetas_metodo
  on public.recetas using gin (metodo);


-- ─── 5. Preferencia por perfil de hijo ────────────────────────
--
-- Va en el PERFIL DEL HIJO, no en la cuenta: un hermano de 8 meses puede
-- estar en BLW y el de 3 años comer de todo. Y el mismo bebé cambia de método
-- con el tiempo — esto no es una preferencia de la app, es un dato del niño.
--
-- Default 'ambos' para que NADA cambie para los usuarios que ya están
-- instalados: siguen viendo el catálogo completo tal cual lo ven hoy.

alter table public.perfiles_hijos
  add column if not exists preferencia_metodo text not null default 'ambos';

alter table public.perfiles_hijos
  drop constraint if exists perfiles_hijos_preferencia_metodo_valida;

alter table public.perfiles_hijos
  add constraint perfiles_hijos_preferencia_metodo_valida
  check (preferencia_metodo in ('papilla', 'blw', 'ambos'));

comment on column public.perfiles_hijos.preferencia_metodo is
  'Método de alimentación del niño: papilla, blw o ambos. Filtra el catálogo por defecto. Default ambos = comportamiento histórico.';


-- ─── 6. La vista `recetas_teaser` DEBE exponer los campos nuevos ──
--
-- 🔴 EL CLIENTE LEE DE LA VISTA, NO DE LA TABLA (`useRecetasStore`,
-- `app/receta/[id].tsx`). Si las columnas se agregan a `recetas` y no acá, el
-- filtro por método devuelve vacío **sin ningún error**: PostgREST no conoce
-- la columna en la vista y el `.contains()` no matchea nada. Fallo silencioso.
--
-- Se usa CREATE OR REPLACE (no DROP + CREATE) a propósito: preserva los grants
-- y el `security_invoker = false`. Postgres exige que las columnas viejas
-- queden en el mismo orden y con el mismo tipo, y solo permite AGREGAR al
-- final — por eso las tres nuevas van después de `video_url`.
--
-- ⚠️ `security_invoker` sigue en FALSE a propósito. La vista necesita leer
-- `suscripciones` y `desbloqueos_temporales` para decidir si muestra el video,
-- y con invoker la RLS de esas tablas la bloquearía. Ver CLAUDE.md.

create or replace view public.recetas_teaser as
  select
    r.id,
    r.slug,
    r.nombre,
    r.descripcion,
    r.imagen_url,
    r.momento_dia,
    r.etapas_compatibles,
    r.tiempo_preparacion,
    r.porciones_base,
    r.alergenos,
    r.tags,
    r.es_premium,
    r.activa,
    r.created_at,
    r.ingredientes,
    r.pasos,
    r.calorias,
    r.proteinas,
    r.carbohidratos,
    r.grasas,
    r.hierro,
    case
      when r.es_premium = false
        or r.video_url is null
        or exists (
          select 1 from public.suscripciones s
          where s.user_id = auth.uid()
            and s.plan = any (array['premium'::text, 'premium_anual'::text])
            and s.activa = true
        )
        or exists (
          select 1 from public.desbloqueos_temporales d
          where d.user_id = auth.uid()
            and d.receta_id = r.id
            and d.expires_at > now()
        )
      then r.video_url
      else null::text
    end as video_url,
    -- ↓ columnas nuevas de la Fase 11 (siempre visibles: el contenido de
    --   receta es free, solo el video se gatea)
    r.metodo,
    r.forma_servido,
    r.nota_seguridad
  from public.recetas r
  where r.activa = true;


-- ─── 7. Grants: reafirmar y no confiar ────────────────────────
--
-- CREATE OR REPLACE VIEW no debería tocar los grants, pero acá ya hubo una
-- vulnerabilidad por grants de escritura en esta misma vista (migración 038,
-- auditoría del 2026-08-24: `DELETE` como `anon` borraba las 207 recetas).
-- Reafirmar es barato; asumir salió caro una vez.

revoke all privileges on public.recetas_teaser from anon;
revoke all privileges on public.recetas_teaser from authenticated;
grant select on public.recetas_teaser to authenticated;


-- ============================================================
-- ✅ VERIFICACIÓN — correr DESPUÉS de aplicar. Los 4 chequeos.
-- ============================================================
--
-- 1) Grants: debe devolver EXACTAMENTE una fila -> authenticated | SELECT
--
--    select grantee, privilege_type
--    from information_schema.role_table_grants
--    where table_schema = 'public' and table_name = 'recetas_teaser'
--      and grantee in ('anon', 'authenticated');
--
-- 2) La vista NO debe ser security_invoker (reloptions sin invoker=true):
--
--    select reloptions from pg_class where relname = 'recetas_teaser';
--
-- 3) Las 3 columnas nuevas tienen que estar EN LA VISTA, no solo en la tabla:
--
--    select column_name from information_schema.columns
--    where table_schema = 'public' and table_name = 'recetas_teaser'
--      and column_name in ('metodo', 'forma_servido', 'nota_seguridad');
--    -- 3 filas
--
-- 4) La constraint de seguridad tiene que RECHAZAR esto:
--
--    begin;
--      update public.recetas set metodo = array['papilla', 'blw']
--      where id = (select id from public.recetas limit 1);
--      -- debe fallar: recetas_blw_exige_seguridad
--    rollback;
-- ============================================================
