import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Pantalla raíz — redirige según el estado de autenticación.
 * Expo Router se encarga del splash screen hasta que se resuelva.
 */
export default function Index() {
  const session = useAuthStore((state) => state.session);
  const recoveryPendiente = useAuthStore((state) => state.recoveryPendiente);

  // Reset de contraseña en curso: gana siempre sobre el redirect normal.
  if (recoveryPendiente) {
    return <Redirect href="/nueva-contrasena" />;
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
