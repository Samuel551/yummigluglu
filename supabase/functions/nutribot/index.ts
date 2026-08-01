// ============================================================
// Yummi Glu Glu — NutriBot (Fase 6)
//
// Proxy al Anthropic API. El API key NUNCA sale del servidor: vive en los
// secrets de Supabase (`supabase secrets set ANTHROPIC_API_KEY=...`).
//
// Defensas (todas server-side — el cliente es del atacante):
//   1. Identidad por JWT. No se confía en ningún id que mande el body.
//   2. Cupo mensual consumido ATÓMICAMENTE antes de llamar a Anthropic
//      (`consumir_credito_nutribot`). Si no hay cupo, no se gasta un token.
//   3. Topes duros de tamaño sobre TODO lo que manda el cliente (mensaje,
//      historial). Sin esto, un cliente modificado manda 500k tokens de
//      historial y factura una fortuna en un request.
//   4. `max_tokens` acotado: el output cuesta 5x el input.
//   5. El perfil del hijo se lee de la DB verificando que sea del usuario —
//      no se acepta el contexto que mande el cliente.
//
// Deploy: supabase functions deploy nutribot   (verify_jwt ON)
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';

// ── Cupos mensuales ──────────────────────────────────────────────────────────
// Configurables por env para poder ajustarlos sin redeploy.
// Free bajo a propósito: cada mensaje de un free es pérdida (la publicidad deja
// centavos). El cupo free es costo de adquisición, no de operación.
const LIMITE_FREE = Number(Deno.env.get('NUTRIBOT_LIMITE_FREE') ?? '20');
const LIMITE_PREMIUM = Number(Deno.env.get('NUTRIBOT_LIMITE_PREMIUM') ?? '300');

// ── Topes de tamaño (anti-abuso de costo) ───────────────────────────────────
const MAX_CHARS_MENSAJE = 1500;
const MAX_TURNOS_HISTORIAL = 10; // últimos N mensajes que se reenvían a Anthropic
const MAX_CHARS_TURNO = 1200;
const MAX_TOKENS_RESPUESTA = 600;

// Tope de mensajes que se guardan por conversación. No afecta lo que se le manda
// a Anthropic (eso ya está capado en MAX_TURNOS_HISTORIAL): es para que el jsonb
// de una conversación eterna no crezca sin techo. Un premium con 300 mensajes/mes
// no llega acá en una sola charla.
const MAX_MENSAJES_PERSISTIDOS = 200;
const MAX_CHARS_TITULO = 60;

const MODELO = 'claude-sonnet-5';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// CORS.
//
// Solo importa cuando la app corre en el navegador (`npm run web`): en React
// Native no hay política de origen. Pero `npm run web` es parte del flujo de
// desarrollo, así que tiene que funcionar.
//
// Devolvemos los headers que el navegador PIDE en el preflight en vez de una
// lista fija. supabase-js manda `authorization`, `content-type`, `x-client-info`
// y `apikey`, y esa lista crece con las versiones: una lista hardcodeada se
// queda corta y el síntoma es horrible de debuggear (el preflight responde 200
// y el POST simplemente nunca sale — no aparece en los logs de la función).
//
// `Allow-Origin: *` es seguro acá: la autenticación es un bearer token, no una
// cookie, así que no hay riesgo de request con credenciales desde otro origen.
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

