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
  paquetes: PurchasesPackage[];
  cargando: boolean;
  comprando: boolean;
  error: string | null;

  inicializarRevenueCat: (userId: string) => Promise<void>;
  cerrarSesionRevenueCat: () => Promise<void>;
  cargarSuscripcion: () => Promise<void>;
  cargarPaquetes: () => Promise<void>;
  comprarPremium: () => Promise<void>;
  restaurarCompras: () => Promise<void>;
  limpiarError: () => void;
}

export const useSuscripcionStore = create<SuscripcionState>((set, get) => ({
  suscripcion: null,
  esPremium: false,
  paquetes: [],
  cargando: false,
  comprando: false,
  error: null,

  limpiarError: () => set({ error: null }),

  inicializarRevenueCat: async (userId) => {
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
      await Promise.all([get().cargarSuscripcion(), get().cargarPaquetes()]);
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
    set({ suscripcion: null, esPremium: false, paquetes: [] });
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
      set({ cargando: false });
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

  comprarPremium: async () => {
    if (!revenueCatListo) {
      set({ error: 'Las compras no están disponibles en este momento.' });
      return;
    }
    const { paquetes } = get();
    const paquete = paquetes[0];
    if (!paquete) {
      set({ error: 'No hay paquetes disponibles. Intenta más tarde.' });
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
