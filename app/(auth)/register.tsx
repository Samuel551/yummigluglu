import { useState, useRef } from 'react';
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
import { Link } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useColoresTema } from '@/hooks/useColoresTema';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  const { registrarse, cargando, error, limpiarError } = useAuthStore();
  const c = useColoresTema();
  const scrollRef = useRef<ScrollView>(null);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Campos requeridos', 'Completa todos los campos.');
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
    await registrarse(email, password);
    if (!useAuthStore.getState().error) {
      setRegistrado(true);
    }
  };

  if (registrado) {
    return (
      <View className="flex-1 bg-fondo-app dark:bg-[#121212] items-center justify-center px-6">
        <Text className="text-5xl mb-4">✉️</Text>
        <Text className="text-2xl font-bold text-negro dark:text-[#F0EDE8] text-center mb-2">
          ¡Revisa tu correo!
        </Text>
        <Text className="text-gris-texto dark:text-[#A0A0A0] text-center text-base leading-6">
          Te enviamos un enlace de confirmación a{'\n'}
          <Text className="font-semibold text-verde">{email}</Text>
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity
            className="mt-8 bg-verde rounded-xl px-8 py-4"
            accessibilityLabel="Ir al inicio de sesión"
          >
            <Text className="text-white font-bold">Ir al login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-fondo-app dark:bg-[#121212]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="flex-grow justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="items-center mb-10">
            <Text className="text-6xl mb-3">🌱</Text>
            <Text className="text-3xl font-bold text-negro dark:text-[#F0EDE8]">Crear cuenta</Text>
            <Text className="text-gris-texto dark:text-[#A0A0A0] text-base mt-1 text-center">
              Comienza el viaje alimentario de tu bebé
            </Text>
          </View>

          {/* Formulario */}
          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-negro dark:text-[#F0EDE8] mb-1">Email</Text>
              <TextInput
                className="bg-white dark:bg-[#1E1E1E] border border-gris-claro dark:border-[#2A2A2A] rounded-xl px-4 py-3 text-negro dark:text-[#F0EDE8] text-base"
                placeholder="tu@email.com"
                placeholderTextColor={c.grisTexto}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  limpiarError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="Campo de email"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-negro dark:text-[#F0EDE8] mb-1">
                Contraseña
              </Text>
              <View className="relative">
                <TextInput
                  className="bg-white dark:bg-[#1E1E1E] border border-gris-claro dark:border-[#2A2A2A] rounded-xl px-4 py-3 text-negro dark:text-[#F0EDE8] text-base"
                  style={{ paddingRight: 48 }}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={c.grisTexto}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!mostrarPassword}
                  autoComplete="new-password"
                  accessibilityLabel="Campo de contraseña"
                />
                <TouchableOpacity
                  className="absolute right-3 top-0 bottom-0 justify-center"
                  onPress={() => setMostrarPassword((v) => !v)}
                  accessibilityLabel={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <Text style={{ fontSize: 20 }}>{mostrarPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-negro dark:text-[#F0EDE8] mb-1">
                Confirmar contraseña
              </Text>
              <View className="relative">
                <TextInput
                  className="bg-white dark:bg-[#1E1E1E] border border-gris-claro dark:border-[#2A2A2A] rounded-xl px-4 py-3 text-negro dark:text-[#F0EDE8] text-base"
                  style={{ paddingRight: 48 }}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={c.grisTexto}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!mostrarConfirm}
                  accessibilityLabel="Campo de confirmación de contraseña"
                  onFocus={() =>
                    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
                  }
                />
                <TouchableOpacity
                  className="absolute right-3 top-0 bottom-0 justify-center"
                  onPress={() => setMostrarConfirm((v) => !v)}
                  accessibilityLabel={
                    mostrarConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'
                  }
                >
                  <Text style={{ fontSize: 20 }}>{mostrarConfirm ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {error && <Text className="text-error text-sm text-center">{error}</Text>}

            <TouchableOpacity
              className={`rounded-xl py-4 items-center mt-2 ${cargando ? 'bg-verde/60' : 'bg-verde'}`}
              onPress={handleRegister}
              disabled={cargando}
              accessibilityLabel="Crear cuenta"
            >
              {cargando ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Crear cuenta</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link a login */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gris-texto dark:text-[#A0A0A0]">¿Ya tienes cuenta? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity accessibilityLabel="Ir a inicio de sesión">
                <Text className="text-verde font-semibold">Inicia sesión</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {cargando && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          pointerEvents="auto"
        >
          <View
            style={{
              backgroundColor: c.card,
              borderRadius: 16,
              paddingHorizontal: 32,
              paddingVertical: 28,
              alignItems: 'center',
              gap: 12,
              minWidth: 240,
            }}
          >
            <ActivityIndicator size="large" color="#2D9B5A" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: c.negro,
                textAlign: 'center',
              }}
            >
              Creando tu cuenta...
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: c.grisTexto,
                textAlign: 'center',
              }}
            >
              Enviando correo de confirmación
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
