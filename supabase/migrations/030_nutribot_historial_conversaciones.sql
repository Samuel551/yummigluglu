-- ============================================================
-- NutriBot — historial de conversaciones recuperable
--
-- PROBLEMA QUE ARREGLA:
-- La Edge Function `nutribot` hacía `insert` en `conversaciones_ia` en CADA
-- mensaje, guardando el historial completo de nuevo en cada fila. Eso daba:
--   1. Crecimiento cuadrático (una charla de N turnos guardaba ~N²/2 mensajes).
--   2. Ninguna noción de "conversación": filas sueltas, imposibles de agrupar.
--   3. El historial del cliente viene capado a 10 turnos, así que NINGUNA fila
--      llegaba a contener la conversación entera.
--
-- MODELO NUEVO: una fila = una conversación. `conversaciones_ia.id` ES el id de
-- la conversación, y la Edge Function le hace append a `mensajes` en cada turno
-- (leyendo de la DB, que es la fuente de verdad — NO del historial recortado que
-- manda el cliente).
--
-- Las filas que ya existen son válidas bajo el modelo nuevo: cada una tiene un
-- intercambio (pregunta + respuesta), o sea una conversación de un turno. No hay
-- nada que borrar, solo hay que ponerles título.
-- ============================================================

-- ── 1. Título de la conversación ────────────────────────────────────────────
-- Se deriva de las primeras palabras del primer mensaje del usuario, sin llamar
-- a la IA: costo cero y sin latencia. Lo escribe la Edge Function al crear la
-- conversación.
alter table public.conversaciones_ia
  add column if not exists titulo text;

-- ── 2. Backfill de las conversaciones que ya existían ───────────────────────
-- Toma el primer mensaje con role 'user' del array y lo recorta a 60 chars.
update public.conversaciones_ia
set titulo = coalesce(
  nullif(
    left(
      (
        select m ->> 'content'
        from jsonb_array_elements(mensajes) as m
        where m ->> 'role' = 'user'
        limit 1
      ),
      60
    ),
    ''
  ),
  'Conversación'
)
where titulo is null;

-- ── 3. Índice para listar el historial ──────────────────────────────────────
-- La lista se pide siempre igual: las conversaciones del usuario, la más
-- reciente primero. Sin este índice es un seq scan por cada apertura del panel.
create index if not exists idx_conversaciones_ia_user_updated
  on public.conversaciones_ia (user_id, updated_at desc);

-- ── 4. `updated_at` automático ──────────────────────────────────────────────
-- La Edge Function ya lo setea explícitamente, pero el trigger evita que una
-- escritura futura (o una corrección manual) deje el orden de la lista mintiendo.
create or replace function public.touch_conversaciones_ia()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_conversaciones_ia on public.conversaciones_ia;
create trigger trg_touch_conversaciones_ia
  before update on public.conversaciones_ia
  for each row
  execute function public.touch_conversaciones_ia();

-- ── 5. GRANTs explícitos ────────────────────────────────────────────────────
-- Convención del proyecto (ver CLAUDE.md § Migraciones): no depender de la
-- auto-exposición legacy al Data API, que Supabase retira el 30-oct-2026.
-- La tabla ya tiene RLS con la policy "usuarios ven sus propias conversaciones"
-- (ALL, auth.uid() = user_id), así que el DELETE del usuario ya está cubierto.
grant select, insert, update, delete on public.conversaciones_ia to authenticated;
grant select, insert, update, delete on public.conversaciones_ia to service_role;
