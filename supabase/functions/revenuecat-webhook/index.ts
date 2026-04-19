// ============================================================
// Baby Bites — Webhook de RevenueCat
// Recibe eventos de suscripción y actualiza la tabla suscripciones
// usando service role (el cliente NUNCA escribe directamente).
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

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

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Validar el secret del webhook — RevenueCat lo envía en Authorization
  const authHeader = req.headers.get('Authorization');
  if (!WEBHOOK_SECRET || authHeader !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: PayloadWebhook;
  try {
    payload = await req.json();
  } catch {
    return new Response('Bad Request: JSON inválido', { status: 400 });
  }

  const { event } = payload;
  if (!event?.type || !event?.app_user_id) {
    return new Response('Bad Request: evento inválido', { status: 400 });
  }

  const userId = event.app_user_id;
  const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

  let plan: string;
  let activa: boolean;

  switch (event.type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'NON_RENEWING_PURCHASE':
      plan = 'premium';
      activa = true;
      break;

    case 'CANCELLATION':
      // El usuario canceló pero la suscripción sigue activa hasta expires_at.
      // Cuando venza, RevenueCat dispara EXPIRATION.
      plan = 'premium';
      activa = true;
      break;

    case 'EXPIRATION':
    case 'BILLING_ISSUE':
      plan = 'free';
      activa = false;
      break;

    default:
      // Eventos informativos (SUBSCRIBER_ALIAS, TRANSFER, etc.) — ignorar
      return new Response(JSON.stringify({ ok: true, ignorado: event.type }), {
        headers: { 'Content-Type': 'application/json' },
      });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase.from('suscripciones').upsert(
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

  if (error) {
    console.error('Error al actualizar suscripción:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
