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
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { usePerfilStore } from '@/store/usePerfilStore';
import { ALERGENOS } from '@/constants/Alergias';
import { useColoresTema } from '@/hooks/useColoresTema';
import { calcularEtapaPorEdad } from '@/constants/Etapas';

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

export default function EditarPerfilScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColoresTema();
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
        }}
      >
        <Text style={{ color: c.grisTexto }}>Perfil no encontrado</Text>
      </SafeAreaView>
    );
  }

  const toggleAlergia = (id: string) => {
    setAlergias((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 16, color: c.verde, fontWeight: '600' }}>← Volver</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '800', color: c.negro }}>Editar perfil</Text>
        </View>

        {/* Nombre */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: c.grisTexto,
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          NOMBRE
        </Text>
        <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <TextInput
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            style={{ fontSize: 16, color: c.negro }}
            placeholder="Nombre del bebé"
            placeholderTextColor={c.grisTexto}
          />
        </View>

        {/* Avatar */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: c.grisTexto,
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          AVATAR
        </Text>
        <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 14, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {AVATARES.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => setAvatarEmoji(emoji)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: avatarEmoji === emoji ? c.verdeClaro : c.grisClaro,
                  borderWidth: avatarEmoji === emoji ? 2 : 0,
                  borderColor: c.verde,
                }}
              >
                <Text style={{ fontSize: 22 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fecha de nacimiento */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: c.grisTexto,
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          FECHA DE NACIMIENTO
        </Text>
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 8,
            flexDirection: 'row',
            gap: 12,
          }}
        >
          {[
            { label: 'Día', value: dia, setter: setDia, placeholder: 'DD', maxLength: 2 },
            { label: 'Mes', value: mes, setter: setMes, placeholder: 'MM', maxLength: 2 },
            { label: 'Año', value: anio, setter: setAnio, placeholder: 'AAAA', maxLength: 4 },
          ].map(({ label, value, setter, placeholder, maxLength }) => (
            <View key={label} style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: c.grisTexto, marginBottom: 4 }}>{label}</Text>
              <TextInput
                value={value}
                onChangeText={setter}
                keyboardType="numeric"
                maxLength={maxLength}
                style={{
                  fontSize: 16,
                  color: c.negro,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E7EB',
                  paddingBottom: 4,
                }}
                placeholder={placeholder}
                placeholderTextColor={c.grisTexto}
              />
            </View>
          ))}
        </View>
        {etapaCalculada && (
          <View
            style={{
              backgroundColor: c.verdeClaro,
              borderRadius: 10,
              padding: 10,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 13, color: c.verde, fontWeight: '600' }}>
              Etapa detectada:{' '}
              {etapaCalculada === 'inicio'
                ? 'Primeros alimentos (6-11m)'
                : etapaCalculada === 'transicion'
                  ? 'Texturas y finger foods (12-23m)'
                  : 'Platos completos (2a+)'}
            </Text>
          </View>
        )}

        {/* Alergias */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: c.grisTexto,
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          ALERGIAS
        </Text>
        <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 14, marginBottom: 28 }}>
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
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: activo ? '#FEE2E2' : c.cardBorde,
                    borderWidth: activo ? 1.5 : 0,
                    borderColor: '#FCA5A5',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{a.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: activo ? '600' : '400',
                      color: activo ? '#DC2626' : c.grisTexto,
                    }}
                  >
                    {a.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Guardar */}
        <TouchableOpacity
          onPress={guardar}
          disabled={cargando}
          activeOpacity={0.8}
          style={{
            backgroundColor: c.verde,
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Guardar cambios</Text>
          )}
        </TouchableOpacity>

        {/* Eliminar */}
        <TouchableOpacity
          onPress={confirmarEliminar}
          disabled={cargando}
          activeOpacity={0.8}
          style={{
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#FCA5A5',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#DC2626' }}>
            Eliminar perfil de {perfil.nombre}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
