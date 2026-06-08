import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useColoresTema } from '@/hooks/useColoresTema';

export default function EditarCuentaScreen() {
  const { usuario, actualizarEmail, enviarResetContrasena, cargando, error, limpiarError } =
    useAuthStore();
  const c = useColoresTema();
  const insets = useSafeAreaInsets();

  const [nuevoEmail, setNuevoEmail] = useState(usuario?.email ?? '');

  const emailCambiado = nuevoEmail !== usuario?.email && nuevoEmail.trim().length > 0;

  const guardarEmail = async () => {
    if (!emailCambiado) return;
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
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          {/* ── BOTÓN VOLVER ── */}
          <Pressable
            onPress={() => {
              limpiarError();
              router.back();
            }}
            hitSlop={12}
            style={({ pressed }) => ({
              paddingHorizontal: 24,
              paddingTop: 16,
              opacity: pressed ? 0.5 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              alignSelf: 'flex-start',
            })}
          >
            <Feather name="arrow-left" size={18} color={c.negro} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.negro }}>Volver</Text>
          </Pressable>

          {/* ── HEADER EDITORIAL ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              MI CUENTA
            </Text>
            <Text
              style={{
                fontSize: 30,
                fontWeight: '800',
                color: c.negro,
                letterSpacing: -0.6,
                lineHeight: 36,
              }}
            >
              Editar cuenta
            </Text>
            {usuario?.email && (
              <Text
                style={{ fontSize: 14, color: c.grisTexto, lineHeight: 20, marginTop: 8 }}
                numberOfLines={1}
              >
                {usuario.email}
              </Text>
            )}
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: c.cardBorde,
              marginHorizontal: 24,
              marginTop: 28,
            }}
          />

          {/* Banner de error sutil */}
          {error && (
            <View
              style={{
                marginHorizontal: 24,
                marginTop: 16,
                backgroundColor: '#FEE2E2',
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: c.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="alert-circle" size={15} color="#DC2626" />
              </View>
              <Text style={{ flex: 1, fontSize: 13, color: '#DC2626', fontWeight: '500' }}>
                {error}
              </Text>
            </View>
          )}

          {/* ── EMAIL ── */}
          <Eyebrow label="EMAIL" c={c} />
          <View style={{ paddingHorizontal: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: c.cardBorde,
              }}
            >
              <Feather name="mail" size={18} color={c.negro} style={{ opacity: 0.85 }} />
              <TextInput
                value={nuevoEmail}
                onChangeText={setNuevoEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: c.negro,
                  fontWeight: '500',
                }}
                placeholder="tu@email.com"
                placeholderTextColor={c.grisTexto}
              />
            </View>

            <TouchableOpacity
              onPress={guardarEmail}
              disabled={cargando || !emailCambiado}
              activeOpacity={0.85}
              style={{
                marginTop: 16,
                backgroundColor: emailCambiado ? c.verde : c.grisClaro,
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                shadowColor: emailCambiado ? c.verde : 'transparent',
                shadowOpacity: emailCambiado ? 0.18 : 0,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: emailCambiado ? 3 : 0,
              }}
              accessibilityLabel="Guardar nuevo email"
            >
              {cargando ? (
                <ActivityIndicator color={emailCambiado ? '#fff' : c.grisTexto} size="small" />
              ) : (
                <>
                  <Feather
                    name="check"
                    size={15}
                    color={emailCambiado ? '#fff' : c.grisTexto}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '800',
                      color: emailCambiado ? '#fff' : c.grisTexto,
                      letterSpacing: 0.2,
                    }}
                  >
                    Guardar email
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ── CONTRASEÑA ── */}
          <Eyebrow label="CONTRASEÑA" c={c} />
          <View style={{ paddingHorizontal: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
                paddingVertical: 8,
              }}
            >
              <Feather
                name="lock"
                size={18}
                color={c.negro}
                style={{ opacity: 0.85, marginTop: 2 }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: c.grisTexto,
                  lineHeight: 21,
                }}
              >
                Te enviaremos un enlace a{' '}
                <Text style={{ fontWeight: '700', color: c.negro }}>{usuario?.email}</Text> para que
                puedas cambiarla de forma segura.
              </Text>
            </View>

            <TouchableOpacity
              onPress={solicitarCambioContrasena}
              disabled={cargando}
              activeOpacity={0.85}
              style={{
                marginTop: 16,
                backgroundColor: c.card,
                borderWidth: 1.5,
                borderColor: c.verde,
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
              accessibilityLabel="Enviar enlace para cambiar contraseña"
            >
              {cargando ? (
                <ActivityIndicator color={c.verde} size="small" />
              ) : (
                <>
                  <Feather name="mail" size={15} color={c.verde} />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: c.verde,
                      letterSpacing: 0.2,
                    }}
                  >
                    Enviar enlace de cambio
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Eyebrow({ label, c }: { label: string; c: ReturnType<typeof useColoresTema> }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        color: c.grisTexto,
        letterSpacing: 2,
        textTransform: 'uppercase',
        paddingHorizontal: 24,
        marginTop: 28,
        marginBottom: 12,
      }}
    >
      {label}
    </Text>
  );
}
