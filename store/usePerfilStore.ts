import { create } from 'zustand';
import { PerfilHijo, PerfilHijoInput } from '@/types';
import { supabase } from '@/lib/supabase';

interface PerfilState {
  perfiles: PerfilHijo[];
  perfilActivo: PerfilHijo | null;
  cargando: boolean;
  error: string | null;

  // Acciones
  cargarPerfiles: () => Promise<void>;
  crearPerfil: (input: PerfilHijoInput) => Promise<PerfilHijo | null>;
  actualizarPerfil: (id: string, input: Partial<PerfilHijoInput>) => Promise<void>;
  eliminarPerfil: (id: string) => Promise<void>;
  setPerfilActivo: (perfil: PerfilHijo | null) => void;
  limpiarError: () => void;
}

export const usePerfilStore = create<PerfilState>((set, get) => ({
  perfiles: [],
  perfilActivo: null,
  cargando: false,
  error: null,

  limpiarError: () => set({ error: null }),

  setPerfilActivo: (perfil) => set({ perfilActivo: perfil }),

  cargarPerfiles: async () => {
    set({ cargando: true, error: null });
    try {
      const { data, error } = await supabase
        .from('perfiles_hijos')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const perfiles = data as PerfilHijo[];
      set({ perfiles });

      // Si no hay perfil activo pero hay perfiles, activar el primero
      if (!get().perfilActivo && perfiles.length > 0) {
        set({ perfilActivo: perfiles[0] });
      }
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },

  crearPerfil: async (input) => {
    if (get().perfiles.length >= 2) {
      set({ error: 'Plan gratuito: puedes tener hasta 2 perfiles.' });
      return null;
    }
    set({ cargando: true, error: null });
    try {
      const { data, error } = await supabase.from('perfiles_hijos').insert(input).select().single();

      if (error) throw error;

      const nuevoPerfil = data as PerfilHijo;
      set((state) => ({
        perfiles: [...state.perfiles, nuevoPerfil],
        // Si es el primero, lo activamos automáticamente
        perfilActivo: state.perfiles.length === 0 ? nuevoPerfil : state.perfilActivo,
      }));

      return nuevoPerfil;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    } finally {
      set({ cargando: false });
    }
  },

  actualizarPerfil: async (id, input) => {
    set({ cargando: true, error: null });
    try {
      const { data, error } = await supabase
        .from('perfiles_hijos')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const perfilActualizado = data as PerfilHijo;
      set((state) => ({
        perfiles: state.perfiles.map((p) => (p.id === id ? perfilActualizado : p)),
        perfilActivo: state.perfilActivo?.id === id ? perfilActualizado : state.perfilActivo,
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },

  eliminarPerfil: async (id) => {
    set({ cargando: true, error: null });
    try {
      const { error } = await supabase.from('perfiles_hijos').delete().eq('id', id);
      if (error) throw error;

      set((state) => {
        const nuevosPerfiles = state.perfiles.filter((p) => p.id !== id);
        return {
          perfiles: nuevosPerfiles,
          // Si el perfil eliminado era el activo, activar el primero disponible
          perfilActivo:
            state.perfilActivo?.id === id ? (nuevosPerfiles[0] ?? null) : state.perfilActivo,
        };
      });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },
}));
