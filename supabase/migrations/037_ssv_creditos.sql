-- ============================================================
-- 037 — El registro de SSV pasa a ser un CRÉDITO consumible
--
-- Por qué el cambio: `serverSideVerificationOptions` solo se puede pasar al
-- CREAR el anuncio recompensado, y el anuncio se precarga al abrir la app,
-- cuando todavía no se sabe qué receta va a querer desbloquear el usuario.
-- Crear el anuncio recién al pedirlo cerraría el problema, pero le agrega 3-5
-- segundos de espera al único camino de monetización que tenemos.
--
-- Solución: el callback firmado de Google NO concede una receta puntual,
-- concede un CRÉDITO al usuario. Después el cliente lo canjea por la receta que
-- elija. Que el usuario elija QUÉ desbloquear no es un problema de seguridad —
-- ya se ganó el desbloqueo. Lo que no puede es fabricar créditos, porque solo
-- nacen de un callback con la firma de Google.
-- ============================================================

alter table public.ssv_transacciones_procesadas
  add column if not exists consumido_at timestamptz,
  add column if not exists consumido_receta_id uuid;

-- `receta_id` queda como histórico de la migración anterior; el dato que manda
-- ahora es `consumido_receta_id`. No se borra para no perder filas si ya hubiera.
comment on column public.ssv_transacciones_procesadas.receta_id is
  'Obsoleto desde la migración 037. Usar consumido_receta_id.';

-- Índice para "buscá un crédito libre de este usuario", que es la consulta que
-- hace `canjear-desbloqueo` en cada canje. Parcial: las filas ya consumidas no
-- se buscan nunca, así que no ocupan lugar en el índice.
create index if not exists idx_ssv_creditos_libres
  on public.ssv_transacciones_procesadas (user_id)
  where consumido_at is null;
