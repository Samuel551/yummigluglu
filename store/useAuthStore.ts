import { create } from 'zustand';
import { Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

const APP_REDIRECT_URL =
  Platform.OS === 'web' && typeof window !== 'undefined'
    ? `${window.location.origin}/`
    : Linking.createURL('/', { scheme: 'babybites' });
import { supabase } from '@/lib/supabase';
import { mensajeError } from '@/lib/errores';

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
  actualizarEmail: (email: string) => Promise<void>;
  actualizarContrasena: (contrasena: string) => Promise<void>;
  enviarResetContrasena: (email: string) => Promise<void>;
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
      set({ error: mensajeError(e) });
    } finally {
      set({ cargando: false });
    }
  },

  registrarse: async (email, password) => {
    set({ cargando: true, error: null });
    try {
      const redirectUrl = APP_REDIRECT_URL;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      // Supabase devuelve identities vacío cuando el email ya existe (no lanza error por seguridad)
      if ((data.user?.identities?.length ?? 0) === 0) {
        set({ error: 'Este correo ya está registrado. Inicia sesión.' });
        return;
      }
    } catch (e) {
      set({ error: mensajeError(e) });
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
      set({ error: mensajeError(e) });
    } finally {
      set({ cargando: false });
    }
  },

  actualizarEmail: async (email) => {
    set({ cargando: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      const { data } = await supabase.auth.getUser();
      set({ usuario: data.user });
    } catch (e) {
      set({ error: mensajeError(e) });
    } finally {
      set({ cargando: false });
    }
  },

  actualizarContrasena: async (_contrasena) => {
    // No usado — el cambio de contraseña se hace vía email de reset
  },

  enviarResetContrasena: async (email) => {
    set({ cargando: true, error: null });
    try {
      // Verificar si el email está registrado antes de enviar el reset
      const { data: existe, error: rpcError } = await supabase.rpc('verificar_email_registrado', {
        email_input: email,
      });
      if (rpcError) throw rpcError;
      if (!existe) {
        set({ error: 'Este correo no está registrado.' });
        return;
      }
      const redirectUrl = APP_REDIRECT_URL;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) throw error;
    } catch (e) {
      set({ error: mensajeError(e) });
    } finally {
      set({ cargando: false });
    }
  },

  enviarMagicLink: async (email) => {
    set({ cargando: true, error: null });
    try {
      const redirectUrl = APP_REDIRECT_URL;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (e) {
      set({ error: mensajeError(e) });
    } finally {
      set({ cargando: false });
    }
  },
}));