// ============================================================
// System prompt — parte ESTABLE (idéntica para todos los usuarios).
//
// Va primero y con cache_control: es el prefijo cacheado. Anthropic cobra las
// lecturas de caché a ~10% del precio, así que en una conversación de varios
// turnos esto baja el costo de input de forma notoria.
//
// OJO: el mínimo cacheable en Sonnet 5 son 1024 tokens. Si este bloque se
// achica por debajo de eso, deja de cachear en silencio (sin error).
// Verificar con `usage.cache_read_input_tokens` > 0 en el segundo turno.
//
// El texto está en español NEUTRAL a propósito: define cómo le habla al
// usuario final (ver CLAUDE.md § Code Conventions).
// ============================================================
const SYSTEM_ESTABLE = `Eres NutriBot, el asistente de alimentación infantil de la aplicación Yummi Glu Glu. Acompañas a madres, padres y cuidadores de niños de 0 a 5 años en Chile y Latinoamérica hispanohablante.

## Tu rol

Ayudas con dudas prácticas del día a día sobre alimentación infantil: qué alimentos ofrecer según la edad, cómo preparar y presentar comidas, texturas apropiadas, manejo de rechazo a la comida, ideas de menús, y orientación general sobre introducción de alimentos.

## Cómo hablas

Escribe SIEMPRE en español neutro, tratando al usuario de "tú" (usa "prueba", "intenta", "puedes", "revisa", "ofrece"). Nunca uses voseo ("probá", "podés", "ofrecé") ni regionalismos marcados: tu público es toda Latinoamérica, no un solo país.

Sé cálido, cercano y tranquilizador, pero directo. Muchos usuarios te escriben cansados, preocupados o con culpa. Nunca los hagas sentir juzgados por cómo alimentan a su hijo.

Responde CORTO. Estás en un chat dentro de una aplicación móvil, no escribiendo un artículo. Apunta a 3 a 6 frases para preguntas simples. Solo extiéndete cuando la pregunta realmente lo requiera, y en ese caso usa listas breves en lugar de párrafos largos. No repitas la pregunta antes de responder ni cierres con resúmenes innecesarios.

Ve directo a lo accionable. El usuario quiere saber qué hacer esta noche a la hora de la cena, no una explicación teórica de nutrición.

## Formato: texto plano, sin markdown

La aplicación muestra tu respuesta como texto plano y NO interpreta markdown. Los símbolos de formato se ven literalmente en pantalla y ensucian la lectura.

Nunca uses asteriscos para negrita ni cursiva (nada de \`**palabra**\` ni \`*palabra*\`), ni almohadillas para títulos, ni backticks. Si necesitas destacar algo, usa MAYÚSCULAS con moderación o simplemente ponlo al principio de la frase.

Para enumerar, empieza cada línea con un guion y un espacio ("- "), que sí se lee bien. Cuando un ítem de la lista tenga nombre y explicación, sepáralos con dos puntos en lugar de resaltar el nombre. Por ejemplo, escribe "- Tortilla de verduras: con zapallo y zanahoria rallada" y no "- **Tortilla de verduras** con zapallo".

## Límites que no cruzas

No eres médico, pediatra ni nutricionista clínico, y no reemplazas a ninguno. Esto es innegociable:

- **No diagnosticas.** Si el usuario describe síntomas (vómitos, diarrea, sarpullido, dificultad para respirar, hinchazón, pérdida de peso, sangre en las deposiciones), no intentes identificar la causa. Indica con claridad y sin alarmismo que eso lo debe evaluar su pediatra, y si los síntomas sugieren urgencia (dificultad para respirar, hinchazón de labios o lengua, decaimiento marcado) di que busque atención médica inmediata.
- **No indicas medicamentos, suplementos ni dosis**, incluyendo vitaminas, hierro o probióticos. Eso lo define el pediatra.
- **No manejas dietas terapéuticas** para condiciones diagnosticadas (alergias confirmadas, enfermedad celíaca, diabetes, problemas renales, trastornos metabólicos). Puedes dar orientación general, pero siempre remites al profesional que lleva el caso.
- **No opinas sobre peso ni crecimiento** del niño. No sugieres que un niño está por debajo o por encima de lo esperado.

Cuando remitas al pediatra, hazlo en una frase y sigue adelante ayudando en lo que sí puedes. No conviertas cada respuesta en una advertencia legal.

## Seguridad alimentaria: lo que siempre respetas

- **Miel: nunca antes de los 12 meses.** Riesgo de botulismo infantil. Esto no tiene excepciones.
- **Riesgo de atragantamiento.** Antes de los 4 años evita recomendar frutos secos enteros, uvas enteras, tomates cherry enteros, salchichas en rodajas circulares, palomitas de maíz, caramelos duros y trozos grandes y firmes de zanahoria o manzana cruda. Si un alimento así aparece, explica cómo prepararlo seguro (partido a lo largo, rallado, cocido hasta ablandar, molido).
- **Leche de vaca como bebida principal: no antes de los 12 meses.** En preparaciones cocinadas a partir de los 6 meses está bien.
- **Sal y azúcar añadidas:** evítalas antes del año y mantenlas al mínimo después.
- **Alimentos crudos o poco cocidos** (huevo crudo, carnes o pescados crudos, lácteos sin pasteurizar): no se recomiendan a esta edad.
- **Pescados altos en mercurio** (pez espada, tiburón, atún de aleta amarilla en cantidad): limitarlos.

## Alergias

Si el perfil del niño tiene alergias registradas, respétalas de forma absoluta: nunca sugieras un alimento que contenga ese alérgeno, ni siquiera como opción alternativa, y revisa los ingredientes ocultos (por ejemplo, la salsa de soya contiene trigo; muchos embutidos contienen leche).

Para la *introducción* de alérgenos comunes (maní, huevo, frutos secos, mariscos, pescado, trigo, soya, leche), da información general y recomienda coordinarla con el pediatra, especialmente si hay antecedentes familiares de alergia o el niño tiene dermatitis atópica.

## Cuando la pregunta no es de tu área

Si te preguntan algo que no tiene relación con alimentación infantil o con el uso de la aplicación, dilo amablemente en una frase y ofrece volver al tema. No inventes ni improvises fuera de tu dominio.

## Sobre la aplicación

Yummi Glu Glu tiene un catálogo de recetas filtrables por etapa y momento del día, favoritos, plan semanal con lista de compras, un diario de introducción de alimentos y videos de preparación. Si una consulta se resuelve mejor con una función de la aplicación, menciónala en una frase. No inventes funciones que no existen ni prometas recetas específicas por nombre: no tienes acceso al catálogo.

## Incertidumbre

Si no estás seguro de algo, dilo. Es mucho mejor decir "esto conviene confirmarlo con tu pediatra" que dar una respuesta inventada con seguridad. En alimentación infantil, una respuesta equivocada dicha con confianza puede hacer daño real.`;

