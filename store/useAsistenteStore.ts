import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import {
  NUTRIBOT_LIMITE_FREE,
  NUTRIBOT_LIMITE_PREMIUM,
  NUTRIBOT_MAX_TURNOS_HISTORIAL,
} from '@/constants/Nutribot';
import type { MensajeIA, ResumenConversacion } from '@/types';

/**
 * NutriBot — chat con el asistente de alimentación infantil.
 *
 * UNA FILA DE `conversaciones_ia` = UNA CONVERSACIÓN. La escribe siempre la Edge
 * Function `nutribot` con `service_role`; el cliente solo LEE (para el panel de
 * historial) y BORRA (RLS lo limita a las propias). `conversacionId` es el hilo
 * abierto: si es `null`, el próximo mensaje arranca una conversación nueva y el
 * servidor devuelve el id recién creado.
 *
 * El cupo (`usados` / `limite`) lo manda el servidor en cada respuesta — esa es
 * la fuente de verdad. Las constantes de `constants/Nutribot.ts` solo se usan
 * para pintar el contador ANTES del primer mensaje.
 */

interface Cupo {
  usados: number;
  limite: number;
  esPremium: boolean;
}

interface AsistenteState {
  mensajes: MensajeIA[];
  conversacionId: string | null;
  conversaciones: ResumenConversacion[];
  cargandoConversaciones: boolean;
  enviando: boolean;
  error: string | null;
  cupo: Cupo | null;
  limiteAlcanzado: boolean;

  enviar: (texto: string, perfilId?: string | null) => Promise<void>;
  cargarCupo: () => Promise<void>;
  cargarConversaciones: () => Promise<void>;
  abrirConversacion: (id: string) => Promise<void>;
  eliminarConversacion: (id: string) => Promise<void>;
  nuevaConversacion: () => void;
  limpiarError: () => void;
}

function periodoActual(): string {
  const ahora = new Date();
  const anio = ahora.getUTCFullYear();
  const mes = String(ahora.getUTCMonth() + 1).padStart(2, '0');
  return `${anio}-${mes}`;
}

/**
 * `functions.invoke` devuelve `error` para cualquier respuesta no-2xx, pero el
 * body con nuestro detalle (limite_alcanzado, usados, etc.) viaja en la
 * Response original que queda colgada en `error.context`. Sin esto perdemos el
 * motivo real y solo veríamos "Edge Function returned a non-2xx status code".
 */
