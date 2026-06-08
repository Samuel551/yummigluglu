import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePerfilStore } from '@/store/usePerfilStore';
import { usePlanStore } from '@/store/usePlanStore';
import { useColoresTema } from '@/hooks/useColoresTema';

export default function HerramientasScreen() {
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const perfiles = usePerfilStore((s) => s.perfiles);
  const plan = usePlanStore((s) => s.plan);

  const tieneLista = !!plan;

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          {/* ── ENCABEZADO EDITORIAL ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              HERRAMIENTAS
            </Text>
            <Text
              style={{
                fontSize: 30,
                fontWeight: '800',
                color: c.negro,
                letterSpacing: -0.6,
                lineHeight: 36,
              }}
            >
              Tu día a día
            </Text>
            <Text style={{ fontSize: 14, color: c.grisTexto, lineHeight: 20, marginTop: 8 }}>
              Recordatorios, diario de alimentos y lista de compras.
            </Text>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: c.cardBorde,
              marginHorizontal: 24,
              marginTop: 28,
              marginBottom: 24,
            }}
          />

          {/* ── AGENDA ── */}
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: c.grisTexto,
              letterSpacing: 2,
              paddingHorizontal: 24,
              marginBottom: 12,
            }}
          >
            AGENDA
          </Text>
          <ToolItem
            icono="bell"
            titulo="Agenda y recordatorios"
            descripcion="Recordatorios, controles médicos y próximos hitos"
            onPress={() => router.push('/agenda')}
            c={c}
          />

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: c.cardBorde,
              marginHorizontal: 24,
              marginTop: 24,
              marginBottom: 24,
            }}
          />

          {/* ── DIARIO POR HIJO ── */}
          {perfiles.length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: c.grisTexto,
                  letterSpacing: 2,
                  paddingHorizontal: 24,
                  marginBottom: 12,
                }}
              >
                DIARIO DE ALIMENTOS
              </Text>
              {perfiles.map((p) => (
                <ToolItem
                  key={p.id}
                  icono="book-open"
                  titulo={`Diario de ${p.nombre}`}
                  descripcion={`${p.avatar_emoji} Reacciones e introducción de alimentos`}
                  onPress={() => router.push(`/diario/${p.id}`)}
                  c={c}
                />
              ))}

              {/* Separador */}
              <View
                style={{
                  height: 1,
                  backgroundColor: c.cardBorde,
                  marginHorizontal: 24,
                  marginTop: 24,
                  marginBottom: 24,
                }}
              />
            </>
          )}

          {/* ── LISTA DE COMPRAS ── */}
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: c.grisTexto,
              letterSpacing: 2,
              paddingHorizontal: 24,
              marginBottom: 12,
            }}
          >
            LISTA DE COMPRAS
          </Text>
          {tieneLista ? (
            <ToolItem
              icono="shopping-cart"
              titulo="Lista de la semana"
              descripcion="Ingredientes del plan semanal actual"
              onPress={() => router.push('/lista-compras')}
              c={c}
            />
          ) : (
            <View style={{ paddingHorizontal: 24 }}>
              <Text style={{ fontSize: 13, color: c.grisTexto, lineHeight: 18 }}>
                Generá un plan semanal en la tab{' '}
                <Text style={{ fontWeight: '700', color: c.negro }}>Plan</Text> y acá vas a poder
                ver la lista de compras correspondiente.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Item de herramienta ──────────────────────────────────────────────────────

function ToolItem({
  icono,
  titulo,
  descripcion,
  onPress,
  c,
}: {
  icono: keyof typeof Feather.glyphMap;
  titulo: string;
  descripcion: string;
  onPress: () => void;
  c: ReturnType<typeof useColoresTema>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: c.verdeClaro,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Feather name={icono} size={20} color={c.verde} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: c.negro,
            marginBottom: 3,
          }}
        >
          {titulo}
        </Text>
        <Text style={{ fontSize: 13, color: c.grisTexto, lineHeight: 18 }}>{descripcion}</Text>
      </View>
      <Feather name="arrow-right" size={18} color={c.grisTexto} />
    </TouchableOpacity>
  );
}
