import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { buildGrid } from '@/constants/Semana';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useRecordatoriosStore, programarHitosFuturos } from '@/store/useRecordatoriosStore';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { proximosHitos, hitoActual, tiempoHastaHito } from '@/constants/Hitos';
import { Recordatorio, TipoRecordatorio, RecordatorioInput, ModoNotificacion } from '@/types';
import { UpsellPremium } from '@/components/UpsellPremium';

// ─── Helpers de presentación ──────────────────────────────────────────────────

const TIPO_LABEL: Record<TipoRecordatorio, string> = {
  comida: 'Comida',
  hidratacion: 'Hidratación',
  diario: 'Diario',
  hito: 'Hito',
  control: 'Control médico',
  lista_compras: 'Lista de compras',
};

const TIPO_ICON: Record<TipoRecordatorio, keyof typeof Feather.glyphMap> = {
  comida: 'coffee',
  hidratacion: 'droplet',
  diario: 'book-open',
  hito: 'award',
  control: 'activity',
  lista_compras: 'shopping-cart',
};

const TIPOS_FREE: TipoRecordatorio[] = ['comida', 'control', 'lista_compras'];

const PLACEHOLDER_TITULO: Record<TipoRecordatorio, string> = {
  comida: 'Ej: Hora del almuerzo',
  hidratacion: 'Ej: Ofrécele agüita',
  diario: 'Ej: ¿Cómo le fue con la palta?',
  hito: 'Ej: Introducir el huevo',
  control: 'Ej: Control con el pediatra',
  lista_compras: 'Ej: Revisar la lista de compras',
};

const PLACEHOLDER_DESCRIPCION: Record<TipoRecordatorio, string> = {
  comida: 'Ej: Hoy toca tortilla de espinaca',
  hidratacion: 'Ej: Recuerda después de jugar en el parque',
  diario: 'Ej: Anotar la reacción en el diario de alimentos',
  hito: 'Ej: Empezar con yema cocida y observar 3 días',
  control: 'Ej: Dra. Soto · 3er piso, llevar carnet',
  lista_compras: 'Ej: Ir al super antes del finde',
};

function formatearHoraDiaria(horaDiaria?: string): string {
  if (!horaDiaria) return '';
  const [h, m] = horaDiaria.split(':');
  return `${h}:${m}`;
}