async function leerCuerpoDeError(error: unknown): Promise<Record<string, unknown> | null> {
  const contexto = (error as { context?: unknown })?.context;
  if (!contexto || typeof (contexto as Response).json !== 'function') return null;
  try {
    return (await (contexto as Response).json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const useAsistenteStore = create<AsistenteState>((set, get) => ({
  mensajes: [],
  conversacionId: null,
  conversaciones: [],
  cargandoConversaciones: false,
  enviando: false,
  error: null,
  cupo: null,
  limiteAlcanzado: false,

  limpiarError: () => set({ error: null }),

  /**
   * Abre un hilo nuevo. NO borra nada: la conversación anterior ya está guardada
   * en `conversaciones_ia` y sigue estando en el panel de historial.
   *
   * NO toca `limiteAlcanzado` ni `cupo` — el consumo vive en `uso_nutribot` del
   * lado del servidor y no se devuelve por empezar otro chat.
   */
  nuevaConversacion: () => set({ mensajes: [], conversacionId: null, error: null }),

  cargarConversaciones: async () => {
    set({ cargandoConversaciones: true });

    // Sin `mensajes` en el select: la lista solo pinta título y fecha. RLS ya
    // limita las filas a las del usuario, no hace falta filtrar por user_id.
    const { data, error } = await supabase
      .from('conversaciones_ia')
      .select('id, titulo, updated_at')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('NutriBot: no se pudo cargar el historial', error);
      set({ cargandoConversaciones: false });
      return;
    }

    set({ conversaciones: (data ?? []) as ResumenConversacion[], cargandoConversaciones: false });
  },

  abrirConversacion: async (id) => {
    const { data, error } = await supabase
      .from('conversaciones_ia')
      .select('mensajes')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      console.warn('NutriBot: no se pudo abrir la conversación', error);
      set({ error: 'No pudimos abrir esa conversación. Intenta de nuevo.' });
      return;
    }

    set({
      mensajes: Array.isArray(data.mensajes) ? (data.mensajes as MensajeIA[]) : [],
      conversacionId: id,
      error: null,
    });
  },

  eliminarConversacion: async (id) => {
    const previas = get().conversaciones;

    // Optimistic delete — mismo patrón que `useDiarioStore`.
    set({ conversaciones: previas.filter((c) => c.id !== id) });

    // Si el usuario borró el hilo que tiene abierto, la pantalla queda en uno
    // nuevo: dejar `conversacionId` apuntando a una fila muerta haría que el
    // próximo mensaje cayera en el fallback del servidor sin contexto.
    if (get().conversacionId === id) {
      set({ mensajes: [], conversacionId: null });
    }

    const { error } = await supabase.from('conversaciones_ia').delete().eq('id', id);

    if (error) {
      console.warn('NutriBot: no se pudo eliminar la conversación', error);
      set({ conversaciones: previas, error: 'No pudimos eliminar la conversación.' });
    }
  },

  cargarCupo: async () => {
    const esPremium = useSuscripcionStore.getState().esPremium;
    const limite = esPremium ? NUTRIBOT_LIMITE_PREMIUM : NUTRIBOT_LIMITE_FREE;

    const { data, error } = await supabase
      .from('uso_nutribot')
      .select('mensajes')
      .eq('periodo', periodoActual())
      .maybeSingle();

    if (error) {
      console.warn('No se pudo cargar el consumo de NutriBot', error);
      return;
    }

    const usados = (data?.mensajes as number | undefined) ?? 0;
    set({ cupo: { usados, limite, esPremium }, limiteAlcanzado: usados >= limite });
  },

  enviar: async (texto, perfilId) => {
    const limpio = texto.trim();
    if (!limpio || get().enviando) return;

    const ahora = new Date().toISOString();
    const mensajeUsuario: MensajeIA = { role: 'user', content: limpio, timestamp: ahora };

    // El historial que mandamos es el de ANTES de este mensaje: la Edge Function
    // agrega el mensaje nuevo por su cuenta. Recortamos acá también para no
    // mandar de gusto lo que el servidor va a descartar igual.
    const historial = get()
      .mensajes.slice(-NUTRIBOT_MAX_TURNOS_HISTORIAL)
      .map(({ role, content }) => ({ role, content }));

    set((s) => ({
      mensajes: [...s.mensajes, mensajeUsuario],
      enviando: true,
      error: null,
    }));

    const { data, error } = await supabase.functions.invoke('nutribot', {
      body: {
        mensaje: limpio,
        perfilId: perfilId ?? null,
        // Con `conversacionId` el servidor toma el contexto de la DB e ignora
        // `historial`; este solo se usa de fallback si no puede leerla.
        conversacionId: get().conversacionId,
        historial,
      },
    });

    if (error) {
      const cuerpo = await leerCuerpoDeError(error);

      if (cuerpo?.error === 'limite_alcanzado') {
        set((s) => ({
          // Sacamos el mensaje optimista: nunca llegó a procesarse.
          mensajes: s.mensajes.slice(0, -1),
          enviando: false,
          limiteAlcanzado: true,
          error: (cuerpo.mensaje as string) ?? 'Alcanzaste tu límite de mensajes de este mes.',
          cupo: {
            usados: (cuerpo.usados as number) ?? s.cupo?.usados ?? 0,
            limite: (cuerpo.limite as number) ?? s.cupo?.limite ?? NUTRIBOT_LIMITE_FREE,
            esPremium: (cuerpo.es_premium as boolean) ?? s.cupo?.esPremium ?? false,
          },
        }));
        return;
      }

      console.warn('NutriBot: error al enviar el mensaje', error, cuerpo);
      set((s) => ({
        mensajes: s.mensajes.slice(0, -1),
        enviando: false,
        error:
          (cuerpo?.error as string) ??
          'No pudimos enviar tu mensaje. Revisa tu conexión e intenta de nuevo.',
      }));
      return;
    }

    const respuesta = typeof data?.respuesta === 'string' ? data.respuesta : '';
    if (!respuesta) {
      set((s) => ({
        mensajes: s.mensajes.slice(0, -1),
        enviando: false,
        error: 'El asistente no pudo responder. Intenta de nuevo.',
      }));
      return;
    }

    const usados = (data.usados as number | undefined) ?? 0;
    const limite = (data.limite as number | undefined) ?? NUTRIBOT_LIMITE_FREE;
    const idConversacion =
      typeof data.conversacion_id === 'string' ? (data.conversacion_id as string) : null;

    set((s) => ({
      mensajes: [
        ...s.mensajes,
        { role: 'assistant', content: respuesta, timestamp: new Date().toISOString() },
      ],
      enviando: false,
      // El primer mensaje de un hilo nuevo devuelve el id recién creado: a partir
      // de acá los siguientes turnos se appendean a esa misma fila. Si el
      // servidor no pudo persistir, queda en null y el próximo turno reintenta
      // crear la conversación (mejor eso que perder el hilo en silencio).
      conversacionId: idConversacion ?? s.conversacionId,
      cupo: { usados, limite, esPremium: (data.es_premium as boolean) ?? false },
      limiteAlcanzado: usados >= limite,
    }));
  },
}));
