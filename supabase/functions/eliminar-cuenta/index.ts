// ============================================================
// Yummi Glu Glu — Eliminación de cuenta
//
// Borra la cuenta del usuario y TODOS sus datos asociados.
//
// Existe como Edge Function porque borrar de `auth.users` requiere
// `service_role`, y esa clave jamás puede estar en el cliente.
//
// Las 12 tablas de `public` referencian `auth.users(id) ON DELETE CASCADE`
// (verificado contra el catálogo), así que un solo `deleteUser` arrastra
// perfiles, favoritos, diario, conversaciones, planes, listas, recordatorios,
// desbloqueos, suscripción y cupo de NutriBot. No hay que borrar tabla por
// tabla: hacerlo a mano sería más frágil y dejaría huérfanos si se agrega una
// tabla nueva y alguien olvida sumarla acá.
//
// Defensas:
//   1. Identidad por JWT. NO se acepta ningún id del body: un usuario solo
//      puede borrarse a sí mismo.
//   2. Confirmación explícita en el body, para que una llamada accidental o un
//      reintento de red no borre una cuenta.
//
// Deploy: supabase functions deploy eliminar-cuenta   (verify_jwt ON)
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Mismo criterio que `nutribot`: devolvemos los headers que pide el navegador en
// el preflight en vez de una lista fija, porque supabase-js manda `x-client-info`
// y `apikey` además de los obvios, y esa lista crece con las versiones.
const HEADERS_POR_DEFECTO = 'authorization, content-type, x-client-info, apikey';

function corsHeaders(req: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      req.headers.get('Access-Control-Request-Headers') ?? HEADERS_POR_DEFECTO,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }
  if (req.method !== 'POST') {
    return jsonResponse(req, { error: 'Método no permitido' }, 405);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return jsonResponse(req, { error: 'Falta autenticación' }, 401);
  }

  // ── 1. Identidad por JWT ──────────────────────────────────────────────────
  // El id sale del token, nunca del body. Sin esto, cualquiera con una sesión
  // válida podría mandar el id de otro y borrarle la cuenta.
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await supabaseUser.auth.getUser();

  if (userErr || !user) {
    return jsonResponse(req, { error: 'Sesión inválida' }, 401);
  }

  // ── 2. Confirmación explícita ─────────────────────────────────────────────
  // Un POST sin cuerpo, o un reintento automático de red, no debe borrar nada.
  let confirmado = false;
  try {
    const body = await req.json();
    confirmado = body?.confirmar === true;
  } catch {
    confirmado = false;
  }

  if (!confirmado) {
    return jsonResponse(req, { error: 'Falta la confirmación explícita' }, 400);
  }

  // ── 3. Borrado ────────────────────────────────────────────────────────────
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id);

  if (deleteErr) {
    console.error('Eliminar cuenta: fallo al borrar el usuario', {
      mensaje: deleteErr.message,
    });
    return jsonResponse(
      req,
      { error: 'No pudimos eliminar tu cuenta en este momento. Intenta de nuevo.' },
      500
    );
  }

  // Se registra el borrado sin el email ni el id: sirve para auditar el volumen
  // de bajas sin conservar datos de una cuenta que el usuario pidió eliminar.
  console.log(JSON.stringify({ evento: 'cuenta_eliminada', at: new Date().toISOString() }));

  return jsonResponse(req, { ok: true });
});
