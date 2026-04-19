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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useDiarioStore } from '@/store/useDiarioStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { buildGrid } from '@/constants/Semana';
import { DiarioAlimento, ReaccionAlimento } from '@/types';

// ─── Config de reacciones ─────────────────────────────────────────────────────

const REACCION_CONFIG: Record<
  ReaccionAlimento,
  { emoji: string; label: string; color: string; bg: string }
> = {
  ninguna: { emoji: '✅', label: 'Sin reacción', color: '#15803D', bg: '#F0FDF4' },
  leve: { emoji: '⚠️', label: 'Reacción leve', color: '#92400E', bg: '#FFFBEB' },
  severa: { emoji: '🚨', label: 'Reacción severa', color: '#991B1B', bg: '#FEF2F2' },
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
    <View style={{ backgroundColor: c.card, borderRadius: 14, padding: 12 }}>
      {/* Nav mes */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <TouchableOpacity onPress={irAnterior} style={{ padding: 4 }}>
          <Text style={{ fontSize: 16, color: c.verde }}>◀</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 14, fontWeight: '700', color: c.negro }}>
          {MESES[mes.month]} {mes.year}
        </Text>
        <TouchableOpacity onPress={irSiguiente} style={{ padding: 4 }}>
          <Text style={{ fontSize: 16, color: c.verde }}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Headers */}
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        {DIAS_HDR.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.grisTexto }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      {grid.map((fila, fi) => (
        <View key={fi} style={{ flexDirection: 'row', marginBottom: 2 }}>
          {fila.map((dia, di) => {
            if (!dia) return <View key={di} style={{ flex: 1, height: 34 }} />;
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
                style={{ flex: 1, height: 34, alignItems: 'center', justifyContent: 'center' }}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
        >
          <Text style={{ fontSize: 15, color: c.verde, fontWeight: '600' }}>← Volver</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 8, gap: 12 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: 20, fontWeight: '800', color: c.negro }}>
              Diario de alimentos
            </Text>
            {perfil && (
              <Text style={{ fontSize: 13, color: c.grisTexto, marginTop: 2 }} numberOfLines={1}>
                {perfil.avatar_emoji} {perfil.nombre}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={abrirAgregar}
            style={{
              backgroundColor: c.verde,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
            accessibilityLabel="Agregar alimento"
          >
            <Text style={{ color: c.blanco, fontWeight: '700', fontSize: 14 }}>+ Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista */}
      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={c.verde} />
        </View>
      ) : entradas.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📔</Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: c.negro,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Diario vacío
          </Text>
          <Text style={{ fontSize: 14, color: c.grisTexto, textAlign: 'center', lineHeight: 20 }}>
            Registrá cada alimento nuevo que prueba {perfil?.nombre ?? 'tu bebé'} y si tuvo alguna
            reacción.
          </Text>
          <TouchableOpacity
            onPress={abrirAgregar}
            style={{
              marginTop: 24,
              backgroundColor: c.verde,
              borderRadius: 16,
              paddingHorizontal: 24,
              paddingVertical: 13,
            }}
          >
            <Text style={{ color: c.blanco, fontWeight: '700', fontSize: 15 }}>
              + Agregar primer alimento
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
          {fechasOrdenadas.map((fecha) => (
            <View key={fecha} style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: c.grisTexto,
                  letterSpacing: 0.6,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                {formatearFecha(fecha)}
              </Text>

              <View style={{ backgroundColor: c.card, borderRadius: 16, overflow: 'hidden' }}>
                {gruposPorFecha[fecha].map((entrada, idx) => {
                  const config = REACCION_CONFIG[entrada.reaccion];
                  return (
                    <View
                      key={entrada.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderTopWidth: idx > 0 ? 1 : 0,
                        borderTopColor: c.grisClaro,
                      }}
                    >
                      {/* Badge reacción */}
                      <View
                        style={{
                          backgroundColor: config.bg,
                          borderRadius: 20,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          marginRight: 12,
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>{config.emoji}</Text>
                      </View>

                      {/* Contenido */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: c.negro }}>
                          {entrada.alimento}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: entrada.notas ? c.grisTexto : config.color,
                            marginTop: 1,
                          }}
                          numberOfLines={1}
                        >
                          {entrada.notas || config.label}
                        </Text>
                      </View>

                      {/* Botones editar y borrar */}
                      <TouchableOpacity
                        onPress={() => abrirEditar(entrada)}
                        style={{ padding: 8 }}
                        accessibilityLabel={`Editar ${entrada.alimento}`}
                      >
                        <Text style={{ fontSize: 16 }}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleEliminar(entrada)}
                        style={{ padding: 8 }}
                        accessibilityLabel={`Eliminar ${entrada.alimento}`}
                      >
                        <Text style={{ fontSize: 16 }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {error && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
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
        <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
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
                <Text style={{ fontSize: 20, fontWeight: '800', color: c.negro }}>
                  {editando ? 'Editar alimento' : 'Nuevo alimento'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{ fontSize: 16, color: c.grisTexto }}>Cancelar</Text>
                </TouchableOpacity>
              </View>

              {/* Alimento */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: c.negro, marginBottom: 6 }}>
                Alimento *
              </Text>
              <TextInput
                value={formAlimento}
                onChangeText={setFormAlimento}
                placeholder="ej: Zanahoria, Manzana, Pollo..."
                placeholderTextColor={c.grisTexto}
                style={{
                  backgroundColor: c.card,
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
              <Text style={{ fontSize: 13, fontWeight: '600', color: c.negro, marginBottom: 8 }}>
                Fecha de introducción
              </Text>
              <MiniCalendario fecha={formFecha} onChange={setFormFecha} />
              <View style={{ marginBottom: 20 }} />

              {/* Reacción */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: c.negro, marginBottom: 10 }}>
                ¿Tuvo alguna reacción?
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                {(
                  Object.entries(REACCION_CONFIG) as [
                    ReaccionAlimento,
                    (typeof REACCION_CONFIG)[ReaccionAlimento],
                  ][]
                ).map(([key, config]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setFormReaccion(key)}
                    style={{
                      flex: 1,
                      backgroundColor: formReaccion === key ? config.bg : c.card,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: formReaccion === key ? config.color : 'transparent',
                    }}
                    accessibilityLabel={config.label}
                  >
                    <Text style={{ fontSize: 22 }}>{config.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: config.color,
                        marginTop: 4,
                        textAlign: 'center',
                      }}
                    >
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Notas */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: c.negro, marginBottom: 6 }}>
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
                style={{
                  backgroundColor: guardando ? c.verde + '99' : c.verde,
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
                accessibilityLabel="Guardar"
              >
                {guardando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: c.blanco, fontWeight: '700', fontSize: 16 }}>
                    {editando ? 'Guardar cambios' : 'Agregar al diario'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
