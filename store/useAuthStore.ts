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
  eliminarCuenta: () => Promise<boolean>;
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
      // WEB (herramienta de dev — la app es Android-only): el módulo nativo de
      // Google Sign In no existe en el navegador. Acá va el flujo OAuth clásico
      // de Supabase: redirect a Google y vuelta a esta misma URL con los tokens
      // en el fragment, que los captura detectSessionInUrl (habilitado solo en
      // web en lib/supabase.ts).
      // ⚠️ Requiere el origin (http://localhost:8081) en la whitelist de
      // Redirect URLs del dashboard — si no matchea, Supabase cae al Site URL
      // (yummigluglu://) EN SILENCIO y el navegador queda colgado.
      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: APP_REDIRECT_URL },
        });
        if (error) throw error;
        return; // el navegador se va a Google — no hay nada más que hacer acá
      }
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

  eliminarCuenta: async () => {
    set({ cargando: true, error: null });
    try {
      // El borrado lo hace la Edge Function `eliminar-cuenta` con `service_role`:
      // tocar `auth.users` requiere esa clave, que jamás puede vivir en el cliente.
      // La identidad sale del JWT del lado del servidor, así que acá NO se manda
      // ningún id — solo la confirmación explícita que la función exige.
      const { error } = await supabase.functions.invoke('eliminar-cuenta', {
        body: { confirmar: true },
      });

      if (error) {
        // `functions.invoke` NO propaga el cuerpo de la respuesta: ante un 4xx/5xx
        // devuelve un FunctionsHttpError con el mensaje genérico "non-2xx status
        // code". El detalle real queda en el log de la función, así que acá
        // mostramos un mensaje propio en vez de ese texto en inglés.
        console.warn('Eliminar cuenta: la función devolvió error —', error.message);
        set({ error: 'No pudimos eliminar tu cuenta en este momento. Intenta de nuevo.' });
        return false;
      }

      // scope 'local' a propósito: el usuario ya no existe en el servidor, así que
      // un signOut global responde 401 y —según la versión— puede dejar la sesión
      // guardada en AsyncStorage. El borrado local siempre limpia, y de todos modos
      // emite SIGNED_OUT, que es lo que dispara la limpieza de RevenueCat y
      // desbloqueos en _layout.tsx.
      await supabase.auth.signOut({ scope: 'local' });
      set({ session: null, usuario: null });
      return true;
    } catch (e) {
      set({ error: mensajeError(e) });
      return false;
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
      // NO se verifica si el email existe antes de mandar el reset, a propósito.
      //
      // Antes se llamaba al RPC `verificar_email_registrado` para poder decir
      // "Este correo no está registrado". Esa ayuda convertía el formulario en
      // un buscador de usuarios: con la anon key (pública, viaja en el APK)
      // cualquiera podía iterar una lista de emails y sacar el padrón de la app.
      // En una app de alimentación infantil eso revela que la persona tiene un
      // hijo pequeño — dato personal, y material para phishing dirigido.
      //
      // El RPC quedó sin permiso de EXECUTE para anon/authenticated (migración
      // 031). `resetPasswordForEmail` tampoco revela si el email existe, así que
      // la pantalla debe mostrar SIEMPRE el mismo mensaje neutro.
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
