import { create } from 'zustand';
import { Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const APP_REDIRECT_URL =
  Platform.OS === 'web' && typeof window !== 'undefined'
    ? `${window.location.origin}/`
    : Linking.createURL('/', { scheme: 'yummigluglu' });
import { supabase } from '@/lib/supabase';
import { mensajeError } from '@/lib/errores';

// Configuración de Google Sign In — corre una vez al cargar el módulo.
// El webClientId es el "Web Client" de Google Cloud (público, NO secreto).
// En web el módulo nativo no aplica, por eso el guard de plataforma.
if (Platform.OS !== 'web' && process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
}

interface AuthState {
  session: Session | null;
  usuario: User | null;
  cargando: boolean;
  error: string | null;
  // True mientras un link de reset (type=recovery) está activo: fuerza a los
  // guards a mandar al usuario a /nueva-contrasena hasta que setee la clave.
  recoveryPendiente: boolean;

  // Acciones
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrarse: (email: string, password: string) => Promise<void>;
  iniciarSesionConGoogle: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
  enviarMagicLink: (email: string) => Promise<void>;
  actualizarEmail: (email: string) => Promise<void>;
  actualizarContrasena: (contrasena: string) => Promise<void>;
  enviarResetContrasena: (email: string) => Promise<void>;
  setSession: (session: Session | null) => void;
  setRecoveryPendiente: (v: boolean) => void;
  limpiarError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  usuario: null,
  cargando: false,
  error: null,
  recoveryPendiente: false,

  setSession: (session) =>
    set({
      session,
      usuario: session?.user ?? null,
    }),

  setRecoveryPendiente: (v) => set({ recoveryPendiente: v }),

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

  iniciarSesionConGoogle: async () => {
    set({ cargando: true, error: null });
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Cerramos cualquier sesión local de Google previa (NO toca la de Supabase)
      // para que SIEMPRE aparezca el selector de cuentas. Si no, la librería reusa
      // en silencio la última cuenta usada y no deja elegir otra.
      await GoogleSignin.signOut();
      const respuesta = await GoogleSignin.signIn();
      // El usuario cerró el selector sin elegir cuenta → no es error, salimos en silencio
      if (!isSuccessResponse(respuesta)) {
        return;
      }
      const idToken = respuesta.data.idToken;
      if (!idToken) {
        throw new Error('No se recibió el token de Google. Intenta de nuevo.');
      }
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;
      // Si el usuario recién se creó (< 60s), le mandamos el correo de bienvenida.
      // Best-effort: si falla, NO rompe el login (por eso el catch vacío).
      const usuario = data.user;
      if (usuario && Date.now() - new Date(usuario.created_at).getTime() < 60_000) {
        supabase.functions.invoke('welcome-email').catch(() => {});
      }
      // La navegación la maneja el listener de auth en _layout.tsx
    } catch (e) {
      // Si el usuario cancela el selector (por código), tampoco lo mostramos como error
      if (
        isErrorWithCode(e) &&
        (e.code === statusCodes.SIGN_IN_CANCELLED || e.code === statusCodes.IN_PROGRESS)
      ) {
        return;
      }
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

  actualizarContrasena: async (contrasena) => {
    set({ cargando: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({ password: contrasena });
      if (error) throw error;
    } catch (e) {
      set({ error: mensajeError(e) });
    } finally {
      set({ cargando: false });
    }
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