function formatearFechaHora(fechaHora?: string): string {
  if (!fechaHora) return '';
  const d = new Date(fechaHora);
  const dia = d.getDate();
  const mes = d.getMonth() + 1;
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes} · ${h}:${min}`;
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────

export default function AgendaScreen() {
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const perfilActivo = usePerfilStore((s) => s.perfilActivo);
  const esPremium = useSuscripcionStore((s) => s.esPremium);
  const params = useLocalSearchParams<{ tipo?: string; abrir?: string }>();
  const {
    recordatorios,
    cargando,
    error,
    errorEsPremium,
    cargarRecordatorios,
    toggleActivo,
    eliminarRecordatorio,
    limpiarError,
  } = useRecordatoriosStore();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoInicial, setTipoInicial] = useState<TipoRecordatorio>('comida');
  const [hitosProgramados, setHitosProgramados] = useState(false);

  // Si llegamos con ?abrir=1&tipo=control desde otra pantalla, abrimos el modal directo
  useEffect(() => {
    if (params.abrir === '1') {
      if (
        params.tipo &&
        ['comida', 'hidratacion', 'diario', 'control', 'lista_compras'].includes(params.tipo)
      ) {
        setTipoInicial(params.tipo as TipoRecordatorio);
      }
      setModalAbierto(true);
    }
  }, [params.abrir, params.tipo]);

  useEffect(() => {
    if (perfilActivo) {
      cargarRecordatorios(perfilActivo.id);
    }
  }, [perfilActivo, cargarRecordatorios]);

  // Auto-programar hitos para users premium (idempotente — no crea duplicados)
  useEffect(() => {
    if (!perfilActivo || !esPremium || hitosProgramados) return;
    programarHitosFuturos(perfilActivo.id, perfilActivo.fecha_nacimiento).finally(() => {
      setHitosProgramados(true);
      // Recargar para mostrar los nuevos hitos
      if (perfilActivo) cargarRecordatorios(perfilActivo.id);
    });
  }, [perfilActivo, esPremium, hitosProgramados, cargarRecordatorios]);

  // Hitos a mostrar visualmente (premium ve todos pendientes, free solo el actual)
  const hitosAMostrar = useMemo(() => {
    if (!perfilActivo) return [];
    if (esPremium) return proximosHitos(perfilActivo.fecha_nacimiento, 5);
    const actual = hitoActual(perfilActivo.fecha_nacimiento);
    return actual ? [actual] : [];
  }, [perfilActivo, esPremium]);

  const activos = useMemo(() => recordatorios.filter((r) => r.activo), [recordatorios]);

  if (!perfilActivo) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: c.fondoApp,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: c.grisTexto }}>Crea primero un perfil de hijo.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        >
          {/* ── ENCABEZADO EDITORIAL ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
            {/* Estilo OBJETO, no callback: css-interop lo descarta. Ver CLAUDE.md. */}
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={8}
              activeOpacity={0.5}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginBottom: 24,
              }}
            >
              <Feather name="arrow-left" size={18} color={c.negro} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: c.negro }}>Volver</Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              AGENDA
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
              Agenda de <Text style={{ color: c.verde }}>{perfilActivo.nombre}</Text>
            </Text>
            <Text style={{ fontSize: 14, color: c.grisTexto, lineHeight: 20, marginTop: 8 }}>
              Recordatorios, controles y próximos hitos.
            </Text>
          </View>

          {/* Banner de upsell si chocó con límite premium */}
          {errorEsPremium && (
            <UpsellPremium
              titulo="Esta función es Premium"
              beneficios={[
                'Recordatorios ilimitados (free: máx 3)',
                'Los próximos 5 hitos alimentarios, en vez de 1',
                'Activar la semana entera del plan de un toque',
                'Hidratación, diario y recurrencia personalizada',
              ]}
              onCerrar={limpiarError}
            />
          )}

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

          {/* ── PRÓXIMOS HITOS ── */}
          {hitosAMostrar.length > 0 && (
            <>
              <View style={{ paddingHorizontal: 24 }}>
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
                    }}
                  >
                    PRÓXIMOS HITOS
                  </Text>
                  {!esPremium && (
                    <View
                      style={{
                        backgroundColor: c.premiumFondo,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: '800',
                          color: c.naranja,
                          letterSpacing: 1,
                        }}
                      >
                        SOLO ACTUAL
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ gap: 12 }}>
                  {hitosAMostrar.map((h) => (
                    <View
                      key={h.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 14,
                        paddingVertical: 4,
                      }}
                    >
                      <Text style={{ fontSize: 28, lineHeight: 42 }}>{h.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: c.naranja,
                            letterSpacing: 1.2,
                            marginBottom: 3,
                          }}
                        >
                          {tiempoHastaHito(perfilActivo.fecha_nacimiento, h).toUpperCase()}
                        </Text>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: '700',
                            color: c.negro,
                            lineHeight: 20,
                          }}
                        >
                          {h.titulo}
                        </Text>
                        <Text
                          style={{ fontSize: 12, color: c.grisTexto, marginTop: 2, lineHeight: 16 }}
                        >
                          {h.descripcion}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {!esPremium && (
                  <TouchableOpacity
                    onPress={() => router.push('/premium')}
                    activeOpacity={0.6}
                    style={{
                      marginTop: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Feather name="star" size={13} color={c.naranja} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: c.naranja }}>
                      Ver el calendario completo con Premium
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View
                style={{
                  height: 1,
                  backgroundColor: c.cardBorde,
                  marginHorizontal: 24,
                  marginTop: 28,
                  marginBottom: 24,
                }}
              />
            </>
          )}

          {/* ── RECORDATORIOS ── */}
          <View style={{ paddingHorizontal: 24 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                marginBottom: 16,
              }}
            >
              MIS RECORDATORIOS {activos.length > 0 && `(${activos.length})`}
            </Text>

            {cargando ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <ActivityIndicator color={c.verde} />
              </View>
            ) : recordatorios.length === 0 ? (
              <View style={{ paddingVertical: 24 }}>
                <Text style={{ fontSize: 14, color: c.grisTexto, lineHeight: 20 }}>
                  Aún no tienes recordatorios. Toca el botón de abajo para crear el primero.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {recordatorios.map((r) => (
                  <RecordatorioCard
                    key={r.id}
                    recordatorio={r}
                    onToggle={() => toggleActivo(r.id)}
                    onEliminar={() => {
                      Alert.alert('Eliminar recordatorio', '¿Estás seguro?', [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: () => eliminarRecordatorio(r.id),
                        },
                      ]);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* ── BOTÓN FLOTANTE NUEVO ── */}
        <View
          style={{
            position: 'absolute',
            left: 24,
            right: 24,
            bottom: insets.bottom + 20,
          }}
        >
          <TouchableOpacity
            onPress={() => setModalAbierto(true)}
            activeOpacity={0.85}
            style={{
              backgroundColor: c.verde,
              paddingVertical: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: c.verde,
              shadowOpacity: 0.3,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <Feather name="plus" size={18} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>
              Nuevo recordatorio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error toast */}
        {error && !errorEsPremium && (
          <Pressable
            onPress={limpiarError}
            style={{
              position: 'absolute',
              top: insets.top + 60,
              left: 16,
              right: 16,
              backgroundColor: c.error,
              borderRadius: 12,
              padding: 14,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{error}</Text>
          </Pressable>
        )}
      </SafeAreaView>

      {/* Modal de creación */}
      <ModalCrearRecordatorio
        visible={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        perfilHijoId={perfilActivo.id}
        esPremium={esPremium}
        tipoInicial={tipoInicial}
      />
    </View>
  );
}

// ─── Card de recordatorio ─────────────────────────────────────────────────────

function RecordatorioCard({
  recordatorio,
  onToggle,
  onEliminar,
}: {
  recordatorio: Recordatorio;
  onToggle: () => void;
  onEliminar: () => void;
}) {
  const c = useColoresTema();
  const dim = !recordatorio.activo;

  const cuando = recordatorio.fecha_hora
    ? formatearFechaHora(recordatorio.fecha_hora)
    : recordatorio.hora_diaria
      ? `Cada día · ${formatearHoraDiaria(recordatorio.hora_diaria)}`
      : '';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 4,
        opacity: dim ? 0.5 : 1,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: c.verdeClaro,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name={TIPO_ICON[recordatorio.tipo]} size={18} color={c.verde} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: '700',
            color: c.grisTexto,
            letterSpacing: 1.2,
            marginBottom: 2,
          }}
        >
          {TIPO_LABEL[recordatorio.tipo].toUpperCase()} · {cuando.toUpperCase()}
        </Text>
        <Text style={{ fontSize: 15, fontWeight: '700', color: c.negro, lineHeight: 20 }}>
          {recordatorio.titulo}
        </Text>
        {recordatorio.descripcion && (
          <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 2, lineHeight: 16 }}>
            {recordatorio.descripcion}
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={onToggle} hitSlop={8} activeOpacity={0.5} style={{ padding: 6 }}>
        <Feather
          name={recordatorio.activo ? 'bell' : 'bell-off'}
          size={18}
          color={recordatorio.activo ? c.verde : c.grisTexto}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={onEliminar} hitSlop={8} activeOpacity={0.5} style={{ padding: 6 }}>
        <Feather name="trash-2" size={16} color={c.grisTexto} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Modal de creación ────────────────────────────────────────────────────────

type ModoRecurrencia = 'diario' | 'unaVez';

function ModalCrearRecordatorio({
  visible,
  onCerrar,
  perfilHijoId,
  esPremium,
  tipoInicial,
}: {
  visible: boolean;
  onCerrar: () => void;
  perfilHijoId: string;
  esPremium: boolean;
  tipoInicial: TipoRecordatorio;
}) {
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const { crearRecordatorio, cargando, errorEsPremium, error } = useRecordatoriosStore();

  // Helper: hora actual + N min, padded a 2 dígitos
  function horaActualMasMin(min: number) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + min);
    return {
      hora: String(d.getHours()).padStart(2, '0'),
      minuto: String(d.getMinutes()).padStart(2, '0'),
      date: d,
    };
  }

  const inicial = horaActualMasMin(1);

  const [tipo, setTipo] = useState<TipoRecordatorio>(tipoInicial);
  const [modo, setModo] = useState<ModoRecurrencia>(
    tipoInicial === 'control' ? 'unaVez' : 'diario'
  );
  const [modoNoti, setModoNoti] = useState<ModoNotificacion>('notificacion');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [hora, setHora] = useState(inicial.hora);
  const [minuto, setMinuto] = useState(inicial.minuto);

  // Para modo 'unaVez': calendario inline + inputs de hora
  const [fechaUnica, setFechaUnica] = useState<Date>(inicial.date);
  const [horaUnica, setHoraUnica] = useState(inicial.hora);
  const [minutoUnico, setMinutoUnico] = useState(inicial.minuto);
  const [mesVista, setMesVista] = useState({
    year: inicial.date.getFullYear(),
    month: inicial.date.getMonth(),
  });

  const tiposVisibles: TipoRecordatorio[] = esPremium
    ? ['comida', 'hidratacion', 'diario', 'control', 'lista_compras']
    : TIPOS_FREE;

  // Cuando el modal se abre, resetear a hora actual + 1 min y sincronizar tipo
  useEffect(() => {
    if (visible) {
      const ahora = horaActualMasMin(1);
      setTipo(tipoInicial);
      setModo(tipoInicial === 'control' || tipoInicial === 'hito' ? 'unaVez' : 'diario');
      setHora(ahora.hora);
      setMinuto(ahora.minuto);
      setHoraUnica(ahora.hora);
      setMinutoUnico(ahora.minuto);
      setFechaUnica(ahora.date);
      setMesVista({ year: ahora.date.getFullYear(), month: ahora.date.getMonth() });
    }
  }, [visible, tipoInicial]);

  function resetForm() {
    const ahora = horaActualMasMin(1);
    setTipo('comida');
    setModo('diario');
    setModoNoti('notificacion');
    setTitulo('');
    setDescripcion('');
    setHora(ahora.hora);
    setMinuto(ahora.minuto);
    setHoraUnica(ahora.hora);
    setMinutoUnico(ahora.minuto);
    setFechaUnica(ahora.date);
    setMesVista({ year: ahora.date.getFullYear(), month: ahora.date.getMonth() });
  }

  async function handleCrear() {
    if (!titulo.trim() || preview.esPasado) return;

    let input: RecordatorioInput;

    if (modo === 'unaVez') {
      const hu = parseInt(horaUnica, 10);
      const mu = parseInt(minutoUnico, 10);
      const fechaConHora = new Date(fechaUnica);
      fechaConHora.setHours(hu, mu, 0, 0);
      input = {
        perfil_hijo_id: perfilHijoId,
        tipo,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fecha_hora: fechaConHora.toISOString(),
        modo_notificacion: modoNoti,
      };
    } else {
      const h = parseInt(hora, 10);
      const m = parseInt(minuto, 10);
      input = {
        perfil_hijo_id: perfilHijoId,
        tipo,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        hora_diaria: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`,
        modo_notificacion: modoNoti,
      };
    }

    const creado = await crearRecordatorio(input);
    if (creado) {
      resetForm();
      onCerrar();
    }
  }

  // Calendario inline helpers
  const MESES_LARGOS = [
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

  // Preview en vivo: cuándo va a sonar el recordatorio + es pasado?
  const preview = useMemo(() => {
    function fmtHora(d: Date): string {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    function fmtFecha(d: Date): string {
      return `${d.getDate()} ${MESES_CORTO[d.getMonth()]}`;
    }

    if (modo === 'unaVez') {
      const hu = parseInt(horaUnica, 10);
      const mu = parseInt(minutoUnico, 10);
      if (isNaN(hu) || hu < 0 || hu > 23 || isNaN(mu) || mu < 0 || mu > 59) {
        return { texto: 'Ingresa una hora válida (0-23 : 0-59)', esPasado: true };
      }

      const fecha = new Date(fechaUnica);
      fecha.setHours(hu, mu, 0, 0);
      const diff = fecha.getTime() - Date.now();

      if (diff <= 0) {
        return { texto: 'Esta fecha y hora ya pasaron', esPasado: true };
      }

      const totalMin = Math.floor(diff / 60000);
      const dias = Math.floor(totalMin / (60 * 24));
      const horas = Math.floor((totalMin - dias * 60 * 24) / 60);

      if (dias === 0 && horas === 0) {
        const m = totalMin || 1;
        return { texto: `Sonará en ${m} minuto${m === 1 ? '' : 's'}`, esPasado: false };
      }
      if (dias === 0) {
        return { texto: `Sonará hoy a las ${fmtHora(fecha)}`, esPasado: false };
      }
      if (dias === 1) {
        return { texto: `Sonará mañana a las ${fmtHora(fecha)}`, esPasado: false };
      }
      return { texto: `Sonará el ${fmtFecha(fecha)} a las ${fmtHora(fecha)}`, esPasado: false };
    }

    // Modo diario
    const hu = parseInt(hora, 10);
    const mu = parseInt(minuto, 10);
    if (isNaN(hu) || hu < 0 || hu > 23 || isNaN(mu) || mu < 0 || mu > 59) {
      return { texto: 'Ingresa una hora válida (0-23 : 0-59)', esPasado: true };
    }

    const proxima = new Date();
    proxima.setHours(hu, mu, 0, 0);
    if (proxima.getTime() <= Date.now()) {
      proxima.setDate(proxima.getDate() + 1);
    }

    const diff = proxima.getTime() - Date.now();
    const totalMin = Math.floor(diff / 60000);
    const horas = Math.floor(totalMin / 60);

    if (horas === 0) {
      const m = totalMin || 1;
      return {
        texto: `Sonará en ${m} minuto${m === 1 ? '' : 's'} (y cada día a esta hora)`,
        esPasado: false,
      };
    }
    if (horas < 24) {
      const restoMin = totalMin % 60;
      const txtMin = restoMin > 0 ? ` ${restoMin}min` : '';
      return {
        texto: `Próxima alarma en ${horas}h${txtMin} (y cada día a las ${fmtHora(proxima)})`,
        esPasado: false,
      };
    }
    return { texto: `Sonará mañana a las ${fmtHora(proxima)} (y cada día)`, esPasado: false };
  }, [modo, fechaUnica, horaUnica, minutoUnico, hora, minuto, MESES_CORTO]);

  const hoyMidnight = useMemo(() => {
    const h = new Date();
    h.setHours(0, 0, 0, 0);
    return h;
  }, []);

  function irMesAnterior() {
    setMesVista(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  }
  function irMesSiguiente() {
    setMesVista(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
  }
  function seleccionarDia(dia: number) {
    const nueva = new Date(mesVista.year, mesVista.month, dia);
    nueva.setHours(parseInt(horaUnica, 10) || 0, parseInt(minutoUnico, 10) || 0, 0, 0);
    setFechaUnica(nueva);
  }

  // Helper para stepper de hora/minuto: ajusta valor con wrap-around
  function ajustar(valor: string, delta: number, max: number): string {
    let n = (parseInt(valor, 10) || 0) + delta;
    if (n > max) n = 0;
    if (n < 0) n = max;
    return String(n).padStart(2, '0');
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCerrar}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={24}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <View
          style={{
            backgroundColor: c.fondoApp,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 12,
            paddingBottom: insets.bottom + 20,
            maxHeight: '90%',
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: c.grisClaro,
              alignSelf: 'center',
              marginBottom: 20,
            }}
          />

          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: c.negro,
                letterSpacing: -0.4,
                marginBottom: 24,
              }}
            >
              Nuevo recordatorio
            </Text>

            {/* Tipo */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                marginBottom: 10,
              }}
            >
              TIPO
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
              {tiposVisibles.map((t) => {
                const activo = tipo === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTipo(t)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: activo ? c.negro : c.cardBorde,
                      backgroundColor: activo ? c.negro : c.card,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Feather
                      name={TIPO_ICON[t]}
                      size={13}
                      color={activo ? c.fondoApp : c.negro}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: activo ? c.fondoApp : c.negro,
                      }}
                    >
                      {TIPO_LABEL[t]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Título */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                marginBottom: 10,
              }}
            >
              TÍTULO
            </Text>
            <TextInput
              value={titulo}
              onChangeText={setTitulo}
              placeholder={PLACEHOLDER_TITULO[tipo]}
              placeholderTextColor={c.grisTexto}
              style={{
                fontSize: 15,
                color: c.negro,
                borderWidth: 1,
                borderColor: c.cardBorde,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 16,
                backgroundColor: c.card,
              }}
            />

            {/* Descripción */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                marginBottom: 10,
              }}
            >
              DESCRIPCIÓN (OPCIONAL)
            </Text>
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder={PLACEHOLDER_DESCRIPCION[tipo]}
              placeholderTextColor={c.grisTexto}
              multiline
              numberOfLines={2}
              style={{
                fontSize: 14,
                color: c.negro,
                borderWidth: 1,
                borderColor: c.cardBorde,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 16,
                backgroundColor: c.card,
                minHeight: 60,
                textAlignVertical: 'top',
              }}
            />

            {/* Toggle modo de recurrencia */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                marginBottom: 10,
              }}
            >
              ¿CUÁNDO?
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              {(['diario', 'unaVez'] as ModoRecurrencia[]).map((m, idx) => {
                const activo = modo === m;
                const label = m === 'diario' ? 'Cada día' : 'Una vez';
                const icon = m === 'diario' ? 'refresh-cw' : 'calendar';
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setModo(m)}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: activo ? c.negro : c.cardBorde,
                      backgroundColor: activo ? c.negro : c.card,
                      marginLeft: idx === 0 ? 0 : 8,
                    }}
                  >
                    <Feather
                      name={icon}
                      size={15}
                      color={activo ? c.fondoApp : c.negro}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: activo ? c.fondoApp : c.negro,
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Inputs según modo */}
            {modo === 'diario' ? (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: c.grisTexto,
                    letterSpacing: 2,
                    marginBottom: 10,
                  }}
                >
                  HORA (formato 24h)
                </Text>
                <StepperHoraMinuto
                  hora={hora}
                  setHora={setHora}
                  minuto={minuto}
                  setMinuto={setMinuto}
                  ajustar={ajustar}
                  c={c}
                />
                {/* Preview en vivo */}
                <View
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 10,
                    backgroundColor: preview.esPasado ? '#FEE2E2' : c.verdeClaro,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Feather
                    name={preview.esPasado ? 'alert-triangle' : 'clock'}
                    size={14}
                    color={preview.esPasado ? '#DC2626' : c.verde}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: preview.esPasado ? '#DC2626' : c.verde,
                      flex: 1,
                    }}
                  >
                    {preview.texto}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: c.grisTexto,
                    letterSpacing: 2,
                    marginBottom: 10,
                  }}
                >
                  ELEGÍ EL DÍA
                </Text>

                {/* Header del mes con navegación */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={irMesAnterior}
                    hitSlop={8}
                    activeOpacity={0.5}
                    style={{ padding: 8 }}
                  >
                    <Feather name="chevron-left" size={20} color={c.verde} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: c.negro }}>
                    {MESES_LARGOS[mesVista.month]} {mesVista.year}
                  </Text>
                  <TouchableOpacity
                    onPress={irMesSiguiente}
                    hitSlop={8}
                    activeOpacity={0.5}
                    style={{ padding: 8 }}
                  >
                    <Feather name="chevron-right" size={20} color={c.verde} />
                  </TouchableOpacity>
                </View>

                {/* Headers L M M J V S D — width fijo 14.28% por columna */}
                <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                  {DIAS_HEADER.map((d, i) => (
                    <View key={i} style={{ width: `${100 / 7}%`, alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: c.grisTexto }}>
                        {d}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Grid de días — width fijo por celda evita flex bug en Android */}
                {buildGrid(mesVista.year, mesVista.month).map((fila, fi) => (
                  <View key={fi} style={{ flexDirection: 'row', marginBottom: 4 }}>
                    {fila.map((dia, di) => {
                      if (dia === null) {
                        return <View key={di} style={{ width: `${100 / 7}%`, height: 36 }} />;
                      }
                      const fechaCelda = new Date(mesVista.year, mesVista.month, dia);
                      const esPasado = fechaCelda.getTime() < hoyMidnight.getTime();
                      const esHoy = fechaCelda.getTime() === hoyMidnight.getTime();
                      const esSeleccionado =
                        fechaUnica.getFullYear() === mesVista.year &&
                        fechaUnica.getMonth() === mesVista.month &&
                        fechaUnica.getDate() === dia;

                      return (
                        <TouchableOpacity
                          key={di}
                          disabled={esPasado}
                          onPress={() => seleccionarDia(dia)}
                          activeOpacity={0.6}
                          style={{
                            width: `${100 / 7}%`,
                            height: 36,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: esPasado ? 0.25 : 1,
                          }}
                        >
                          <View
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: esSeleccionado ? c.verde : 'transparent',
                              borderWidth: esHoy && !esSeleccionado ? 1.5 : 0,
                              borderColor: c.verde,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: esSeleccionado || esHoy ? '700' : '500',
                                color: esSeleccionado ? '#fff' : esHoy ? c.verde : c.negro,
                                fontVariant: ['tabular-nums'],
                              }}
                            >
                              {dia}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}

                {/* Hora */}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: c.grisTexto,
                    letterSpacing: 2,
                    marginTop: 18,
                    marginBottom: 10,
                  }}
                >
                  HORA (formato 24h)
                </Text>
                <StepperHoraMinuto
                  hora={horaUnica}
                  setHora={setHoraUnica}
                  minuto={minutoUnico}
                  setMinuto={setMinutoUnico}
                  ajustar={ajustar}
                  c={c}
                />

                {/* Preview en vivo */}
                <View
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 10,
                    backgroundColor: preview.esPasado ? '#FEE2E2' : c.verdeClaro,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Feather
                    name={preview.esPasado ? 'alert-triangle' : 'clock'}
                    size={14}
                    color={preview.esPasado ? '#DC2626' : c.verde}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: preview.esPasado ? '#DC2626' : c.verde,
                      flex: 1,
                    }}
                  >
                    {preview.texto}
                  </Text>
                </View>
              </View>
            )}

            {/* TIPO DE AVISO — Notificación vs Alarma */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                marginTop: 8,
                marginBottom: 10,
              }}
            >
              TIPO DE AVISO
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {(['notificacion', 'alarma'] as ModoNotificacion[]).map((m, idx) => {
                const activo = modoNoti === m;
                const label = m === 'notificacion' ? 'Notificación' : 'Alarma';
                const icon = m === 'notificacion' ? 'bell' : 'volume-2';
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setModoNoti(m)}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: activo ? c.negro : c.cardBorde,
                      backgroundColor: activo ? c.negro : c.card,
                      marginLeft: idx === 0 ? 0 : 8,
                    }}
                  >
                    <Feather
                      name={icon}
                      size={15}
                      color={activo ? c.fondoApp : c.negro}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: activo ? c.fondoApp : c.negro,
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text
              style={{
                fontSize: 11,
                color: c.grisTexto,
                marginBottom: 20,
                lineHeight: 16,
              }}
            >
              {modoNoti === 'alarma'
                ? '🔔 Suena fuerte aunque tengas el cel en silencio, vibra largo y la notificación queda fija. Se reprograma 6 veces seguidas para que no se te pase.'
                : 'Sonido corto y banner normal. Se silencia si tienes modo "No molestar" activado.'}
            </Text>

            {/* CTA */}
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={onCerrar}
                disabled={cargando}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: c.cardBorde,
                  backgroundColor: c.card,
                  alignItems: 'center',
                  marginRight: 10,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.negro }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCrear}
                disabled={cargando || !titulo.trim() || preview.esPasado}
                activeOpacity={0.85}
                style={{
                  flex: 2,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: !titulo.trim() || preview.esPasado ? c.grisClaro : c.verde,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cargando ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>
                    Crear recordatorio
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Error inline */}
            {error && (
              <View
                style={{
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: errorEsPremium ? c.premiumFondo : '#FEE',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: errorEsPremium ? c.naranja : c.error,
                    lineHeight: 18,
                  }}
                >
                  {error}
                </Text>
                {errorEsPremium && (
                  <TouchableOpacity
                    onPress={() => {
                      onCerrar();
                      setTimeout(() => router.push('/premium'), 200);
                    }}
                    activeOpacity={0.6}
                    style={{ marginTop: 8 }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: c.naranja }}>
                      Probar Premium →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Stepper Hora:Minuto ──────────────────────────────────────────────────────

function StepperHoraMinuto({
  hora,
  setHora,
  minuto,
  setMinuto,
  ajustar,
  c,
}: {
  hora: string;
  setHora: (v: string) => void;
  minuto: string;
  setMinuto: (v: string) => void;
  ajustar: (valor: string, delta: number, max: number) => string;
  c: ReturnType<typeof useColoresTema>;
}) {
  const inputStyle = {
    fontSize: 26,
    fontWeight: '700' as const,
    color: c.negro,
    borderWidth: 1,
    borderColor: c.cardBorde,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: c.card,
    textAlign: 'center' as const,
    width: 76,
    fontVariant: ['tabular-nums' as const],
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      {/* Hora */}
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => setHora(ajustar(hora, +1, 23))}
          activeOpacity={0.5}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Feather name="chevron-up" size={22} color={c.verde} />
        </TouchableOpacity>
        <TextInput
          value={hora}
          onChangeText={setHora}
          keyboardType="number-pad"
          maxLength={2}
          style={inputStyle}
          selectTextOnFocus
        />
        <TouchableOpacity
          onPress={() => setHora(ajustar(hora, -1, 23))}
          activeOpacity={0.5}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Feather name="chevron-down" size={22} color={c.verde} />
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontSize: 26,
          fontWeight: '700',
          color: c.negro,
          marginHorizontal: 12,
        }}
      >
        :
      </Text>

      {/* Minuto */}
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => setMinuto(ajustar(minuto, +1, 59))}
          activeOpacity={0.5}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Feather name="chevron-up" size={22} color={c.verde} />
        </TouchableOpacity>
        <TextInput
          value={minuto}
          onChangeText={setMinuto}
          keyboardType="number-pad"
          maxLength={2}
          style={inputStyle}
          selectTextOnFocus
        />
        <TouchableOpacity
          onPress={() => setMinuto(ajustar(minuto, -1, 59))}
          activeOpacity={0.5}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Feather name="chevron-down" size={22} color={c.verde} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
