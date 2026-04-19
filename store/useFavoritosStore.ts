import { create } from 'zustand';
import { Favorito, Receta } from '@/types';
import { supabase } from '@/lib/supabase';

interface FavoritosState {
  favoritos: Favorito[];
  recetasFavoritas: Receta[];
  cargando: boolean;
  error: string | null;

  // Acciones
  cargarFavoritos: () => Promise<void>;
  agregarFavorito: (recetaId: string, receta: Receta, perfilId?: string) => Promise<void>;
  quitarFavorito: (recetaId: string) => Promise<void>;
  esFavorito: (recetaId: string) => boolean;
  limpiarError: () => void;
}

export const useFavoritosStore = create<FavoritosState>((set, get) => ({
  favoritos: [],
  recetasFavoritas: [],
  cargando: false,
  error: null,

  limpiarError: () => set({ error: null }),

  esFavorito: (recetaId) => get().favoritos.some((f) => f.receta_id === recetaId),

  cargarFavoritos: async () => {
    set({ cargando: true, error: null });
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('*, receta:recetas(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const filas = (data ?? []) as (Favorito & { receta: Receta })[];
      set({
        favoritos: filas.map(({ receta: _r, ...f }) => f as Favorito),
        recetasFavoritas: filas.map((f) => f.receta).filter(Boolean),
      });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },

  agregarFavorito: async (recetaId, receta, perfilId) => {
    // Optimistic update inmediato
    const favoritoTemporal: Favorito = {
      id: `temp_${recetaId}`,
      user_id: '',
      receta_id: recetaId,
      perfil_id: perfilId,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      favoritos: [favoritoTemporal, ...state.favoritos],
      recetasFavoritas: [receta, ...state.recetasFavoritas],
    }));

    try {
      const { data, error } = await supabase
        .from('favoritos')
        .insert({ receta_id: recetaId, perfil_id: perfilId })
        .select()
        .single();

      if (error) throw error;

      // Reemplazar el temporal con el real
      set((state) => ({
        favoritos: state.favoritos.map((f) =>
          f.id === favoritoTemporal.id ? (data as Favorito) : f
        ),
      }));
    } catch (e) {
      // Revertir el optimistic update
      set((state) => ({
        favoritos: state.favoritos.filter((f) => f.id !== favoritoTemporal.id),
        recetasFavoritas: state.recetasFavoritas.filter((r) => r.id !== recetaId),
        error: (e as Error).message,
      }));
    }
  },

  quitarFavorito: async (recetaId) => {
    const favoritoAnterior = get().favoritos.find((f) => f.receta_id === recetaId);
    const recetaAnterior = get().recetasFavoritas.find((r) => r.id === recetaId);

    // Optimistic update inmediato
    set((state) => ({
      favoritos: state.favoritos.filter((f) => f.receta_id !== recetaId),
      recetasFavoritas: state.recetasFavoritas.filter((r) => r.id !== recetaId),
    }));

    try {
      const { error } = await supabase.from('favoritos').delete().eq('receta_id', recetaId);
      if (error) throw error;
    } catch (e) {
      // Revertir en caso de error
      set((state) => ({
        favoritos: favoritoAnterior ? [favoritoAnterior, ...state.favoritos] : state.favoritos,
        recetasFavoritas: recetaAnterior
          ? [recetaAnterior, ...state.recetasFavoritas]
          : state.recetasFavoritas,
        error: (e as Error).message,
      }));
    }
  },
}));
