import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { mensajeError } from '@/lib/errores';
import { DiarioAlimento, ReaccionAlimento } from '@/types';

interface DiarioState {
  entradas: DiarioAlimento[];
  cargando: boolean;
  error: string | null;

  cargarDiario: (perfilId: string) => Promise<void>;
  agregarAlimento: (
    perfilId: string,
    alimento: string,
    fecha: string,
    reaccion: ReaccionAlimento,
    notas?: string
  ) => Promise<void>;
  editarAlimento: (
    id: string,
    alimento: string,
    fecha: string,
    reaccion: ReaccionAlimento,
    notas?: string
  ) => Promise<void>;
  eliminarAlimento: (id: string) => Promise<void>;
  limpiarDiario: () => void;
}

export const useDiarioStore = create<DiarioState>((set, get) => ({
  entradas: [],
  cargando: false,
  error: null,

  limpiarDiario: () => set({ entradas: [], error: null }),

  cargarDiario: async (perfilId) => {
    set({ cargando: true, error: null });
    try {
      const { data, error } = await supabase
        .from('diario_alimentos')
        .select('*')
        .eq('perfil_id', perfilId)
        .order('fecha_introduccion', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ entradas: (data ?? []) as DiarioAlimento[] });
    } catch (e) {
      set({ error: mensajeError(e) });
    } finally {
      set({ cargando: false });
    }
  },

  agregarAlimento: async (perfilId, alimento, fecha, reaccion, notas) => {
    set({ error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Sin sesión activa');

      const { data, error } = await supabase
        .from('diario_alimentos')
        .insert({
          user_id: user.id,
          perfil_id: perfilId,
          alimento: alimento.trim(),
          fecha_introduccion: fecha,
          reaccion,
          notas: notas?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Insertar optimistamente al inicio de la lista
      set({ entradas: [data as DiarioAlimento, ...get().entradas] });
    } catch (e) {
      set({ error: mensajeError(e) });
    }
  },

  editarAlimento: async (id, alimento, fecha, reaccion, notas) => {
    const prev = get().entradas;
    set({
      entradas: prev.map((e) =>
        e.id === id
          ? {
              ...e,
              alimento: alimento.trim(),
              fecha_introduccion: fecha,
              reaccion,
              notas: notas?.trim() || undefined,
            }
          : e
      ),
      error: null,
    });

    try {
      const { error } = await supabase
        .from('diario_alimentos')
        .update({
          alimento: alimento.trim(),
          fecha_introduccion: fecha,
          reaccion,
          notas: notas?.trim() || null,
        })
        .eq('id', id);

      if (error) set({ entradas: prev, error: error.message });
    } catch (e) {
      set({ entradas: prev, error: (e as Error).message });
    }
  },

  eliminarAlimento: async (id) => {
    // Optimistic delete
    const prev = get().entradas;
    set({ entradas: prev.filter((e) => e.id !== id) });

    const { error } = await supabase.from('diario_alimentos').delete().eq('id', id);
    if (error) {
      set({ entradas: prev, error: error.message });
    }
  },
}));
