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
import { Link } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrado, setRegistrado] = useState(false);

  const { registrarse, cargando, error, limpiarError } = useAuthStore();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Campos requeridos', 'Completá todos los campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Contraseñas no coinciden', 'Verificá que las contraseñas sean iguales.');
      return;
    }

    limpiarError();
    await registrarse(email, password);
    if (!error) {
      setRegistrado(true);
    }
  };

  if (registrado) {
    return (
      <View className="flex-1 bg-fondo-app items-center justify-center px-6">
        <Text className="text-5xl mb-4">✉️</Text>
        <Text className="text-2xl font-bold text-negro text-center mb-2">¡Revisá tu email!</Text>
        <Text className="text-gris-texto text-center text-base leading-6">
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
    <KeyboardAvoidingView
      className="flex-1 bg-fondo-app"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-10">
          <Text className="text-6xl mb-3">🌱</Text>
          <Text className="text-3xl font-bold text-negro">Crear cuenta</Text>
          <Text className="text-gris-texto text-base mt-1 text-center">
            Comenzá el viaje alimentario de tu bebé
          </Text>
        </View>

        {/* Formulario */}
        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-negro mb-1">Email</Text>
            <TextInput
              className="bg-white border border-gris-claro rounded-xl px-4 py-3 text-negro text-base"
              placeholder="tu@email.com"
              placeholderTextColor="#6B6560"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              accessibilityLabel="Campo de email"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-negro mb-1">Contraseña</Text>
            <TextInput
              className="bg-white border border-gris-claro rounded-xl px-4 py-3 text-negro text-base"
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#6B6560"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              accessibilityLabel="Campo de contraseña"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-negro mb-1">Confirmar contraseña</Text>
            <TextInput
              className="bg-white border border-gris-claro rounded-xl px-4 py-3 text-negro text-base"
              placeholder="Repetí tu contraseña"
              placeholderTextColor="#6B6560"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              accessibilityLabel="Campo de confirmación de contraseña"
            />
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
          <Text className="text-gris-texto">¿Ya tenés cuenta? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity accessibilityLabel="Ir a inicio de sesión">
              <Text className="text-verde font-semibold">Iniciá sesión</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
