import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePerfilStore } from '@/store/usePerfilStore';
import { ALERGENOS } from '@/constants/Alergias';
import { useColoresTema } from '@/hooks/useColoresTema';
import { calcularEtapaPorEdad } from '@/constants/Etapas';

const ACCIONES_RAPIDAS = [
  {
    tipo: 'control' as const,
    icon: 'activity' as const,
    titulo: 'Programar control médico',
    descripcion: 'Pediatra, vacunas, controles de rutina',
  },
  {
    tipo: 'comida' as const,
    icon: 'clock' as const,
    titulo: 'Programar recordatorio de comida',
    descripcion: 'Una alarma diaria a la hora del almuerzo, cena, etc',
  },
];

const AVATARES = [
  '🍼',
  '👶',
  '🌱',
  '🌟',
  '🦁',
  '🐻',
  '🐰',
  '🦊',
  '🐧',
  '🦋',
  '🌸',
  '⭐',
  '🐨',
  '🦄',
  '🐸',
  '🐼',
  '🦉',
  '🐬',
  '🌈',
  '🍓',
  '🎈',
  '🚀',
  '🌙',
  '🐥',
];

const ETAPA_LABEL: Record<string, string> = {
  inicio: 'Primeros alimentos · 6 a 11 meses',
  transicion: 'Texturas variadas · 12 a 23 meses',
  preescolar: 'Platos completos · 2 años o más',
};

