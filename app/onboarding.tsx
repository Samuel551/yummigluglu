import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { ALERGENOS } from '@/constants/Alergias';
import { calcularEtapaPorEdad, getEtapaInfo, formatearEdad } from '@/constants/Etapas';

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
const PASOS_TOTAL = 3;

export default function OnboardingScreen() {
  const [paso, setPaso] = useState(1);

  // Paso 1 — nombre y avatar
  const [nombre, setNombre] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🍼');

  // Paso 2 — fecha de nacimiento
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');

  // Paso 3 — alergias
  const [alergias, setAlergias] = useState<string[]>([]);

  // Refs para auto-foco entre campos de fecha
  const refMes = useRef<RNTextInput>(null);
  const refAnio = useRef<RNTextInput>(null);

  const insets = useSafeAreaInsets();
  const { crearPerfil, cargando, error } = usePerfilStore();
  const c = useColoresTema();

  // Calcula la edad en meses según la fecha ingresada (null si la fecha es inválida).
  // Rango válido: desde el nacimiento (0m) hasta 6 años (72m).
  const calcularMeses = (): number | null => {
    if (!dia || !mes || anio.length < 4) return null;
    const fechaNac = new Date(Number(anio), Number(mes) - 1, Number(dia));
    if (isNaN(fechaNac.getTime())) return null;
    // Rechaza fechas imposibles (ej. 31/02, que JS "rota" a marzo)
    if (fechaNac.getDate() !== Number(dia) || fechaNac.getMonth() !== Number(mes) - 1) return null;
    const hoy = new Date();
    if (fechaNac > hoy) return null; // fecha futura
    const meses = Math.floor((hoy.getTime() - fechaNac.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    if (meses > 72) return null; // tope 6 años por ahora (la extensión a 10a es futura)
    return meses;
  };

  const mesesEdad = calcularMeses();
  const etapaCalculada = mesesEdad !== null ? calcularEtapaPorEdad(mesesEdad) : null;
  const etapaInfo = etapaCalculada ? getEtapaInfo(etapaCalculada) : null;
  const esLactancia = etapaCalculada === 'lactancia';
  // Meses que faltan para empezar con sólidos (~6 meses, estándar OMS)
  const mesesParaSolidos = mesesEdad !== null ? Math.max(0, 6 - mesesEdad) : 0;

  const toggleAlergia = (id: string) => {
    setAlergias((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  // Avanzar al siguiente paso con validación
  const avanzar = () => {
    if (paso === 1) {
      if (!nombre.trim()) {
        Alert.alert('Nombre requerido', 'Ingresa el nombre de tu bebé.');
        return;
      }
      setPaso(2);
    } else if (paso === 2) {
      if (!dia || !mes || !anio) {
        Alert.alert('Fecha incompleta', 'Completa el día, mes y año.');
        return;
      }
      if (!etapaCalculada) {
        Alert.alert(
          'Fecha inválida',
          'Verifica la fecha. Puedes registrar a tu bebé desde su nacimiento hasta los 6 años.'
        );
        return;
      }
      setPaso(3);
    }
  };

  // Crear el perfil y navegar a la app principal
  const crear = async () => {
    if (!etapaCalculada) return;
    const fechaISO = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    const perfil = await crearPerfil({
      nombre: nombre.trim(),
      fecha_nacimiento: fechaISO,
      etapa: etapaCalculada,
      alergias,
      avatar_emoji: avatarEmoji,
    });
    if (perfil) {
      router.replace('/(tabs)');
    }
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: '700' as const,
    color: c.negro,
    marginBottom: 8,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.fondoApp }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Barra de progreso */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
        {[1, 2, 3].map((p) => (
          <View
            key={p}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: p <= paso ? c.verde : c.grisClaro,
            }}
          />
        ))}
      </View>

      {/* Eyebrow paso */}
      <Text style={{ fontSize: 11, fontWeight: '700', color: c.grisTexto, letterSpacing: 2 }}>
        PASO {paso} DE {PASOS_TOTAL}
      </Text>

      {/* ── Paso 1: nombre y avatar ───────────────────────────────────── */}
      {paso === 1 && (
        <View style={{ flex: 1, marginTop: 10 }}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: '800',
              color: c.negro,
              letterSpacing: -0.6,
              lineHeight: 36,
            }}
          >
            ¿Cómo se llama tu bebé?
          </Text>
          <Text style={{ fontSize: 15, color: c.grisTexto, marginTop: 10, marginBottom: 28 }}>
            Puedes agregar más perfiles después.
          </Text>

          <Text style={labelStyle}>Nombre</Text>
          <TextInput
            style={{
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.cardBorde,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 13,
              fontSize: 16,
              color: c.negro,
              marginBottom: 24,
            }}
            placeholder="Ej: Mateo"
            placeholderTextColor={c.grisTexto}
            value={nombre}
            onChangeText={setNombre}
            autoFocus
            autoCapitalize="words"
            accessibilityLabel="Nombre del bebé"
          />

          <Text style={labelStyle}>Elige un avatar</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {AVATARES.map((emoji) => {
              const activo = avatarEmoji === emoji;
              return (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setAvatarEmoji(emoji)}
                  activeOpacity={0.8}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activo ? c.verdeClaro : c.card,
                    borderWidth: activo ? 2 : 1,
                    borderColor: activo ? c.verde : c.cardBorde,
                  }}
                  accessibilityLabel={`Avatar ${emoji}`}
                >
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Paso 2: fecha de nacimiento ──────────────────────────────── */}
      {paso === 2 && (
        <View style={{ flex: 1, marginTop: 10 }}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: '800',
              color: c.negro,
              letterSpacing: -0.6,
              lineHeight: 36,
            }}
          >
            ¿Cuándo nació <Text style={{ color: c.verde }}>{nombre}</Text>?
          </Text>
          <Text style={{ fontSize: 15, color: c.grisTexto, marginTop: 10, marginBottom: 28 }}>
            Con esto sabemos en qué etapa está: desde solo leche hasta platos completos.
          </Text>

          {/* Campos de fecha: día / mes / año */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            {[
              { label: 'Día', value: dia, placeholder: 'DD', maxLength: 2, width: '22%' as const },
              { label: 'Mes', value: mes, placeholder: 'MM', maxLength: 2, width: '22%' as const },
              {
                label: 'Año',
                value: anio,
                placeholder: 'AAAA',
                maxLength: 4,
                width: '46%' as const,
              },
            ].map((campo) => (
              <View key={campo.label} style={{ width: campo.width }}>
                <Text style={{ ...labelStyle, textAlign: 'center' }}>{campo.label}</Text>
                <TextInput
                  ref={campo.label === 'Mes' ? refMes : campo.label === 'Año' ? refAnio : undefined}
                  style={{
                    backgroundColor: c.card,
                    borderWidth: 1,
                    borderColor: c.cardBorde,
                    borderRadius: 14,
                    paddingVertical: 13,
                    fontSize: 16,
                    color: c.negro,
                    textAlign: 'center',
                    fontVariant: ['tabular-nums'],
                  }}
                  placeholder={campo.placeholder}
                  placeholderTextColor={c.grisTexto}
                  value={campo.value}
                  onChangeText={(v) => {
                    if (campo.label === 'Día') {
                      setDia(v);
                      if (v.length === 2) refMes.current?.focus();
                    } else if (campo.label === 'Mes') {
                      setMes(v);
                      if (v.length === 2) refAnio.current?.focus();
                    } else {
                      setAnio(v);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={campo.maxLength}
                  accessibilityLabel={`${campo.label} de nacimiento`}
                />
              </View>
            ))}
          </View>

          {/* Badge de etapa calculada automáticamente */}
          {esLactancia && etapaInfo ? (
            <View
              style={{
                backgroundColor: c.premiumFondo,
                borderRadius: 14,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: etapaInfo.color + '44',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 24, lineHeight: 32 }}>🍼</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: c.negro }}>
                  Por ahora, solo leche
                </Text>
                <Text style={{ fontSize: 13, color: c.grisTexto, marginTop: 2, lineHeight: 19 }}>
                  {mesesParaSolidos > 0
                    ? `Faltan ~${mesesParaSolidos} ${
                        mesesParaSolidos === 1 ? 'mes' : 'meses'
                      } para empezar con sólidos. Te avisaremos cuando sea el momento.`
                    : 'Ya casi puede empezar con sólidos. Te avisaremos cuando sea el momento.'}
                </Text>
              </View>
            </View>
          ) : etapaInfo ? (
            <View
              style={{
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.cardBorde,
                borderRadius: 14,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: etapaInfo.color + '33',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 24 }}>{etapaInfo.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: c.negro }}>
                  {formatearEdad(`${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`)}
                </Text>
                <Text style={{ fontSize: 13, color: c.grisTexto, marginTop: 2 }}>
                  {etapaInfo.nombre} · {etapaInfo.descripcion}
                </Text>
              </View>
            </View>
          ) : (
            dia &&
            mes &&
            anio.length === 4 && (
              <View
                style={{
                  backgroundColor: c.premiumFondo,
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Feather name="alert-triangle" size={18} color={c.naranja} />
                <Text style={{ flex: 1, fontSize: 13, color: c.naranja }}>
                  Verifica la fecha — puedes registrar desde el nacimiento hasta los 6 años.
                </Text>
              </View>
            )
          )}
        </View>
      )}

      {/* ── Paso 3: alergias ─────────────────────────────────────────── */}
      {paso === 3 && (
        <View style={{ flex: 1, marginTop: 10 }}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: '800',
              color: c.negro,
              letterSpacing: -0.6,
              lineHeight: 36,
            }}
          >
            ¿Tiene alguna alergia?
          </Text>
          <Text style={{ fontSize: 15, color: c.grisTexto, marginTop: 10, marginBottom: 28 }}>
            Selecciona las que apliquen. Puedes editarlo después.
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {ALERGENOS.map((alergia) => {
              const seleccionado = alergias.includes(alergia.id);
              return (
                <TouchableOpacity
                  key={alergia.id}
                  onPress={() => toggleAlergia(alergia.id)}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 999,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: seleccionado ? c.verdeClaro : c.card,
                    borderWidth: 1.5,
                    borderColor: seleccionado ? c.verde : c.cardBorde,
                  }}
                  accessibilityLabel={`Alergia ${alergia.nombre}`}
                >
                  <Text style={{ fontSize: 18 }}>{alergia.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: seleccionado ? c.verde : c.negro,
                    }}
                  >
                    {alergia.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {error && (
            <Text style={{ fontSize: 13, color: c.error, textAlign: 'center', marginBottom: 16 }}>
              {error}
            </Text>
          )}
        </View>
      )}

      {/* ── Botones de navegación ─────────────────────────────────────── */}
      <View style={{ gap: 8, marginTop: 24 }}>
        <TouchableOpacity
          style={{
            backgroundColor: cargando ? c.grisClaro : c.verde,
            borderRadius: 999,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 10,
          }}
          activeOpacity={0.85}
          onPress={paso < PASOS_TOTAL ? avanzar : crear}
          disabled={cargando}
          accessibilityLabel={paso < PASOS_TOTAL ? 'Siguiente paso' : 'Crear perfil y empezar'}
        >
          {cargando ? (
            <ActivityIndicator color={c.grisTexto} size="small" />
          ) : (
            <>
              <Feather
                name={paso < PASOS_TOTAL ? 'arrow-right' : 'check'}
                size={18}
                color={c.blanco}
              />
              <Text
                style={{ color: c.blanco, fontWeight: '800', fontSize: 15, letterSpacing: 0.3 }}
              >
                {paso < PASOS_TOTAL ? 'Siguiente' : `Empezar con ${nombre} ${avatarEmoji}`}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {paso > 1 && (
          <TouchableOpacity
            style={{ alignItems: 'center', paddingVertical: 8 }}
            onPress={() => setPaso(paso - 1)}
            disabled={cargando}
            accessibilityLabel="Volver al paso anterior"
          >
            <Text style={{ fontSize: 14, color: c.grisTexto, fontWeight: '600' }}>Volver</Text>
          </TouchableOpacity>
        )}

        {/* Atajo para saltear alergias en el paso 3 */}
        {paso === 3 && alergias.length === 0 && !cargando && (
          <TouchableOpacity
            style={{ alignItems: 'center', paddingVertical: 6 }}
            onPress={crear}
            accessibilityLabel="Continuar sin alergias"
          >
            <Text style={{ fontSize: 14, color: c.grisTexto }}>Sin alergias por ahora</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
