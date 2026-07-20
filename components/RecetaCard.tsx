import { View, Text, Pressable, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Receta } from '@/types';
import { useFavoritosStore } from '@/store/useFavoritosStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { COLOR_ETAPA, ETAPA_LABEL, getEtapaInfo } from '@/constants/Etapas';

interface RecetaCardProps {
  receta: Receta;
}

export function RecetaCard({ receta }: RecetaCardProps) {
  const c = useColoresTema();
  const { esFavorito, agregarFavorito, quitarFavorito } = useFavoritosStore();
  const perfilActivo = usePerfilStore((state) => state.perfilActivo);
  const favorito = esFavorito(receta.id);

  const etapaPrimaria = receta.etapas_compatibles[0] ?? 'inicio';
  const colorEtapa = COLOR_ETAPA[etapaPrimaria] ?? COLOR_ETAPA.inicio;
  const etapaInfo = getEtapaInfo(etapaPrimaria);

  const handleToggleFavorito = () => {
    if (favorito) {
      quitarFavorito(receta.id);
    } else {
      agregarFavorito(receta.id, receta, perfilActivo?.id);
    }
  };

  return (
    <Pressable
      onPress={() => router.push(`/receta/${receta.id}`)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
        marginBottom: 28,
      })}
    >
      {/* Imagen / fallback */}
      <View
        style={{
          width: '100%',
          aspectRatio: 4 / 3,
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: colorEtapa.bg,
          position: 'relative',
        }}
      >
        {receta.imagen_url ? (
          <Image
            source={{ uri: receta.imagen_url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 96, lineHeight: 144 }}>{etapaInfo.emoji}</Text>
          </View>
        )}

        {/* Favorito — círculo translúcido top-left */}
        <TouchableOpacity
          onPress={handleToggleFavorito}
          activeOpacity={0.7}
          hitSlop={8}
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: 'rgba(255,255,255,0.95)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <Feather
            name="heart"
            size={16}
            color={favorito ? '#E53935' : '#1A1714'}
            style={{ opacity: favorito ? 1 : 0.85 }}
          />
        </TouchableOpacity>

        {/* Badge de video — verde si el video es gratis, oscuro si es premium.
            Para un user free la vista recetas_teaser manda video_url = null en los
            premium, así que `!es_premium && video_url` identifica al video gratis. */}
        {receta.es_premium ? (
          <View
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              backgroundColor: '#1A1714',
              borderRadius: 999,
              paddingHorizontal: 11,
              paddingVertical: 5,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Feather name="video" size={11} color="#fff" />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 }}>
              VIDEO
            </Text>
          </View>
        ) : receta.video_url ? (
          <View
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              backgroundColor: c.verde,
              borderRadius: 999,
              paddingHorizontal: 11,
              paddingVertical: 5,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Feather name="play" size={11} color="#fff" />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 }}>
              VIDEO GRATIS
            </Text>
          </View>
        ) : null}
      </View>

      {/* Título */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: c.negro,
          letterSpacing: -0.3,
          lineHeight: 24,
          marginTop: 14,
        }}
        numberOfLines={2}
      >
        {receta.nombre}
      </Text>

      {/* Stats inline — mismo patrón que HeroDia */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginTop: 8,
        }}
      >
        <StatInline icon="clock" texto={`${receta.tiempo_preparacion} min`} color={c.negro} />
        <Bullet color={c.grisTexto} />
        <StatInline icon="users" texto={`${receta.porciones_base} porc.`} color={c.negro} />
        <Bullet color={c.grisTexto} />
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: colorEtapa.text,
            fontVariant: ['tabular-nums'],
          }}
        >
          {ETAPA_LABEL[etapaPrimaria]}
        </Text>
      </View>
    </Pressable>
  );
}

function StatInline({
  icon,
  texto,
  color,
}: {
  icon: keyof typeof Feather.glyphMap;
  texto: string;
  color: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Feather name={icon} size={13} color={color} />
      <Text style={{ fontSize: 13, fontWeight: '600', color, fontVariant: ['tabular-nums'] }}>
        {texto}
      </Text>
    </View>
  );
}

function Bullet({ color }: { color: string }) {
  return <Text style={{ fontSize: 12, color, marginHorizontal: 10 }}>·</Text>;
}
