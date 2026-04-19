import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useTemaStore } from '@/store/useTemaStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { formatearEdad } from '@/constants/Etapas';

export default function PerfilScreen() {
  const c = useColoresTema();
  const setTema = useTemaStore((s) => s.setTema);
  const { usuario, cerrarSesion, cargando } = useAuthStore();
  const { perfiles, perfilActivo, setPerfilActivo } = usePerfilStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: c.negro, marginBottom: 20 }}>
          Mi cuenta
        </Text>

        {/* Sección cuenta */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: c.grisTexto,
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          CUENTA
        </Text>
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 16,
            marginBottom: 24,
            overflow: 'hidden',
          }}
        >
          <TouchableOpacity
            onPress={() => router.push('/editar-cuenta')}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: c.cardBorde,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: c.grisTexto, marginBottom: 2 }}>Email</Text>
              <Text style={{ fontSize: 15, color: c.negro, fontWeight: '500' }}>
                {usuario?.email}
              </Text>
            </View>
            <Text style={{ fontSize: 18, color: c.isDark ? '#555' : '#C7C4C0' }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/editar-cuenta')}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: c.grisTexto, marginBottom: 2 }}>Contraseña</Text>
              <Text style={{ fontSize: 15, color: c.negro, fontWeight: '500' }}>••••••••</Text>
            </View>
            <Text style={{ fontSize: 18, color: c.isDark ? '#555' : '#C7C4C0' }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sección perfiles */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: c.grisTexto, letterSpacing: 0.8 }}>
            PERFILES ({perfiles.length}/2 EN PLAN FREE)
          </Text>
        </View>

        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 16,
            marginBottom: 12,
            overflow: 'hidden',
          }}
        >
          {perfiles.map((p, idx) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => router.push(`/editar-perfil/${p.id}`)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                borderBottomWidth: idx < perfiles.length - 1 ? 1 : 0,
                borderBottomColor: c.cardBorde,
              }}
            >
              {/* Avatar */}
              <TouchableOpacity
                onPress={() => setPerfilActivo(p)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: perfilActivo?.id === p.id ? c.verdeClaro : c.grisClaro,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  borderWidth: perfilActivo?.id === p.id ? 2 : 0,
                  borderColor: c.verde,
                }}
              >
                <Text style={{ fontSize: 22 }}>{p.avatar_emoji}</Text>
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '600', color: c.negro }}>
                  {p.nombre}
                </Text>
                <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 1 }}>
                  {formatearEdad(p.fecha_nacimiento)}
                </Text>
              </View>

              {perfilActivo?.id === p.id && (
                <View
                  style={{
                    backgroundColor: c.verdeClaro,
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontSize: 11, color: c.verde, fontWeight: '600' }}>Activo</Text>
                </View>
              )}
              <Text style={{ fontSize: 18, color: c.isDark ? '#555' : '#C7C4C0' }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Accesos rápidos por perfil */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: c.grisTexto,
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          HERRAMIENTAS
        </Text>
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 16,
            marginBottom: 24,
            overflow: 'hidden',
          }}
        >
          {perfiles.map((p, idx) => (
            <TouchableOpacity
              key={`diario-${p.id}`}
              onPress={() => router.push(`/diario/${p.id}`)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: idx < perfiles.length - 1 ? 1 : 0,
                borderBottomColor: c.cardBorde,
              }}
            >
              <Text style={{ fontSize: 22, marginRight: 12 }}>📔</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: c.negro }}>
                  Diario de alimentos
                </Text>
                <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 1 }}>
                  {p.avatar_emoji} {p.nombre}
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: c.isDark ? '#555' : '#C7C4C0' }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sección apariencia */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: c.grisTexto,
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          APARIENCIA
        </Text>
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 16,
            marginBottom: 24,
            overflow: 'hidden',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <Text style={{ fontSize: 22, marginRight: 12 }}>{c.isDark ? '🌙' : '☀️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: c.negro }}>Modo oscuro</Text>
              <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 1 }}>
                {c.isDark ? 'Activado' : 'Desactivado'}
              </Text>
            </View>
            <Switch
              value={c.isDark}
              onValueChange={(val) => setTema(val ? 'dark' : 'light')}
              trackColor={{ false: '#D1D5DB', true: c.verde }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Agregar hijo */}
        {perfiles.length < 2 && (
          <TouchableOpacity
            onPress={() => router.push('/onboarding')}
            activeOpacity={0.8}
            style={{
              backgroundColor: c.card,
              borderRadius: 16,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginBottom: 32,
              borderWidth: 1.5,
              borderColor: c.verde,
              borderStyle: 'dashed',
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: c.verdeClaro,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 22 }}>+</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '600', color: c.verde }}>
              Agregar otro hijo
            </Text>
          </TouchableOpacity>
        )}

        {/* Panel admin */}
        <TouchableOpacity
          onPress={() => router.push('/admin')}
          activeOpacity={0.8}
          style={{
            backgroundColor: c.negro,
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            marginBottom: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 16 }}>🔐</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: c.blanco }}>Panel Admin</Text>
        </TouchableOpacity>

        {/* Cerrar sesión */}
        <TouchableOpacity
          onPress={cerrarSesion}
          disabled={cargando}
          activeOpacity={0.8}
          style={{
            backgroundColor: c.card,
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#FCA5A5',
          }}
        >
          {cargando ? (
            <ActivityIndicator color="#DC2626" />
          ) : (
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#DC2626' }}>Cerrar sesión</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
