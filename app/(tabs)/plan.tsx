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
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePerfilStore } from '@/store/usePerfilStore';
import { usePlanStore } from '@/store/usePlanStore';
import { supabase } from '@/lib/supabase';
import { useColoresTema } from '@/hooks/useColoresTema';
import {
  DIAS_SEMANA,
  DIAS_LABEL,
  MOMENTOS_DIA,
  MOMENTO_EMOJI,
  MOMENTO_LABEL,
  getLunesDeSemana,
  formatearRangoSemana,
  getFechasDeSemana,
  semanaAnterior,
  semanaSiguiente,
  buildGrid,
} from '@/constants/Semana';
import { DiaSemana } from '@/types';

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

// ─── Componente CalendarioPicker ──────────────────────────────────────────────

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
  const [mes, setMes] = useState(() => {
    const d = new Date(inicioActual + 'T12:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  // Siempre seleccionamos el lunes de la semana actual
  const [seleccionado, setSeleccionado] = useState<string>(() =>
    getLunesDeSemana(new Date(inicioActual + 'T12:00:00'))
  );
  const [semanasConPlan, setSemanasConPlan] = useState<Set<string>>(new Set());
  const [cargandoSemanas, setCargandoSemanas] = useState(false);

  // Cargar semanas con plan al abrir
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
      <View style={{ flex: 1, backgroundColor: c.fondoApp, padding: 24, paddingTop: 32 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '800', color: c.negro }}>Elige una semana</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 15, color: c.grisTexto }}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* Leyenda */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: c.verde }} />
            <Text style={{ fontSize: 11, color: c.grisTexto }}>Seleccionada</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                backgroundColor: c.verdeClaro,
                borderWidth: 1,
                borderColor: c.verde,
              }}
            />
            <Text style={{ fontSize: 11, color: c.grisTexto }}>Ya tiene plan</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                borderWidth: 1.5,
                borderColor: c.verde,
              }}
            />
            <Text style={{ fontSize: 11, color: c.grisTexto }}>Esta semana</Text>
          </View>
        </View>

        {/* Navegación de mes */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <TouchableOpacity onPress={irMesAnterior} style={{ padding: 8 }}>
            <Text style={{ fontSize: 20, color: c.verde }}>◀</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: '700', color: c.negro }}>
            {MESES[mes.month]} {mes.year}
          </Text>
          <TouchableOpacity onPress={irMesSiguiente} style={{ padding: 8 }}>
            <Text style={{ fontSize: 20, color: c.verde }}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Headers días */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 4, marginBottom: 4 }}>
          {DIAS_HEADER.map((d, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: c.grisTexto }}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Filas — cada fila es una semana tappable */}
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 4,
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: isSelected ? c.verde : tienePlan ? c.verdeClaro : 'transparent',
                  borderWidth: isCurrentWeek && !isSelected ? 1.5 : 0,
                  borderColor: c.verde,
                }}
              >
                {/* Días de la fila */}
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    paddingVertical: 10,
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
                      <View key={di} style={{ flex: 1, alignItems: 'center' }}>
                        {dia !== null ? (
                          <View style={{ alignItems: 'center' }}>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: esHoyDia || isSelected ? '700' : '400',
                                color: isSelected
                                  ? '#fff'
                                  : tienePlan
                                    ? c.verde
                                    : esHoyDia
                                      ? c.verde
                                      : c.negro,
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

                {/* Badge "Plan ✓" o "Esta semana" */}
                <View style={{ paddingRight: 10, minWidth: 60, alignItems: 'flex-end' }}>
                  {isSelected ? (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>✓ OK</Text>
                  ) : tienePlan ? (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: c.verde }}>Plan ✓</Text>
                  ) : isCurrentWeek ? (
                    <Text style={{ fontSize: 10, color: c.verde, fontWeight: '600' }}>Hoy</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Info semana seleccionada */}
        <View
          style={{
            marginTop: 16,
            backgroundColor: c.verdeClaro,
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 13, color: c.verde, fontWeight: '600' }}>
            📅 {formatearRangoSemana(seleccionado)} — 7 días
            {semanasConPlan.has(seleccionado) ? '  ·  Ya tiene plan' : ''}
          </Text>
        </View>

        {/* Confirmar */}
        <TouchableOpacity
          onPress={() => onConfirm(seleccionado)}
          style={{
            marginTop: 12,
            backgroundColor: c.verde,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          accessibilityLabel="Ver plan de la semana seleccionada"
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            {semanasConPlan.has(seleccionado)
              ? 'Ver plan existente'
              : 'Generar plan para esta semana'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

export default function PlanScreen() {
  const c = useColoresTema();
  const { perfilActivo } = usePerfilStore();
  const { plan, recetasCache, cargando, error, cargarPlan, generarPlan, limpiarPlan } =
    usePlanStore();

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
    await generarPlan(perfilActivo.id, perfilActivo.etapa, perfilActivo.alergias, inicio);
  };

  const handleRegenerarPlan = () => {
    Alert.alert(
      '⭐ Función Premium',
      'Regenerar el plan ilimitadas veces es exclusivo para usuarios Premium.\n\n¡Actualizá tu plan para desbloquearla!',
      [{ text: 'Entendido', style: 'cancel' }]
    );
  };

  const handleConfirmarCalendario = (fecha: string) => {
    setInicio(fecha);
    setCalendarioVisible(false);
  };

  const fechasDeSemana = getFechasDeSemana(inicio);
  const hoyISO = new Date().toISOString().split('T')[0];
  const esInicioHoy = inicio === hoyISO || inicio === getLunesDeSemana();

  if (!perfilActivo) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📅</Text>
          <Text style={{ fontSize: 17, fontWeight: '700', color: c.negro, textAlign: 'center' }}>
            Sin perfil activo
          </Text>
          <Text style={{ fontSize: 14, color: c.grisTexto, textAlign: 'center', marginTop: 6 }}>
            Selecciona un perfil en la pestaña Perfil para ver el plan semanal.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: c.negro }}>Plan semanal</Text>
        <Text style={{ fontSize: 14, color: c.grisTexto, marginTop: 2 }}>
          {perfilActivo.avatar_emoji} {perfilActivo.nombre}
        </Text>

        {/* Selector de período */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
            backgroundColor: c.card,
            borderRadius: 14,
            padding: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => setInicio(semanaAnterior(inicio))}
            style={{ padding: 6 }}
            accessibilityLabel="Período anterior"
          >
            <Text style={{ fontSize: 18, color: c.verde }}>◀</Text>
          </TouchableOpacity>

          {/* Toca para abrir el calendario */}
          <TouchableOpacity
            onPress={() => setCalendarioVisible(true)}
            style={{ flex: 1, alignItems: 'center' }}
            accessibilityLabel="Elegir período desde el calendario"
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: c.negro }}>
              {formatearRangoSemana(inicio)}
            </Text>
            {esInicioHoy && (
              <Text style={{ fontSize: 11, color: c.verde, marginTop: 1 }}>
                Esta semana · Toca para cambiar
              </Text>
            )}
            {!esInicioHoy && (
              <Text style={{ fontSize: 11, color: c.grisTexto, marginTop: 1 }}>
                Toca para cambiar
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setInicio(semanaSiguiente(inicio))}
            style={{ padding: 6 }}
            accessibilityLabel="Período siguiente"
          >
            <Text style={{ fontSize: 18, color: c.verde }}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido */}
      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={c.verde} />
        </View>
      ) : !plan ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🥦</Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: c.negro,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Sin plan para este período
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
            Generá un plan personalizado para {perfilActivo.nombre} con recetas adaptadas a su etapa
            y sin sus alergenos.
          </Text>
          <TouchableOpacity
            onPress={handleGenerarPlan}
            disabled={cargando}
            style={{
              backgroundColor: c.verde,
              borderRadius: 16,
              paddingHorizontal: 28,
              paddingVertical: 14,
            }}
            accessibilityLabel="Generar plan"
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>✨ Generar plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {/* Regenerar (premium) */}
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 4,
                alignItems: 'flex-end',
              }}
            >
              <TouchableOpacity
                onPress={handleRegenerarPlan}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: c.premiumFondo,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ fontSize: 12 }}>👑</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: c.naranja }}>
                  Regenerar plan
                </Text>
              </TouchableOpacity>
            </View>

            {/* Días */}
            {DIAS_SEMANA.map((dia, idx) => {
              const fecha = fechasDeSemana[idx];
              const esHoy = fecha.toDateString() === new Date().toDateString();

              return (
                <View
                  key={dia}
                  style={{
                    marginHorizontal: 20,
                    marginBottom: 12,
                    backgroundColor: c.card,
                    borderRadius: 16,
                    overflow: 'hidden',
                    borderWidth: esHoy ? 2 : 0,
                    borderColor: esHoy ? c.verde : 'transparent',
                  }}
                >
                  {/* Header día */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      backgroundColor: esHoy ? c.verde : c.fondoApp,
                    }}
                  >
                    <Text
                      style={{ fontWeight: '700', fontSize: 14, color: esHoy ? '#fff' : c.negro }}
                    >
                      {DIAS_LABEL[dia as DiaSemana]}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: esHoy ? 'rgba(255,255,255,0.8)' : c.grisTexto,
                        marginLeft: 6,
                      }}
                    >
                      {fecha.getDate()} {MESES_CORTO[fecha.getMonth()]}
                    </Text>
                  </View>

                  {/* Momentos */}
                  {MOMENTOS_DIA.map((momento, mIdx) => {
                    const recetaId = plan.dias[dia as DiaSemana]?.[momento];
                    const receta = recetaId ? recetasCache[recetaId] : null;
                    return (
                      <TouchableOpacity
                        key={momento}
                        onPress={() => recetaId && router.push(`/receta/${recetaId}`)}
                        disabled={!recetaId}
                        activeOpacity={0.6}
                        accessibilityLabel={
                          receta
                            ? `Ver receta ${receta.nombre}`
                            : `Sin receta para ${MOMENTO_LABEL[momento]}`
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          borderTopWidth: mIdx > 0 ? 1 : 0,
                          borderTopColor: c.cardBorde,
                        }}
                      >
                        <Text style={{ fontSize: 16, marginRight: 10, width: 24 }}>
                          {MOMENTO_EMOJI[momento]}
                        </Text>
                        <Text style={{ fontSize: 12, color: c.grisTexto, width: 68 }}>
                          {MOMENTO_LABEL[momento]}
                        </Text>
                        {receta ? (
                          <>
                            <Text
                              style={{ flex: 1, fontSize: 13, fontWeight: '600', color: c.negro }}
                              numberOfLines={1}
                            >
                              {receta.nombre}
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                color: c.isDark ? '#555' : '#C7C4C0',
                                marginLeft: 4,
                              }}
                            >
                              ›
                            </Text>
                          </>
                        ) : (
                          <Text style={{ flex: 1, fontSize: 13, color: c.grisTexto }}>—</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Botón lista de compras sticky */}
          <View style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
            <TouchableOpacity
              onPress={() => router.push('/lista-compras')}
              style={{
                backgroundColor: c.verde,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 4,
              }}
              accessibilityLabel="Ver lista de compras"
            >
              <Text style={{ fontSize: 20 }}>🛒</Text>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                Lista de compras
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {error && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
          <Text style={{ color: c.error, fontSize: 12, textAlign: 'center' }}>{error}</Text>
        </View>
      )}

      {/* Calendario picker */}
      <CalendarioPicker
        visible={calendarioVisible}
        inicioActual={inicio}
        perfilId={perfilActivo.id}
        onClose={() => setCalendarioVisible(false)}
        onConfirm={handleConfirmarCalendario}
        c={c}
      />
    </SafeAreaView>
  );
}
