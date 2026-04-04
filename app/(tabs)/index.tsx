import { View, Text, SafeAreaView } from 'react-native';
import { usePerfilStore } from '@/store/usePerfilStore';

/**
 * Pantalla Home — Fase 2 traerá el catálogo de recetas destacadas.
 * Por ahora muestra el estado base con el perfil activo.
 */
export default function HomeScreen() {
  const perfilActivo = usePerfilStore((state) => state.perfilActivo);

  return (
    <SafeAreaView className="flex-1 bg-fondo-app">
      <View className="flex-1 px-5 pt-6">
        <Text className="text-2xl font-bold text-negro">Hola 👋</Text>
        {perfilActivo ? (
          <Text className="text-gris-texto mt-1">
            Recetas para {perfilActivo.avatar_emoji} {perfilActivo.nombre}
          </Text>
        ) : (
          <Text className="text-gris-texto mt-1">Creá el perfil de tu bebé para empezar</Text>
        )}

        {/* TODO Fase 2: Sección de recetas destacadas */}
        <View className="flex-1 items-center justify-center">
          <Text className="text-4xl mb-4">🍼</Text>
          <Text className="text-negro font-semibold text-lg text-center">Próximamente</Text>
          <Text className="text-gris-texto text-sm text-center mt-2">
            El catálogo de recetas se construye en Fase 2
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
