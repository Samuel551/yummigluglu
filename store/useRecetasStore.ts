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

/**
 * Contador de peticiones para descartar respuestas viejas.
 *
 * En nativo los tabs quedan MONTADOS: Inicio (`(tabs)/index.tsx`) y Catálogo
 * (`(tabs)/recetas.tsx`) se suscriben los dos al país y escriben esta misma
 * lista global. Al cambiar de país disparan dos cargas en paralelo con filtros
 * distintos (Inicio no manda `momento`), y sin este guard ganaba la que
 * respondía última — no la más nueva. Resultado: el catálogo podía quedar con
 * el resultado de otra pantalla o de un país anterior.
 */
let peticionActual = 0;

export const useRecetasStore = create<RecetasState>((set) => ({
  recetas: [],
  cargando: false,
  error: null,

  limpiarError: () => set({ error: null }),

  cargarRecetas: async (filtros) => {
    const idPeticion = ++peticionActual;
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

      // Llegó tarde: ya salió una carga más nueva. Descartamos para no pisarla.
      if (idPeticion !== peticionActual) return;
      set({ recetas: resultado });
    } catch (e) {
      if (idPeticion !== peticionActual) return;
      set({ error: (e as Error).message });
    } finally {
      if (idPeticion === peticionActual) set({ cargando: false });
    }
  },
}));
