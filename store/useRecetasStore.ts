import { create } from 'zustand';
import { Receta, FiltrosReceta } from '@/types';
import { supabase } from '@/lib/supabase';

interface RecetasState {
  recetas: Receta[];
  cargando: boolean;
  error: string | null;

  // Acciones
  cargarRecetas: (filtros?: FiltrosReceta) => Promise<void>;
  limpiarError: () => void;
}

export const useRecetasStore = create<RecetasState>((set) => ({
  recetas: [],
  cargando: false,
  error: null,

  limpiarError: () => set({ error: null }),

  cargarRecetas: async (filtros) => {
    set({ cargando: true, error: null });
    try {
      let query = supabase.from('recetas').select('*').eq('activa', true);

      // Filtrar por etapa compatible con el perfil activo
      if (filtros?.etapa) {
        query = query.contains('etapas_compatibles', [filtros.etapa]);
      }

      // Filtrar por momento del día
      if (filtros?.momento) {
        query = query.contains('momento_dia', [filtros.momento]);
      }

      // Filtrar solo recetas gratuitas
      if (filtros?.solo_sin_premium) {
        query = query.eq('es_premium', false);
      }

      // Excluir alergenos del perfil del bebé
      if (filtros?.excluir_alergenos?.length) {
        for (const alergeno of filtros.excluir_alergenos) {
          query = query.not('alergenos', 'cs', `{${alergeno}}`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;

      set({ recetas: (data as Receta[]) ?? [] });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },
}));
