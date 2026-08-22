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

      // Pollear Supabase hasta que el webhook de RevenueCat actualice la DB.
      // En producción el webhook tarda < 5 segundos.
      for (let intento = 0; intento < 10; intento++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await get().cargarSuscripcion();
        if (get().esPremium) break;
      }
    } catch (e) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) {
        set({ error: err.message ?? 'Error al procesar la compra.' });
      }
    } finally {
      set({ comprando: false });
    }
  },

  restaurarCompras: async () => {
    if (!revenueCatListo) {
      set({ error: 'Las compras no están disponibles en este momento.' });
      return;
    }
    set({ comprando: true, error: null });
    try {
      await Purchases.restorePurchases();

      for (let intento = 0; intento < 10; intento++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await get().cargarSuscripcion();
        if (get().esPremium) break;
      }
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ comprando: false });
    }
  },
}));
