import '../global.css';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import { useTemaStore } from '@/store/useTemaStore';

export default function RootLayout() {
  const setSession = useAuthStore((state) => state.setSession);
  const { inicializarRevenueCat, cerrarSesionRevenueCat } = useSuscripcionStore();
  const tema = useTemaStore((s) => s.tema);
  const hidratar = useTemaStore((s) => s.hidratar);
  const [procesandoAuth, setProcesandoAuth] = useState(false);

  // Hidratar tema desde AsyncStorage al arrancar
  useEffect(() => {
    hidratar();
  }, [hidratar]);

  useEffect(() => {
    // Cargar sesión activa al iniciar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        inicializarRevenueCat(session.user.id);
      }
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' && session?.user) {
        inicializarRevenueCat(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        cerrarSesionRevenueCat();
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, inicializarRevenueCat, cerrarSesionRevenueCat]);

  // Deep links de Supabase auth — confirmación de email, magic link y reset password.
  // Supabase redirige a babybites://#access_token=...&refresh_token=...&type=...
  // En RN hay que parsear el fragment a mano y llamar setSession (detectSessionInUrl solo aplica en web).
  useEffect(() => {
    const procesarDeepLink = async (url: string | null) => {
      if (!url) return;
      const fragment = url.split('#')[1];
      if (!fragment) return;
      const params = new URLSearchParams(fragment);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (!access_token || !refresh_token) return;
      setProcesandoAuth(true);
      try {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) console.warn('Error procesando deep link de auth:', error.message);
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
