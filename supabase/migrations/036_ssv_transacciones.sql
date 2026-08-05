-- ============================================================
-- 036 — Idempotencia del callback SSV de AdMob
--
-- Server-Side Verification: AdMob llama a la Edge Function `ssv-recompensa`
-- cuando un usuario termina un anuncio recompensado. Esa llamada viene FIRMADA
-- por Google, así que es la única fuente confiable de "vio el anuncio".
--
-- Esta tabla registra cada `transaction_id` ya procesado. La firma sigue siendo
-- válida si alguien reenvía la MISMA URL, así que sin este registro un atacante
-- que capture un callback legítimo podría repetirlo para renovar su desbloqueo
-- indefinidamente. El chequeo de frescura del timestamp acota la ventana; esto
-- la cierra del todo.
--
-- Solo la escribe `service_role`. Ni `anon` ni `authenticated` la tocan.
-- ============================================================

create table if not exists public.ssv_transacciones_procesadas (
  transaction_id text primary key,
  -- ON DELETE CASCADE obligatorio: es lo que hace que un solo `deleteUser`
  -- borre todos los datos del usuario. Ver CLAUDE.md § eliminar-cuenta.
  user_id uuid not null references auth.users(id) on delete cascade,
  receta_id uuid,
  created_at timestamptz not null default now()
);

-- Para poder purgar filas viejas sin escanear toda la tabla.
create index if not exists idx_ssv_transacciones_created_at
  on public.ssv_transacciones_procesadas (created_at);

-- 1. RLS SIEMPRE antes de los grants.
alter table public.ssv_transacciones_procesadas enable row level security;

-- 2. Grants — mismo patrón que `webhook_events_procesados` (migración 006):
--    tabla accesible SOLO por service_role. A partir del 30 oct 2026 Supabase
--    deja de exponer automáticamente las tablas nuevas al Data API, así que los
--    grants explícitos no son opcionales.
grant select, insert, delete on public.ssv_transacciones_procesadas to service_role;

-- 3. Sin policies a propósito: RLS activo y sin policies bloquea a todo el mundo
--    salvo a service_role, que las saltea. El linter lo marca como INFO
--    `rls_enabled_no_policy` — es lo esperado acá, igual que en
--    `webhook_events_procesados`.
