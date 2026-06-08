import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useColoresTema } from '@/hooks/useColoresTema';

export default function NuevaContrasenaScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);

  const { actualizarContrasena, cargando, error, limpiarError } = useAuthStore();
  const c = useColoresTema();

  const handleGuardar = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Campos requeridos', 'Completa ambos campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Contraseñas no coinciden', 'Verifica que las contraseñas sean iguales.');
      return;
    }
    limpiarError();
    await actualizarContrasena(password);
    if (!useAuthStore.getState().error) {
      useAuthStore.getState().setRecoveryPendiente(false);
      Alert.alert('Contraseña actualizada', 'Tu nueva contraseña quedó guardada.', [
        { text: 'Continuar', onPress: () => router.replace('/(tabs)') },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.fondoApp }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: c.verdeClaro,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Feather name="lock" size={30} color={c.verde} />
          </View>
          <Text style={{ fontSize: 30, fontWeight: '800', color: c.negro, letterSpacing: -0.6 }}>
            Nueva contraseña
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: c.grisTexto,
              marginTop: 6,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            Escribe tu nueva contraseña para terminar de recuperar tu cuenta.
          </Text>
        </View>

        {/* Formulario */}
        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: c.negro, marginBottom: 8 }}>
              Nueva contraseña
            </Text>
            <View style={{ position: 'relative', justifyContent: 'center' }}>
              <TextInput
                style={{
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.cardBorde,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  paddingRight: 50,
                  fontSize: 16,
                  color: c.negro,
                }}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={c.grisTexto}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!mostrarPassword}
                autoComplete="new-password"
                accessibilityLabel="Campo de nueva contraseña"
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 14, padding: 4 }}
                hitSlop={8}
                onPress={() => setMostrarPassword((v) => !v)}
                accessibilityLabel={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <Feather name={mostrarPassword ? 'eye-off' : 'eye'} size={20} color={c.grisTexto} />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: c.negro, marginBottom: 8 }}>
              Confirmar contraseña
            </Text>
            <View style={{ position: 'relative', justifyContent: 'center' }}>
              <TextInput
                style={{
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.cardBorde,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  paddingRight: 50,
                  fontSize: 16,
                  color: c.negro,
                }}
                placeholder="Repite tu contraseña"
                placeholderTextColor={c.grisTexto}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!mostrarConfirm}
                accessibilityLabel="Campo de confirmación de contraseña"
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 14, padding: 4 }}
                hitSlop={8}
                onPress={() => setMostrarConfirm((v) => !v)}
                accessibilityLabel={
                  mostrarConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'
                }
              >
                <Feather name={mostrarConfirm ? 'eye-off' : 'eye'} size={20} color={c.grisTexto} />
              </TouchableOpacity>
            </View>
          </View>

          {error && (
            <Text style={{ fontSize: 13, color: c.error, textAlign: 'center' }}>{error}</Text>
          )}

          <TouchableOpacity
            style={{
              borderRadius: 999,
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 10,
              marginTop: 4,
              backgroundColor: cargando ? c.grisClaro : c.verde,
            }}
            activeOpacity={0.85}
            onPress={handleGuardar}
            disabled={cargando}
            accessibilityLabel="Guardar nueva contraseña"
          >
            {cargando ? (
              <ActivityIndicator color={c.grisTexto} size="small" />
            ) : (
              <>
                <Feather name="check" size={18} color={c.blanco} />
                <Text
                  style={{ color: c.blanco, fontWeight: '800', fontSize: 15, letterSpacing: 0.3 }}
                >
                  Guardar contraseña
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
