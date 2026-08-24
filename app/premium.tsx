import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { PACKAGE_TYPE } from 'react-native-purchases';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import { usePerfilStore, MAX_PERFILES_FREE } from '@/store/usePerfilStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { construirPlanes, formatearVencimiento, PlanPresentado } from '@/lib/planes';
import { NUTRIBOT_LIMITE_FREE, NUTRIBOT_LIMITE_PREMIUM } from '@/constants/Nutribot';
import type { ThemePalette } from '@/constants/Colors';

type BeneficioIcon = keyof typeof Feather.glyphMap;

interface Beneficio {
  icon: BeneficioIcon;
  titulo: string;
  descripcion: string;
}

/**
 * 🔴 **REGLA: cada beneficio de esta lista tiene que corresponder a un gate REAL
 * en el código.** Esto es la pantalla de cobro: prometer algo que el plan gratuito
 * ya incluye es tergiversar la compra integrada — reembolsos y política de Play.
 *
 * Auditado el 2026-08-22. Dónde se hace cumplir cada uno:
 *
 * | Beneficio           | Gate                                                    |
 * | ------------------- | ------------------------------------------------------- |
 * | Videos paso a paso  | vista `recetas_teaser` — gatea `video_url`              |
 * | NutriBot            | `supabase/functions/nutribot` — cupo mensual por plan   |
 * | Sin anuncios        | `components/AnuncioBanner.tsx`, `lib/intersticial.ts`   |
 * | Perfiles ilimitados | `store/usePerfilStore.ts` → `MAX_PERFILES_FREE`         |
 * | Plan semanal        | `app/(tabs)/plan.tsx` — regenerar y programar la semana |
 * | Agenda completa     | `app/agenda.tsx` → `TIPOS_FREE` e hitos                 |
 *
 * ⚠️ **Lo que NO va acá: el catálogo de recetas.** Las recetas son SIEMPRE free
 * (migración `024`); solo se gatea el video. Esta lista decía "Recetas premium sin
 * límite — catálogo completo" y era **falso**: le cobraba al usuario algo que ya
 * tenía gratis. Si volvés a agregar un beneficio, primero mostrá el gate.
 *
 * Los números salen de las constantes, no de texto suelto, para que el copy no
 * pueda quedar desincronizado del código nunca más.
 */
const BENEFICIOS: Beneficio[] = [
  {
    icon: 'play-circle',
    titulo: 'Videos paso a paso',
    descripcion: 'Mira la preparación completa de cada receta en clips cortos verticales.',
  },
  {
    icon: 'message-circle',
    titulo: 'NutriBot sin freno',
    descripcion: `${NUTRIBOT_LIMITE_PREMIUM} consultas al mes con el asistente de alimentación, en vez de ${NUTRIBOT_LIMITE_FREE}.`,
  },
  {
    icon: 'shield',
    titulo: 'Sin anuncios',
    descripcion: 'Disfruta la app sin interrupciones, ahora y cuando crezca.',
  },
  {
    icon: 'users',
    titulo: 'Perfiles ilimitados',
    descripcion: `Agrega todos los hijos que necesites; el plan gratuito incluye ${MAX_PERFILES_FREE}.`,
  },
  {
    icon: 'calendar',
    titulo: 'Plan semanal ilimitado',
    descripcion:
      'Regenera el menú las veces que quieras y programa la semana completa de un toque.',
  },
  {
    icon: 'bell',
    titulo: 'Agenda completa',
    // `proximosHitos(fecha, 5)` en agenda.tsx: el 5 son CINCO HITOS, no cinco años.
    // El catálogo tiene 11 hitos y llega a los 48 meses (4 años). No decir "5 años".
    descripcion: 'Los 5 tipos de recordatorio y los próximos 5 hitos, en vez de 1.',
  },
];

/**
 * Tarjeta seleccionable de un plan.
 *
 * ⚠️ `TouchableOpacity` con `style` OBJETO envolviendo un `View` que lleva el layout.
 * NADA de `style` como función — css-interop descarta el bloque entero sin avisar y
 * la tarjeta saldría como texto apilado. Hay regla de ESLint. Ver CLAUDE.md.
 */
