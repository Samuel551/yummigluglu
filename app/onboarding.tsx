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
import { usePerfilStore } from '@/store/usePerfilStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { ALERGENOS } from '@/constants/Alergias';
import { calcularEtapaPorEdad, getEtapaInfo, formatearEdad } from '@/constants/Etapas';
import type { EtapaAlimentaria } from '@/types';

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

  // Calcula la etapa alimentaria según la fecha ingresada
  const calcularEtapa = (): EtapaAlimentaria | null => {
    if (!dia || !mes || anio.length < 4) return null;
    const fechaNac = new Date(Number(anio), Number(mes) - 1, Number(dia));
    if (isNaN(fechaNac.getTime())) return null;
    const hoy = new Date();
    // Diferencia en meses aproximada
    const meses = Math.floor((hoy.getTime() - fechaNac.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    // Rango válido: 4 meses a 6 años (72 meses)
    if (meses < 4 || meses > 72) return null;
    return calcularEtapaPorEdad(meses);
  };

  const etapaCalculada = calcularEtapa();
  const etapaInfo = etapaCalculada ? getEtapaInfo(etapaCalculada) : null;

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
          'Verifica la fecha. La app es para bebés de 4 meses a 6 años.'
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

  return (
    <ScrollView
      className="flex-1 bg-fondo-app dark:bg-[#121212]"
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Barra de progreso */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 40 }}>
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

      {/* ── Paso 1: nombre y avatar ───────────────────────────────────── */}
      {paso === 1 && (
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>👶</Text>
          <Text className="text-2xl font-bold text-negro dark:text-[#F0EDE8] mb-1">
            ¿Cómo se llama tu bebé?
          </Text>
          <Text className="text-gris-texto dark:text-[#A0A0A0] mb-8">
            Puedes agregar más perfiles después.
          </Text>

          <Text className="text-sm font-medium text-negro dark:text-[#F0EDE8] mb-1">Nombre</Text>
          <TextInput
            className="bg-white dark:bg-[#1E1E1E] border border-gris-claro dark:border-[#2A2A2A] rounded-xl px-4 py-3 text-negro dark:text-[#F0EDE8] text-base mb-6"
            placeholder="Ej: Mateo"
            placeholderTextColor={c.grisTexto}
            value={nombre}
            onChangeText={setNombre}
            autoFocus
            autoCapitalize="words"
            accessibilityLabel="Nombre del bebé"
          />

          <Text className="text-sm font-medium text-negro dark:text-[#F0EDE8] mb-3">
            Elige un avatar
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {AVATARES.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => setAvatarEmoji(emoji)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: avatarEmoji === emoji ? c.verdeClaro : c.blanco,
                  borderWidth: avatarEmoji === emoji ? 2 : 1,
                  borderColor: avatarEmoji === emoji ? c.verde : c.grisClaro,
                }}
                accessibilityLabel={`Avatar ${emoji}`}
              >
                <Text style={{ fontSize: 26 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── Paso 2: fecha de nacimiento ──────────────────────────────── */}
      {paso === 2 && (
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🗓️</Text>
          <Text className="text-2xl font-bold text-negro dark:text-[#F0EDE8] mb-1">
            ¿Cuándo nació {nombre}?
          </Text>
          <Text className="text-gris-texto dark:text-[#A0A0A0] mb-8">
            Usamos esto para mostrar recetas según su etapa de alimentación.
          </Text>

          {/* Campos de fecha: día / mes / año */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text className="text-sm font-medium text-negro dark:text-[#F0EDE8] mb-1 text-center">
                Día
              </Text>
              <TextInput
                className="bg-white dark:bg-[#1E1E1E] border border-gris-claro dark:border-[#2A2A2A] rounded-xl py-3 text-negro dark:text-[#F0EDE8] text-base text-center"
                placeholder="DD"
                placeholderTextColor={c.grisTexto}
                value={dia}
                onChangeText={(v) => {
                  setDia(v);
                  if (v.length === 2) refMes.current?.focus();
                }}
                keyboardType="numeric"
                maxLength={2}
                accessibilityLabel="Día de nacimiento"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="text-sm font-medium text-negro dark:text-[#F0EDE8] mb-1 text-center">
                Mes
              </Text>
              <TextInput
                ref={refMes}
                className="bg-white dark:bg-[#1E1E1E] border border-gris-claro dark:border-[#2A2A2A] rounded-xl py-3 text-negro dark:text-[#F0EDE8] text-base text-center"
                placeholder="MM"
                placeholderTextColor={c.grisTexto}
                value={mes}
                onChangeText={(v) => {
                  setMes(v);
                  if (v.length === 2) refAnio.current?.focus();
                }}
                keyboardType="numeric"
                maxLength={2}
                accessibilityLabel="Mes de nacimiento"
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text className="text-sm font-medium text-negro dark:text-[#F0EDE8] mb-1 text-center">
                Año
              </Text>
              <TextInput
                ref={refAnio}
                className="bg-white dark:bg-[#1E1E1E] border border-gris-claro dark:border-[#2A2A2A] rounded-xl py-3 text-negro dark:text-[#F0EDE8] text-base text-center"
                placeholder="AAAA"
                placeholderTextColor={c.grisTexto}
                value={anio}
                onChangeText={setAnio}
                keyboardType="numeric"
                maxLength={4}
                accessibilityLabel="Año de nacimiento"
              />
            </View>
          </View>

          {/* Badge de etapa calculada automáticamente */}
          {etapaInfo ? (
            <View
              style={{
                backgroundColor: etapaInfo.color + '40',
                borderRadius: 12,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 28 }}>{etapaInfo.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text className="font-semibold text-negro dark:text-[#F0EDE8]">
                  {formatearEdad(`${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`)}
                </Text>
                <Text
                  className="text-gris-texto dark:text-[#A0A0A0] text-sm"
                  style={{ flexWrap: 'wrap' }}
                >
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
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <Text className="text-naranja text-sm text-center">
                  Verifica la fecha — la app es para bebés de 4 meses a 6 años.
                </Text>
              </View>
            )
          )}
        </View>
      )}

      {/* ── Paso 3: alergias ─────────────────────────────────────────── */}
      {paso === 3 && (
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🌾</Text>
          <Text className="text-2xl font-bold text-negro dark:text-[#F0EDE8] mb-1">
            ¿Tiene alguna alergia?
          </Text>
          <Text className="text-gris-texto dark:text-[#A0A0A0] mb-8">
            Selecciona las que apliquen. Puedes editarlo después.
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {ALERGENOS.map((alergia) => {
              const seleccionado = alergias.includes(alergia.id);
              return (
                <TouchableOpacity
                  key={alergia.id}
                  onPress={() => toggleAlergia(alergia.id)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: seleccionado ? c.verdeClaro : c.blanco,
                    borderWidth: 1.5,
                    borderColor: seleccionado ? c.verde : c.grisClaro,
                  }}
                  accessibilityLabel={`Alergia ${alergia.nombre}`}
                >
                  <Text style={{ fontSize: 18 }}>{alergia.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '500',
                      color: seleccionado ? c.verde : c.negro,
                    }}
                  >
                    {alergia.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {error && <Text className="text-error text-sm text-center mb-4">{error}</Text>}
        </View>
      )}

      {/* ── Botones de navegación ─────────────────────────────────────── */}
      <View style={{ gap: 12, marginTop: 24 }}>
        <TouchableOpacity
          style={{
            backgroundColor: cargando ? c.verde + '99' : c.verde,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          onPress={paso < PASOS_TOTAL ? avanzar : crear}
          disabled={cargando}
          accessibilityLabel={paso < PASOS_TOTAL ? 'Siguiente paso' : 'Crear perfil y empezar'}
        >
          {cargando ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {paso < PASOS_TOTAL ? 'Siguiente' : `Empezar con ${nombre} ${avatarEmoji}`}
            </Text>
          )}
        </TouchableOpacity>

        {paso > 1 && (
          <TouchableOpacity
            className="items-center py-2"
            onPress={() => setPaso(paso - 1)}
            disabled={cargando}
            accessibilityLabel="Volver al paso anterior"
          >
            <Text className="text-gris-texto dark:text-[#A0A0A0]">Volver</Text>
          </TouchableOpacity>
        )}

        {/* Atajo para saltear alergias en el paso 3 */}
        {paso === 3 && alergias.length === 0 && !cargando && (
          <TouchableOpacity
            className="items-center py-1"
            onPress={crear}
            accessibilityLabel="Continuar sin alergias"
          >
            <Text className="text-gris-texto dark:text-[#A0A0A0] text-sm">
              Sin alergias por ahora
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
