// ============================================================
// Yummi Glu Glu — Canjear desbloqueo (rewarded ad)
//
// El cliente llama a esta función DESPUÉS de que el usuario completó un anuncio
// recompensado. Crea/renueva un desbloqueo de 24h para una receta premium.
//
// 🔒 CAMBIO IMPORTANTE (2026-08-05): esta función YA NO le cree al cliente.
//
// Antes bastaba con llamarla diciendo "vi el anuncio" y concedía el desbloqueo,
// así que un usuario técnico podía regalárselos sin ver nada. Ahora exige un
// CRÉDITO en `ssv_transacciones_procesadas`, y esos créditos solo los crea la
// función `ssv-recompensa` cuando Google le manda un callback FIRMADO.
//
// El crédito no está atado a una receta: se emite al usuario y él elige acá qué
// desbloquear. Que elija QUÉ no es un problema de seguridad —ya se ganó el
// desbloqueo—; lo que no puede es fabricar el crédito.
//
// Seguridad:
//   - Identifica al usuario por su JWT, no por un id del body.
//   - Exige y CONSUME un crédito verificado por firma de Google.
//   - Valida que la receta exista, esté activa y sea premium.
//
// Deploy: supabase functions deploy canjear-desbloqueo   (verify_jwt ON)
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DURACION_HORAS = 24;

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

  // ── 2. Validar el recetaId ────────────────────────────────────────────────
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

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ── 3. Verificar la receta ANTES de gastar el crédito ─────────────────────
  // El orden importa: si se consumiera primero y la receta resultara inválida,
  // el usuario perdería un crédito que se ganó viendo un anuncio completo.
  const { data: receta, error: recErr } = await admin
    .from('recetas')
    .select('id, es_premium, activa')
    .eq('id', recetaId)
    .single();

  if (recErr || !receta || !receta.activa) {
    return jsonResponse({ error: 'Receta no encontrada' }, 404);
  }
  if (!receta.es_premium) {
    // Desbloquear una receta gratuita no tiene sentido: se devuelve OK sin
    // gastar el crédito, que le queda al usuario para otra.
    return jsonResponse({ ok: true, ignorado: 'receta_gratuita' }, 200);
  }

  // ── 4. Buscar un crédito libre ────────────────────────────────────────────
  const { data: credito } = await admin
    .from('ssv_transacciones_procesadas')
    .select('transaction_id')
    .eq('user_id', user.id)
    .is('consumido_at', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!credito) {
    // El callback de Google puede tardar unos segundos, así que esto no es
    // necesariamente fraude: puede ser que todavía no llegó. El cliente
    // reintenta unas veces antes de darse por vencido.
    return jsonResponse({ error: 'sin_credito' }, 409);
  }

  // ── 5. Consumirlo ─────────────────────────────────────────────────────────
  // El `.is('consumido_at', null)` en el UPDATE es el candado: si dos peticiones
  // corren a la vez por el mismo crédito, solo una matchea filas. Sin ese guard
  // las dos leerían el mismo crédito libre y se concederían dos desbloqueos.
  const { data: consumido, error: consErr } = await admin
    .from('ssv_transacciones_procesadas')
    .update({ consumido_at: new Date().toISOString(), consumido_receta_id: recetaId })
    .eq('transaction_id', credito.transaction_id)
    .is('consumido_at', null)
    .select('transaction_id');

  if (consErr) {
    return jsonResponse({ error: consErr.message }, 500);
  }
  if (!consumido || consumido.length === 0) {
    // Otra petición se lo llevó entre el SELECT y el UPDATE.
    return jsonResponse({ error: 'sin_credito' }, 409);
  }

  // ── 6. Conceder el desbloqueo ─────────────────────────────────────────────
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
