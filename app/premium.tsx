import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useColoresTema } from '@/hooks/useColoresTema';

type BeneficioIcon = keyof typeof Feather.glyphMap;

interface Beneficio {
  icon: BeneficioIcon;
  titulo: string;
  descripcion: string;
}

const BENEFICIOS: Beneficio[] = [
  {
    icon: 'star',
    titulo: 'Recetas premium sin límite',
    descripcion: 'Catálogo completo curado por edad, etapa y momento del día.',
  },
  {
    icon: 'play-circle',
    titulo: 'Videos paso a paso',
    descripcion: 'Mira la preparación completa en clips cortos verticales.',
  },
  {
    icon: 'calendar',
    titulo: 'Plan semanal ilimitado',
    descripcion: 'Genera y regenera menús personalizados las veces que quieras.',
  },
  {
    icon: 'bell',
    titulo: 'Agenda completa',
    descripcion: 'Recordatorios ilimitados, hitos hasta 5 años y semana programada.',
  },
  {
    icon: 'users',
    titulo: 'Perfiles ilimitados',
    descripcion: 'Agrega todos los hijos que necesites con planes y agendas separadas.',
  },
  {
    icon: 'shield',
    titulo: 'Sin anuncios',
    descripcion: 'Disfruta la app sin interrupciones, ahora y cuando crezca.',
  },
];

export default function PremiumScreen() {
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const perfilActivo = usePerfilStore((s) => s.perfilActivo);
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
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          {/* ── BOTÓN VOLVER ── */}
          <Pressable
            onPress={() => router.back()}
            disabled={comprando}
            hitSlop={12}
            style={({ pressed }) => ({
              paddingHorizontal: 24,
              paddingTop: 16,
              opacity: pressed || comprando ? 0.5 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              alignSelf: 'flex-start',
            })}
          >
            <Feather name="arrow-left" size={18} color={c.negro} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.negro }}>
              Volver
            </Text>
          </Pressable>

          {/* ── HEADER EDITORIAL ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 28 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: '#1A1714',
                  borderRadius: 999,
                  paddingHorizontal: 11,
                  paddingVertical: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Feather name="star" size={11} color="#fff" />
                <Text
                  style={{ fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 }}
                >
                  PREMIUM
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 32,
                fontWeight: '800',
                color: c.negro,
                letterSpacing: -0.7,
                lineHeight: 38,
              }}
            >
              Cocinar sin límites
              {perfilActivo ? (
                <>
                  {'\n'}para{' '}
                  <Text style={{ color: c.verde }}>{perfilActivo.nombre}</Text>{' '}
                  <Text style={{ fontSize: 28, lineHeight: 42 }}>
                    {perfilActivo.avatar_emoji}
                  </Text>
                </>
              ) : (
                <>{'.'}</>
              )}
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: c.grisTexto,
                lineHeight: 22,
                marginTop: 12,
              }}
            >
              Catálogo completo, videos paso a paso y agenda inteligente para acompañar
              cada etapa de la alimentación.
            </Text>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: c.cardBorde,
              marginHorizontal: 24,
              marginTop: 32,
              marginBottom: 24,
            }}
          />

          {/* ── BENEFICIOS — lista magazine ── */}
          <View style={{ paddingHorizontal: 24 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                marginBottom: 20,
              }}
            >
              TODO LO QUE INCLUYE
            </Text>

            {BENEFICIOS.map((b, idx) => (
              <View
                key={b.titulo}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 16,
                  paddingBottom: 20,
                  marginBottom: idx === BENEFICIOS.length - 1 ? 0 : 20,
                  borderBottomWidth: idx === BENEFICIOS.length - 1 ? 0 : 1,
                  borderBottomColor: c.cardBorde,
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
                  }}
                >
                  <Feather name={b.icon} size={20} color={c.verde} />
                </View>
                <View style={{ flex: 1, paddingTop: 2 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: c.negro,
                      letterSpacing: -0.2,
                      marginBottom: 4,
                    }}
                  >
                    {b.titulo}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: c.grisTexto,
                      lineHeight: 19,
                    }}
                  >
                    {b.descripcion}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: c.cardBorde,
              marginHorizontal: 24,
              marginTop: 28,
              marginBottom: 28,
            }}
          />

          {/* ── PRECIO ── */}
          <View style={{ paddingHorizontal: 24 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              PLAN MENSUAL
            </Text>

            {paquete ? (
              <>
                <Text
                  style={{
                    fontSize: 44,
                    fontWeight: '900',
                    color: c.negro,
                    textAlign: 'center',
                    letterSpacing: -1.2,
                    lineHeight: 50,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {paquete.product.priceString}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: c.grisTexto,
                    textAlign: 'center',
                    marginTop: 8,
                  }}
                >
                  por mes · cancelas cuando quieras
                </Text>
              </>
            ) : (
              <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={c.verde} />
                <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 10 }}>
                  Cargando precio…
                </Text>
              </View>
            )}
          </View>

          {/* ── CTA ── */}
          <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
            <TouchableOpacity
              onPress={comprarPremium}
              disabled={comprando || !paquete}
              activeOpacity={0.85}
              style={{
                paddingVertical: 17,
                borderRadius: 999,
                alignItems: 'center',
                backgroundColor: comprando || !paquete ? c.grisClaro : c.verde,
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              {comprando ? (
                <>
                  <ActivityIndicator color={c.blanco} size="small" />
                  <Text
                    style={{
                      color: c.blanco,
                      fontWeight: '700',
                      fontSize: 15,
                      letterSpacing: 0.2,
                    }}
                  >
                    Verificando compra…
                  </Text>
                </>
              ) : (
                <Text
                  style={{
                    color: paquete ? c.blanco : c.grisTexto,
                    fontWeight: '800',
                    fontSize: 15,
                    letterSpacing: 0.3,
                  }}
                >
                  Suscribirme ahora
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={restaurarCompras}
              disabled={comprando}
              activeOpacity={0.6}
              style={{ paddingVertical: 14, alignItems: 'center', marginTop: 4 }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: c.grisTexto,
                  fontWeight: '600',
                  textDecorationLine: 'underline',
                  textDecorationColor: c.cardBorde,
                }}
              >
                Restaurar compras
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── DISCLAIMER LEGAL ── */}
          <Text
            style={{
              fontSize: 11,
              color: c.grisTexto,
              textAlign: 'center',
              marginHorizontal: 32,
              marginTop: 20,
              lineHeight: 17,
            }}
          >
            El cobro se realiza a través de Google Play. La suscripción se renueva
            automáticamente salvo que la canceles con al menos 24 horas de anticipación al
            final del período vigente.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
