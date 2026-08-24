import { useState, useEffect } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useFavoritosStore } from '@/store/useFavoritosStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { reprogramarSaludos } from '@/lib/saludos';

// Ícono simple basado en texto/emoji hasta integrar Lucide
function TabIcon({
  emoji,
  focused,
  premium = false,
}: {
  emoji: string;
  focused: boolean;
  premium?: boolean;
}) {
  return (
    <View className="items-center justify-center">
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
      {premium && (
        <View style={{ position: 'absolute', top: -4, right: -8 }}>
          <Text style={{ fontSize: 10 }}>👑</Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const c = useColoresTema();
  const session = useAuthStore((state) => state.session);
  const recoveryPendiente = useAuthStore((state) => state.recoveryPendiente);
  const { perfiles, cargarPerfiles } = usePerfilStore();
  const cargarFavoritos = useFavoritosStore((state) => state.cargarFavoritos);

  // Controla si ya terminamos de cargar perfiles por primera vez
  const [perfilesCargados, setPerfilesCargados] = useState(false);

  useEffect(() => {
    if (!session) return;
    cargarPerfiles().finally(() => setPerfilesCargados(true));
    cargarFavoritos();
  }, [session, cargarPerfiles, cargarFavoritos]);

  /**
   * Renueva la ventana de saludos de cumpleaños y cumplemés.
   *
   * Depende de `perfiles`, no del arranque: así una sola línea cubre los cuatro
   * casos que mueven las fechas — carga inicial, alta de un hijo, corrección de
   * la fecha de nacimiento y borrado de un perfil.
   *
   * `reprogramarSaludos` es idempotente (cancela y reprograma) y sale sin hacer
   * nada si no hay permiso o si el usuario los apagó, así que llamarla de más
   * es barato. Nunca pide permisos: eso pasa en el onboarding, en contexto.
   */
  useEffect(() => {
    if (perfiles.length === 0) return;
    reprogramarSaludos(perfiles).catch(() => {});
  }, [perfiles]);

  // Reset de contraseña en curso: gana sobre todo lo demás.
  if (recoveryPendiente) {
    return <Redirect href="/nueva-contrasena" />;
  }

  // Sin sesión → login
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Mientras cargamos perfiles, mostramos un spinner mínimo para evitar flashes
  if (!perfilesCargados) {
    return (
      <View className="flex-1 bg-fondo-app dark:bg-[#121212] items-center justify-center">
        <ActivityIndicator size="large" color={c.verde} />
      </View>
    );
  }

  // Sin perfiles → onboarding
  if (perfiles.length === 0) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.verde,
        tabBarInactiveTintColor: c.grisTexto,
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.grisClaro,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          height: 64 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
          tabBarAccessibilityLabel: 'Pantalla de inicio',
        }}
      />
      <Tabs.Screen
        name="recetas"
        options={{
          title: 'Recetas',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🍽️" focused={focused} />,
          tabBarAccessibilityLabel: 'Catálogo de recetas',
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
          tabBarAccessibilityLabel: 'Plan semanal de comidas',
        }}
      />
      <Tabs.Screen
        name="herramientas"
        options={{
          title: 'Herramientas',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🧰" focused={focused} />,
          tabBarAccessibilityLabel: 'Herramientas: agenda, diario y lista de compras',
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'Videos',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎬" focused={focused} premium />,
          tabBarAccessibilityLabel: 'Videos premium',
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👶" focused={focused} />,
          tabBarAccessibilityLabel: 'Perfiles de hijos y cuenta',
        }}
      />
    </Tabs>
  );
}
