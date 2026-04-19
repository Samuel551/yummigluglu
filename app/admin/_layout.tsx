import { Stack } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminStore } from '@/store/useAdminStore';

export default function AdminLayout() {
  const { autenticado, autenticar } = useAdminStore();
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (autenticado) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    );
  }

  const intentar = async () => {
    if (!password.trim()) return;
    setCargando(true);
    setError(null);
    const ok = await autenticar(password);
    setCargando(false);
    if (!ok) {
      setError('Contraseña incorrecta.');
      setPassword('');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
      >
        <Text style={{ fontSize: 52, marginBottom: 16 }}>🔐</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1C1917', marginBottom: 8 }}>
          Panel Admin
        </Text>
        <Text style={{ fontSize: 14, color: '#78716C', textAlign: 'center', marginBottom: 32 }}>
          Acceso restringido. Ingresa tu contraseña de administrador.
        </Text>

        <TextInput
          style={{
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            borderWidth: 1.5,
            borderColor: error ? '#FCA5A5' : '#EEEBE6',
            marginBottom: 12,
            color: '#1C1917',
          }}
          placeholder="Contraseña"
          placeholderTextColor="#A8A29E"
          secureTextEntry
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (error) setError(null);
          }}
          onSubmitEditing={intentar}
          autoFocus
          accessibilityLabel="Contraseña admin"
        />

        {error && (
          <Text
            style={{ color: '#DC2626', fontSize: 13, marginBottom: 12, alignSelf: 'flex-start' }}
          >
            {error}
          </Text>
        )}

        <TouchableOpacity
          onPress={intentar}
          disabled={cargando || !password.trim()}
          style={{
            width: '100%',
            backgroundColor: password.trim() ? '#1C1917' : '#EEEBE6',
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          activeOpacity={0.8}
          accessibilityLabel="Entrar al panel admin"
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: password.trim() ? '#fff' : '#A8A29E',
                fontWeight: '700',
                fontSize: 16,
              }}
            >
              Entrar
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
