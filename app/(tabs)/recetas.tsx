import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useRecetasStore } from '@/store/useRecetasStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { usePaisStore } from '@/store/usePaisStore';
import { useFavoritosStore } from '@/store/useFavoritosStore';
import { RecetaCard } from '@/components/RecetaCard';
import { MomentoDia } from '@/types';
import { useColoresTema } from '@/hooks/useColoresTema';

const MOMENTOS_VALIDOS: MomentoDia[] = ['desayuno', 'almuerzo', 'cena', 'snack'];

const MOMENTOS: { id: MomentoDia | null; label: string }[] = [
  { id: null, label: 'Todas' },
  { id: 'desayuno', label: 'Desayuno' },
  { id: 'almuerzo', label: 'Almuerzo' },
  { id: 'snack', label: 'Snack' },
  { id: 'cena', label: 'Cena' },
];

export default function RecetasScreen() {
  const c = useColoresTema();
  const params = useLocalSearchParams<{ momento?: string }>();
  const { recetas, cargando, error, cargarRecetas } = useRecetasStore();
  const perfilActivo = usePerfilStore((state) => state.perfilActivo);
  const pais = usePaisStore((s) => s.pais);
  const recetasFavoritas = useFavoritosStore((s) => s.recetasFavoritas);
  const [momentoSeleccionado, setMomentoSeleccionado] = useState<MomentoDia | null>(null);
  const [soloFavoritos, setSoloFavoritos] = useState(false);

  // Si llegamos con ?momento=desayuno desde Inicio, aplicar el filtro
  useEffect(() => {
    if (params.momento && MOMENTOS_VALIDOS.includes(params.momento as MomentoDia)) {
      setMomentoSeleccionado(params.momento as MomentoDia);
    }
  }, [params.momento]);

  useEffect(() => {
    cargarRecetas({
      etapa: perfilActivo?.etapa,
      momento: momentoSeleccionado ?? undefined,
      excluir_alergenos: perfilActivo?.alergias,
      pais,
    });
  }, [momentoSeleccionado, perfilActivo, pais, cargarRecetas]);

  // Filtro en memoria por favoritos (se cruza con momento si ambos están activos)
  const recetasMostradas = useMemo(() => {
    if (!soloFavoritos) return recetas;
    const idsFavoritos = new Set(recetasFavoritas.map((r) => r.id));
    return recetas.filter((r) => idsFavoritos.has(r.id));
  }, [recetas, soloFavoritos, recetasFavoritas]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <FlatList
        data={recetasMostradas}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <RecetaCard receta={item} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* ── ENCABEZADO EDITORIAL ── */}
            <View style={{ paddingTop: 20 }}>
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
                CATÁLOGO · {recetas.length} RECETAS
              </Text>

              {perfilActivo ? (
                <>
                  <Text
                    style={{
                      fontSize: 30,
                      fontWeight: '800',
                      color: c.negro,
                      letterSpacing: -0.6,
                      lineHeight: 36,
                    }}
                  >
                    Para{' '}
                    <Text style={{ color: c.verde }}>{perfilActivo.nombre}</Text>{' '}
                    <Text style={{ fontSize: 28, lineHeight: 42 }}>
                      {perfilActivo.avatar_emoji}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: c.grisTexto,
                      lineHeight: 20,
                      marginTop: 8,
                    }}
                  >
                    {soloFavoritos
                      ? `${recetasMostradas.length} ${recetasMostradas.length === 1 ? 'favorita' : 'favoritas'}`
                      : `${recetasMostradas.length} ${recetasMostradas.length === 1 ? 'receta disponible' : 'recetas disponibles'} para esta etapa`}
                  </Text>
                </>
              ) : (
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: '800',
                    color: c.negro,
                    letterSpacing: -0.6,
                    lineHeight: 36,
                  }}
                >
                  Recetas
                </Text>
              )}
            </View>

            {/* Separador */}
            <View
              style={{
                height: 1,
                backgroundColor: c.cardBorde,
                marginTop: 28,
                marginBottom: 20,
              }}
            />

            {/* ── FILTROS — pills outline → fill negro ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 24, gap: 8 }}
              style={{ marginHorizontal: -24, paddingLeft: 24, marginBottom: 24 }}
            >
              {MOMENTOS.map(({ id, label }) => {
                const activo = momentoSeleccionado === id;
                return (
                  <FiltroPill
                    key={label}
                    label={label}
                    activo={activo}
                    onPress={() => setMomentoSeleccionado(id)}
                  />
                );
              })}

              {/* Separador vertical sutil */}
              <View
                style={{
                  width: 1,
                  backgroundColor: c.cardBorde,
                  marginVertical: 4,
                  marginHorizontal: 4,
                }}
              />

              <FiltroPill
                label="Favoritos"
                icon="heart"
                activo={soloFavoritos}
                onPress={() => setSoloFavoritos((v) => !v)}
              />
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          cargando ? (
            <View style={{ paddingVertical: 60, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={c.verde} />
            </View>
          ) : error ? (
            <EmptyState
              icon="alert-triangle"
              titulo="Error al cargar recetas"
              mensaje="Revisa tu conexión e intenta de nuevo"
              accion={{
                label: 'Reintentar',
                onPress: () =>
                  cargarRecetas({
                    etapa: perfilActivo?.etapa,
                    momento: momentoSeleccionado ?? undefined,
                    excluir_alergenos: perfilActivo?.alergias,
                    pais,
                  }),
              }}
            />
          ) : (
            <EmptyState
              icon={soloFavoritos ? 'heart' : 'search'}
              titulo={soloFavoritos ? 'Aún no tienes favoritos' : 'Sin recetas para este filtro'}
              mensaje={
                soloFavoritos
                  ? 'Toca el corazón en cualquier receta para guardarla aquí'
                  : 'Prueba otro momento del día o revisa el perfil activo'
              }
            />
          )
        }
      />
    </SafeAreaView>
  );
}

// ─── FiltroPill — mismo patrón que MomentoPill del Inicio ─────────────────────

function FiltroPill({
  label,
  icon,
  activo,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  activo: boolean;
  onPress: () => void;
}) {
  const c = useColoresTema();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: activo ? c.negro : c.cardBorde,
        backgroundColor: activo ? c.negro : c.card,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {icon && (
        <Feather
          name={icon}
          size={13}
          color={activo ? c.fondoApp : c.negro}
        />
      )}
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: activo ? c.fondoApp : c.negro,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  titulo,
  mensaje,
  accion,
}: {
  icon: keyof typeof Feather.glyphMap;
  titulo: string;
  mensaje: string;
  accion?: { label: string; onPress: () => void };
}) {
  const c = useColoresTema();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: c.grisClaro,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Feather name={icon} size={26} color={c.grisTexto} />
      </View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: c.negro,
          textAlign: 'center',
          letterSpacing: -0.2,
        }}
      >
        {titulo}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: c.grisTexto,
          textAlign: 'center',
          marginTop: 6,
          lineHeight: 19,
          maxWidth: 280,
        }}
      >
        {mensaje}
      </Text>
      {accion && (
        <TouchableOpacity
          onPress={accion.onPress}
          activeOpacity={0.7}
          style={{
            marginTop: 18,
            backgroundColor: c.negro,
            paddingHorizontal: 22,
            paddingVertical: 11,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: c.fondoApp,
              fontWeight: '700',
              fontSize: 13,
              letterSpacing: 0.2,
            }}
          >
            {accion.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
