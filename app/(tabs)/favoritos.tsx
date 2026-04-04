import { View, Text, SafeAreaView } from 'react-native';

/**
 * Pantalla Favoritos — Se implementa en Fase 3.
 */
export default function FavoritosScreen() {
  return (
    <SafeAreaView className="flex-1 bg-fondo-app">
      <View className="flex-1 items-center justify-center px-5">
        <Text className="text-4xl mb-4">❤️</Text>
        <Text className="text-negro font-semibold text-lg text-center">Mis Favoritos</Text>
        <Text className="text-gris-texto text-sm text-center mt-2">
          Guardá las recetas que más le gustan a tu bebé — disponible en Fase 3
        </Text>
      </View>
    </SafeAreaView>
  );
}
