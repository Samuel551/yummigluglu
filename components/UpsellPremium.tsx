import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColoresTema } from '@/hooks/useColoresTema';

interface Props {
  titulo?: string;
  beneficios: string[];
  onCerrar?: () => void;
}

/**
 * Card de upsell premium reutilizable.
 * Aparece cuando el user free choca con un límite o feature premium.
 * Tap → navega a /premium.
 */
export function UpsellPremium({
  titulo = 'Recordatorios ilimitados con Premium',
  beneficios,
  onCerrar,
}: Props) {
  const c = useColoresTema();

  return (
    <View
      style={{
        backgroundColor: c.premiumFondo,
        borderRadius: 18,
        padding: 20,
        marginHorizontal: 24,
        marginVertical: 16,
        borderWidth: 1.5,
        borderColor: c.naranja,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <Feather name="star" size={18} color={c.naranja} />
          <Text style={{ fontSize: 15, fontWeight: '800', color: c.negro, flex: 1, lineHeight: 20 }}>
            {titulo}
          </Text>
        </View>
        {onCerrar && (
          <Pressable
            onPress={onCerrar}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 2 })}
          >
            <Feather name="x" size={18} color={c.grisTexto} />
          </Pressable>
        )}
      </View>

      <View style={{ gap: 8, marginBottom: 16 }}>
        {beneficios.map((b) => (
          <View key={b} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <Feather name="check" size={14} color={c.verde} style={{ marginTop: 3 }} />
            <Text style={{ fontSize: 13, color: c.negro, flex: 1, lineHeight: 18 }}>{b}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/premium')}
        style={({ pressed }) => ({
          backgroundColor: c.naranja,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
      >
        <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Probar Premium</Text>
        <Feather name="arrow-right" size={14} color="#fff" />
      </Pressable>
    </View>
  );
}
