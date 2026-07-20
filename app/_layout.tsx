import '../global.css';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import { useTemaStore } from '@/store/useTemaStore';
import { usePaisStore } from '@/store/usePaisStore';
import { useAnunciosStore } from '@/store/useAnunciosStore';
import { useDesbloqueosStore } from '@/store/useDesbloqueosStore';

export default function RootLayout() {
  const setSession = useAuthStore((state) => state.setSession);
  const { inicializarRevenueCat, cerrarSesionRevenueCat } = useSuscripcionStore();
  const tema = useTemaStore((s) => s.tema);
  const hidratar = useTemaStore((s) => s.hidratar);
  const hidratarPais = usePaisStore((s) => s.hidratar);
  const inicializarAnuncios = useAnunciosStore((s) => s.inicializar);
  const [procesandoAuth, setProcesandoAuth] = useState(false);

  // Hidratar stores persistidos desde AsyncStorage al arrancar
  useEffect(() => {
    hidratar();
    hidratarPais();
  }, [hidratar, hidratarPais]);

  // Inicializar el SDK de anuncios una vez al arrancar. No-op seguro en web /
  // dev client sin recompilar (el módulo nativo no está disponible).
  useEffect(() => {
    inicializarAnuncios();
  }, [inicializarAnuncios]);

  useEffect(() => {
    // Cargar sesión activa al iniciar la app.
    // Si el refresh token guardado es inválido (ej. cuenta borrada/revocada, o
    // token expirado más allá del límite de reuso), Supabase lanza
    // "Invalid Refresh Token". Lo manejamos: limpiamos la sesión zombi en
    // silencio y dejamos al usuario en login, sin overlay de error.
    const cargarSesion = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        if (session?.user) {
          inicializarRevenueCat(session.user.id);
          useDesbloqueosStore.getState().cargar();
        }
      } catch (e) {
        console.warn('Sesión inválida al iniciar, limpiando:', e);
        await supabase.auth.signOut().catch(() => {});
        setSession(null);
      }
    };
    cargarSesion();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' && session?.user) {
        inicializarRevenueCat(session.user.id);
        useDesbloqueosStore.getState().cargar();
      } else if (event === 'SIGNED_OUT') {
        cerrarSesionRevenueCat();
        useDesbloqueosStore.getState().limpiar();
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, inicializarRevenueCat, cerrarSesionRevenueCat]);

  // Deep links de Supabase auth — confirmación de email, magic link y reset password.
  // Supabase redirige a yummigluglu://#access_token=...&refresh_token=...&type=...
  // En RN hay que parsear el fragment a mano y llamar setSession (detectSessionInUrl solo aplica en web).
  useEffect(() => {
    const procesarDeepLink = async (url: string | null) => {
      if (!url) return;
      const fragment = url.split('#')[1];
      if (!fragment) return;
      const params = new URLSearchParams(fragment);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const type = params.get('type');
      if (!access_token || !refresh_token) return;
      setProcesandoAuth(true);
      try {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          console.warn('Error procesando deep link de auth:', error.message);
          return;
        }
        // En reset de contraseña (type=recovery) el link solo autentica de forma
        // temporal — falta que el usuario escriba la clave nueva. Prendemos el flag
        // para que los guards no lo manden a (tabs) y gane la pantalla de recovery.
        if (type === 'recovery') {
          useAuthStore.getState().setRecoveryPendiente(true);
          router.replace('/nueva-contrasena');
        }
      } finally {
        setProcesandoAuth(false);
      }
    };

    Linking.getInitialURL().then(procesarDeepLink);
    const sub = Linking.addEventListener('url', ({ url }) => procesarDeepLink(url));
    return () => sub.remove();
  }, []);

  return (
    <View className="flex-1 bg-fondo-app dark:bg-[#121212]">
      <StatusBar
        style={tema === 'dark' ? 'light' : 'dark'}
        backgroundColor={tema === 'dark' ? '#121212' : '#F7F5F0'}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="premium" options={{ presentation: 'card' }} />
        <Stack.Screen name="receta/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="lista-compras" options={{ presentation: 'card' }} />
        <Stack.Screen name="diario/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="agenda" options={{ presentation: 'card' }} />
        <Stack.Screen name="nueva-contrasena" options={{ presentation: 'card' }} />
      </Stack>
      {procesandoAuth && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          pointerEvents="auto"
        >
          <View
            style={{
              backgroundColor: tema === 'dark' ? '#1E1E1E' : '#FFFFFF',
              borderRadius: 16,
              paddingHorizontal: 32,
              paddingVertical: 28,
              alignItems: 'center',
              gap: 16,
              minWidth: 220,
            }}
          >
            <ActivityIndicator size="large" color="#2D9B5A" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: tema === 'dark' ? '#F0EDE8' : '#1A1714',
                textAlign: 'center',
              }}
            >
              Confirmando tu cuenta...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
