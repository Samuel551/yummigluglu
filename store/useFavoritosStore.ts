import { create } from 'zustand';
import { Favorito } from '@/types';
import { supabase } from '@/lib/supabase';

interface FavoritosState {
  favoritos: Favorito[];
  cargando: boolean;
  error: string | null;

  // Acciones
  cargarFavoritos: () => Promise<void>;
  agregarFavorito: (recetaId: string, perfilId?: string) => Promise<void>;
  quitarFavorito: (recetaId: string) => Promise<void>;
  esFavorito: (recetaId: string) => boolean;
  limpiarError: () => void;
}

export const useFavoritosStore = create<FavoritosState>((set, get) => ({
  favoritos: [],
  cargando: false,
  error: null,

  limpiarError: () => set({ error: null }),

  esFavorito: (recetaId) => get().favoritos.some((f) => f.receta_id === recetaId),

  cargarFavoritos: async () => {
    set({ cargando: true, error: null });
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ favoritos: data as Favorito[] });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },

  agregarFavorito: async (recetaId, perfilId) => {
    // Optimistic update: agregar inmediatamente a la UI
    const favoritoTemporal: Favorito = {
      id: `temp_${recetaId}`,
      user_id: '',
      receta_id: recetaId,
      perfil_id: perfilId,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ favoritos: [favoritoTemporal, ...state.favoritos] }));

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
      // Revertir el optimistic update en caso de error
      set((state) => ({
        favoritos: state.favoritos.filter((f) => f.id !== favoritoTemporal.id),
        error: (e as Error).message,
      }));
    }
  },

  quitarFavorito: async (recetaId) => {
    const favoritoAnterior = get().favoritos.find((f) => f.receta_id === recetaId);

    // Optimistic update: quitar inmediatamente
    set((state) => ({
      favoritos: state.favoritos.filter((f) => f.receta_id !== recetaId),
    }));

    try {
      const { error } = await supabase.from('favoritos').delete().eq('receta_id', recetaId);

      if (error) throw error;
    } catch (e) {
      // Revertir en caso de error
      set((state) => ({
        favoritos: favoritoAnterior ? [favoritoAnterior, ...state.favoritos] : state.favoritos,
        error: (e as Error).message,
      }));
    }
  },
}));
