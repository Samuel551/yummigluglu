// ============================================================
// Yummi Glu Glu — Sincronizar suscripción contra RevenueCat
//
// 🔧 POR QUÉ EXISTE (bug encontrado en el QA del 2026-08-24):
//
// "Restaurar compras" NO reparaba nada. El flujo viejo era:
//
//     Purchases.restorePurchases()  ->  esperar a que el WEBHOOK
//                                       actualice `suscripciones`
//
// Y ahí estaba la falla: `restorePurchases()` le pide a RevenueCat que
// re-sincronice con Google, pero si RC ya tenía esa compra y nada cambió,
// **no dispara ningún webhook**. La tabla nunca se tocaba, el cliente
// encuestaba 10 segundos y se rendía EN SILENCIO.
//
// 🔴 El problema de fondo era circular: el botón que existe para reparar un
//    webhook que falló, dependía de que el webhook funcionara. La red de
//    seguridad colgaba del mismo clavo que debía reemplazar.
//
// Esta función rompe esa circularidad: en vez de ESPERAR a que RevenueCat
// avise, le PREGUNTA directamente por la API REST, servidor contra servidor.
//
// Seguridad:
//   - Identidad SOLO por JWT. Nunca acepta un id del body: si lo hiciera,
//     cualquiera con sesión podría sincronizar (y activar) la cuenta ajena.
//   - La Secret API Key de RevenueCat vive en los secrets de Supabase y
//     NUNCA sale del servidor. No es una EXPO_PUBLIC_*.
//   - Escribe con service_role, porque el cliente tiene `suscripciones` en
//     solo lectura (migración 004).
//
// Deploy: supabase functions deploy sincronizar-suscripcion   (verify_jwt ON)
//   El cliente la llama con `functions.invoke`, así que verify_jwt va ON.
//   No confundir con revenuecat-webhook / ssv-recompensa, que son servidor a
//   servidor y van con --no-verify-jwt.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const REVENUECAT_SECRET_API_KEY = Deno.env.get('REVENUECAT_SECRET_API_KEY') ?? '';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/** Una entitlement de RevenueCat. `expires_date` en null = vitalicia. */
interface EntitlementRC {
  expires_date: string | null;
  product_identifier?: string;
}

/**
 * Busca la entitlement activa que venza más tarde.
 *
 * A propósito NO se filtra por nombre de entitlement: el identificador vive
 * solo en el dashboard de RevenueCat y no aparece en ningún lado del código
 * (el webhook tampoco lo mira — mapea por tipo de evento). Hardcodear un
 * nombre acá sería atarse a un valor que nadie versiona y que se rompería en
 * silencio si alguien lo renombra en el dashboard.
 */
function entitlementActiva(entitlements: Record<string, EntitlementRC>): {
  activa: boolean;
  expiresAt: string | null;
} {
  const ahora = Date.now();
  let mejor: string | null = null;
  let vitalicia = false;

  for (const ent of Object.values(entitlements ?? {})) {
    if (!ent) continue;

    // expires_date null = no vence nunca. Gana sobre cualquier fecha.
    if (ent.expires_date === null) {
      vitalicia = true;
      continue;
    }

    const vence = Date.parse(ent.expires_date);
    if (Number.isNaN(vence) || vence <= ahora) continue;

    if (mejor === null || vence > Date.parse(mejor)) {
      mejor = ent.expires_date;
    }
  }

  if (vitalicia) return { activa: true, expiresAt: null };
  if (mejor !== null) return { activa: true, expiresAt: mejor };
  return { activa: false, expiresAt: null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido' }, 405);
  }
  if (!REVENUECAT_SECRET_API_KEY) {
    console.error('sincronizar-suscripcion: falta REVENUECAT_SECRET_API_KEY en los secrets');
    return jsonResponse({ error: 'La sincronización no está disponible por ahora.' }, 503);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return jsonResponse({ error: 'Falta autenticación' }, 401);
  }

  // ── 1. Identidad por JWT ──────────────────────────────────────────────────
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await supabaseUser.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ error: 'Sesión inválida' }, 401);
  }

  // ── 2. Preguntarle a RevenueCat por este usuario ──────────────────────────
  // `app_user_id` en RevenueCat es el user_id de Supabase: lo setea
  // `Purchases.logIn(userId)` en useSuscripcionStore.inicializarRevenueCat.
  let entitlements: Record<string, EntitlementRC> = {};
  try {
    const rcRes = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`,
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_SECRET_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (rcRes.status === 404) {
      // RC no conoce a este usuario: nunca compró nada. No es un error.
      return jsonResponse({ ok: true, encontrada: false });
    }

    if (!rcRes.ok) {
      // El status de RevenueCat va al log del servidor, nunca al cliente:
      // un 401 de credenciales no es asunto del usuario.
      console.error('sincronizar-suscripcion: RevenueCat respondió', rcRes.status);
      return jsonResponse({ error: 'No pudimos verificar tu suscripción. Intenta de nuevo.' }, 502);
    }

    const body = await rcRes.json();
    entitlements = body?.subscriber?.entitlements ?? {};
  } catch (e) {
    console.error('sincronizar-suscripcion: fallo llamando a RevenueCat', (e as Error)?.message);
    return jsonResponse({ error: 'No pudimos verificar tu suscripción. Intenta de nuevo.' }, 502);
  }

  const { activa, expiresAt } = entitlementActiva(entitlements);

  // ── 3. Si no hay entitlement activa: NO degradar ──────────────────────────
  //
  // 🔴 REGLA DELIBERADA: esta función solo SUBE de plan, nunca baja.
  //
  // Dos razones, las dos con dientes:
  //
  //   1. Los premium de CORTESÍA (cuentas comp del equipo y la familia) no
  //      existen en RevenueCat — se escriben a mano y tienen
  //      `revenuecat_customer_id` en NULL. Si degradáramos ante un "no
  //      encontrado", el primer toque a "Restaurar compras" les borraría el
  //      regalo.
  //
  //   2. Un hipo de la API de RC (500, timeout, respuesta vacía) haría que le
  //      saquemos el premium a alguien que SÍ está pagando. Ese error es mucho
  //      más caro que el opuesto.
  //
  // Las bajas legítimas las maneja el webhook con EXPIRATION / BILLING_ISSUE,
  // que es el camino correcto: RevenueCat avisando un hecho, no nosotros
  // deduciéndolo de un silencio.
  if (!activa) {
    return jsonResponse({ ok: true, encontrada: false });
  }

  // ── 4. Upsert con service_role ────────────────────────────────────────────
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { error: upsertError } = await admin.from('suscripciones').upsert(
    {
      user_id: user.id,
      plan: 'premium',
      activa: true,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (upsertError) {
    console.error('sincronizar-suscripcion: error al actualizar —', upsertError.message);
    return jsonResponse({ error: 'No pudimos activar tu suscripción. Intenta de nuevo.' }, 500);
  }

  return jsonResponse({ ok: true, encontrada: true, expires_at: expiresAt });
});
