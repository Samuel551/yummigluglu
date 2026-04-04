import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export default function RootLayout() {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    // Cargar sesión activa al iniciar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <>
      <StatusBar style="dark" backgroundColor="#F7F5F0" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="receta/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="asistente" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
