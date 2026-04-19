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

type ModoLogin = 'login' | 'magic-link' | 'recuperar';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [modo, setModo] = useState<ModoLogin>('login');
  const [emailEnviado, setEmailEnviado] = useState<'magic-link' | 'recuperar' | null>(null);

  const { iniciarSesion, enviarMagicLink, enviarResetContrasena, cargando, error, limpiarError } =
    useAuthStore();
  const c = useColoresTema();
  const scrollRef = useRef<ScrollView>(null);

  const cambiarModo = (nuevoModo: ModoLogin) => {
    setModo(nuevoModo);
    limpiarError();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Completa tu email y contraseña.');
      return;
    }
    limpiarError();
    await iniciarSesion(email, password);
    // La navegación la maneja el listener de auth en _layout.tsx
  };

  const handleMagicLink = async () => {
    if (!email) {
      Alert.alert('Email requerido', 'Ingresa tu email para recibir el enlace.');
      return;
    }
    limpiarError();
    await enviarMagicLink(email);
    if (!useAuthStore.getState().error) {
      setEmailEnviado('magic-link');
    }
  };

  const handleRecuperar = async () => {
    if (!email) {
      Alert.alert('Email requerido', 'Ingresa tu email para recuperar tu contraseña.');
      return;
    }
    limpiarError();
    await enviarResetContrasena(email);
    if (!useAuthStore.getState().error) {
      setEmailEnviado('recuperar');
    }
  };

  // Pantalla de confirmación tras enviar email
  if (emailEnviado) {
    const esMagicLink = emailEnviado === 'magic-link';
    return (
      <View className="flex-1 bg-fondo-app dark:bg-[#121212] items-center justify-center px-6">
        <Text className="text-5xl mb-4">{esMagicLink ? '📬' : '🔑'}</Text>
        <Text className="text-2xl font-bold text-negro dark:text-[#F0EDE8] text-center mb-2">
          ¡Revisa tu correo!
        </Text>
        <Text className="text-gris-texto dark:text-[#A0A0A0] text-center text-base leading-6">
          {esMagicLink
            ? 'Te enviamos un enlace mágico a'
            : 'Te enviamos un enlace para cambiar tu contraseña a'}
          {'\n'}
          <Text className="font-semibold text-verde">{email}</Text>
        </Text>
        <TouchableOpacity
          className="mt-8"
          onPress={() => {
            setEmailEnviado(null);
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
      className="flex-1 bg-fondo-app dark:bg-[#121212]"
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
        {/* Logo / Header */}
        <View className="items-center mb-10">
          {/* lineHeight > fontSize: emoji 🍼 tiene la tetina sobresaliendo del bbox y Android lo recortaba */}
          <Text className="text-6xl mb-3" style={{ lineHeight: 90 }}>
            🍼
          </Text>
          <Text className="text-3xl font-bold text-negro dark:text-[#F0EDE8]">Baby Bites</Text>
          <Text className="text-gris-texto dark:text-[#A0A0A0] text-base mt-1">
            Alimentación inteligente para tu bebé
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
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              accessibilityLabel="Campo de email"
              onFocus={() =>
                setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
              }
            />
          </View>

          {modo === 'login' && (
            <View>
              <Text className="text-sm font-medium text-negro dark:text-[#F0EDE8] mb-1">
                Contraseña
              </Text>
              <View className="relative">
                <TextInput
                  className="bg-white dark:bg-[#1E1E1E] border border-gris-claro dark:border-[#2A2A2A] rounded-xl px-4 py-3 text-negro dark:text-[#F0EDE8] text-base"
                  style={{ paddingRight: 48 }}
                  placeholder="Tu contraseña"
                  placeholderTextColor={c.grisTexto}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!mostrarPassword}
                  autoComplete="password"
                  accessibilityLabel="Campo de contraseña"
                  onFocus={() =>
                    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
                  }
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
          )}

          {error && <Text className="text-error text-sm text-center">{error}</Text>}

          {/* Botón principal */}
          <TouchableOpacity
            className={`rounded-xl py-4 items-center mt-2 ${cargando ? 'bg-verde/60' : 'bg-verde'}`}
            onPress={
              modo === 'login'
                ? handleLogin
                : modo === 'magic-link'
                  ? handleMagicLink
                  : handleRecuperar
            }
            disabled={cargando}
            accessibilityLabel={
              modo === 'login'
                ? 'Iniciar sesión'
                : modo === 'magic-link'
                  ? 'Enviar enlace mágico'
                  : 'Recuperar contraseña'
            }
          >
            {cargando ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                {modo === 'login'
                  ? 'Iniciar sesión'
                  : modo === 'magic-link'
                    ? 'Enviar enlace mágico'
                    : 'Recuperar contraseña'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggles de modo */}
          {modo === 'login' ? (
            <View className="gap-2 mt-1">
              <TouchableOpacity
                className="items-center py-1"
                onPress={() => cambiarModo('magic-link')}
                accessibilityLabel="Ingresar sin contraseña con enlace mágico"
              >
                <Text className="text-verde text-sm">¿Sin contraseña? Usa enlace mágico</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-center py-1"
                onPress={() => cambiarModo('recuperar')}
                accessibilityLabel="Recuperar contraseña olvidada"
              >
                <Text className="text-gris-texto dark:text-[#A0A0A0] text-sm">
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="items-center py-2"
              onPress={() => cambiarModo('login')}
              accessibilityLabel="Volver al inicio de sesión"
            >
              <Text className="text-verde text-sm">← Volver al login</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Link a registro */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gris-texto dark:text-[#A0A0A0]">¿No tienes cuenta? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity accessibilityLabel="Ir a registro">
              <Text className="text-verde font-semibold">Registrarte</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
