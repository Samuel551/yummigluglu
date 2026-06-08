import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePerfilStore } from '@/store/usePerfilStore';
import { usePlanStore } from '@/store/usePlanStore';
import { usePaisStore } from '@/store/usePaisStore';
import { useRecordatoriosStore } from '@/store/useRecordatoriosStore';
import { supabase } from '@/lib/supabase';
import { useColoresTema } from '@/hooks/useColoresTema';
import {
  DIAS_SEMANA,
  DIAS_LABEL,
  MOMENTOS_DIA,
  MOMENTO_LABEL,
  getLunesDeSemana,
  formatearRangoSemana,
  getFechasDeSemana,
  semanaAnterior,
  semanaSiguiente,
  buildGrid,
} from '@/constants/Semana';
import { DiaSemana, MomentoDia } from '@/types';

// ─── Mapeo momento → ícono Feather (reemplaza MOMENTO_EMOJI) ──────────────────
const MOMENTO_ICON: Record<MomentoDia, keyof typeof Feather.glyphMap> = {
  desayuno: 'sunrise',
  almuerzo: 'sun',
  snack: 'coffee',
  cena: 'moon',
};

// ─── Helpers de calendario ────────────────────────────────────────────────────

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
const MESES_CORTO = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];
const DIAS_HEADER = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const ETAPA_DESCRIPCION: Record<string, string> = {
  inicio: 'Primeros alimentos · 6 a 11 meses',
  transicion: 'Texturas variadas · 12 a 23 meses',
  preescolar: 'Platos completos · 2 años o más',
};

/** Devuelve el ISO del lunes de la fila `rowIndex` del mes dado. */
function getLunesDeFilaFn(rowIndex: number, year: number, month: number): string {
  const primerDia = new Date(year, month, 1).getDay();
  const offset = primerDia === 0 ? 6 : primerDia - 1;
  const dayOfMonth = rowIndex * 7 - offset + 1;
  return new Date(year, month, dayOfMonth).toISOString().split('T')[0];
}

