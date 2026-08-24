import { create } from 'zustand';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { supabase } from '@/lib/supabase';
import { Suscripcion } from '@/types';

const API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? '';

// Flag de runtime: queda en false si la inicialización falla, y los métodos hacen no-op.
// Evita que llamadas posteriores (cargarPaquetes, comprarPremium) crashen cuando el
// módulo nativo no está disponible (Expo Go, dev client sin recompilar, sin API key).
let revenueCatListo = false;

// Lógica de verificación en cliente (solo para UI).
// La fuente de verdad real es la RLS de Supabase.
function calcularEsPremium(suscripcion: Suscripcion | null): boolean {
  if (!suscripcion) return false;
  if (!suscripcion.activa) return false;
  if (suscripcion.plan !== 'premium' && suscripcion.plan !== 'premium_anual') return false;
  if (suscripcion.expires_at && new Date(suscripcion.expires_at) <= new Date()) return false;
  return true;
}

interface SuscripcionState {
  suscripcion: Suscripcion | null;
  esPremium: boolean;
  /**
   * `false` mientras todavía no sabemos si el usuario es premium.
   *
   * `esPremium` arranca en `false`, así que sin este flag es imposible distinguir
   * "no es premium" de "todavía no llegó la respuesta de Supabase". Los anuncios
   * se inicializan apenas abre la app, mucho antes que esa respuesta: sin este
   * flag, un premium veía publicidad durante los primeros segundos de cada
   * arranque en frío.
   *
   * Regla para todo formato de anuncio: **ante la duda, no mostrar**. Que un free
   * no vea el banner dos segundos no cuesta nada; que un premium lo vea, sí.
   */
  suscripcionResuelta: boolean;
  paquetes: PurchasesPackage[];
  cargando: boolean;
  comprando: boolean;
  error: string | null;

  inicializarRevenueCat: (userId: string) => Promise<void>;
  cerrarSesionRevenueCat: () => Promise<void>;
  cargarSuscripcion: () => Promise<void>;
  cargarPaquetes: () => Promise<void>;
  comprarPremium: (paquete: PurchasesPackage) => Promise<void>;
  restaurarCompras: () => Promise<void>;
  /** Verifica la suscripción contra RevenueCat vía Edge Function, sin depender del webhook. */
  sincronizarConServidor: () => Promise<void>;
  limpiarError: () => void;
}