function TarjetaPlan({
  plan,
  seleccionado,
  deshabilitado,
  onSelect,
  c,
}: {
  plan: PlanPresentado;
  seleccionado: boolean;
  deshabilitado: boolean;
  onSelect: () => void;
  c: ThemePalette;
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      disabled={deshabilitado}
      activeOpacity={0.7}
      style={{ marginBottom: 12 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          borderWidth: seleccionado ? 2 : 1,
          borderColor: seleccionado ? c.verde : c.cardBorde,
          backgroundColor: seleccionado ? c.verdeClaro : c.card,
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 16,
          opacity: deshabilitado ? 0.6 : 1,
        }}
      >
        {/* Radio */}
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 2,
            borderColor: seleccionado ? c.verde : c.cardBorde,
            backgroundColor: seleccionado ? c.verde : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {seleccionado ? <Feather name="check" size={13} color={c.blanco} /> : null}
        </View>

        {/* Nombre + desglose */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: c.negro, letterSpacing: -0.2 }}>
              {plan.etiqueta}
            </Text>
            {plan.ahorroPct !== null ? (
              <View
                style={{
                  backgroundColor: c.premium,
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '800',
                    color: '#FFFFFF',
                    letterSpacing: 0.5,
                  }}
                >
                  AHORRAS {plan.ahorroPct}%
                </Text>
              </View>
            ) : null}
          </View>
          {plan.desglose ? (
            <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 3 }}>
              equivale a {plan.desglose} al mes
            </Text>
          ) : null}
        </View>

        {/* Precio — SIEMPRE del paquete, nunca hardcodeado */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: 19,
              fontWeight: '900',
              color: c.negro,
              letterSpacing: -0.5,
              fontVariant: ['tabular-nums'],
            }}
          >
            {plan.precio}
          </Text>
          <Text style={{ fontSize: 11, color: c.grisTexto, marginTop: 2 }}>{plan.periodo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/** Cuando la oferta trae un solo plan no hay nada que elegir: se muestra el precio grande. */
function PrecioUnico({ plan, c }: { plan: PlanPresentado; c: ThemePalette }) {
  return (
    <View>
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
        {plan.precio}
      </Text>
      <Text style={{ fontSize: 13, color: c.grisTexto, textAlign: 'center', marginTop: 8 }}>
        {plan.periodo} · cancelas cuando quieras
      </Text>
    </View>
  );
}

// Deep link al centro de suscripciones de Google Play. Con `package` abre
// directo la lista de esta app; sin él, el listado general del usuario.
const URL_SUSCRIPCIONES_PLAY =
  'https://play.google.com/store/account/subscriptions?package=com.yummigluglu.app';

/**
 * Pantalla para quien YA es premium: estado, renovación y gestión.
 *
 * 🔴 **POR QUÉ EXISTE (2026-08-24).** Antes esta pantalla EXPULSABA al premium
 * con un `router.back()` apenas `esPremium` era `true`. Y como "Restaurar
 * compras" vive ÚNICAMENTE acá, el resultado era que **un usuario premium no
 * tenía ninguna forma de llegar a ese botón**: el mecanismo de reparación
 * quedaba detrás de un guard que asumía que no hacía falta repararlo.
 *
 * Es el mismo patrón que el bug del webhook — una red de seguridad que depende
 * de que no haya pasado nada malo. Regla: **antes de esconder algo detrás de un
 * estado, preguntate si ese estado puede estar equivocado.**
 */
function VistaPremiumActivo({
  c,
  insets,
  expiresAt,
  esAnual,
  comprando,
  onRestaurar,
}: {
  c: ThemePalette;
  insets: { bottom: number };
  expiresAt: string | null | undefined;
  esAnual: boolean;
  comprando: boolean;
  onRestaurar: () => void;
}) {
  const vencimiento = formatearVencimiento(expiresAt);

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          {/* TouchableOpacity con estilo OBJETO, nunca `style` como función. */}
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            activeOpacity={0.5}
            style={{
              paddingHorizontal: 24,
              paddingTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              alignSelf: 'flex-start',
            }}
          >
            <Feather name="arrow-left" size={18} color={c.negro} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.negro }}>Volver</Text>
          </TouchableOpacity>

          {/* ── ENCABEZADO ── */}
          <View style={{ alignItems: 'center', paddingHorizontal: 24, marginTop: 24 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: c.verdeClaro,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="award" size={34} color={c.verde} />
            </View>
            <Text
              style={{
                fontSize: 26,
                fontWeight: '900',
                color: c.negro,
                textAlign: 'center',
                marginTop: 18,
                letterSpacing: -0.6,
              }}
            >
              Tu Premium está activo
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: c.grisTexto,
                textAlign: 'center',
                marginTop: 8,
                lineHeight: 21,
              }}
            >
              Gracias por apoyar Yummi Glu Glu. Tienes todo desbloqueado.
            </Text>
          </View>

          {/* ── TARJETA DE ESTADO ── */}
          <View
            style={{
              marginHorizontal: 24,
              marginTop: 28,
              backgroundColor: c.card,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: c.cardBorde,
              padding: 18,
              gap: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Feather name="check-circle" size={18} color={c.verde} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: c.grisTexto, fontWeight: '600' }}>Plan</Text>
                <Text style={{ fontSize: 15, color: c.negro, fontWeight: '700', marginTop: 2 }}>
                  {esAnual ? 'Premium anual' : 'Premium'}
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: c.cardBorde }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Feather name="calendar" size={18} color={c.verde} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: c.grisTexto, fontWeight: '600' }}>
                  {vencimiento ? 'Se renueva el' : 'Vigencia'}
                </Text>
                <Text style={{ fontSize: 15, color: c.negro, fontWeight: '700', marginTop: 2 }}>
                  {/* Sin fecha = acceso de cortesía (no viene de Google Play).
                      Decir "se renueva" ahí sería mentirle al usuario. */}
                  {vencimiento ?? 'Sin fecha de vencimiento'}
                </Text>
              </View>
            </View>
          </View>

          {/* ── GESTIONAR EN GOOGLE PLAY ── */}
          <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => Linking.openURL(URL_SUSCRIPCIONES_PLAY)}
              activeOpacity={0.85}
            >
              <View
                style={{
                  backgroundColor: c.card,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: c.cardBorde,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Feather name="external-link" size={18} color={c.negro} />
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: c.negro }}>
                  Administrar suscripción
                </Text>
                <Feather name="chevron-right" size={18} color={c.grisTexto} />
              </View>
            </TouchableOpacity>

            <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 10, lineHeight: 18 }}>
              El cambio de plan y la cancelación se hacen desde Google Play. Si cancelas, conservas
              el acceso hasta el final del período que ya pagaste.
            </Text>
          </View>

          {/* ── QUÉ INCLUYE ── */}
          <View style={{ paddingHorizontal: 24, marginTop: 28, gap: 14 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                color: c.grisTexto,
                letterSpacing: 1,
              }}
            >
              QUÉ INCLUYE
            </Text>
            {BENEFICIOS.map((b) => (
              <View
                key={b.titulo}
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
              >
                <Feather name={b.icon} size={17} color={c.verde} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.negro }}>
                    {b.titulo}
                  </Text>
                  <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 2, lineHeight: 18 }}>
                    {b.descripcion}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── RESTAURAR COMPRAS ──
              Discreto, pero PRESENTE. Es la única vía de autoservicio cuando la
              suscripción existe en Google Play pero la app no la refleja — el
              caso exacto que deja el webhook cuando falla. No sacarlo. */}
          <TouchableOpacity
            onPress={onRestaurar}
            disabled={comprando}
            activeOpacity={0.6}
            style={{
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 28,
              opacity: comprando ? 0.5 : 1,
            }}
          >
            {comprando ? (
              <ActivityIndicator color={c.grisTexto} />
            ) : (
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
            )}
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 11,
              color: c.grisTexto,
              textAlign: 'center',
              marginHorizontal: 32,
              marginTop: 4,
              lineHeight: 17,
            }}
          >
            ¿Cambiaste de teléfono o no ves tu Premium? Toca Restaurar compras con la misma cuenta
            de Google con la que te suscribiste.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export default function PremiumScreen() {
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const perfilActivo = usePerfilStore((s) => s.perfilActivo);
  const {
    paquetes,
    comprando,
    esPremium,
    suscripcion,
    error,
    comprarPremium,
    restaurarCompras,
    cargarPaquetes,
    limpiarError,
  } = useSuscripcionStore();

  const planes = useMemo(() => construirPlanes(paquetes), [paquetes]);
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);

  /**
   * El plan que se va a cobrar. El `?? planes[0]` no es adorno: si el offering
   * cambia mientras la pantalla está abierta y el id seleccionado deja de existir,
   * sin ese fallback el botón quedaría muerto para siempre.
   */
  const planSeleccionado = useMemo(
    () => planes.find((p) => p.paquete.identifier === seleccionadoId) ?? planes[0] ?? null,
    [planes, seleccionadoId]
  );

  useEffect(() => {
    cargarPaquetes();
  }, [cargarPaquetes]);

  // Selección inicial: el anual si existe (es el de mejor precio por mes), si no el primero.
  // El precio y el periodo se ven completos en la tarjeta y en el botón, así que
  // preseleccionar el de mejor valor informa, no esconde.
  useEffect(() => {
    if (planes.length === 0) return;
    if (seleccionadoId && planes.some((p) => p.paquete.identifier === seleccionadoId)) return;
    const anual = planes.find((p) => p.paquete.packageType === PACKAGE_TYPE.ANNUAL);
    setSeleccionadoId((anual ?? planes[0]).paquete.identifier);
  }, [planes, seleccionadoId]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'Cerrar', onPress: limpiarError }]);
    }
  }, [error, limpiarError]);

  // 🔴 Acá vivía un `useEffect` que hacía `router.back()` en cuanto `esPremium`
  // era true. Expulsaba al premium de la única pantalla que tiene el botón
  // "Restaurar compras". Ver el comentario de `VistaPremiumActivo`.
  //
  // ⚠️ El early return va DESPUÉS de todos los hooks, sin excepción: React exige
  // que la cantidad y el orden de hooks sea idéntico en cada render.
  //
  // Efecto secundario buscado: al terminar una compra el usuario ya no sale
  // disparado de la pantalla — ve la confirmación de que su Premium quedó activo.
  if (esPremium) {
    return (
      <VistaPremiumActivo
        c={c}
        insets={insets}
        expiresAt={suscripcion?.expires_at}
        esAnual={suscripcion?.plan === 'premium_anual'}
        comprando={comprando}
        onRestaurar={restaurarCompras}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          {/* ── BOTÓN VOLVER ── */}
          {/* TouchableOpacity con estilo OBJETO, no Pressable con `style` como función:
              css-interop descarta el bloque entero sin avisar. Ver CLAUDE.md. */}
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={comprando}
            hitSlop={12}
            activeOpacity={0.5}
            style={{
              paddingHorizontal: 24,
              paddingTop: 16,
              opacity: comprando ? 0.5 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              alignSelf: 'flex-start',
            }}
          >
            <Feather name="arrow-left" size={18} color={c.negro} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.negro }}>Volver</Text>
          </TouchableOpacity>

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
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 }}>
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
                  {'\n'}para <Text style={{ color: c.verde }}>{perfilActivo.nombre}</Text>{' '}
                  <Text style={{ fontSize: 28, lineHeight: 42 }}>{perfilActivo.avatar_emoji}</Text>
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
              Videos paso a paso, asistente sin freno y agenda inteligente para acompañar cada etapa
              de la alimentación.
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

          {/* ── PLANES ── */}
          <View style={{ paddingHorizontal: 24 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                textAlign: planes.length > 1 ? 'left' : 'center',
                marginBottom: planes.length > 1 ? 14 : 12,
              }}
            >
              {planes.length > 1 ? 'ELIGE TU PLAN' : 'TU PLAN'}
            </Text>

            {planes.length === 0 ? (
              <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={c.verde} />
                <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 10 }}>
                  Cargando planes…
                </Text>
              </View>
            ) : planes.length === 1 ? (
              <PrecioUnico plan={planes[0]} c={c} />
            ) : (
              planes.map((plan) => (
                <TarjetaPlan
                  key={plan.paquete.identifier}
                  plan={plan}
                  c={c}
                  seleccionado={plan.paquete.identifier === planSeleccionado?.paquete.identifier}
                  deshabilitado={comprando}
                  onSelect={() => setSeleccionadoId(plan.paquete.identifier)}
                />
              ))
            )}
          </View>

          {/* ── CTA ── */}
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <TouchableOpacity
              onPress={() => {
                if (planSeleccionado) comprarPremium(planSeleccionado.paquete);
              }}
              disabled={comprando || !planSeleccionado}
              activeOpacity={0.85}
              style={{
                paddingVertical: 17,
                borderRadius: 999,
                alignItems: 'center',
                backgroundColor: comprando || !planSeleccionado ? c.grisClaro : c.verde,
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
                    color: planSeleccionado ? c.blanco : c.grisTexto,
                    fontWeight: '800',
                    fontSize: 15,
                    letterSpacing: 0.3,
                    textAlign: 'center',
                  }}
                >
                  {/* El precio va EN el botón a propósito: es el instante en que se
                      cobra, y es la garantía de que lo anunciado y lo cobrado coinciden. */}
                  {planSeleccionado
                    ? `Suscribirme por ${planSeleccionado.precio}`
                    : 'Suscribirme ahora'}
                </Text>
              )}
            </TouchableOpacity>

            {planSeleccionado && !comprando ? (
              <Text
                style={{
                  fontSize: 12,
                  color: c.grisTexto,
                  textAlign: 'center',
                  marginTop: 10,
                }}
              >
                Plan {planSeleccionado.etiqueta.toLowerCase()} · {planSeleccionado.periodo}
              </Text>
            ) : null}

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
            El cobro se realiza a través de Google Play. La suscripción se renueva automáticamente
            salvo que la canceles con al menos 24 horas de anticipación al final del período
            vigente.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