function esHoyEnFila(fila: (number | null)[], year: number, month: number): boolean {
  const hoy = new Date();
  return fila.some(
    (d) => d === hoy.getDate() && month === hoy.getMonth() && year === hoy.getFullYear()
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

export default function PlanScreen() {
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const { perfilActivo } = usePerfilStore();
  const { plan, recetasCache, cargando, error, cargarPlan, generarPlan, limpiarPlan } =
    usePlanStore();
  const pais = usePaisStore((s) => s.pais);
  const activarSemanaPlan = useRecordatoriosStore((s) => s.activarSemanaPlan);
  const cargandoRecordatorios = useRecordatoriosStore((s) => s.cargando);

  const [inicio, setInicio] = useState(() => getLunesDeSemana());
  const [calendarioVisible, setCalendarioVisible] = useState(false);

  useEffect(() => {
    limpiarPlan();
  }, [perfilActivo?.id]);

  useEffect(() => {
    if (!perfilActivo) return;
    cargarPlan(perfilActivo.id, inicio);
  }, [perfilActivo?.id, inicio]);

  const handleGenerarPlan = async () => {
    if (!perfilActivo) return;
    await generarPlan(perfilActivo.id, perfilActivo.etapa, perfilActivo.alergias, inicio, pais);
  };

  const handleRegenerarPlan = () => {
    Alert.alert(
      'Función Premium',
      'Regenerar el plan ilimitadas veces es exclusivo para usuarios Premium.',
      [
        { text: 'Ahora no', style: 'cancel' },
        { text: 'Probar Premium', onPress: () => router.push('/premium') },
      ]
    );
  };

  const handleConfirmarCalendario = (fecha: string) => {
    setInicio(fecha);
    setCalendarioVisible(false);
  };

  const handleProgramarSemana = async () => {
    if (!plan) return;
    const nombres: Record<string, string> = {};
    for (const id in recetasCache) nombres[id] = recetasCache[id].nombre;

    const creados = await activarSemanaPlan(plan, nombres);
    const estado = useRecordatoriosStore.getState();

    if (estado.errorEsPremium) {
      Alert.alert(
        'Función Premium',
        'Programar la semana entera de un solo toque es exclusivo para Premium. Activa las 21 alarmas del plan en un instante.',
        [
          { text: 'Ahora no', style: 'cancel', onPress: () => estado.limpiarError() },
          {
            text: 'Probar Premium',
            onPress: () => {
              estado.limpiarError();
              router.push('/premium');
            },
          },
        ]
      );
    } else if (creados > 0) {
      Alert.alert(
        '¡Listo!',
        `Se programaron ${creados} recordatorios para la semana de ${perfilActivo?.nombre}.`,
        [
          { text: 'OK' },
          { text: 'Ver agenda', onPress: () => router.push('/agenda') },
        ]
      );
    }
  };

  const fechasDeSemana = getFechasDeSemana(inicio);
  const hoyISO = new Date().toISOString().split('T')[0];
  const semanaActualISO = getLunesDeSemana();
  const esSemanaActual = inicio === semanaActualISO;

  // ─── Sin perfil activo ──────────────────────────────────────────────────────
  if (!perfilActivo) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
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
            <Feather name="user" size={26} color={c.grisTexto} />
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
            Sin perfil activo
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: c.grisTexto,
              textAlign: 'center',
              marginTop: 6,
              lineHeight: 19,
              maxWidth: 280,
            }}
          >
            Selecciona un perfil en la pestaña Perfil para ver el plan semanal.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 32,
          }}
        >
          {/* ── ENCABEZADO EDITORIAL ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
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
              PLAN SEMANAL · {formatearRangoSemana(inicio).toUpperCase()}
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
              Para{' '}
              <Text style={{ color: c.verde }}>{perfilActivo.nombre}</Text>{' '}
              <Text style={{ fontSize: 28, lineHeight: 42 }}>{perfilActivo.avatar_emoji}</Text>
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: c.grisTexto,
                lineHeight: 20,
                marginTop: 8,
              }}
            >
              {ETAPA_DESCRIPCION[perfilActivo.etapa] ?? perfilActivo.etapa}
            </Text>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: c.cardBorde,
              marginHorizontal: 24,
              marginTop: 28,
              marginBottom: 20,
            }}
          />

          {/* ── SELECTOR DE SEMANA — inline ── */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 24,
              marginBottom: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => setInicio(semanaAnterior(inicio))}
              hitSlop={12}
              activeOpacity={0.5}
              style={{ padding: 6, marginLeft: -6 }}
              accessibilityLabel="Semana anterior"
            >
              <Feather name="chevron-left" size={22} color={c.negro} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCalendarioVisible(true)}
              activeOpacity={0.6}
              style={{ flex: 1, alignItems: 'center' }}
              accessibilityLabel="Elegir semana desde el calendario"
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '700',
                  color: c.negro,
                  letterSpacing: -0.2,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {formatearRangoSemana(inicio)}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: esSemanaActual ? c.verde : c.grisTexto,
                    fontWeight: '600',
                  }}
                >
                  {esSemanaActual ? 'Esta semana' : 'Toca para cambiar'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setInicio(semanaSiguiente(inicio))}
              hitSlop={12}
              activeOpacity={0.5}
              style={{ padding: 6, marginRight: -6 }}
              accessibilityLabel="Semana siguiente"
            >
              <Feather name="chevron-right" size={22} color={c.negro} />
            </TouchableOpacity>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: c.cardBorde,
              marginHorizontal: 24,
              marginTop: 20,
              marginBottom: 8,
            }}
          />

          {/* ── CONTENIDO ── */}
          {cargando ? (
            <View style={{ paddingVertical: 80, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={c.verde} />
            </View>
          ) : !plan ? (
            <EmptyStatePlan
              perfilNombre={perfilActivo.nombre}
              onGenerar={handleGenerarPlan}
              cargando={cargando}
            />
          ) : (
            <>
              {/* Días del plan */}
              {DIAS_SEMANA.map((dia, idx) => {
                const fecha = fechasDeSemana[idx];
                const fechaISO = fecha.toISOString().split('T')[0];
                const esHoy = fechaISO === hoyISO;
                return (
                  <DiaEditorial
                    key={dia}
                    dia={dia as DiaSemana}
                    fecha={fecha}
                    esHoy={esHoy}
                    momentos={MOMENTOS_DIA.map((m) => ({
                      momento: m,
                      recetaId: plan.dias[dia as DiaSemana]?.[m],
                      recetaNombre: plan.dias[dia as DiaSemana]?.[m]
                        ? recetasCache[plan.dias[dia as DiaSemana]?.[m] as string]?.nombre
                        : null,
                    }))}
                    c={c}
                  />
                );
              })}

              {/* Regenerar plan — pill outline con badge premium */}
              <View
                style={{
                  paddingHorizontal: 24,
                  paddingTop: 8,
                  paddingBottom: 20,
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  onPress={handleRegenerarPlan}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: c.cardBorde,
                    backgroundColor: c.card,
                  }}
                >
                  <Feather name="rotate-cw" size={15} color={c.negro} />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: c.negro,
                      letterSpacing: -0.1,
                    }}
                  >
                    Regenerar plan
                  </Text>
                  <View
                    style={{
                      backgroundColor: '#1A1714',
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Feather name="star" size={9} color="#fff" />
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: '700',
                        color: '#fff',
                        letterSpacing: 0.8,
                      }}
                    >
                      PREMIUM
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Acciones finales — al final del scroll, no sticky */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  paddingHorizontal: 24,
                  paddingTop: 4,
                  paddingBottom: 12,
                }}
              >
                <TouchableOpacity
                  onPress={handleProgramarSemana}
                  disabled={cargandoRecordatorios}
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
                    backgroundColor: c.card,
                    borderWidth: 1.5,
                    borderColor: c.verde,
                    borderRadius: 999,
                    paddingVertical: 14,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                  accessibilityLabel="Programar recordatorios de la semana"
                >
                  {cargandoRecordatorios ? (
                    <ActivityIndicator color={c.verde} size="small" />
                  ) : (
                    <>
                      <Feather name="bell" size={15} color={c.verde} />
                      <Text style={{ color: c.verde, fontWeight: '700', fontSize: 13 }}>
                        Programar
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/lista-compras')}
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
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
                  accessibilityLabel="Ver lista de compras"
                >
                  <Feather name="shopping-cart" size={15} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>
                    Lista de compras
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {error && (
            <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
              <Text style={{ color: c.error, fontSize: 12, textAlign: 'center' }}>{error}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Modal calendario */}
      <CalendarioPicker
        visible={calendarioVisible}
        inicioActual={inicio}
        perfilId={perfilActivo.id}
        onClose={() => setCalendarioVisible(false)}
        onConfirm={handleConfirmarCalendario}
        c={c}
      />
    </View>
  );
}

// ─── DiaEditorial ─────────────────────────────────────────────────────────────

function DiaEditorial({
  dia,
  fecha,
  esHoy,
  momentos,
  c,
}: {
  dia: DiaSemana;
  fecha: Date;
  esHoy: boolean;
  momentos: Array<{ momento: MomentoDia; recetaId: string | undefined; recetaNombre: string | null | undefined }>;
  c: ReturnType<typeof useColoresTema>;
}) {
  return (
    <View style={{ paddingTop: 20, paddingBottom: 4 }}>
      {/* Eyebrow del día */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 24,
          marginBottom: 12,
        }}
      >
        {esHoy && (
          <View
            style={{
              backgroundColor: '#1A1714',
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: '800',
                color: '#fff',
                letterSpacing: 1.2,
              }}
            >
              HOY
            </Text>
          </View>
        )}
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: esHoy ? c.negro : c.grisTexto,
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontVariant: ['tabular-nums'],
          }}
        >
          {DIAS_LABEL[dia]} · {fecha.getDate()} {MESES_CORTO[fecha.getMonth()]}
        </Text>
      </View>

      {/* Bloque de momentos con barra vertical si es hoy */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 24 }}>
        {esHoy && (
          <View
            style={{
              width: 3,
              backgroundColor: c.verde,
              borderRadius: 2,
              marginRight: 12,
              marginVertical: 2,
            }}
          />
        )}
        <View style={{ flex: 1 }}>
          {momentos.map(({ momento, recetaId, recetaNombre }, mIdx) => (
            <TouchableOpacity
              key={momento}
              onPress={() => recetaId && router.push(`/receta/${recetaId}`)}
              disabled={!recetaId}
              activeOpacity={0.6}
              accessibilityLabel={
                recetaNombre
                  ? `Ver receta ${recetaNombre}`
                  : `Sin receta para ${MOMENTO_LABEL[momento]}`
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 13,
                borderTopWidth: mIdx > 0 ? 1 : 0,
                borderTopColor: c.cardBorde,
              }}
            >
              <View
                style={{
                  width: 28,
                  alignItems: 'center',
                  marginRight: 10,
                }}
              >
                <Feather
                  name={MOMENTO_ICON[momento]}
                  size={17}
                  color={recetaId ? c.negro : c.grisTexto}
                  style={{ opacity: recetaId ? 0.85 : 0.4 }}
                />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: c.grisTexto,
                  fontWeight: '600',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  width: 78,
                }}
              >
                {MOMENTO_LABEL[momento]}
              </Text>
              {recetaNombre ? (
                <>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: '600',
                      color: c.negro,
                      letterSpacing: -0.1,
                    }}
                    numberOfLines={1}
                  >
                    {recetaNombre}
                  </Text>
                  <Feather name="chevron-right" size={16} color={c.grisTexto} />
                </>
              ) : (
                <Text style={{ flex: 1, fontSize: 14, color: c.grisTexto }}>—</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Separador entre días */}
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

