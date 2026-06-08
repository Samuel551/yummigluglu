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

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  const { registrarse, iniciarSesionConGoogle, cargando, error, limpiarError } = useAuthStore();
  const c = useColoresTema();
  const scrollRef = useRef<ScrollView>(null);

  const handleGoogle = async () => {
    limpiarError();
    await iniciarSesionConGoogle();
    // La navegación la maneja el listener de auth en _layout.tsx
  };

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
          <Feather name="mail" size={30} color={c.verde} />
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
          Te enviamos un enlace de confirmación a{'\n'}
          <Text style={{ fontWeight: '700', color: c.verde }}>{email}</Text>
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity
            style={{
              marginTop: 28,
              backgroundColor: c.verde,
              borderRadius: 999,
              paddingHorizontal: 28,
              paddingVertical: 15,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
            activeOpacity={0.85}
            accessibilityLabel="Ir al inicio de sesión"
          >
            <Feather name="log-in" size={18} color={c.blanco} />
            <Text style={{ color: c.blanco, fontWeight: '800', fontSize: 15 }}>Ir al login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
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
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <Text style={{ fontSize: 60, marginBottom: 12, lineHeight: 90 }}>🌱</Text>
            <Text style={{ fontSize: 30, fontWeight: '800', color: c.negro, letterSpacing: -0.6 }}>
              Crear cuenta
            </Text>
            <Text style={{ fontSize: 15, color: c.grisTexto, marginTop: 6, textAlign: 'center' }}>
              Comienza el viaje alimentario de tu bebé
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
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={c.grisTexto}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!mostrarPassword}
                  autoComplete="new-password"
                  accessibilityLabel="Campo de contraseña"
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
                  onFocus={() =>
                    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
                  }
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 14, padding: 4 }}
                  hitSlop={8}
                  onPress={() => setMostrarConfirm((v) => !v)}
                  accessibilityLabel={
                    mostrarConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'
                  }
                >
                  <Feather
                    name={mostrarConfirm ? 'eye-off' : 'eye'}
                    size={20}
                    color={c.grisTexto}
                  />
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
              onPress={handleRegister}
              disabled={cargando}
              accessibilityLabel="Crear cuenta"
            >
              {cargando ? (
                <ActivityIndicator color={c.grisTexto} size="small" />
              ) : (
                <>
                  <Feather name="user-plus" size={18} color={c.blanco} />
                  <Text
                    style={{ color: c.blanco, fontWeight: '800', fontSize: 15, letterSpacing: 0.3 }}
                  >
                    Crear cuenta
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Continuar con Google */}
            <View
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 2 }}
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
          </View>

          {/* Link a login */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ fontSize: 14, color: c.grisTexto }}>¿Ya tienes cuenta? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity accessibilityLabel="Ir a inicio de sesión">
                <Text
                  style={{
                    fontSize: 14,
                    color: c.verde,
                    fontWeight: '700',
                    textDecorationLine: 'underline',
                  }}
                >
                  Inicia sesión
                </Text>
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
              borderRadius: 20,
              paddingHorizontal: 32,
              paddingVertical: 28,
              alignItems: 'center',
              gap: 14,
              minWidth: 240,
            }}
          >
            <ActivityIndicator size="large" color={c.verde} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.negro, textAlign: 'center' }}>
              Creando tu cuenta...
            </Text>
            <Text style={{ fontSize: 13, color: c.grisTexto, textAlign: 'center' }}>
              Enviando correo de confirmación
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
