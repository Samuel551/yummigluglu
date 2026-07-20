// ============================================================
// Yummi Glu Glu — Canjear desbloqueo (rewarded ad)
//
// El cliente llama a esta función DESPUÉS de que el usuario completó un
// anuncio recompensado (rewarded). La función crea/renueva un desbloqueo
// de 24h para una receta premium, usando service_role (el cliente NO puede
// escribir la tabla `desbloqueos_temporales` directamente).
//
// Seguridad:
//   - Identifica al usuario por su JWT (Authorization), no confía en un id
//     mandado por el cliente.
//   - Valida que la receta exista, esté activa y sea premium.
//   - Upsert idempotente por (user_id, receta_id): re-ver el ad extiende la
//     expiración, no crea duplicados.
//
// LIMITACIÓN CONOCIDA (hardening futuro): sin Server-Side Verification (SSV)
// de AdMob, la función confía en que el cliente vio el ad. El daño máximo es
// que un usuario técnico se regale un desbloqueo de 24h sin ver el anuncio —
// riesgo bajo (una receta, no dinero). Para cerrarlo: configurar SSV en el
// ad unit rewarded y validar el callback firmado de Google antes del upsert.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DURACION_HORAS = 24;

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido' }, 405);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return jsonResponse({ error: 'Falta autenticación' }, 401);
  }

  // 1. Identificar al usuario por su JWT (no confiamos en ids del body).
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

  // 2. Validar el recetaId del body.
  let recetaId = '';
  try {
    const body = await req.json();
    recetaId = typeof body?.recetaId === 'string' ? body.recetaId : '';
  } catch {
    return jsonResponse({ error: 'Body inválido' }, 400);
  }
  if (!UUID_REGEX.test(recetaId)) {
    return jsonResponse({ error: 'recetaId inválido' }, 400);
  }

  // 3. Verificar la receta (existe, activa, y es premium) con service_role.
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: receta, error: recErr } = await admin
    .from('recetas')
    .select('id, es_premium, activa')
    .eq('id', recetaId)
    .single();

  if (recErr || !receta || !receta.activa) {
    return jsonResponse({ error: 'Receta no encontrada' }, 404);
  }
  // Desbloquear una receta gratuita no tiene sentido — no gastamos un canje.
  if (!receta.es_premium) {
    return jsonResponse({ ok: true, ignorado: 'receta_gratuita' }, 200);
  }

  // 4. Upsert del desbloqueo (extiende expiración si ya existía).
  const expiresAt = new Date(Date.now() + DURACION_HORAS * 3600 * 1000).toISOString();
  const { error: upErr } = await admin
    .from('desbloqueos_temporales')
    .upsert(
      { user_id: user.id, receta_id: recetaId, expires_at: expiresAt },
      { onConflict: 'user_id,receta_id' }
    );

  if (upErr) {
    return jsonResponse({ error: upErr.message }, 500);
  }

  return jsonResponse({ ok: true, expires_at: expiresAt }, 200);
});
