import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePlanStore } from '@/store/usePlanStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { formatearRangoSemana } from '@/constants/Semana';
import { ItemCompras } from '@/types';

export default function ListaComprasScreen() {
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const {
    plan,
    lista,
    cargandoLista,
    error,
    cargarLista,
    generarLista,
    toggleComprado,
    limpiarComprados,
  } = usePlanStore();

  useEffect(() => {
    if (!plan) return;
    cargarLista(plan.id);
  }, [plan?.id]);

  const handleGenerarLista = async () => {
    await generarLista();
  };

  const handleLimpiarComprados = () => {
    Alert.alert('Limpiar lista', '¿Desmarcas todos los ítems como no comprados?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpiar', onPress: () => limpiarComprados() },
    ]);
  };

  // Agrupar items por categoría
  const itemsPorCategoria: Record<string, ItemCompras[]> = {};
  for (const item of lista?.items ?? []) {
    if (!itemsPorCategoria[item.categoria]) {
      itemsPorCategoria[item.categoria] = [];
    }
    itemsPorCategoria[item.categoria].push(item);
  }

  const totalItems = lista?.items.length ?? 0;
  const comprados = lista?.items.filter((i) => i.comprado).length ?? 0;
  const progreso = totalItems > 0 ? comprados / totalItems : 0;

  // Detectar si el plan cambió después de la última generación/edición de la lista.
  // Cuando el user toggle items, lista.updated_at avanza pero plan.updated_at queda igual,
  // así que el banner solo aparece cuando el plan REALMENTE cambió post-lista.
  const planDesincronizado =
    plan && lista && new Date(plan.updated_at) > new Date(lista.updated_at);

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          {/* ── BOTÓN VOLVER ── */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => ({
              paddingHorizontal: 24,
              paddingTop: 16,
              opacity: pressed ? 0.5 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              alignSelf: 'flex-start',
            })}
          >
            <Feather name="arrow-left" size={18} color={c.negro} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.negro }}>Volver</Text>
          </Pressable>

          {/* ── HEADER EDITORIAL ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 16,
                fontVariant: ['tabular-nums'],
              }}
            >
              LISTA DE COMPRAS
              {plan ? ` · ${formatearRangoSemana(plan.semana_inicio).toUpperCase()}` : ''}
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
              {totalItems > 0 ? (
                <>
                  <Text style={{ color: c.verde, fontVariant: ['tabular-nums'] }}>
                    {totalItems}
                  </Text>{' '}
                  {totalItems === 1 ? 'ingrediente' : 'ingredientes'}
                </>
              ) : (
                'Tu lista'
              )}
            </Text>

            {totalItems > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 14,
                    color: c.grisTexto,
                    lineHeight: 20,
                    marginTop: 8,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {comprados} comprado{comprados === 1 ? '' : 's'} de {totalItems}
                </Text>

                {/* Barra de progreso sutil */}
                <View
                  style={{
                    height: 4,
                    backgroundColor: c.cardBorde,
                    borderRadius: 999,
                    marginTop: 14,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${progreso * 100}%`,
                      height: '100%',
                      backgroundColor: c.verde,
                      borderRadius: 999,
                    }}
                  />
                </View>
              </>
            )}
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: c.cardBorde,
              marginHorizontal: 24,
              marginTop: 28,
              marginBottom: 8,
            }}
          />

          {/* ── CONTENIDO ── */}
          {cargandoLista ? (
            <View style={{ paddingVertical: 80, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={c.verde} />
            </View>
          ) : !lista ? (
            <EmptyStateLista onGenerar={handleGenerarLista} />
          ) : (
            <>
              {/* Banner desincronización — solo si el plan cambió después de la lista */}
              {planDesincronizado && (
                <TouchableOpacity
                  onPress={handleGenerarLista}
                  activeOpacity={0.85}
                  accessibilityLabel="Actualizar lista con los cambios del plan"
                  style={{
                    marginHorizontal: 24,
                    marginTop: 16,
                    marginBottom: 4,
                    backgroundColor: c.verdeClaro,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: c.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name="refresh-cw" size={15} color={c.verde} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: c.negro,
                        letterSpacing: -0.1,
                      }}
                    >
                      El plan cambió
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: c.grisTexto,
                        marginTop: 2,
                      }}
                    >
                      Toca para actualizar la lista
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={c.verde} />
                </TouchableOpacity>
              )}

              {/* Categorías */}
              {Object.entries(itemsPorCategoria).map(([categoria, items]) => (
                <CategoriaSeccion
                  key={categoria}
                  categoria={categoria}
                  items={items}
                  onToggle={toggleComprado}
                  c={c}
                />
              ))}

              {/* Acción final — solo Limpiar comprados (cuando hay items comprados) */}
              {comprados > 0 && (
                <View
                  style={{
                    paddingHorizontal: 24,
                    paddingTop: 16,
                    paddingBottom: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleLimpiarComprados}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: c.verde,
                      borderRadius: 999,
                      paddingVertical: 14,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                      shadowColor: c.verde,
                      shadowOpacity: 0.18,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 3 },
                      elevation: 3,
                    }}
                    accessibilityLabel="Limpiar ítems comprados"
                  >
                    <Feather name="check-circle" size={15} color="#fff" />
                    <Text
                      style={{
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: 13,
                        letterSpacing: 0.2,
                      }}
                    >
                      Limpiar comprados ({comprados})
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {error && (
            <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
              <Text style={{ color: c.error, fontSize: 12, textAlign: 'center' }}>{error}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── CategoriaSeccion ─────────────────────────────────────────────────────────

function CategoriaSeccion({
  categoria,
  items,
  onToggle,
  c,
}: {
  categoria: string;
  items: ItemCompras[];
  onToggle: (nombre: string) => void;
  c: ReturnType<typeof useColoresTema>;
}) {
  return (
    <View style={{ paddingTop: 20 }}>
      {/* Eyebrow categoría */}
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: c.grisTexto,
          letterSpacing: 2,
          textTransform: 'uppercase',
          paddingHorizontal: 24,
          marginBottom: 8,
        }}
      >
        {categoria}
      </Text>

      {/* Items con separadores */}
      <View style={{ paddingHorizontal: 24 }}>
        {items.map((item, idx) => (
          <TouchableOpacity
            key={item.nombre}
            onPress={() => onToggle(item.nombre)}
            activeOpacity={0.6}
            accessibilityLabel={`${item.nombre} — ${item.comprado ? 'marcar como no comprado' : 'marcar como comprado'}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 13,
              borderTopWidth: idx > 0 ? 1 : 0,
              borderTopColor: c.cardBorde,
              opacity: item.comprado ? 0.5 : 1,
            }}
          >
            {/* Checkbox circular */}
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 1.5,
                borderColor: item.comprado ? c.verde : '#D1CEC9',
                backgroundColor: item.comprado ? c.verde : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              {item.comprado && <Feather name="check" size={13} color="#fff" />}
            </View>

            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: c.negro,
                fontWeight: '500',
                letterSpacing: -0.1,
                textDecorationLine: item.comprado ? 'line-through' : 'none',
              }}
              numberOfLines={1}
            >
              {item.nombre}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: c.grisTexto,
                fontWeight: '600',
                fontVariant: ['tabular-nums'],
                marginLeft: 8,
              }}
            >
              {item.cantidad}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Separador entre categorías */}
      <View
        style={{
          height: 1,
          backgroundColor: c.cardBorde,
          marginHorizontal: 24,
          marginTop: 20,
        }}
      />
    </View>
  );
}

// ─── EmptyStateLista ──────────────────────────────────────────────────────────

function EmptyStateLista({ onGenerar }: { onGenerar: () => void }) {
  const c = useColoresTema();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 56,
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: c.grisClaro,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Feather name="shopping-cart" size={26} color={c.grisTexto} />
      </View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: c.negro,
          textAlign: 'center',
          letterSpacing: -0.2,
        }}
      >
        Sin lista generada
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: c.grisTexto,
          textAlign: 'center',
          marginTop: 6,
          lineHeight: 19,
          maxWidth: 280,
          marginBottom: 20,
        }}
      >
        Genera la lista con todos los ingredientes del plan semanal, agrupados por categoría.
      </Text>
      <TouchableOpacity
        onPress={onGenerar}
        activeOpacity={0.85}
        style={{
          backgroundColor: c.verde,
          paddingHorizontal: 24,
          paddingVertical: 13,
          borderRadius: 999,
          shadowColor: c.verde,
          shadowOpacity: 0.18,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
        }}
        accessibilityLabel="Generar lista de compras"
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.2 }}>
          Generar lista
        </Text>
      </TouchableOpacity>
    </View>
  );
}
