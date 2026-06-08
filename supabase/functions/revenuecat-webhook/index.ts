// ============================================================
// Yummi Glu Glu — Webhook de RevenueCat (hardened)
//
// Recibe eventos de suscripción y actualiza la tabla `suscripciones`
// usando service role (el cliente NUNCA escribe directamente).
//
// Defensas:
//   1. Comparación timing-safe del shared secret (RC no soporta HMAC).
//   2. Validación de UUID y verificación de que `app_user_id` exista
//      en `auth.users` antes de cualquier escritura.
//   3. Idempotencia via tabla `webhook_events_procesados` (event_id PK).
//   4. Operacional: el secret debe ser ≥ 32 chars random y rotarse
//      ante cualquier sospecha. Vive en `REVENUECAT_WEBHOOK_SECRET`
//      (Supabase Edge Function secrets), nunca en el repo.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface EventoRevenueCat {
  type: string;
  app_user_id: string;
  id: string;
  expiration_at_ms?: number;
}

interface PayloadWebhook {
  api_version: string;
  event: EventoRevenueCat;
}

// Comparación constant-time para evitar timing attacks sobre el secret.
// La longitud se XORea como primer paso para que mismatches de largo
// también se detecten en tiempo constante respecto al máximo.
function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  const len = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < len; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // ─── 1. Auth: timing-safe compare del shared secret ─────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!WEBHOOK_SECRET || !timingSafeEqual(authHeader, WEBHOOK_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // ─── 2. Parse + validación de shape ─────────────────────────────────
  let payload: PayloadWebhook;
  try {
    payload = await req.json();
  } catch {
    return new Response('Bad Request: JSON inválido', { status: 400 });
  }

  const event = payload?.event;
  if (!event?.type || !event?.app_user_id || !event?.id) {
    return new Response('Bad Request: evento incompleto', { status: 400 });
  }

  const userId = event.app_user_id;
  if (!UUID_REGEX.test(userId)) {
    return new Response('Bad Request: app_user_id inválido', { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ─── 3. Idempotencia: ¿ya procesamos este event_id? ─────────────────
  const { data: yaProcesado } = await supabase
    .from('webhook_events_procesados')
    .select('event_id')
    .eq('event_id', event.id)
    .maybeSingle();

  if (yaProcesado) {
    return jsonResponse({ ok: true, ignorado: 'duplicado', event_id: event.id });
  }

  // ─── 4. Mapear tipo de evento a estado de suscripción ───────────────
  let plan: string;
  let activa: boolean;

  switch (event.type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'NON_RENEWING_PURCHASE':
    case 'CANCELLATION':
      // CANCELLATION: el usuario canceló pero la suscripción sigue activa
      // hasta expires_at. Cuando venza, RC dispara EXPIRATION.
      plan = 'premium';
      activa = true;
      break;

    case 'EXPIRATION':
    case 'BILLING_ISSUE':
      plan = 'free';
      activa = false;
      break;

    default:
      // Eventos informativos (SUBSCRIBER_ALIAS, TRANSFER, TEST, etc.) —
      // se ignoran sin tocar la suscripción.
      return jsonResponse({ ok: true, ignorado: event.type });
  }

  // ─── 5. Verificar que el user exista en auth.users ──────────────────
  // Aunque la FK de suscripciones haría fallar el upsert con un user
  // inexistente, el chequeo explícito devuelve 404 controlado y evita
  // la escritura. RC no reintenta en 4xx, así que no genera retry loop.
  const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(userId);
  if (userErr || !userData?.user) {
    console.warn(
      `Webhook RC: app_user_id ${userId} no existe en auth.users — evento ${event.id} rechazado`
    );
    return new Response('Not Found: usuario inexistente', { status: 404 });
  }

  // ─── 6. Upsert de la suscripción ────────────────────────────────────
  const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

  const { error: upsertError } = await supabase.from('suscripciones').upsert(
    {
      user_id: userId,
      plan,
      activa,
      expires_at: expiresAt,
      revenuecat_customer_id: event.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (upsertError) {
    console.error('Webhook RC: error al actualizar suscripción —', upsertError.message);
    return jsonResponse({ error: upsertError.message }, 500);
  }

  // ─── 7. Marcar evento como procesado (best-effort, race-safe via PK) ─
  // Si dos retries simultáneos llegan acá, uno gana y el otro choca
  // contra la PK. No nos importa: el upsert anterior es idempotente.
  const { error: idemError } = await supabase.from('webhook_events_procesados').insert({
    event_id: event.id,
    event_type: event.type,
    user_id: userId,
  });

  if (idemError && idemError.code !== '23505') {
    // 23505 = unique_violation (race con otro retry) — esperado, no es error
    console.warn('Webhook RC: no se pudo registrar idempotencia —', idemError.message);
  }

  return jsonResponse({ ok: true, event_id: event.id, type: event.type });
});
