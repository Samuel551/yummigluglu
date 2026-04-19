import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import { useColoresTema } from '@/hooks/useColoresTema';

// ─── Vista para usuarios premium ─────────────────────────────
function VistaPremium() {
  const c = useColoresTema();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
      >
        <Text style={{ fontSize: 52, marginBottom: 16 }}>🎬</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#FFF4EC',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 4,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 12 }}>👑</Text>
          <Text style={{ fontSize: 12, fontWeight: '700', color: c.naranja }}>PREMIUM ACTIVO</Text>
        </View>
        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: c.negro,
            textAlign: 'center',
            marginBottom: 10,
            lineHeight: 28,
          }}
        >
          Videos paso a paso
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: c.grisTexto,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 32,
          }}
        >
          Estamos preparando el contenido. ¡Ya casi está!{'\n'}
          Mientras tanto, explora todas las recetas premium que ya tienes desbloqueadas.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/recetas')}
          activeOpacity={0.85}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 28,
            borderRadius: 16,
            backgroundColor: c.verde,
          }}
        >
          <Text style={{ color: c.blanco, fontWeight: '700', fontSize: 15 }}>
            Ver recetas premium
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Vista paywall para usuarios free ────────────────────────
function VistaPaywall() {
  const c = useColoresTema();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ fontSize: 56, marginBottom: 8 }}>🍼</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: c.negro, letterSpacing: -0.5 }}>
            Baby Bites
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#FFF4EC',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 12 }}>👑</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: c.naranja }}>PREMIUM</Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: '800',
            color: c.negro,
            textAlign: 'center',
            marginBottom: 10,
            lineHeight: 30,
          }}
        >
          Videos paso a paso
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: c.grisTexto,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 28,
          }}
        >
          Aprendé a preparar cada receta con videos cortos y claros, diseñados para bebés.
        </Text>

        <View
          style={{
            width: '100%',
            backgroundColor: c.card,
            borderRadius: 20,
            padding: 20,
            marginBottom: 28,
            gap: 14,
          }}
        >
          {[
            { emoji: '🎬', texto: 'Videos cortos para cada receta' },
            { emoji: '👨‍🍳', texto: 'Técnicas de preparación para bebés' },
            { emoji: '👑', texto: 'Todas las recetas premium desbloqueadas' },
            { emoji: '🔔', texto: 'Nuevos videos y recetas cada semana' },
          ].map(({ emoji, texto }) => (
            <View key={texto} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: c.verdeClaro,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18 }}>{emoji}</Text>
              </View>
              <Text style={{ fontSize: 14, color: c.negro, flex: 1, fontWeight: '500' }}>
                {texto}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={{
            width: '100%',
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: 'center',
            backgroundColor: c.verde,
            shadowColor: c.verde,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 4,
          }}
          activeOpacity={0.85}
          onPress={() => router.push('/premium')}
        >
          <Text style={{ color: c.blanco, fontWeight: '800', fontSize: 16 }}>
            ✨ Activar Premium
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 12, textAlign: 'center' }}>
          Cancelá cuando quieras. Sin compromisos.
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Pantalla principal ───────────────────────────────────────
export default function VideosScreen() {
  const { esPremium, cargando } = useSuscripcionStore();
  const c = useColoresTema();

  if (cargando) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: c.fondoApp,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={c.verde} />
      </SafeAreaView>
    );
  }

  return esPremium ? <VistaPremium /> : <VistaPaywall />;
}
