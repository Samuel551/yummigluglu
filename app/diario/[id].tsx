import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDiarioStore } from '@/store/useDiarioStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { buildGrid } from '@/constants/Semana';
import { DiarioAlimento, ReaccionAlimento } from '@/types';

type FeatherIcon = keyof typeof Feather.glyphMap;

// ─── Config de reacciones ─────────────────────────────────────────────────────

const REACCION_CONFIG: Record<
  ReaccionAlimento,
  { icon: FeatherIcon; label: string; color: string; bg: string }
> = {
  ninguna: { icon: 'check-circle', label: 'Sin reacción', color: '#15803D', bg: '#F0FDF4' },
  leve: { icon: 'alert-triangle', label: 'Reacción leve', color: '#92400E', bg: '#FFFBEB' },
  severa: { icon: 'alert-octagon', label: 'Reacción severa', color: '#991B1B', bg: '#FEF2F2' },
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
const DIAS_HDR = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const CELDA_DIA = `${100 / 7}%`;

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── Mini calendario inline ───────────────────────────────────────────────────

function MiniCalendario({ fecha, onChange }: { fecha: string; onChange: (f: string) => void }) {
  const c = useColoresTema();
  const [mes, setMes] = useState(() => {
    const d = new Date(fecha + 'T12:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const grid = buildGrid(mes.year, mes.month);
  const hoy = new Date();

  const irAnterior = () =>
    setMes(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  const irSiguiente = () =>
    setMes(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );

  return (
    <View
      style={{
        backgroundColor: c.card,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: c.cardBorde,
      }}
    >
      {/* Nav mes */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <TouchableOpacity onPress={irAnterior} hitSlop={8} style={{ padding: 4 }}>
          <Feather name="chevron-left" size={20} color={c.verde} />
        </TouchableOpacity>
        <Text style={{ fontSize: 14, fontWeight: '700', color: c.negro }}>
          {MESES[mes.month]} {mes.year}
        </Text>
        <TouchableOpacity onPress={irSiguiente} hitSlop={8} style={{ padding: 4 }}>
          <Feather name="chevron-right" size={20} color={c.verde} />
        </TouchableOpacity>
      </View>

      {/* Headers */}
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        {DIAS_HDR.map((d, i) => (
          <View key={i} style={{ width: CELDA_DIA, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.grisTexto }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      {grid.map((fila, fi) => (
        <View key={fi} style={{ flexDirection: 'row', marginBottom: 2 }}>
          {fila.map((dia, di) => {
            if (!dia) return <View key={di} style={{ width: CELDA_DIA, height: 34 }} />;
            const iso = toISO(mes.year, mes.month, dia);
            const seleccionado = iso === fecha;
            const esHoy =
              dia === hoy.getDate() &&
              mes.month === hoy.getMonth() &&
              mes.year === hoy.getFullYear();
            return (
              <TouchableOpacity
                key={di}
                onPress={() => onChange(iso)}
                style={{
                  width: CELDA_DIA,
                  height: 34,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                accessibilityLabel={`Seleccionar ${dia} de ${MESES[mes.month]}`}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: seleccionado ? c.verde : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: esHoy && !seleccionado ? 1.5 : 0,
                    borderColor: c.verde,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: seleccionado || esHoy ? '700' : '400',
                      color: seleccionado ? c.blanco : esHoy ? c.verde : c.negro,
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
    </View>
  );
}

// ─── Helpers de display ───────────────────────────────────────────────────────

function agruparPorFecha(entradas: DiarioAlimento[]): Record<string, DiarioAlimento[]> {
  const grupos: Record<string, DiarioAlimento[]> = {};
  for (const e of entradas) {
    if (!grupos[e.fecha_introduccion]) grupos[e.fecha_introduccion] = [];
    grupos[e.fecha_introduccion].push(e);
  }
  return grupos;
}

function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (fecha.toDateString() === hoy.toDateString()) return 'Hoy';
  if (fecha.toDateString() === ayer.toDateString()) return 'Ayer';
  const meses = [
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
  return `${d} ${meses[m - 1]}`;
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────

export default function DiarioScreen() {
  const { id: perfilId } = useLocalSearchParams<{ id: string }>();
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const { perfiles } = usePerfilStore();
  const {
    entradas,
    cargando,
    error,
    cargarDiario,
    agregarAlimento,
    editarAlimento,
    eliminarAlimento,
    limpiarDiario,
  } = useDiarioStore();

  const perfil = perfiles.find((p) => p.id === perfilId);

  // ── Estado del modal (add y edit comparten el mismo) ──
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<DiarioAlimento | null>(null);
  const [formAlimento, setFormAlimento] = useState('');
  const [formFecha, setFormFecha] = useState('');
  const [formReaccion, setFormReaccion] = useState<ReaccionAlimento>('ninguna');
  const [formNotas, setFormNotas] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!perfilId) return;
    limpiarDiario();
    cargarDiario(perfilId);
  }, [perfilId]);

  const abrirAgregar = () => {
    setEditando(null);
    setFormAlimento('');
    setFormFecha(new Date().toISOString().split('T')[0]);
    setFormReaccion('ninguna');
    setFormNotas('');
    setModalVisible(true);
  };

  const abrirEditar = (entrada: DiarioAlimento) => {
    setEditando(entrada);
    setFormAlimento(entrada.alimento);
    setFormFecha(entrada.fecha_introduccion);
    setFormReaccion(entrada.reaccion);
    setFormNotas(entrada.notas ?? '');
    setModalVisible(true);
  };

  const handleGuardar = async () => {
    if (!formAlimento.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre del alimento.');
      return;
    }
    setGuardando(true);
    if (editando) {
      await editarAlimento(editando.id, formAlimento, formFecha, formReaccion, formNotas);
    } else {
      await agregarAlimento(perfilId, formAlimento, formFecha, formReaccion, formNotas);
    }
    setGuardando(false);
    if (!useDiarioStore.getState().error) setModalVisible(false);
  };

  const handleEliminar = (entrada: DiarioAlimento) => {
    Alert.alert('Eliminar registro', `¿Eliminas "${entrada.alimento}" del diario?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminarAlimento(entrada.id) },
    ]);
  };

  const gruposPorFecha = agruparPorFecha(entradas);
  const fechasOrdenadas = Object.keys(gruposPorFecha).sort((a, b) => b.localeCompare(a));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
      >
        {/* ── BOTÓN VOLVER ── */}
        {/* TouchableOpacity con estilo OBJETO, no Pressable con `style` como función:
            css-interop descarta el bloque entero sin avisar. Ver CLAUDE.md. */}
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          activeOpacity={0.5}
          style={{
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

        {/* ── HEADER EDITORIAL ── */}
        <View style={{ paddingTop: 24 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: c.grisTexto,
              letterSpacing: 2,
              marginBottom: 10,
            }}
          >
            DIARIO DE ALIMENTOS
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
            {perfil ? 'Para ' : 'Diario'}
            {perfil ? <Text style={{ color: c.verde }}>{perfil.nombre}</Text> : null}
            {perfil ? ` ${perfil.avatar_emoji}` : ''}
          </Text>

          {/* CTA Agregar */}
          <TouchableOpacity
            onPress={abrirAgregar}
            activeOpacity={0.85}
            style={{
              marginTop: 18,
              alignSelf: 'flex-start',
              backgroundColor: c.verde,
              borderRadius: 999,
              paddingHorizontal: 18,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              shadowColor: c.verde,
              shadowOpacity: 0.18,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            }}
            accessibilityLabel="Agregar alimento"
          >
            <Feather name="plus" size={17} color={c.blanco} />
            <Text style={{ color: c.blanco, fontWeight: '700', fontSize: 14, letterSpacing: 0.2 }}>
              Agregar alimento
            </Text>
          </TouchableOpacity>
        </View>

        {/* Separador */}
        <View
          style={{
            height: 1,
            backgroundColor: c.cardBorde,
            marginTop: 28,
            marginBottom: 24,
          }}
        />

        {/* ── CONTENIDO ── */}
        {cargando ? (
          <View style={{ paddingVertical: 80, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={c.verde} />
          </View>
        ) : entradas.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48, gap: 14 }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: c.grisClaro,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="book-open" size={26} color={c.grisTexto} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.negro }}>Diario vacío</Text>
            <Text
              style={{
                fontSize: 13,
                color: c.grisTexto,
                textAlign: 'center',
                lineHeight: 20,
                maxWidth: 280,
              }}
            >
              Registra cada alimento nuevo que prueba {perfil?.nombre ?? 'tu bebé'} y si tuvo alguna
              reacción.
            </Text>
          </View>
        ) : (
          fechasOrdenadas.map((fecha) => (
            <View key={fecha} style={{ marginBottom: 28 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: c.grisTexto,
                  letterSpacing: 2,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                }}
              >
                {formatearFecha(fecha)}
              </Text>

              {gruposPorFecha[fecha].map((entrada, idx, arr) => {
                const config = REACCION_CONFIG[entrada.reaccion];
                return (
                  <View
                    key={entrada.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                      paddingVertical: 14,
                      borderBottomWidth: idx === arr.length - 1 ? 0 : 1,
                      borderBottomColor: c.cardBorde,
                    }}
                  >
                    {/* Icono reacción */}
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: config.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Feather name={config.icon} size={18} color={config.color} />
                    </View>

                    {/* Contenido */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '700',
                          color: c.negro,
                          letterSpacing: -0.2,
                        }}
                      >
                        {entrada.alimento}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: entrada.notas ? c.grisTexto : config.color,
                          marginTop: 2,
                        }}
                        numberOfLines={1}
                      >
                        {entrada.notas || config.label}
                      </Text>
                    </View>

                    {/* Acciones */}
                    <TouchableOpacity
                      onPress={() => abrirEditar(entrada)}
                      hitSlop={6}
                      style={{ padding: 6 }}
                      accessibilityLabel={`Editar ${entrada.alimento}`}
                    >
                      <Feather name="edit-2" size={17} color={c.grisTexto} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleEliminar(entrada)}
                      hitSlop={6}
                      style={{ padding: 6 }}
                      accessibilityLabel={`Eliminar ${entrada.alimento}`}
                    >
                      <Feather name="trash-2" size={17} color={c.grisTexto} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      {error && (
        <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
          <Text style={{ color: c.error, fontSize: 12, textAlign: 'center' }}>{error}</Text>
        </View>
      )}

      {/* Modal — Agregar / Editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
          {/* `padding` en ambas plataformas: con `height` en Android el contenido se
              recortaba. Ver CLAUDE.md § "Teclado + edgeToEdgeEnabled". */}
          <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: insets.top + 16,
                paddingBottom: insets.bottom + 32,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header modal */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{ fontSize: 22, fontWeight: '800', color: c.negro, letterSpacing: -0.4 }}
                >
                  {editando ? 'Editar alimento' : 'Nuevo alimento'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={8}>
                  <Text style={{ fontSize: 15, color: c.grisTexto, fontWeight: '600' }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Alimento */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.negro, marginBottom: 8 }}>
                Alimento *
              </Text>
              <TextInput
                value={formAlimento}
                onChangeText={setFormAlimento}
                placeholder="ej: Zanahoria, Manzana, Pollo..."
                placeholderTextColor={c.grisTexto}
                style={{
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.cardBorde,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  fontSize: 16,
                  color: c.negro,
                  marginBottom: 20,
                }}
                autoFocus={!editando}
                autoCapitalize="sentences"
              />

              {/* Calendario para fecha */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.negro, marginBottom: 8 }}>
                Fecha de introducción
              </Text>
              <MiniCalendario fecha={formFecha} onChange={setFormFecha} />
              <View style={{ marginBottom: 20 }} />

              {/* Reacción */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.negro, marginBottom: 10 }}>
                ¿Tuvo alguna reacción?
              </Text>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}
              >
                {(
                  Object.entries(REACCION_CONFIG) as [
                    ReaccionAlimento,
                    (typeof REACCION_CONFIG)[ReaccionAlimento],
                  ][]
                ).map(([key, config]) => {
                  const activo = formReaccion === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setFormReaccion(key)}
                      activeOpacity={0.8}
                      style={{
                        width: '31.5%',
                        backgroundColor: activo ? config.bg : c.card,
                        borderRadius: 14,
                        paddingVertical: 14,
                        alignItems: 'center',
                        gap: 6,
                        borderWidth: 1.5,
                        borderColor: activo ? config.color : c.cardBorde,
                      }}
                      accessibilityLabel={config.label}
                    >
                      <Feather
                        name={config.icon}
                        size={20}
                        color={activo ? config.color : c.grisTexto}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color: activo ? config.color : c.grisTexto,
                          textAlign: 'center',
                        }}
                      >
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Notas */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.negro, marginBottom: 8 }}>
                Notas (opcional)
              </Text>
              <TextInput
                value={formNotas}
                onChangeText={setFormNotas}
                placeholder="ej: Le gustó mucho, tuvo un poco de sarpullido..."
                placeholderTextColor={c.grisTexto}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.cardBorde,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  fontSize: 15,
                  color: c.negro,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  marginBottom: 28,
                }}
              />

              {/* Guardar */}
              <TouchableOpacity
                onPress={handleGuardar}
                disabled={guardando}
                activeOpacity={0.85}
                style={{
                  backgroundColor: guardando ? c.grisClaro : c.verde,
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 10,
                }}
                accessibilityLabel="Guardar"
              >
                {guardando ? (
                  <ActivityIndicator color={c.grisTexto} size="small" />
                ) : (
                  <>
                    <Feather name={editando ? 'check' : 'plus'} size={18} color={c.blanco} />
                    <Text
                      style={{
                        color: c.blanco,
                        fontWeight: '800',
                        fontSize: 15,
                        letterSpacing: 0.3,
                      }}
                    >
                      {editando ? 'Guardar cambios' : 'Agregar al diario'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
