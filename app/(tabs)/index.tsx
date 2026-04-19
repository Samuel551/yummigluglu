import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useRecetasStore } from '@/store/useRecetasStore';
import { RecetaCard } from '@/components/RecetaCard';
import { useColoresTema } from '@/hooks/useColoresTema';

const ETAPA_DESCRIPCION: Record<string, string> = {
  inicio: 'Primeros alimentos · 6 a 11 meses',
  transicion: 'Texturas variadas · 12 a 23 meses',
  preescolar: 'Platos completos · 2 años o más',
};

export default function HomeScreen() {
  const c = useColoresTema();
  const perfilActivo = usePerfilStore((state) => state.perfilActivo);
  const { recetas, cargando, cargarRecetas } = useRecetasStore();

  useEffect(() => {
    if (!perfilActivo) return;
    cargarRecetas({
      etapa: perfilActivo.etapa,
      excluir_alergenos: perfilActivo.alergias,
    });
  }, [perfilActivo, cargarRecetas]);

  // Las primeras 5 como "destacadas" del home
  const destacadas = recetas.slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Saludo */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: c.negro }}>Hola 👋</Text>
          {perfilActivo ? (
            <>
              <Text numberOfLines={1} style={{ fontSize: 14, color: c.grisTexto, marginTop: 4 }}>
                Recetas para {perfilActivo.avatar_emoji} {perfilActivo.nombre}
              </Text>
              <View
                style={{
                  backgroundColor: c.verdeClaro,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginTop: 10,
                  alignSelf: 'flex-start',
                }}
              >
                <Text style={{ fontSize: 12, color: c.verde, fontWeight: '600' }}>
                  {ETAPA_DESCRIPCION[perfilActivo.etapa] ?? perfilActivo.etapa}
                </Text>
              </View>
            </>
          ) : (
            <Text style={{ fontSize: 14, color: c.grisTexto, marginTop: 4 }}>
              Creá el perfil de tu bebé para empezar
            </Text>
          )}
        </View>

        {/* Sección recetas destacadas */}
        {perfilActivo && (
          <View style={{ marginBottom: 28 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: '700', color: c.negro }}>
                Recetas para hoy
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/recetas')}>
                <Text style={{ fontSize: 13, color: c.verde, fontWeight: '600' }}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {cargando ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <ActivityIndicator size="small" color={c.verde} />
              </View>
            ) : destacadas.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {destacadas.map((receta) => (
                  <RecetaCard key={receta.id} receta={receta} horizontal />
                ))}
              </ScrollView>
            ) : (
              <View style={{ paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 13, color: c.grisTexto }}>
                  No hay recetas disponibles para esta etapa aún.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Acceso rápido por momento */}
        {perfilActivo && (
          <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: c.negro, marginBottom: 14 }}>
              ¿Qué momento es?
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {[
                { momento: 'desayuno', emoji: '🌅', label: 'Desayuno' },
                { momento: 'almuerzo', emoji: '☀️', label: 'Almuerzo' },
                { momento: 'cena', emoji: '🌙', label: 'Cena' },
                { momento: 'snack', emoji: '🍪', label: 'Snack' },
              ].map(({ momento, emoji, label }) => (
                <TouchableOpacity
                  key={momento}
                  onPress={() => router.push('/(tabs)/recetas')}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    minWidth: '45%',
                    backgroundColor: c.card,
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 6 }}>{emoji}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: c.negro }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* NutriBot promo */}
        <TouchableOpacity
          onPress={() => router.push('/asistente')}
          activeOpacity={0.85}
          style={{
            marginHorizontal: 20,
            marginBottom: 28,
            backgroundColor: c.verde,
            borderRadius: 16,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <Text style={{ fontSize: 32 }}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: c.blanco }}>NutriBot</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
              Preguntale qué puede comer {perfilActivo?.nombre ?? 'tu bebé'} hoy
            </Text>
          </View>
          <Text style={{ fontSize: 18, color: c.blanco }}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
