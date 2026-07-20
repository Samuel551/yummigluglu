import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
    const { data, error } = await supabase.functions.invoke('canjear-desbloqueo', {
      body: { recetaId },
    });

    if (error || !data?.ok || !data?.expires_at) {
      console.warn('Desbloqueo rechazado por el servidor', error ?? data);
      return false;
    }

    set((s) => ({
      desbloqueos: {
        ...s.desbloqueos,
        [recetaId]: new Date(data.expires_at as string).getTime(),
      },
    }));
    return true;
  },
}));
