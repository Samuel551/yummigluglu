import { View, Text, SafeAreaView } from 'react-native';

/**
 * Pantalla Catálogo de Recetas — Se implementa en Fase 2.
 */
export default function RecetasScreen() {
  return (
    <SafeAreaView className="flex-1 bg-fondo-app">
      <View className="flex-1 items-center justify-center px-5">
        <Text className="text-4xl mb-4">🍽️</Text>
        <Text className="text-negro font-semibold text-lg text-center">Catálogo de Recetas</Text>
        <Text className="text-gris-texto text-sm text-center mt-2">
          60 recetas curadas — disponible en Fase 2
        </Text>
      </View>
    </SafeAreaView>
  );
}
