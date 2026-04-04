import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  usuario: User | null;
  cargando: boolean;
  error: string | null;

  // Acciones
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrarse: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  enviarMagicLink: (email: string) => Promise<void>;
  setSession: (session: Session | null) => void;
  limpiarError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  usuario: null,
  cargando: false,
  error: null,

  setSession: (session) =>
    set({
      session,
      usuario: session?.user ?? null,
    }),

  limpiarError: () => set({ error: null }),

  iniciarSesion: async (email, password) => {
    set({ cargando: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },

  registrarse: async (email, password) => {
    set({ cargando: true, error: null });
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },

  cerrarSesion: async () => {
    set({ cargando: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ session: null, usuario: null });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },

  enviarMagicLink: async (email) => {
    set({ cargando: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ cargando: false });
    }
  },
}));
