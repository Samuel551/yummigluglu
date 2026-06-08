// Edge Function: correo de bienvenida.
// Se invoca desde el cliente tras un registro nuevo (hoy: Google sign in).
// Manda un mail vía Resend usando el dominio verificado yummigluglu.com.
//
// Seguridad: requiere el JWT del usuario (verify_jwt por defecto). El email se
// toma del usuario AUTENTICADO (no del body), así nadie puede mandar mails a terceros.
//
// Requiere el secret RESEND_API_KEY en Supabase:
//   supabase secrets set RESEND_API_KEY=re_xxx
// (SUPABASE_URL y SUPABASE_ANON_KEY los inyecta Supabase automáticamente.)

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    // Cliente con el JWT del usuario → resolvemos su identidad real.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return new Response(JSON.stringify({ error: 'Usuario sin email' }), { status: 401 });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Falta RESEND_API_KEY' }), { status: 500 });
    }

    const html = `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1A1714;">
        <div style="text-align: center; font-size: 56px; line-height: 1;">🍼</div>
        <h1 style="font-size: 24px; font-weight: 800; text-align: center; margin: 16px 0 8px;">
          ¡Te damos la bienvenida a Yummi Glu Glu!
        </h1>
        <p style="font-size: 15px; line-height: 22px; color: #6B6B6B; text-align: center; margin: 0 0 24px;">
          Nos alegra acompañarte en la alimentación de tu bebé, desde la lactancia hasta sus primeros platos completos.
        </p>
        <div style="background: #F0F7F0; border-radius: 14px; padding: 18px 20px; font-size: 14px; line-height: 21px;">
          <strong>Para empezar:</strong>
          <ul style="padding-left: 18px; margin: 8px 0 0;">
            <li>Crea el perfil de tu bebé con su fecha de nacimiento.</li>
            <li>Descubre recetas según su etapa de alimentación.</li>
            <li>Recibe avisos de los próximos hitos.</li>
          </ul>
        </div>
        <p style="font-size: 12px; color: #9B9B9B; text-align: center; margin-top: 28px;">
          Yummi Glu Glu · Alimentación inteligente para tu bebé
        </p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Yummi Glu Glu <noreply@yummigluglu.com>',
        to: [user.email],
        subject: '¡Te damos la bienvenida a Yummi Glu Glu! 🍼',
        html,
      }),
    });

    if (!res.ok) {
      const detalle = await res.text();
      return new Response(JSON.stringify({ error: 'Resend falló', detalle }), { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
