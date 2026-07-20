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
      // Leemos de la vista `recetas_teaser` (no de la tabla) para que las recetas
      // premium aparezcan como teaser con candado para los usuarios free. La vista
      // gatea el contenido pesado server-side. Ver migración 023.
      let query = supabase.from('recetas_teaser').select('*').eq('activa', true);

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

      // Filtrar por país en memoria.
      // Universal = tiene los 6 países específicos → aparece en cualquier filtro de país.
      // País específico (ej. 'colombia' sin los otros 5) → solo aparece con ese país o 'todos'.
      const TODOS_LOS_PAISES = ['chile', 'peru', 'colombia', 'venezuela', 'argentina', 'mexico'];
      let resultado = (data as Receta[]) ?? [];
      if (filtros?.pais && filtros.pais !== 'todos') {
        const p = filtros.pais;
        resultado = resultado.filter(
          (r) => r.tags.includes(p) || TODOS_LOS_PAISES.every((id) => r.tags.includes(id))
        );
      }

      set({ recetas: resultado });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },
}));
