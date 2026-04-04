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
} from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modoMagicLink, setModoMagicLink] = useState(false);
  const [magicLinkEnviado, setMagicLinkEnviado] = useState(false);

  const { iniciarSesion, enviarMagicLink, cargando, error, limpiarError } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Completá tu email y contraseña.');
      return;
    }
    limpiarError();
    await iniciarSesion(email, password);
    // La navegación la maneja el listener de auth en _layout.tsx
  };

  const handleMagicLink = async () => {
    if (!email) {
      Alert.alert('Email requerido', 'Ingresá tu email para recibir el enlace.');
      return;
    }
    limpiarError();
    await enviarMagicLink(email);
    if (!error) {
      setMagicLinkEnviado(true);
    }
  };

  if (magicLinkEnviado) {
    return (
      <View className="flex-1 bg-fondo-app items-center justify-center px-6">
        <Text className="text-5xl mb-4">📬</Text>
        <Text className="text-2xl font-bold text-negro text-center mb-2">¡Revisá tu email!</Text>
        <Text className="text-gris-texto text-center text-base leading-6">
          Te enviamos un enlace mágico a{'\n'}
          <Text className="font-semibold text-verde">{email}</Text>
        </Text>
        <TouchableOpacity
          className="mt-8"
          onPress={() => {
            setMagicLinkEnviado(false);
            limpiarError();
          }}
          accessibilityLabel="Volver al inicio de sesión"
        >
          <Text className="text-verde font-semibold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-fondo-app"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo / Header */}
        <View className="items-center mb-10">
          <Text className="text-6xl mb-3">🍼</Text>
          <Text className="text-3xl font-bold text-negro">Baby Bites</Text>
          <Text className="text-gris-texto text-base mt-1">
            Alimentación inteligente para tu bebé
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

          {!modoMagicLink && (
            <View>
              <Text className="text-sm font-medium text-negro mb-1">Contraseña</Text>
              <TextInput
                className="bg-white border border-gris-claro rounded-xl px-4 py-3 text-negro text-base"
                placeholder="Tu contraseña"
                placeholderTextColor="#6B6560"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                accessibilityLabel="Campo de contraseña"
              />
            </View>
          )}

          {error && <Text className="text-error text-sm text-center">{error}</Text>}

          {/* Botón principal */}
          <TouchableOpacity
            className={`rounded-xl py-4 items-center mt-2 ${cargando ? 'bg-verde/60' : 'bg-verde'}`}
            onPress={modoMagicLink ? handleMagicLink : handleLogin}
            disabled={cargando}
            accessibilityLabel={modoMagicLink ? 'Enviar enlace mágico' : 'Iniciar sesión'}
          >
            {cargando ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                {modoMagicLink ? 'Enviar enlace mágico' : 'Iniciar sesión'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle magic link */}
          <TouchableOpacity
            className="items-center py-2"
            onPress={() => {
              setModoMagicLink(!modoMagicLink);
              limpiarError();
            }}
            accessibilityLabel={
              modoMagicLink ? 'Volver a login con contraseña' : 'Ingresar sin contraseña'
            }
          >
            <Text className="text-verde text-sm">
              {modoMagicLink ? 'Ingresar con contraseña' : '¿Sin contraseña? Usá enlace mágico'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Link a registro */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gris-texto">¿No tenés cuenta? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity accessibilityLabel="Ir a registro">
              <Text className="text-verde font-semibold">Registrarte</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