// Construye el bloque de contexto del niño. VARIABLE por usuario, así que va
// DESPUÉS del bloque cacheado — si fuera antes, invalidaría la caché de todos.
function construirContextoNino(
  perfil: {
    nombre: string;
    fecha_nacimiento: string;
    etapa: string;
    alergias: string[] | null;
    objetivo_nutricional: string | null;
  } | null
): string {
  if (!perfil) {
    return 'No hay un perfil de niño activo en este momento. Si la respuesta depende de la edad, pregúntala antes de responder.';
  }

  const nacimiento = new Date(perfil.fecha_nacimiento);
  const ahora = new Date();
  let meses =
    (ahora.getFullYear() - nacimiento.getFullYear()) * 12 +
    (ahora.getMonth() - nacimiento.getMonth());
  if (ahora.getDate() < nacimiento.getDate()) meses -= 1;
  meses = Math.max(0, meses);

  const edadTexto =
    meses < 24
      ? `${meses} ${meses === 1 ? 'mes' : 'meses'}`
      : `${Math.floor(meses / 12)} años y ${meses % 12} meses`;

  const alergias = perfil.alergias ?? [];
  const lineaAlergias =
    alergias.length > 0
      ? `- ALERGIAS REGISTRADAS: ${alergias.join(', ')}. Nunca sugieras estos alimentos ni ingredientes que los contengan, en ninguna forma.`
      : '- Sin alergias registradas.';

  const lineaObjetivo = perfil.objetivo_nutricional
    ? `\n- Objetivo nutricional indicado por el cuidador: ${perfil.objetivo_nutricional}.`
    : '';

  return `Contexto del niño sobre el que consulta el usuario (úsalo en cada respuesta sin volver a preguntarlo):
- Nombre: ${perfil.nombre}
- Edad: ${edadTexto} (${meses} meses)
- Etapa alimentaria: ${perfil.etapa}
${lineaAlergias}${lineaObjetivo}

Ajusta texturas, porciones y alimentos sugeridos a esta edad exacta.`;
}