export default function EditarPerfilScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const { perfiles, actualizarPerfil, eliminarPerfil, cargando } = usePerfilStore();
  const perfil = perfiles.find((p) => p.id === id);

  const [nombre, setNombre] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('👶');
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [alergias, setAlergias] = useState<string[]>([]);

  useEffect(() => {
    if (!perfil) return;
    setNombre(perfil.nombre);
    setAvatarEmoji(perfil.avatar_emoji);
    setAlergias(perfil.alergias);
    const fecha = new Date(perfil.fecha_nacimiento);
    setDia(String(fecha.getUTCDate()));
    setMes(String(fecha.getUTCMonth() + 1));
    setAnio(String(fecha.getUTCFullYear()));
  }, [perfil]);

  if (!perfil) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: c.fondoApp,
          alignItems: 'center',
          justifyContent: 'center',
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
          <Feather name="alert-triangle" size={26} color={c.grisTexto} />
        </View>
        <Text style={{ fontSize: 16, color: c.negro, fontWeight: '700', textAlign: 'center' }}>
          Perfil no encontrado
        </Text>
      </SafeAreaView>
    );
  }

  const toggleAlergia = (alergiaId: string) => {
    setAlergias((prev) =>
      prev.includes(alergiaId) ? prev.filter((a) => a !== alergiaId) : [...prev, alergiaId]
    );
  };

  const calcularEtapa = () => {
    if (!dia || !mes || !anio || anio.length < 4) return null;
    const fecha = new Date(`${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`);
    const hoy = new Date();
    const meses =
      (hoy.getFullYear() - fecha.getFullYear()) * 12 + (hoy.getMonth() - fecha.getMonth());
    if (meses < 4 || meses > 72) return null;
    return calcularEtapaPorEdad(meses);
  };

  const etapaCalculada = calcularEtapa();

  const guardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Falta el nombre', 'Ingresa el nombre de tu hijo/a.');
      return;
    }
    if (!etapaCalculada) {
      Alert.alert('Fecha inválida', 'Verifica la fecha de nacimiento (entre 4 meses y 6 años).');
      return;
    }
    const fechaISO = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    await actualizarPerfil(id, {
      nombre: nombre.trim(),
      avatar_emoji: avatarEmoji,
      fecha_nacimiento: fechaISO,
      etapa: etapaCalculada,
      alergias,
    });
    router.back();
  };

  const confirmarEliminar = () => {
    Alert.alert(`Eliminar a ${perfil.nombre}`, 'Esta acción no se puede deshacer. ¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await eliminarPerfil(id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          {/* ── BOTÓN VOLVER ── */}
          {/* TouchableOpacity con estilo OBJETO, no Pressable con `style` como función:
              css-interop descarta el bloque entero sin avisar. Ver CLAUDE.md. */}
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
              }}
            >
              EDITAR PERFIL
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: c.verdeClaro,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 32, lineHeight: 48 }}>{avatarEmoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '800',
                    color: c.negro,
                    letterSpacing: -0.5,
                    lineHeight: 34,
                  }}
                  numberOfLines={1}
                >
                  {nombre || perfil.nombre}
                </Text>
                {etapaCalculada && (
                  <Text style={{ fontSize: 13, color: c.grisTexto, marginTop: 4, lineHeight: 18 }}>
                    {ETAPA_LABEL[etapaCalculada]}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <Separator c={c} />

          {/* ── NOMBRE ── */}
          <Eyebrow label="NOMBRE" c={c} />
          <View style={{ paddingHorizontal: 24 }}>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
              // Mismo tope que el onboarding: sin esto un nombre largo rompe el header
              // del NutriBot. Si cambia uno, cambiar el otro.
              maxLength={30}
              style={{
                fontSize: 16,
                color: c.negro,
                fontWeight: '500',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: c.cardBorde,
              }}
              placeholder="Nombre del bebé"
              placeholderTextColor={c.grisTexto}
            />
          </View>

          {/* ── AVATAR ── */}
          <Eyebrow label="AVATAR" c={c} />
          <View style={{ paddingHorizontal: 24 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {AVATARES.map((emoji) => {
                const activo = avatarEmoji === emoji;
                return (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setAvatarEmoji(emoji)}
                    activeOpacity={0.7}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: activo ? c.verdeClaro : c.grisClaro,
                      borderWidth: activo ? 2 : 0,
                      borderColor: c.verde,
                    }}
                    accessibilityLabel={`Avatar ${emoji}`}
                  >
                    <Text style={{ fontSize: 22 }}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── FECHA DE NACIMIENTO ── */}
          <Eyebrow label="FECHA DE NACIMIENTO" c={c} />
          <View
            style={{
              paddingHorizontal: 24,
              flexDirection: 'row',
              gap: 14,
            }}
          >
            {[
              { label: 'DÍA', value: dia, setter: setDia, placeholder: 'DD', maxLength: 2 },
              { label: 'MES', value: mes, setter: setMes, placeholder: 'MM', maxLength: 2 },
              { label: 'AÑO', value: anio, setter: setAnio, placeholder: 'AAAA', maxLength: 4 },
            ].map(({ label, value, setter, placeholder, maxLength }) => (
              <View key={label} style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: c.grisTexto,
                    fontWeight: '700',
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  {label}
                </Text>
                <TextInput
                  value={value}
                  onChangeText={setter}
                  keyboardType="numeric"
                  maxLength={maxLength}
                  style={{
                    fontSize: 17,
                    color: c.negro,
                    fontWeight: '600',
                    fontVariant: ['tabular-nums'],
                    borderBottomWidth: 1,
                    borderBottomColor: c.cardBorde,
                    paddingVertical: 8,
                  }}
                  placeholder={placeholder}
                  placeholderTextColor={c.grisTexto}
                />
              </View>
            ))}
          </View>

          {/* ── ALERGIAS ── */}
          <Eyebrow label="ALERGIAS" c={c} />
          <View style={{ paddingHorizontal: 24 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ALERGENOS.map((a) => {
                const activo = alergias.includes(a.id);
                return (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => toggleAlergia(a.id)}
                    activeOpacity={0.75}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                      borderRadius: 999,
                      backgroundColor: activo ? '#FEE2E2' : c.card,
                      borderWidth: 1,
                      borderColor: activo ? '#FCA5A5' : c.cardBorde,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{a.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: activo ? '700' : '500',
                        color: activo ? '#DC2626' : c.negro,
                        letterSpacing: -0.1,
                      }}
                    >
                      {a.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── AGENDA Y RECORDATORIOS ── */}
          <Eyebrow label="AGENDA Y RECORDATORIOS" c={c} />
          <View style={{ paddingHorizontal: 24 }}>
            {ACCIONES_RAPIDAS.map((accion, idx) => (
              <TouchableOpacity
                key={accion.tipo}
                onPress={() =>
                  router.push({
                    pathname: '/agenda',
                    params: { abrir: '1', tipo: accion.tipo },
                  })
                }
                activeOpacity={0.6}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 13,
                  borderTopWidth: idx > 0 ? 1 : 0,
                  borderTopColor: c.cardBorde,
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
                    marginRight: 14,
                  }}
                >
                  <Feather name={accion.icon} size={18} color={c.verde} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: c.negro,
                      letterSpacing: -0.1,
                    }}
                  >
                    {accion.titulo}
                  </Text>
                  <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 2, lineHeight: 17 }}>
                    {accion.descripcion}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={c.grisTexto} />
              </TouchableOpacity>
            ))}
          </View>

          {/* ── ACCIONES FINALES ── */}
          <View style={{ paddingHorizontal: 24, marginTop: 32, gap: 12 }}>
            {/* Guardar */}
            <TouchableOpacity
              onPress={guardar}
              disabled={cargando}
              activeOpacity={0.85}
              style={{
                backgroundColor: c.verde,
                borderRadius: 999,
                paddingVertical: 15,
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
              accessibilityLabel="Guardar cambios"
            >
              {cargando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="check" size={15} color="#fff" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '800',
                      color: '#fff',
                      letterSpacing: 0.2,
                    }}
                  >
                    Guardar cambios
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Eliminar */}
            <TouchableOpacity
              onPress={confirmarEliminar}
              disabled={cargando}
              activeOpacity={0.7}
              style={{
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                borderWidth: 1.5,
                borderColor: '#FCA5A5',
                backgroundColor: c.card,
              }}
              accessibilityLabel={`Eliminar perfil de ${perfil.nombre}`}
            >
              <Feather name="trash-2" size={15} color="#DC2626" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: '#DC2626',
                  letterSpacing: 0.2,
                }}
              >
                Eliminar perfil de {perfil.nombre}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Eyebrow({ label, c }: { label: string; c: ReturnType<typeof useColoresTema> }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        color: c.grisTexto,
        letterSpacing: 2,
        textTransform: 'uppercase',
        paddingHorizontal: 24,
        marginTop: 24,
        marginBottom: 12,
      }}
    >
      {label}
    </Text>
  );
}

function Separator({ c }: { c: ReturnType<typeof useColoresTema> }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: c.cardBorde,
        marginHorizontal: 24,
        marginTop: 24,
      }}
    />
  );
}
