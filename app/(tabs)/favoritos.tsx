import { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFavoritosStore } from '@/store/useFavoritosStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { RecetaCard } from '@/components/RecetaCard';
import { useColoresTema } from '@/hooks/useColoresTema';

export default function FavoritosScreen() {
  const c = useColoresTema();
  const { recetasFavoritas, cargando, cargarFavoritos } = useFavoritosStore();
  const perfilActivo = usePerfilStore((state) => state.perfilActivo);

  useEffect(() => {
    cargarFavoritos();
  }, [cargarFavoritos]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      {/* Encabezado */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: c.negro }}>Favoritos</Text>
        {perfilActivo && (
          <Text style={{ fontSize: 13, color: c.grisTexto, marginTop: 2 }}>
            Recetas guardadas para {perfilActivo.avatar_emoji} {perfilActivo.nombre}
          </Text>
        )}
      </View>

      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={c.verde} />
        </View>
      ) : recetasFavoritas.length === 0 ? (
        /* Estado vacío */
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🤍</Text>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '700',
              color: c.negro,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Aún no tienes favoritos
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: c.grisTexto,
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: 24,
            }}
          >
            Toca el ❤️ en cualquier receta para guardarla aquí y encontrarla rápido
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/recetas')}
            style={{
              backgroundColor: c.verde,
              paddingHorizontal: 28,
              paddingVertical: 12,
              borderRadius: 24,
            }}
          >
            <Text style={{ color: c.blanco, fontWeight: '700', fontSize: 15 }}>
              Explorar recetas
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recetasFavoritas}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => <RecetaCard receta={item} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