type TurnoCliente = { role?: unknown; content?: unknown };

// Sanea el historial que manda el cliente: recorta a los últimos N turnos,
// trunca cada uno, descarta lo que no tenga forma válida.
function sanearHistorial(bruto: unknown): { role: 'user' | 'assistant'; content: string }[] {
  if (!Array.isArray(bruto)) return [];

  const limpio: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const turno of bruto.slice(-MAX_TURNOS_HISTORIAL) as TurnoCliente[]) {
    const role = turno?.role === 'assistant' ? 'assistant' : turno?.role === 'user' ? 'user' : null;
    const content = typeof turno?.content === 'string' ? turno.content.trim() : '';
    if (!role || !content) continue;
    limpio.push({ role, content: content.slice(0, MAX_CHARS_TURNO) });
  }

  // La API exige que el primer turno sea 'user'. Si el recorte dejó un
  // 'assistant' al principio, lo descartamos.
  while (limpio.length > 0 && limpio[0].role !== 'user') limpio.shift();
  return limpio;
}

/**
 * Título de la conversación para la lista del historial. Se deriva del primer
 * mensaje del usuario: costo cero y sin latencia, a diferencia de pedirle un
 * título a la IA (una llamada extra por cada conversación nueva).
 *
 * Corta en el último espacio para no partir una palabra al medio.
 */
function derivarTitulo(mensaje: string): string {
  const limpio = mensaje.replace(/\s+/g, ' ').trim();
  if (limpio.length <= MAX_CHARS_TITULO) return limpio || 'Conversación';

  const recorte = limpio.slice(0, MAX_CHARS_TITULO);
  const ultimoEspacio = recorte.lastIndexOf(' ');
  return (ultimoEspacio > 30 ? recorte.slice(0, ultimoEspacio) : recorte).trim();
}

/**
 * Devuelve el crédito consumido cuando la falla es NUESTRA (Anthropic caído,
 * key inválida, respuesta vacía). El usuario no tiene por qué pagar con un
 * mensaje de su cupo un error que no provocó.
 *
 * Best-effort: si la devolución falla, se loguea pero no se le cambia la
 * respuesta al usuario — ya tuvo un error, no le sumamos otro.
 */
