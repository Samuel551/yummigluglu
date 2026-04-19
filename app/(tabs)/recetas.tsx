import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecetasStore } from '@/store/useRecetasStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { RecetaCard } from '@/components/RecetaCard';
import { MomentoDia } from '@/types';
import { useColoresTema } from '@/hooks/useColoresTema';

const MOMENTOS: { id: MomentoDia | null; label: string }[] = [
  { id: null, label: 'Todas' },
  { id: 'desayuno', label: '🌅 Desayuno' },
  { id: 'almuerzo', label: '☀️ Almuerzo' },
  { id: 'cena', label: '🌙 Cena' },
  { id: 'snack', label: '🍪 Snack' },
];

export default function RecetasScreen() {
  const c = useColoresTema();
  const { recetas, cargando, error, cargarRecetas } = useRecetasStore();
  const perfilActivo = usePerfilStore((state) => state.perfilActivo);
  const [momentoSeleccionado, setMomentoSeleccionado] = useState<MomentoDia | null>(null);

  useEffect(() => {
    cargarRecetas({
      etapa: perfilActivo?.etapa,
      momento: momentoSeleccionado ?? undefined,
      excluir_alergenos: perfilActivo?.alergias,
    });
  }, [momentoSeleccionado, perfilActivo, cargarRecetas]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      {/* Encabezado */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: c.negro }}>Recetas</Text>
        {perfilActivo && (
          <Text style={{ fontSize: 13, color: c.grisTexto, marginTop: 2 }}>
            Para {perfilActivo.avatar_emoji} {perfilActivo.nombre} · {recetas.length} disponibles
          </Text>
        )}
      </View>

      {/* Filtros por momento del día */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {MOMENTOS.map(({ id, label }) => {
            const activo = momentoSeleccionado === id;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => setMomentoSeleccionado(id)}
                activeOpacity={0.75}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  borderRadius: 20,
                  backgroundColor: activo ? c.verde : c.grisClaro,
                  borderWidth: 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: activo ? '700' : '500',
                    color: activo ? c.blanco : c.grisTexto,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista de recetas */}
      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={c.verde} />
        </View>
      ) : error ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
        >
          <Text style={{ fontSize: 32, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: c.negro, textAlign: 'center' }}>
            Error al cargar recetas
          </Text>
          <Text style={{ fontSize: 13, color: c.grisTexto, textAlign: 'center', marginTop: 6 }}>
            Revisa tu conexión e intenta de nuevo
          </Text>
          <TouchableOpacity
            onPress={() =>
              cargarRecetas({
                etapa: perfilActivo?.etapa,
                momento: momentoSeleccionado ?? undefined,
                excluir_alergenos: perfilActivo?.alergias,
              })
            }
            style={{
              marginTop: 16,
              backgroundColor: c.verde,
              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: c.blanco, fontWeight: '600' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : recetas.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
        >
          <Text style={{ fontSize: 32, marginBottom: 12 }}>🔍</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: c.negro, textAlign: 'center' }}>
            Sin recetas para este filtro
          </Text>
          <Text style={{ fontSize: 13, color: c.grisTexto, textAlign: 'center', marginTop: 6 }}>
            Prueba otro momento del día o revisa el perfil activo
          </Text>
        </View>
      ) : (
        <FlatList
          data={recetas}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => <RecetaCard receta={item} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
