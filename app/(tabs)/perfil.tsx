import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { usePerfilStore } from '@/store/usePerfilStore';

/**
 * Pantalla Perfil — Base funcional. Fase 1 agrega el CRUD completo de perfiles.
 */
export default function PerfilScreen() {
  const { usuario, cerrarSesion, cargando } = useAuthStore();
  const { perfiles, perfilActivo } = usePerfilStore();

  return (
    <SafeAreaView className="flex-1 bg-fondo-app">
      <View className="flex-1 px-5 pt-6">
        <Text className="text-2xl font-bold text-negro mb-6">Mi cuenta</Text>

        {/* Email del usuario */}
        <View className="bg-white rounded-card p-4 mb-4 shadow-sm">
          <Text className="text-xs text-gris-texto uppercase font-medium mb-1">Email</Text>
          <Text className="text-negro font-medium">{usuario?.email}</Text>
        </View>

        {/* Perfiles de hijos */}
        <View className="bg-white rounded-card p-4 mb-4 shadow-sm">
          <Text className="text-xs text-gris-texto uppercase font-medium mb-2">
            Perfiles ({perfiles.length}/2 en plan Free)
          </Text>
          {perfiles.length === 0 ? (
            <Text className="text-gris-texto text-sm">
              Todavía no creaste ningún perfil — disponible en Fase 1
            </Text>
          ) : (
            perfiles.map((p) => (
              <View key={p.id} className="flex-row items-center py-2">
                <Text className="text-2xl mr-3">{p.avatar_emoji}</Text>
                <View>
                  <Text className="font-medium text-negro">{p.nombre}</Text>
                  <Text className="text-xs text-gris-texto">{p.etapa}</Text>
                </View>
                {perfilActivo?.id === p.id && (
                  <View className="ml-auto bg-verde-claro px-2 py-1 rounded-full">
                    <Text className="text-verde text-xs font-medium">Activo</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity
          className="bg-white border border-error rounded-card py-4 items-center mt-auto mb-4"
          onPress={cerrarSesion}
          disabled={cargando}
          accessibilityLabel="Cerrar sesión"
        >
          {cargando ? (
            <ActivityIndicator color="#E53935" />
          ) : (
            <Text className="text-error font-semibold">Cerrar sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