// ─── EmptyStatePlan ───────────────────────────────────────────────────────────

function EmptyStatePlan({
  perfilNombre,
  onGenerar,
  cargando,
}: {
  perfilNombre: string;
  onGenerar: () => void;
  cargando: boolean;
}) {
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
        <Feather name="calendar" size={26} color={c.grisTexto} />
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
        Sin plan para este período
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
        Genera un plan personalizado para {perfilNombre} con recetas adaptadas a su etapa y sin
        sus alergenos.
      </Text>
      <TouchableOpacity
        onPress={onGenerar}
        disabled={cargando}
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
        accessibilityLabel="Generar plan"
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.2 }}>
          Generar plan
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── CalendarioPicker (modal) ─────────────────────────────────────────────────

function CalendarioPicker({
  visible,
  inicioActual,
  perfilId,
  onClose,
  onConfirm,
  c,
}: {
  visible: boolean;
  inicioActual: string;
  perfilId: string;
  onClose: () => void;
  onConfirm: (fecha: string) => void;
  c: ReturnType<typeof useColoresTema>;
}) {
  const insets = useSafeAreaInsets();
  const [mes, setMes] = useState(() => {
    const d = new Date(inicioActual + 'T12:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [seleccionado, setSeleccionado] = useState<string>(() =>
    getLunesDeSemana(new Date(inicioActual + 'T12:00:00'))
  );
  const [semanasConPlan, setSemanasConPlan] = useState<Set<string>>(new Set());
  const [cargandoSemanas, setCargandoSemanas] = useState(false);

  useEffect(() => {
    if (!visible || !perfilId) return;
    setCargandoSemanas(true);
    supabase
      .from('planes_semanales')
      .select('semana_inicio')
      .eq('perfil_id', perfilId)
      .then(({ data }) => {
        setSemanasConPlan(
          new Set((data ?? []).map((r: { semana_inicio: string }) => r.semana_inicio))
        );
        setCargandoSemanas(false);
      });
  }, [visible, perfilId]);

  const grid = buildGrid(mes.year, mes.month);
  const semanaActualISO = getLunesDeSemana();

  const irMesAnterior = () =>
    setMes(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  const irMesSiguiente = () =>
    setMes(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: c.fondoApp, paddingTop: insets.top + 16 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              ELEGIR SEMANA
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8} activeOpacity={0.6}>
              <Text style={{ fontSize: 14, color: c.grisTexto, fontWeight: '600' }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 26,
              fontWeight: '800',
              color: c.negro,
              letterSpacing: -0.5,
              lineHeight: 32,
            }}
          >
            ¿Para qué semana?
          </Text>
        </View>

        {/* Separador */}
        <View
          style={{
            height: 1,
            backgroundColor: c.cardBorde,
            marginHorizontal: 24,
            marginBottom: 16,
          }}
        />

        {/* Navegación de mes */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={irMesAnterior}
            hitSlop={12}
            activeOpacity={0.5}
            style={{ padding: 6, marginLeft: -6 }}
          >
            <Feather name="chevron-left" size={20} color={c.negro} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: c.negro,
              fontVariant: ['tabular-nums'],
              letterSpacing: -0.2,
            }}
          >
            {MESES[mes.month]} {mes.year}
          </Text>
          <TouchableOpacity
            onPress={irMesSiguiente}
            hitSlop={12}
            activeOpacity={0.5}
            style={{ padding: 6, marginRight: -6 }}
          >
            <Feather name="chevron-right" size={20} color={c.negro} />
          </TouchableOpacity>
        </View>

        {/* Headers días */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 28, marginBottom: 6 }}>
          {DIAS_HEADER.map((d, i) => (
            <View key={i} style={{ width: `${100 / 7}%`, alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: c.grisTexto,
                  letterSpacing: 1,
                }}
              >
                {d}
              </Text>
            </View>
          ))}
        </View>

        {/* Filas — cada fila es una semana tappable */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
          {cargandoSemanas ? (
            <ActivityIndicator color={c.verde} style={{ marginTop: 20 }} />
          ) : (
            grid.map((fila, fi) => {
              const lunesFila = getLunesDeFilaFn(fi, mes.year, mes.month);
              const isSelected = seleccionado === lunesFila;
              const tienePlan = semanasConPlan.has(lunesFila);
              const isCurrentWeek = lunesFila === semanaActualISO;
              const tieneHoy = esHoyEnFila(fila, mes.year, mes.month);

              return (
                <TouchableOpacity
                  key={fi}
                  onPress={() => setSeleccionado(lunesFila)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Semana del ${formatearRangoSemana(lunesFila)}${tienePlan ? ', ya tiene plan' : ''}`}
                  style={{
                    position: 'relative',
                    marginBottom: 4,
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: isSelected
                      ? c.verde
                      : tienePlan
                        ? c.verdeClaro
                        : 'transparent',
                    borderWidth: isCurrentWeek && !isSelected ? 1 : 0,
                    borderColor: c.verde,
                  }}
                >
                  {/* Días de la fila — alineados con el header (mismo padding) */}
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingVertical: 11,
                      paddingHorizontal: 4,
                    }}
                  >
                    {fila.map((dia, di) => {
                      const esHoyDia =
                        dia !== null &&
                        tieneHoy &&
                        dia === new Date().getDate() &&
                        mes.month === new Date().getMonth() &&
                        mes.year === new Date().getFullYear();
                      return (
                        <View key={di} style={{ width: `${100 / 7}%`, alignItems: 'center' }}>
                          {dia !== null ? (
                            <View style={{ alignItems: 'center' }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: esHoyDia || isSelected ? '700' : '500',
                                  color: isSelected
                                    ? '#fff'
                                    : tienePlan
                                      ? c.verde
                                      : esHoyDia
                                        ? c.verde
                                        : c.negro,
                                  fontVariant: ['tabular-nums'],
                                }}
                              >
                                {dia}
                              </Text>
                              {esHoyDia && !isSelected && (
                                <View
                                  style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: c.verde,
                                    marginTop: 2,
                                  }}
                                />
                              )}
                            </View>
                          ) : (
                            <Text style={{ fontSize: 14, color: 'transparent' }}>·</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>

                  {/* Indicador "tiene plan" — dot absolute, NO afecta alineamiento */}
                  {tienePlan && !isSelected && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: c.verde,
                      }}
                    />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Footer con info + CTA */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: insets.bottom + 20,
            borderTopWidth: 1,
            borderTopColor: c.cardBorde,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: c.grisTexto,
              textAlign: 'center',
              marginBottom: 12,
              fontVariant: ['tabular-nums'],
            }}
          >
            {formatearRangoSemana(seleccionado)}
            {semanasConPlan.has(seleccionado) ? ' · Ya tiene plan' : ''}
          </Text>
          <TouchableOpacity
            onPress={() => onConfirm(seleccionado)}
            activeOpacity={0.85}
            style={{
              backgroundColor: c.verde,
              borderRadius: 999,
              paddingVertical: 15,
              alignItems: 'center',
              shadowColor: c.verde,
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            }}
            accessibilityLabel="Ver plan de la semana seleccionada"
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.2 }}>
              {semanasConPlan.has(seleccionado) ? 'Ver plan existente' : 'Generar plan'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
