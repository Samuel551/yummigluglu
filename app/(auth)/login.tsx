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
import { Feather, AntDesign } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useColoresTema } from '@/hooks/useColoresTema';

type ModoLogin = 'login' | 'magic-link' | 'recuperar';

type FeatherIcon = keyof typeof Feather.glyphMap;

const ICONO_ACCION: Record<ModoLogin, FeatherIcon> = {
  login: 'log-in',
  'magic-link': 'mail',
  recuperar: 'key',
};

const LABEL_ACCION: Record<ModoLogin, string> = {
  login: 'Iniciar sesión',
  'magic-link': 'Enviar enlace mágico',
  recuperar: 'Recuperar contraseña',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [modo, setModo] = useState<ModoLogin>('login');
  const [emailEnviado, setEmailEnviado] = useState<'magic-link' | 'recuperar' | null>(null);

  const {
    iniciarSesion,
    enviarMagicLink,
    enviarResetContrasena,
    iniciarSesionConGoogle,
    cargando,
    error,
    limpiarError,
  } = useAuthStore();
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

  const handleGoogle = async () => {
    limpiarError();
    await iniciarSesionConGoogle();
    // La navegación la maneja el listener de auth en _layout.tsx
  };

  const onSubmit =
    modo === 'login' ? handleLogin : modo === 'magic-link' ? handleMagicLink : handleRecuperar;

  // Pantalla de confirmación tras enviar email
  if (emailEnviado) {
    const esMagicLink = emailEnviado === 'magic-link';
    return (
      <View
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
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: c.verdeClaro,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Feather name={esMagicLink ? 'mail' : 'key'} size={30} color={c.verde} />
        </View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '800',
            color: c.negro,
            letterSpacing: -0.5,
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          Revisa tu correo
        </Text>
        <Text style={{ fontSize: 15, color: c.grisTexto, textAlign: 'center', lineHeight: 22 }}>
          {esMagicLink
            ? 'Te enviamos un enlace mágico a'
            : 'Te enviamos un enlace para cambiar tu contraseña a'}
          {'\n'}
          <Text style={{ fontWeight: '700', color: c.verde }}>{email}</Text>
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 28,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 8,
          }}
          onPress={() => {
            setEmailEnviado(null);
            limpiarError();
          }}
          accessibilityLabel="Volver al inicio de sesión"
        >
          <Feather name="arrow-left" size={18} color={c.verde} />
          <Text style={{ fontSize: 15, fontWeight: '600', color: c.verde }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.fondoApp }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
    >
      <ScrollView
        ref={scrollRef}
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
        {/* Logo / Header */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          {/* lineHeight > fontSize: el emoji 🍼 tiene la tetina sobresaliendo del bbox y Android lo recortaba */}
          <Text style={{ fontSize: 60, marginBottom: 12, lineHeight: 90 }}>🍼</Text>
          <Text style={{ fontSize: 30, fontWeight: '800', color: c.negro, letterSpacing: -0.6 }}>
            Yummi Glu Glu
          </Text>
          <Text style={{ fontSize: 15, color: c.grisTexto, marginTop: 6 }}>
            Alimentación inteligente para tu bebé
          </Text>
        </View>

        {/* Formulario */}
        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: c.negro, marginBottom: 8 }}>
              Email
            </Text>
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
              }}
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
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.negro, marginBottom: 8 }}>
                Contraseña
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
                  style={{ position: 'absolute', right: 14, padding: 4 }}
                  hitSlop={8}
                  onPress={() => setMostrarPassword((v) => !v)}
                  accessibilityLabel={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <Feather
                    name={mostrarPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={c.grisTexto}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {error && (
            <Text style={{ fontSize: 13, color: c.error, textAlign: 'center' }}>{error}</Text>
          )}

          {/* Botón principal */}
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
            onPress={onSubmit}
            disabled={cargando}
            accessibilityLabel={LABEL_ACCION[modo]}
          >
            {cargando ? (
              <ActivityIndicator color={c.grisTexto} size="small" />
            ) : (
              <>
                <Feather name={ICONO_ACCION[modo]} size={18} color={c.blanco} />
                <Text
                  style={{ color: c.blanco, fontWeight: '800', fontSize: 15, letterSpacing: 0.3 }}
                >
                  {LABEL_ACCION[modo]}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Continuar con Google — solo en modo login */}
          {modo === 'login' && (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 4,
                  marginBottom: 2,
                }}
              >
                <View style={{ flex: 1, height: 1, backgroundColor: c.cardBorde }} />
                <Text style={{ fontSize: 13, color: c.grisTexto, marginHorizontal: 12 }}>o</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: c.cardBorde }} />
              </View>

              <TouchableOpacity
                style={{
                  borderRadius: 999,
                  paddingVertical: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 10,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.cardBorde,
                }}
                activeOpacity={0.85}
                onPress={handleGoogle}
                disabled={cargando}
                accessibilityLabel="Continuar con Google"
              >
                <AntDesign name="google" size={18} color="#DB4437" />
                <Text style={{ color: c.negro, fontWeight: '700', fontSize: 15 }}>
                  Continuar con Google
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Toggles de modo */}
          {modo === 'login' ? (
            <View style={{ gap: 4, marginTop: 4 }}>
              <TouchableOpacity
                style={{ alignItems: 'center', paddingVertical: 6 }}
                onPress={() => cambiarModo('magic-link')}
                accessibilityLabel="Ingresar sin contraseña con enlace mágico"
              >
                <Text style={{ fontSize: 14, color: c.verde, fontWeight: '600' }}>
                  ¿Sin contraseña? Usa enlace mágico
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ alignItems: 'center', paddingVertical: 6 }}
                onPress={() => cambiarModo('recuperar')}
                accessibilityLabel="Recuperar contraseña olvidada"
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: c.verde,
                    fontWeight: '600',
                    textDecorationLine: 'underline',
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 8,
              }}
              onPress={() => cambiarModo('login')}
              accessibilityLabel="Volver al inicio de sesión"
            >
              <Feather name="arrow-left" size={16} color={c.verde} />
              <Text style={{ fontSize: 14, color: c.verde, fontWeight: '600' }}>
                Volver al login
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Link a registro */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
          <Text style={{ fontSize: 14, color: c.grisTexto }}>¿No tienes cuenta? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity accessibilityLabel="Ir a registro">
              <Text
                style={{
                  fontSize: 14,
                  color: c.verde,
                  fontWeight: '700',
                  textDecorationLine: 'underline',
                }}
              >
                Registrarte
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
