// ============================================================
// Yummi Glu Glu — Server-Side Verification (SSV) de AdMob
//
// Google llama a esta función, servidor a servidor, cuando un usuario TERMINA
// de ver un anuncio recompensado. La llamada viene firmada con la clave privada
// de Google, así que es la ÚNICA prueba confiable de que el anuncio se vio.
//
// Reemplaza al flujo anterior (`canjear-desbloqueo`), donde el cliente avisaba
// "ya lo vi" y el servidor le creía. Con eso, un usuario técnico podía
// regalarse desbloqueos sin ver nada.
//
// ⚠️ verify_jwt DEBE estar en OFF: el que llama es Google, no un usuario, y no
// trae ningún JWT. La autenticación de esta función ES la firma.
//
// Deploy: supabase functions deploy ssv-recompensa --no-verify-jwt
//
// Configuración en AdMob (sin esto la función nunca se llama):
//   AdMob → Apps → Yummi Glu Glu → Bloques de anuncios → el rewarded →
//   Editar → Verificación del lado del servidor → URL de devolución de llamada:
//   https://<PROJECT>.supabase.co/functions/v1/ssv-recompensa
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createVerify } from 'node:crypto';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Google publica acá las claves públicas con las que firma los callbacks. */
const URL_CLAVES = 'https://www.gstatic.com/admob/reward/verifier-keys.json';

/**
 * Ventana de frescura del callback.
 *
 * Un callback viejo reenviado sigue teniendo la firma válida — la firma no
 * caduca sola. Esto acota el daño de un replay a unos minutos; el registro de
 * `transaction_id` lo cierra del todo. Son dos defensas para el mismo agujero
 * porque la primera es barata y no depende de la base.
 */
const MAX_ANTIGUEDAD_MS = 10 * 60 * 1000;

interface ClaveGoogle {
  keyId: number;
  pem: string;
}

// Cache en memoria del worker. Las claves de Google rotan muy de vez en cuando,
// así que bajarlas en cada callback sería tráfico al pedo. Si aparece un keyId
// desconocido se refresca (ver `obtenerClave`).
let cacheClaves: Map<number, string> | null = null;

async function descargarClaves(): Promise<Map<number, string>> {
  const res = await fetch(URL_CLAVES);
  if (!res.ok) throw new Error(`No se pudieron bajar las claves: ${res.status}`);
  const json = (await res.json()) as { keys: ClaveGoogle[] };
  const mapa = new Map<number, string>();
  for (const k of json.keys) mapa.set(Number(k.keyId), k.pem);
  return mapa;
}

/**
 * Devuelve el PEM del `keyId` pedido. Si no está en cache, refresca UNA vez:
 * el día que Google rote las claves, un keyId nuevo no puede tumbar el flujo.
 */
async function obtenerClave(keyId: number): Promise<string | null> {
  if (cacheClaves?.has(keyId)) return cacheClaves.get(keyId)!;
  cacheClaves = await descargarClaves();
  return cacheClaves.get(keyId) ?? null;
}

/** base64url → Buffer. Google firma en base64url, no en base64 clásico. */
function base64urlABytes(valor: string): Uint8Array {
  const base64 = valor.replace(/-/g, '+').replace(/_/g, '/');
  const relleno = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const bin = atob(base64 + relleno);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  // Google usa GET. No hay CORS porque no lo llama ningún navegador.
  if (req.method !== 'GET') {
    return new Response('Método no permitido', { status: 405 });
  }

  const url = new URL(req.url);

  // ── 1. Aislar el contenido firmado ────────────────────────────────────────
  // Google firma la query string COMPLETA hasta justo antes de `&signature=`.
  // Hay que usar la cadena CRUDA: reconstruirla con URLSearchParams cambiaría
  // el encoding o el orden y la firma dejaría de validar.
  const crudo = url.search.startsWith('?') ? url.search.slice(1) : url.search;
  const corte = crudo.indexOf('&signature=');
  if (corte === -1) {
    return new Response('Falta signature', { status: 400 });
  }
  const contenidoFirmado = crudo.slice(0, corte);

  const params = url.searchParams;
  const signature = params.get('signature') ?? '';
  const keyId = Number(params.get('key_id') ?? '');
  const userId = params.get('user_id') ?? '';
  const transactionId = params.get('transaction_id') ?? '';
  const timestamp = Number(params.get('timestamp') ?? '');

  if (!signature || !keyId || !transactionId) {
    return new Response('Parámetros incompletos', { status: 400 });
  }

  // ── 2. Verificar la firma ─────────────────────────────────────────────────
  // Se usa `node:crypto` y no Web Crypto a propósito: Google manda la firma en
  // formato DER, y `crypto.subtle.verify` con ECDSA espera el formato crudo
  // (r||s). Con Web Crypto habría que convertir DER→raw a mano; createVerify
  // entiende DER directamente. Las claves son P-256 (verificado contra
  // verifier-keys.json), curva soportada por ambos.
  let firmaValida = false;
  try {
    const pem = await obtenerClave(keyId);
    if (!pem) {
      console.warn('SSV: keyId desconocido', keyId);
      return new Response('Clave desconocida', { status: 403 });
    }
    const verificador = createVerify('SHA256');
    verificador.update(contenidoFirmado);
    verificador.end();
    firmaValida = verificador.verify(pem, base64urlABytes(signature));
  } catch (e) {
    console.error('SSV: error verificando la firma', (e as Error).message);
    return new Response('Error de verificación', { status: 500 });
  }

  if (!firmaValida) {
    // Sin detalle a propósito: quien llegue acá sin firma válida no es Google.
    console.warn('SSV: firma inválida');
    return new Response('Firma inválida', { status: 403 });
  }

  // ── 3. Frescura ───────────────────────────────────────────────────────────
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > MAX_ANTIGUEDAD_MS) {
    console.warn('SSV: callback fuera de la ventana de frescura');
    return new Response('Callback vencido', { status: 400 });
  }

  // ── 4. Identidad del usuario ──────────────────────────────────────────────
  // `user_id` lo setea la app antes de mostrar el anuncio y viaja DENTRO de lo
  // firmado: cambiarle un caracter invalida la firma, así que ya no se puede
  // falsificar. Igual se valida la forma antes de tocar la base.
  if (!UUID_REGEX.test(userId)) {
    console.warn('SSV: user_id con formato inválido');
    return new Response('Datos inválidos', { status: 400 });
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ── 5. Registrar el crédito ───────────────────────────────────────────────
  // La fila ES el crédito: nace sin `consumido_at` y `canjear-desbloqueo` la
  // consume después, cuando el usuario elige qué receta desbloquear.
  //
  // Se INSERTA de una y se usa el choque de PK como candado; un SELECT previo
  // dejaría una carrera entre dos callbacks simultáneos. El código 23505
  // (unique_violation) significa "ya procesado" y NO es un error: Google
  // reintenta los callbacks y hay que responderle 200 para que deje de hacerlo.
  const { error: insErr } = await admin
    .from('ssv_transacciones_procesadas')
    .insert({ transaction_id: transactionId, user_id: userId });

  if (insErr) {
    if (insErr.code === '23505') {
      return new Response('OK (duplicado)', { status: 200 });
    }
    console.error('SSV: error registrando el crédito', insErr.message);
    return new Response('Error interno', { status: 500 });
  }

  // Log sin user_id: sirve para medir volumen sin registrar quién vio qué.
  console.log(JSON.stringify({ evento: 'ssv_credito_concedido', at: new Date().toISOString() }));

  return new Response('OK', { status: 200 });
});