export const useSuscripcionStore = create<SuscripcionState>((set, get) => ({
  suscripcion: null,
  esPremium: false,
  suscripcionResuelta: false,
  paquetes: [],
  cargando: false,
  comprando: false,
  error: null,

  limpiarError: () => set({ error: null }),

  inicializarRevenueCat: async (userId) => {
    // La suscripción vive en Supabase y NO depende de RevenueCat, así que se carga
    // siempre y antes que nada. Si quedara dentro de los early returns de abajo,
    // en cualquier build sin RevenueCat (web, dev sin .env.local, módulo nativo
    // ausente) `suscripcionResuelta` no pasaría nunca a true y los anuncios
    // dejarían de mostrarse a TODOS — free incluidos.
    await get().cargarSuscripcion();

    // Sin API key configurada no tiene sentido inicializar (típico en dev sin .env.local)
    if (!API_KEY_ANDROID) return;
    // El módulo nativo no está disponible en builds sin react-native-purchases compilado
    if (!Purchases || typeof Purchases.configure !== 'function') return;
    try {
      // setLogLevel se omite a propósito: en algunos builds el método nativo es async y su
      // promise rechaza fuera del try/catch, generando "Uncaught (in promise)". El default
      // de logging (warn) es suficiente.
      await Purchases.configure({ apiKey: API_KEY_ANDROID });
      await Purchases.logIn(userId);
      revenueCatListo = true;
      await get().cargarPaquetes();
    } catch (e) {
      revenueCatListo = false;
      console.warn('RevenueCat: error de inicialización —', (e as Error).message);
    }
  },

  cerrarSesionRevenueCat: async () => {
    if (revenueCatListo) {
      try {
        await Purchases.logOut();
      } catch {
        // Sin sesión activa en RC — ignorar
      }
    }
    revenueCatListo = false;
    // `suscripcionResuelta` vuelve a false: al cerrar sesión dejamos de saber si el
    // próximo usuario es premium, y hasta que no se resuelva no debe verse un anuncio.
    set({ suscripcion: null, esPremium: false, suscripcionResuelta: false, paquetes: [] });
  },

  cargarSuscripcion: async () => {
    set({ cargando: true });
    try {
      const { data, error } = await supabase.from('suscripciones').select('*').maybeSingle();

      if (error) throw error;
      const suscripcion = data as Suscripcion | null;
      set({ suscripcion, esPremium: calcularEsPremium(suscripcion) });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      // Se marca resuelta AUNQUE haya fallado: si la consulta no responde, tratamos
      // al usuario como free (que es lo que dice `esPremium`) en vez de dejar los
      // anuncios apagados para siempre. La fuente de verdad sigue siendo la tabla
      // `suscripciones`; el siguiente `cargarSuscripcion` corrige el estado.
      set({ cargando: false, suscripcionResuelta: true });
    }
  },

  cargarPaquetes: async () => {
    if (!revenueCatListo) return;
    try {
      const offerings = await Purchases.getOfferings();
      const paquetes = offerings.current?.availablePackages ?? [];
      set({ paquetes });
    } catch (e) {
      console.warn('RevenueCat: error al cargar paquetes —', (e as Error).message);
    }
  },

  // 🔴 Recibe el paquete ELEGIDO por el usuario. Antes tomaba `paquetes[0]` mientras la
  // pantalla mostraba "PLAN MENSUAL / por mes" en texto fijo: con un offering de dos
  // planes, si el anual venía primero la app anunciaba precio mensual y cobraba un año.
  // El periodo y el precio salen del paquete (`lib/planes.ts`). NO volver a elegirlo acá.
  comprarPremium: async (paquete) => {
    if (!revenueCatListo) {
      set({ error: 'Las compras no están disponibles en este momento.' });
      return;
    }
    if (!paquete) {
      set({ error: 'No hay planes disponibles. Intenta más tarde.' });
      return;
    }

    set({ comprando: true, error: null });
    try {
      await Purchases.purchasePackage(paquete);

      // Camino rápido: el webhook de RevenueCat suele escribir la fila en
      // pocos segundos. Se pollea porque es gratis y no toca RevenueCat.
      for (let intento = 0; intento < 10; intento++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await get().cargarSuscripcion();
        if (get().esPremium) break;
      }

      // 🔴 Red de seguridad OBLIGATORIA — el polling solo NO alcanza.
      //
      // En la primera compra real (2026-08-24) el webhook tardó **12 segundos**
      // en escribir la fila, y este bucle se rinde a los ~10. O sea que el
      // camino feliz medido en producción YA se pasa de la ventana: el usuario
      // paga, el bucle se agota y la app lo deja en free sin decir nada.
      //
      // `sincronizar-suscripcion` no espera a nadie: le pregunta a RevenueCat
      // por la API REST y escribe la fila. Determinístico en vez de carrera.
      if (!get().esPremium) {
        await get().sincronizarConServidor();
      }

      if (!get().esPremium) {
        set({
          error:
            'Tu pago se procesó, pero no pudimos activar el Premium todavía. Toca "Restaurar compras" en unos minutos.',
        });
      }
    } catch (e) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) {
        // El mensaje crudo de RevenueCat viene en inglés y es críptico: va al
        // log, no a la pantalla.
        console.warn('Compra premium: error de RevenueCat —', err.message);
        set({ error: 'No pudimos completar la compra. Intenta de nuevo.' });
      }
    } finally {
      set({ comprando: false });
    }
  },

  /**
   * Le pregunta al servidor si este usuario tiene una suscripción activa en
   * RevenueCat, y actualiza `suscripciones` si la hay.
   *
   * Existe porque NO se puede depender del webhook para reparar: ver el
   * encabezado de `supabase/functions/sincronizar-suscripcion/index.ts`.
   */
  sincronizarConServidor: async () => {
    const { error: fnError } = await supabase.functions.invoke('sincronizar-suscripcion', {
      body: {},
    });
    if (fnError) {
      // `functions.invoke` NO propaga el cuerpo del error: ante cualquier 4xx/5xx
      // devuelve el genérico "non-2xx status code". Por eso se loguea el
      // original y el mensaje user-facing lo pone quien llama.
      console.warn('Sincronizar suscripción: falló la Edge Function —', fnError.message);
      return;
    }
    await get().cargarSuscripcion();
  },

  restaurarCompras: async () => {
    if (!revenueCatListo) {
      set({ error: 'Las compras no están disponibles en este momento.' });
      return;
    }
    set({ comprando: true, error: null });
    try {
      // Le pide a RevenueCat que re-sincronice con Google Play.
      await Purchases.restorePurchases();

      // 🔴 Acá estaba el bug (encontrado en el QA del 2026-08-24).
      //
      // Antes esto era un bucle de 10 segundos esperando a que el WEBHOOK
      // actualizara la tabla. Pero `restorePurchases()` **no dispara webhook**
      // si RevenueCat ya tenía la compra y nada cambió — que es exactamente el
      // caso de "restaurar". Verificado: durante toda la prueba
      // `webhook_events_procesados` se quedó en 1.
      //
      // Resultado viejo: 10 segundos de spinner y nada, sin ningún mensaje.
      // El botón que existe para reparar un webhook caído dependía del webhook.
      await get().sincronizarConServidor();

      if (!get().esPremium) {
        set({
          error:
            'No encontramos una suscripción activa en esta cuenta de Google Play. Revisa que sea la misma con la que compraste.',
        });
      }
    } catch (e) {
      console.warn('Restaurar compras: error de RevenueCat —', (e as Error).message);
      set({ error: 'No pudimos restaurar tus compras. Intenta de nuevo.' });
    } finally {
      set({ comprando: false });
    }
  },
}));
