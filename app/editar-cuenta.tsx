import { useState } from 'react';
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
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useColoresTema } from '@/hooks/useColoresTema';

export default function EditarCuentaScreen() {
  const { usuario, actualizarEmail, enviarResetContrasena, cargando, error, limpiarError } =
    useAuthStore();
  const c = useColoresTema();

  const [nuevoEmail, setNuevoEmail] = useState(usuario?.email ?? '');

  const guardarEmail = async () => {
    if (!nuevoEmail.trim() || nuevoEmail === usuario?.email) return;
    await actualizarEmail(nuevoEmail.trim());
    if (!useAuthStore.getState().error) {
      Alert.alert('Email actualizado', 'Revisa tu bandeja para confirmar el cambio.');
    }
  };

  const solicitarCambioContrasena = async () => {
    const email = usuario?.email;
    if (!email) return;
    await enviarResetContrasena(email);
    if (!useAuthStore.getState().error) {
      Alert.alert(
        'Email enviado',
        `Te mandamos un enlace a ${email} para que puedas cambiar tu contraseña.`
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
          <TouchableOpacity
            onPress={() => {
              limpiarError();
              router.back();
            }}
            style={{ marginRight: 12 }}
          >
            <Text style={{ fontSize: 16, color: c.verde, fontWeight: '600' }}>← Volver</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '800', color: c.negro }}>Editar cuenta</Text>
        </View>

        {error && (
          <View
            style={{ backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 }}
          >
            <Text style={{ fontSize: 13, color: '#DC2626' }}>{error}</Text>
          </View>
        )}

        {/* Email */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: c.grisTexto,
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          EMAIL
        </Text>
        <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 8 }}>
          <TextInput
            value={nuevoEmail}
            onChangeText={setNuevoEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={{ fontSize: 16, color: c.negro, paddingVertical: 4 }}
            placeholder="tu@email.com"
            placeholderTextColor={c.grisTexto}
          />
        </View>
        <TouchableOpacity
          onPress={guardarEmail}
          disabled={cargando || nuevoEmail === usuario?.email || !nuevoEmail.trim()}
          activeOpacity={0.8}
          style={{
            backgroundColor:
              nuevoEmail !== usuario?.email && nuevoEmail.trim() ? c.verde : '#E5E7EB',
            borderRadius: 14,
            padding: 14,
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: nuevoEmail !== usuario?.email && nuevoEmail.trim() ? '#fff' : '#9CA3AF',
              }}
            >
              Guardar email
            </Text>
          )}
        </TouchableOpacity>

        {/* Contraseña */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: c.grisTexto,
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          CONTRASEÑA
        </Text>
        <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: c.grisTexto, lineHeight: 20 }}>
            Te vamos a mandar un enlace a{' '}
            <Text style={{ fontWeight: '600', color: c.negro }}>{usuario?.email}</Text> para que
            puedas cambiarla de forma segura.
          </Text>
        </View>
        <TouchableOpacity
          onPress={solicitarCambioContrasena}
          disabled={cargando}
          activeOpacity={0.8}
          style={{
            backgroundColor: c.card,
            borderRadius: 14,
            padding: 14,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: c.verde,
          }}
        >
          {cargando ? (
            <ActivityIndicator color={c.verde} />
          ) : (
            <Text style={{ fontSize: 15, fontWeight: '700', color: c.verde }}>
              Enviar enlace de cambio
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
