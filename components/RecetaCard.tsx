import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Receta } from '@/types';
import { useFavoritosStore } from '@/store/useFavoritosStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { COLOR_ETAPA, ETAPA_BADGE } from '@/constants/Etapas';

// Emoji representativo según tags de la receta
function resolverEmoji(receta: Receta): string {
  if (receta.slug.includes('pasta')) return '🍝';
  if (receta.slug.includes('arroz')) return '🍚';
  if (receta.slug.includes('pollo')) return '🍗';
  if (receta.slug.includes('lentejas')) return '🥣';
  if (receta.slug.includes('yogur')) return '🥛';
  if (receta.slug.includes('avena') || receta.slug.includes('pancito')) return '🥞';
  if (receta.slug.includes('omelette')) return '🍳';
  if (receta.slug.includes('batata') || receta.slug.includes('zapallo')) return '🥕';
  if (receta.slug.includes('manzana') || receta.slug.includes('compota')) return '🍎';
  if (receta.slug.includes('milanesa')) return '🥩';
  return '🍲';
}

interface RecetaCardProps {
  receta: Receta;
  horizontal?: boolean; // Modo horizontal para scroll del home
}

export function RecetaCard({ receta, horizontal = false }: RecetaCardProps) {
  const c = useColoresTema();
  const { esFavorito, agregarFavorito, quitarFavorito } = useFavoritosStore();
  const perfilActivo = usePerfilStore((state) => state.perfilActivo);
  const favorito = esFavorito(receta.id);

  const etapaPrimaria = receta.etapas_compatibles[0] ?? 'inicio';
  const color = COLOR_ETAPA[etapaPrimaria] ?? COLOR_ETAPA.inicio;

  const handleToggleFavorito = (e: { stopPropagation?: () => void }) => {
    e.stopPropagation?.();
    if (favorito) {
      quitarFavorito(receta.id);
    } else {
      agregarFavorito(receta.id, receta, perfilActivo?.id);
    }
  };

  const handlePress = () => {
    router.push(`/receta/${receta.id}`);
  };

  if (horizontal) {
    // Card compacta para el scroll horizontal del home
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={{
          width: 160,
          backgroundColor: c.card,
          borderRadius: 16,
          marginRight: 12,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Encabezado coloreado */}
        <View
          style={{
            backgroundColor: color.bg,
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 36 }}>{resolverEmoji(receta)}</Text>
          {/* Corazón favorito */}
          <TouchableOpacity
            onPress={handleToggleFavorito}
            activeOpacity={0.7}
            style={{ position: 'absolute', top: 6, left: 6, padding: 4 }}
          >
            <Text style={{ fontSize: 16 }}>{favorito ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          {receta.es_premium && (
            <View
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                backgroundColor: '#F59E0B',
                borderRadius: 8,
                paddingHorizontal: 5,
                paddingVertical: 1,
              }}
            >
              <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>PREMIUM</Text>
            </View>
          )}
        </View>

        <View style={{ padding: 10 }}>
          <Text
            style={{ fontSize: 12, fontWeight: '600', color: c.negro, marginBottom: 4 }}
            numberOfLines={2}
          >
            {receta.nombre}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 10, color: c.grisTexto }}>
              ⏱ {receta.tiempo_preparacion}min
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Card completa para el catálogo
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={{
        backgroundColor: c.card,
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Encabezado coloreado */}
      <View
        style={{
          backgroundColor: color.bg,
          height: 100,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 44 }}>{resolverEmoji(receta)}</Text>
        {/* Corazón favorito */}
        <TouchableOpacity
          onPress={handleToggleFavorito}
          activeOpacity={0.7}
          style={{ position: 'absolute', top: 8, left: 10, padding: 4 }}
        >
          <Text style={{ fontSize: 20 }}>{favorito ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        {receta.es_premium && (
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: '#F59E0B',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Text style={{ fontSize: 10 }}>👑</Text>
            <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>PREMIUM</Text>
          </View>
        )}
      </View>

      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: c.negro, marginBottom: 4 }}>
          {receta.nombre}
        </Text>
        <Text
          style={{ fontSize: 12, color: c.grisTexto, marginBottom: 10, lineHeight: 17 }}
          numberOfLines={2}
        >
          {receta.descripcion}
        </Text>

        {/* Info row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 11, color: c.grisTexto }}>
            ⏱ {receta.tiempo_preparacion} min
          </Text>
          <Text style={{ fontSize: 11, color: c.grisTexto }}>🍽️ {receta.porciones_base} porc.</Text>
          {receta.etapas_compatibles.map((etapa) => (
            <View
              key={etapa}
              style={{
                backgroundColor: COLOR_ETAPA[etapa]?.bg ?? '#F5F5F4',
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: COLOR_ETAPA[etapa]?.text ?? '#78716C',
                  fontWeight: '600',
                }}
              >
                {ETAPA_BADGE[etapa]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}
