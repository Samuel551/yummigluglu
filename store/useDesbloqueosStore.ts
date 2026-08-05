import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

/**
 * Reintentos del canje mientras se espera el callback SSV de Google.
 *
 * 5 intentos × 1,5 s ≈ 7,5 s de ventana. Google suele llamar en menos de 2 s;
 * el margen cubre una red lenta sin dejar al usuario mirando un spinner eterno.
 */
const INTENTOS_CANJE = 5;
const ESPERA_ENTRE_INTENTOS_MS = 1500;

/**
 * Desbloqueos temporales de recetas premium ganados con anuncios recompensados.
 *
 * Fuente de verdad: tabla `desbloqueos_temporales` en Supabase (escrita solo por
 * la Edge Function `canjear-desbloqueo`). El cliente LEE los suyos vía RLS y los
 * cachea en memoria para pintar el estado (candado / desbloqueado) sin ir a la
 * red en cada card.
 */
interface DesbloqueosState {
  // recetaId → timestamp de expiración (ms epoch)
  desbloqueos: Record<string, number>;
  cargar: () => Promise<void>;
  limpiar: () => void;
  estaDesbloqueada: (recetaId: string) => boolean;
  // Canjea un desbloqueo (llamar DESPUÉS de que el usuario completó el rewarded).
  // Devuelve true si el servidor lo concedió.
  desbloquear: (recetaId: string) => Promise<boolean>;
}

export const useDesbloqueosStore = create<DesbloqueosState>((set, get) => ({
  desbloqueos: {},

  cargar: async () => {
    const ahoraIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('desbloqueos_temporales')
      .select('receta_id, expires_at')
      .gt('expires_at', ahoraIso);

    if (error || !data) return;

    const mapa: Record<string, number> = {};
    for (const row of data) {
      mapa[row.receta_id as string] = new Date(row.expires_at as string).getTime();
    }
    set({ desbloqueos: mapa });
  },

  limpiar: () => set({ desbloqueos: {} }),

  estaDesbloqueada: (recetaId) => {
    const exp = get().desbloqueos[recetaId];
    return exp != null && exp > Date.now();
  },

  desbloquear: async (recetaId) => {
    // El canje necesita un CRÉDITO que crea el callback SSV de Google, y ese
    // callback llega servidor a servidor unos segundos después de que el ad
    // termina — no siempre antes de que el usuario vuelva a la app.
    //
    // Por eso se reintenta: un 409 `sin_credito` en el primer intento es lo
    // NORMAL, no un fallo. Recién si no aparece en toda la ventana se da por
    // perdido. Esta espera es el precio de no confiar en el cliente.
    for (let intento = 0; intento < INTENTOS_CANJE; intento++) {
      if (intento > 0) {
        await new Promise((r) => setTimeout(r, ESPERA_ENTRE_INTENTOS_MS));
      }

      const { data, error } = await supabase.functions.invoke('canjear-desbloqueo', {
        body: { recetaId },
      });

      if (!error && data?.ok && data?.expires_at) {
        set((s) => ({
          desbloqueos: {
            ...s.desbloqueos,
            [recetaId]: new Date(data.expires_at as string).getTime(),
          },
        }));
        return true;
      }

      // `functions.invoke` no expone el status ni el cuerpo del error (devuelve
      // un FunctionsHttpError genérico), así que no se puede distinguir un 409
      // "todavía no llegó" de un 404 "receta inexistente". Se reintenta igual:
      // el costo de un reintento de más es una llamada, y el de no reintentar es
      // que el usuario pierda una recompensa que se ganó.
      console.warn(`Canje intento ${intento + 1}/${INTENTOS_CANJE} sin éxito`, error ?? data);
    }

    return false;
  },
}));