async function devolverCredito(
  admin: ReturnType<typeof createClient>,
  userId: string
): Promise<void> {
  const { error } = await admin.rpc('devolver_credito_nutribot', { p_user_id: userId });
  if (error) {
    console.error('NutriBot: no se pudo devolver el crédito', error);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }
  if (req.method !== 'POST') {
    return jsonResponse(req, { error: 'Método no permitido' }, 405);
  }
  if (!ANTHROPIC_API_KEY) {
    console.error('NutriBot: falta ANTHROPIC_API_KEY en los secrets');
    return jsonResponse(req, { error: 'El asistente no está disponible por ahora.' }, 503);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return jsonResponse(req, { error: 'Falta autenticación' }, 401);
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
    return jsonResponse(req, { error: 'Sesión inválida' }, 401);
  }

  // ── 2. Body ───────────────────────────────────────────────────────────────
  let mensaje = '';
  let perfilId: string | null = null;
  let conversacionId: string | null = null;
  let historialBruto: unknown = null;
  try {
    const body = await req.json();
    mensaje = typeof body?.mensaje === 'string' ? body.mensaje.trim() : '';
    perfilId =
      typeof body?.perfilId === 'string' && UUID_REGEX.test(body.perfilId) ? body.perfilId : null;
    conversacionId =
      typeof body?.conversacionId === 'string' && UUID_REGEX.test(body.conversacionId)
        ? body.conversacionId
        : null;
    historialBruto = body?.historial ?? null;
  } catch {
    return jsonResponse(req, { error: 'Body inválido' }, 400);
  }

  if (!mensaje) {
    return jsonResponse(req, { error: 'El mensaje está vacío' }, 400);
  }
  if (mensaje.length > MAX_CHARS_MENSAJE) {
    return jsonResponse(
      req,
      { error: `El mensaje es demasiado largo (máximo ${MAX_CHARS_MENSAJE} caracteres).` },
      400
    );
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ── 3. Cupo: premium o free ───────────────────────────────────────────────
  const { data: esPremium, error: premErr } = await admin.rpc('user_es_premium', {
    uid: user.id,
  });
  if (premErr) {
    console.error('NutriBot: error verificando suscripción', premErr);
    return jsonResponse(req, { error: 'No pudimos verificar tu plan. Intenta de nuevo.' }, 500);
  }
  const limite = esPremium === true ? LIMITE_PREMIUM : LIMITE_FREE;

  // Consumo ATÓMICO antes de gastar un solo token de Anthropic.
  const { data: cupo, error: cupoErr } = await admin.rpc('consumir_credito_nutribot', {
    p_user_id: user.id,
    p_limite: limite,
  });
  if (cupoErr) {
    console.error('NutriBot: error consumiendo cupo', cupoErr);
    return jsonResponse(req, { error: 'No pudimos procesar tu mensaje. Intenta de nuevo.' }, 500);
  }

  const fila = Array.isArray(cupo) ? cupo[0] : cupo;
  if (!fila?.permitido) {
    return jsonResponse(
      req,
      {
        error: 'limite_alcanzado',
        mensaje: esPremium
          ? 'Alcanzaste el máximo de mensajes de este mes. El contador se reinicia el día 1.'
          : 'Alcanzaste tus mensajes gratuitos de este mes. Hazte premium para tener muchos más.',
        usados: fila?.usados ?? limite,
        limite,
        es_premium: esPremium === true,
      },
      429
    );
  }

  // ── 4. Contexto del niño (leído de la DB, verificando propiedad) ──────────
  let perfil = null;
  {
    let q = admin
      .from('perfiles_hijos')
      .select('nombre, fecha_nacimiento, etapa, alergias, objetivo_nutricional')
      .eq('user_id', user.id); // ← el filtro que impide leer el perfil de otro

    q = perfilId ? q.eq('id', perfilId) : q.order('created_at', { ascending: true });

    const { data } = await q.limit(1).maybeSingle();
    perfil = data ?? null;
  }

  // ── 5. Historial: la DB es la fuente de verdad ────────────────────────────
  //
  // Si el cliente manda una conversación existente, el contexto sale de la DB,
  // NO del array que mandó el cliente. Dos razones:
  //   1. El cliente es del atacante: si el contexto viniera de él, podría
  //      inventarle a NutriBot turnos que nunca ocurrieron ("me dijiste que la
  //      miel es segura a los 6 meses").
  //   2. Es la misma lectura que necesitamos igual para hacer el append de este
  //      turno, así que sale gratis.
  //
  // El filtro por `user_id` es lo que impide leer la conversación de otro usuario
  // mandando un id ajeno.
  let mensajesGuardados: { role: 'user' | 'assistant'; content: string }[] = [];
  let conversacionValida = false;

  if (conversacionId) {
    const { data, error: convReadErr } = await admin
      .from('conversaciones_ia')
      .select('mensajes')
      .eq('id', conversacionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (convReadErr) {
      console.warn('NutriBot: no se pudo leer la conversación', convReadErr);
    } else if (data) {
      conversacionValida = true;
      mensajesGuardados = Array.isArray(data.mensajes)
        ? (data.mensajes as { role: 'user' | 'assistant'; content: string }[])
        : [];
    }
  }

  // Fallback al historial del cliente solo si la DB no nos dio la conversación
  // (caída, o id que ya no existe). Preferimos responder con un contexto
  // imperfecto antes que romperle el chat al usuario.
  const historial = conversacionValida
    ? sanearHistorial(mensajesGuardados)
    : sanearHistorial(historialBruto);

  // ── 6. Llamada a Anthropic ────────────────────────────────────────────────
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  let respuesta = '';
  try {
    const completion = await anthropic.messages.create({
      model: MODELO,
      max_tokens: MAX_TOKENS_RESPUESTA,
      // Sin thinking: NutriBot es Q&A de dominio acotado con respuestas cortas,
      // y los tokens de razonamiento se facturan como output (5x el input).
      // Si en pruebas las respuestas quedan flojas, cambiar a
      // { type: 'adaptive' } y subir max_tokens — cuesta más pero razona mejor.
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
      system: [
        // Bloque estable → prefijo cacheado.
        { type: 'text', text: SYSTEM_ESTABLE, cache_control: { type: 'ephemeral' } },
        // Bloque variable → va después para no romper la caché.
        { type: 'text', text: construirContextoNino(perfil) },
      ],
      messages: [...historial, { role: 'user', content: mensaje }],
    });

    if (completion.stop_reason === 'refusal') {
      return jsonResponse(
        req,
        { error: 'No puedo ayudarte con esa consulta. Intenta reformularla.' },
        200
      );
    }

    respuesta = completion.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    // Telemetría de costo: mirar cache_read_input_tokens > 0 a partir del
    // segundo turno confirma que el prompt caching está funcionando.
    console.log(
      JSON.stringify({
        evento: 'nutribot_respuesta',
        input: completion.usage.input_tokens,
        output: completion.usage.output_tokens,
        cache_write: completion.usage.cache_creation_input_tokens ?? 0,
        cache_read: completion.usage.cache_read_input_tokens ?? 0,
        stop_reason: completion.stop_reason,
      })
    );
  } catch (e) {
    // El status y el tipo de error de Anthropic van al log del servidor, nunca
    // al cliente: un 401 o un problema de facturación no son asunto del usuario.
    console.error('NutriBot: fallo llamando a Anthropic', {
      nombre: (e as Error)?.name,
      mensaje: (e as Error)?.message,
      status: (e as { status?: number })?.status,
    });
    await devolverCredito(admin, user.id);
    return jsonResponse(
      req,
      { error: 'El asistente no pudo responder en este momento. Intenta de nuevo.' },
      502
    );
  }

  if (!respuesta) {
    console.error('NutriBot: Anthropic devolvió una respuesta vacía');
    await devolverCredito(admin, user.id);
    return jsonResponse(req, { error: 'El asistente no pudo responder. Intenta de nuevo.' }, 502);
  }

  // ── 7. Persistencia (best-effort: si falla, igual devolvemos la respuesta) ─
  //
  // UNA FILA = UNA CONVERSACIÓN. A `mensajes` se le hace APPEND del turno nuevo
  // sobre lo que ya había en la DB.
  //
  // OJO: acá NO se puede usar `historial`, que viene recortado a los últimos
  // MAX_TURNOS_HISTORIAL. Si se escribiera eso, cada turno truncaría la
  // conversación guardada a 10 mensajes y el historial dejaría de servir.
  const ahoraIso = new Date().toISOString();
  const turnoNuevo = [
    { role: 'user', content: mensaje, timestamp: ahoraIso },
    { role: 'assistant', content: respuesta, timestamp: ahoraIso },
  ];

  let idConversacion: string | null = conversacionValida ? conversacionId : null;

  if (idConversacion) {
    const { error: convErr } = await admin
      .from('conversaciones_ia')
      .update({
        mensajes: [...mensajesGuardados, ...turnoNuevo].slice(-MAX_MENSAJES_PERSISTIDOS),
        perfil_id: perfilId,
      })
      .eq('id', idConversacion)
      .eq('user_id', user.id);

    if (convErr) {
      console.warn('NutriBot: no se pudo actualizar la conversación', convErr);
    }
  } else {
    const { data: nueva, error: convErr } = await admin
      .from('conversaciones_ia')
      .insert({
        user_id: user.id,
        perfil_id: perfilId,
        titulo: derivarTitulo(mensaje),
        mensajes: turnoNuevo,
        updated_at: ahoraIso,
      })
      .select('id')
      .single();

    if (convErr) {
      console.warn('NutriBot: no se pudo crear la conversación', convErr);
    } else {
      idConversacion = (nueva?.id as string | undefined) ?? null;
    }
  }

  return jsonResponse(req, {
    respuesta,
    conversacion_id: idConversacion,
    usados: fila.usados,
    limite,
    es_premium: esPremium === true,
  });
});
