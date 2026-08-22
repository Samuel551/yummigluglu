// Match por substring en error.message (case-insensitive)
const MENSAJES_POR_TEXTO: Record<string, string> = {
  'JWT expired': 'Tu sesión expiró. Vuelve a iniciar sesión.',
  'invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu correo antes de ingresar.',
  'User already registered': 'Ya existe una cuenta con ese email.',
  'row-level security': 'No tienes permiso para realizar esta acción.',
  'network request failed': 'Sin conexión. Revisa tu internet.',
  'Failed to fetch': 'Sin conexión. Revisa tu internet.',
  'email rate limit exceeded': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'rate limit': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'unable to validate email address': 'El email no parece válido. Revisa el formato.',
  'password should be at least': 'La contraseña debe tener al menos 6 caracteres.',
  'signup is disabled': 'El registro está deshabilitado en este momento.',
  'invalid email': 'El email no parece válido. Revisa el formato.',
  'error sending confirmation email':
    'No pudimos enviarte el correo de confirmación. Intenta con otro correo o contáctanos.',
  'error sending recovery email':
    'No pudimos enviarte el correo de recuperación. Intenta con otro correo o contáctanos.',
  'error sending magic link':
    'No pudimos enviarte el enlace mágico. Intenta con otro correo o contáctanos.',
};

// Match exacto por error.code (Supabase auth >= 2024)
const MENSAJES_POR_CODE: Record<string, string> = {
  // El texto viejo nombraba "Supabase", "plan free" y "SMTP custom", y encima en
  // voseo. Es un mensaje que ve el USUARIO FINAL: no entiende nada de eso y no
  // puede hacer nada al respecto. El detalle técnico vive en el console.warn.
  over_email_send_rate_limit:
    'Enviamos demasiados correos en poco tiempo. Espera una hora e inténtalo de nuevo.',
  over_request_rate_limit: 'Demasiadas solicitudes. Espera unos segundos e inténtalo de nuevo.',
  email_address_invalid: 'El email no parece válido. Revisa el formato.',
  weak_password: 'La contraseña es muy débil. Usa al menos 6 caracteres.',
  user_already_exists: 'Ya existe una cuenta con ese email.',
  email_exists: 'Ya existe una cuenta con ese email.',
  invalid_credentials: 'Email o contraseña incorrectos.',
  signup_disabled: 'El registro está deshabilitado en este momento.',

  // ── Google Sign In ────────────────────────────────────────────────────────
  // Estos NO vienen de Supabase sino de @react-native-google-signin. Se mapean
  // acá igual, porque `lib/errores.ts` es la fuente única de mensajes.
  //
  // DEVELOPER_ERROR (código 10 en Android) significa que la huella SHA-1 con la
  // que está firmada la app NO coincide con ninguna registrada en el OAuth Client
  // de Google Cloud. Pasa típicamente en las builds distribuidas por Play, porque
  // **Google las REFIRMA con Play App Signing** y esa huella es distinta a la del
  // keystore de EAS. Es un error de configuración: el usuario no puede hacer nada,
  // por eso el mensaje lo empuja al login por correo en vez de dejarlo reintentando.
  DEVELOPER_ERROR:
    'El inicio con Google no está disponible en esta versión. Usa tu correo y contraseña.',
  '10': 'El inicio con Google no está disponible en esta versión. Usa tu correo y contraseña.',
  PLAY_SERVICES_NOT_AVAILABLE: 'Necesitas actualizar Google Play Services para entrar con Google.',
};

/**
 * Errores que Supabase manda **en la URL del deep link**, no en un objeto `Error`.
 * Llegan como `#error=access_denied&error_code=otp_expired&error_description=...`
 * cuando el enlace del correo venció o ya se usó.
 *
 * 🔴 Antes esto no se leía: `procesarDeepLink` cortaba en seco al no encontrar
 * `access_token` y el usuario tocaba el enlace, se le abría la app y **no pasaba
 * absolutamente nada**. Sin mensaje y sin forma de saber que tenía que pedir otro.
 */
const MENSAJES_DEEP_LINK: Record<string, string> = {
  otp_expired:
    'El enlace del correo venció. Vuelve a solicitarlo desde la pantalla de inicio de sesión.',
  access_denied:
    'El enlace del correo ya no es válido. Es posible que lo hayas usado antes. Solicita uno nuevo.',
  validation_failed: 'El enlace del correo no es válido. Solicita uno nuevo.',
  server_error: 'Tuvimos un problema al validar el enlace. Inténtalo de nuevo en unos minutos.',
  unexpected_failure:
    'Tuvimos un problema al validar el enlace. Inténtalo de nuevo en unos minutos.',
};

/** Traduce el `error_code` (o `error`) que viene en la URL de un deep link de auth. */
export function mensajeErrorDeepLink(codigo: string | null, descripcion: string | null): string {
  // El detalle crudo va al log: el mensaje traducido lo esconde y sin esto un
  // reporte de tester vuelve a ser una investigación a ciegas.
  console.warn('[deepLink] auth error en la URL', { codigo, descripcion });
  if (codigo && MENSAJES_DEEP_LINK[codigo]) return MENSAJES_DEEP_LINK[codigo];
  return 'No pudimos validar el enlace del correo. Solicita uno nuevo desde la pantalla de inicio de sesión.';
}

export function mensajeError(error: unknown): string {
  let codigoDesconocido: string | null = null;

  // Loguear el error original SIEMPRE para poder diagnosticar en Metro/devtools
  // (los mensajes traducidos esconden el detalle real de Supabase).
  if (error && typeof error === 'object') {
    const err = error as { message?: string; code?: string; status?: number };
    console.warn('[mensajeError]', { code: err.code, status: err.status, message: err.message });
    if (err.code && MENSAJES_POR_CODE[err.code]) return MENSAJES_POR_CODE[err.code];
    // Guardamos el código para adjuntarlo al mensaje genérico de más abajo.
    if (err.code) codigoDesconocido = String(err.code);
    else if (typeof err.status === 'number') codigoDesconocido = String(err.status);
  }
  const msg = error instanceof Error ? error.message : String(error);
  // DEVELOPER_ERROR a veces llega solo en el mensaje y no en `code`, según la versión
  // de Google Play Services. Se busca en las dos partes para no perderlo.
  if (msg.includes('DEVELOPER_ERROR')) return MENSAJES_POR_CODE.DEVELOPER_ERROR;
  for (const [clave, traduccion] of Object.entries(MENSAJES_POR_TEXTO)) {
    if (msg.toLowerCase().includes(clave.toLowerCase())) return traduccion;
  }

  // Fallback: si el error no matcheó ningún patrón conocido, se adjunta el código
  // crudo entre paréntesis.
  //
  // No es adorno de debug: el mensaje genérico a secas convierte cada reporte de
  // un tester en una investigación a ciegas. Pasó con el login de Google — cinco
  // pantallas de Google Cloud descartando hipótesis porque la captura solo decía
  // "Algo salió mal". Con el código, una foto del error alcanza para saber qué
  // falló. Cuando aparezca un código nuevo, se agrega a MENSAJES_POR_CODE con su
  // texto en español y deja de mostrarse crudo.
  return codigoDesconocido
    ? `Algo salió mal. Inténtalo de nuevo. (${codigoDesconocido})`
    : 'Algo salió mal. Inténtalo de nuevo.';
}
