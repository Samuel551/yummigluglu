import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import { useColoresTema } from '@/hooks/useColoresTema';

const BENEFICIOS = [
  { emoji: '👑', texto: 'Acceso a todas las recetas premium' },
  { emoji: '🎬', texto: 'Videos paso a paso de cada receta' },
  { emoji: '📅', texto: 'Plan semanal ilimitado' },
  { emoji: '🔔', texto: 'Nuevas recetas y videos cada semana' },
];

export default function PremiumScreen() {
  const c = useColoresTema();
  const {
    paquetes,
    comprando,
    esPremium,
    error,
    comprarPremium,
    restaurarCompras,
    cargarPaquetes,
    limpiarError,
  } = useSuscripcionStore();

  const paquete = paquetes[0];

  useEffect(() => {
    cargarPaquetes();
  }, [cargarPaquetes]);

  // Si el usuario ya es premium (compra confirmada), volver atrás
  useEffect(() => {
    if (esPremium) {
      router.back();
    }
  }, [esPremium]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'Cerrar', onPress: limpiarError }]);
    }
  }, [error, limpiarError]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Encabezado */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={comprando}
            style={{ marginBottom: 28 }}
          >
            <Text style={{ fontSize: 14, color: c.verde, fontWeight: '600' }}>← Volver</Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 56, marginBottom: 12 }}>👑</Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: '900',
                color: c.negro,
                textAlign: 'center',
                lineHeight: 32,
              }}
            >
              Baby Bites Premium
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: c.grisTexto,
                textAlign: 'center',
                marginTop: 10,
                lineHeight: 22,
              }}
            >
              Todo lo que tu bebé necesita, sin límites.
            </Text>
          </View>
        </View>

        {/* Beneficios */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: c.card,
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            gap: 16,
          }}
        >
          {BENEFICIOS.map(({ emoji, texto }) => (
            <View key={texto} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: c.verdeClaro,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>{emoji}</Text>
              </View>
              <Text
                style={{ fontSize: 14, color: c.negro, flex: 1, fontWeight: '500', lineHeight: 20 }}
              >
                {texto}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ marginHorizontal: 20, gap: 12 }}>
          {/* Precio */}
          {paquete ? (
            <View
              style={{
                backgroundColor: '#FFF4EC',
                borderRadius: 16,
                padding: 18,
                alignItems: 'center',
                marginBottom: 4,
                borderWidth: 1.5,
                borderColor: c.naranja,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: c.naranja,
                  fontWeight: '700',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                PLAN MENSUAL
              </Text>
              <Text style={{ fontSize: 30, fontWeight: '900', color: c.negro }}>
                {paquete.product.priceString}
              </Text>
              <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 4 }}>
                por mes · cancelá cuando quieras
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: c.card,
                borderRadius: 16,
                padding: 18,
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <ActivityIndicator color={c.verde} />
              <Text style={{ fontSize: 13, color: c.grisTexto, marginTop: 10 }}>
                Cargando precio...
              </Text>
            </View>
          )}

          {/* CTA principal */}
          <TouchableOpacity
            onPress={comprarPremium}
            disabled={comprando || !paquete}
            activeOpacity={0.85}
            style={{
              paddingVertical: 18,
              borderRadius: 18,
              alignItems: 'center',
              backgroundColor: comprando || !paquete ? c.grisClaro : c.verde,
              shadowColor: c.verde,
              shadowOpacity: comprando || !paquete ? 0 : 0.3,
              shadowRadius: 12,
              elevation: comprando || !paquete ? 0 : 4,
            }}
          >
            {comprando ? (
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <ActivityIndicator color={c.blanco} size="small" />
                <Text style={{ color: c.blanco, fontWeight: '700', fontSize: 16 }}>
                  Verificando compra...
                </Text>
              </View>
            ) : (
              <Text
                style={{
                  color: paquete ? c.blanco : c.grisTexto,
                  fontWeight: '800',
                  fontSize: 16,
                }}
              >
                ✨ Suscribirme ahora
              </Text>
            )}
          </TouchableOpacity>

          {/* Restaurar */}
          <TouchableOpacity
            onPress={restaurarCompras}
            disabled={comprando}
            activeOpacity={0.7}
            style={{ paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 14, color: c.verde, fontWeight: '600' }}>
              Restaurar compras
            </Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer legal */}
        <Text
          style={{
            fontSize: 11,
            color: c.grisTexto,
            textAlign: 'center',
            marginHorizontal: 32,
            marginTop: 12,
            lineHeight: 16,
          }}
        >
          El cobro se realiza a través de Google Play. La suscripción se renueva automáticamente
          salvo que la canceles con al menos 24 horas de anticipación al final del período vigente.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
