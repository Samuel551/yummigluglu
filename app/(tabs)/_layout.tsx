import { Tabs, Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/constants/Colors';

// Ícono simple basado en texto/emoji hasta integrar Lucide
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View className="items-center justify-center">
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const session = useAuthStore((state) => state.session);

  // Protección de ruta: si no hay sesión, redirigir a login
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.verde,
        tabBarInactiveTintColor: Colors.grisTexto,
        tabBarStyle: {
          backgroundColor: Colors.blanco,
          borderTopColor: Colors.grisClaro,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
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
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ focused }) => <TabIcon emoji="❤️" focused={focused} />,
          tabBarAccessibilityLabel: 'Mis recetas favoritas',
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
