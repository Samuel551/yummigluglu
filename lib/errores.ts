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
  over_email_send_rate_limit:
    'Supabase bloqueó el envío de correos por límite del plan free. Esperá ~1h o configurá Resend como SMTP custom.',
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

export function mensajeError(error: unknown): string {
  // Loguear el error original SIEMPRE para poder diagnosticar en Metro/devtools
  // (los mensajes traducidos esconden el detalle real de Supabase).
  if (error && typeof error === 'object') {
    const err = error as { message?: string; code?: string; status?: number };
    console.warn('[mensajeError]', { code: err.code, status: err.status, message: err.message });
    if (err.code && MENSAJES_POR_CODE[err.code]) return MENSAJES_POR_CODE[err.code];
  }
  const msg = error instanceof Error ? error.message : String(error);
  // DEVELOPER_ERROR a veces llega solo en el mensaje y no en `code`, según la versión
  // de Google Play Services. Se busca en las dos partes para no perderlo.
  if (msg.includes('DEVELOPER_ERROR')) return MENSAJES_POR_CODE.DEVELOPER_ERROR;
  for (const [clave, traduccion] of Object.entries(MENSAJES_POR_TEXTO)) {
    if (msg.toLowerCase().includes(clave.toLowerCase())) return traduccion;
  }
  return 'Algo salió mal. Inténtalo de nuevo.';
}
