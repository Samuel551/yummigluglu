import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePlanStore } from '@/store/usePlanStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { ItemCompras } from '@/types';

export default function ListaComprasScreen() {
  const c = useColoresTema();
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
    Alert.alert('Limpiar lista', '¿Desmarcás todos los ítems como no comprados?', [
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 16, color: c.verde, fontWeight: '600' }}>← Volver</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '800', color: c.negro }}>Lista de compras</Text>
        </View>
        {totalItems > 0 && (
          <Text style={{ fontSize: 13, color: c.grisTexto, marginTop: 2 }}>
            {comprados} de {totalItems} ítems comprados
          </Text>
        )}
      </View>

      {cargandoLista ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={c.verde} />
        </View>
      ) : !lista ? (
        /* Sin lista generada */
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🛒</Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: c.negro,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Sin lista generada
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: c.grisTexto,
              textAlign: 'center',
              marginBottom: 28,
              lineHeight: 20,
            }}
          >
            Generamos la lista con todos los ingredientes del plan semanal, agrupados por categoría.
          </Text>
          <TouchableOpacity
            onPress={handleGenerarLista}
            style={{
              backgroundColor: c.verde,
              borderRadius: 16,
              paddingHorizontal: 28,
              paddingVertical: 14,
            }}
            accessibilityLabel="Generar lista de compras"
          >
            <Text style={{ color: c.blanco, fontWeight: '700', fontSize: 16 }}>
              ✨ Generar lista
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
          >
            {Object.entries(itemsPorCategoria).map(([categoria, items]) => (
              <View key={categoria} style={{ marginBottom: 20 }}>
                {/* Header categoría */}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: c.grisTexto,
                    letterSpacing: 0.8,
                    marginBottom: 8,
                    textTransform: 'uppercase',
                  }}
                >
                  {categoria}
                </Text>

                <View style={{ backgroundColor: c.card, borderRadius: 16, overflow: 'hidden' }}>
                  {items.map((item, idx) => (
                    <TouchableOpacity
                      key={item.nombre}
                      onPress={() => toggleComprado(item.nombre)}
                      accessibilityLabel={`${item.nombre} — ${item.comprado ? 'marcar como no comprado' : 'marcar como comprado'}`}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderTopWidth: idx > 0 ? 1 : 0,
                        borderTopColor: c.grisClaro,
                        opacity: item.comprado ? 0.45 : 1,
                      }}
                    >
                      {/* Checkbox */}
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          borderWidth: 2,
                          borderColor: item.comprado ? c.verde : '#D1CEC9',
                          backgroundColor: item.comprado ? c.verde : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        {item.comprado && <Text style={{ color: c.blanco, fontSize: 12 }}>✓</Text>}
                      </View>

                      <Text
                        style={{
                          flex: 1,
                          fontSize: 15,
                          color: c.negro,
                          textDecorationLine: item.comprado ? 'line-through' : 'none',
                        }}
                      >
                        {item.nombre}
                      </Text>
                      <Text style={{ fontSize: 13, color: c.grisTexto }}>{item.cantidad}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Acciones footer */}
          <View style={{ padding: 20, flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={handleGenerarLista}
              style={{
                flex: 1,
                backgroundColor: c.card,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: c.verde,
              }}
              accessibilityLabel="Regenerar lista de compras"
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: c.verde }}>🔄 Regenerar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLimpiarComprados}
              style={{
                flex: 1,
                backgroundColor: c.verde,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
              }}
              accessibilityLabel="Limpiar ítems comprados"
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: c.blanco }}>Limpiar ✓</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {error && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
          <Text style={{ color: c.error, fontSize: 12, textAlign: 'center' }}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
