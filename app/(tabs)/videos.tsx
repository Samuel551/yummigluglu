import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { COLOR_ETAPA, ETAPA_LABEL } from '@/constants/Etapas';
import { EtapaAlimentaria } from '@/types';
import { extraerVideoId, urlThumbnail } from '@/lib/youtube';

interface RecetaConVideo {
  id: string;
  nombre: string;
  video_url: string;
  etapas_compatibles: EtapaAlimentaria[];
  es_premium: boolean;
  tiempo_preparacion: number;
}

type FeatherIcon = keyof typeof Feather.glyphMap;

// ─── Vista para usuarios premium ─────────────────────────────
function VistaPremium() {
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const { perfilActivo } = usePerfilStore();
  const [recetas, setRecetas] = useState<RecetaConVideo[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      let query = supabase
        .from('recetas')
        .select('id, nombre, video_url, etapas_compatibles, es_premium, tiempo_preparacion')
        .eq('activa', true)
        .not('video_url', 'is', null);

      if (perfilActivo?.etapa) {
        query = query.contains('etapas_compatibles', [perfilActivo.etapa]);
      }

      const { data } = await query.order('created_at', { ascending: false });
      setRecetas((data as RecetaConVideo[]) ?? []);
      setCargando(false);
    };
    cargar();
  }, [perfilActivo?.etapa]);

  const eyebrow = perfilActivo?.etapa
    ? `VIDEOS · ${ETAPA_LABEL[perfilActivo.etapa].toUpperCase()}`
    : 'VIDEOS';

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
        >
          {/* ── HEADER EDITORIAL ── */}
          <View style={{ paddingTop: 20, marginBottom: 28 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                marginBottom: 10,
              }}
            >
              {eyebrow}
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
              Videos paso a paso
            </Text>
            <Text style={{ fontSize: 15, color: c.grisTexto, lineHeight: 22, marginTop: 10 }}>
              Mira la preparación completa de cada receta en clips cortos y claros.
            </Text>
          </View>

          {cargando ? (
            <View style={{ paddingVertical: 80, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={c.verde} />
            </View>
          ) : recetas.length === 0 ? (
            <EstadoVacio c={c} />
          ) : (
            recetas.map((receta) => {
              const videoId = extraerVideoId(receta.video_url);
              if (!videoId) return null;
              return <CardVideo key={receta.id} receta={receta} videoId={videoId} c={c} />;
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Card de un video ────────────────────────────────────────
function CardVideo({
  receta,
  videoId,
  c,
}: {
  receta: RecetaConVideo;
  videoId: string;
  c: ReturnType<typeof useColoresTema>;
}) {
  const etapaPrimaria = receta.etapas_compatibles[0] ?? 'inicio';
  const colorEtapa = COLOR_ETAPA[etapaPrimaria] ?? COLOR_ETAPA.inicio;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/receta/${receta.id}`)}
      activeOpacity={0.9}
      style={{ marginBottom: 28 }}
    >
      {/* Thumbnail con overlay play */}
      <View
        style={{
          width: '100%',
          aspectRatio: 16 / 9,
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: colorEtapa.bg,
          position: 'relative',
        }}
      >
        <Image
          source={{ uri: urlThumbnail(videoId) }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: 'rgba(255,255,255,0.95)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.18,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }}
          >
            <Feather name="play" size={24} color="#1A1714" style={{ marginLeft: 3 }} />
          </View>
        </View>
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

      {/* Meta inline */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Feather name="clock" size={13} color={c.negro} />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: c.negro,
              fontVariant: ['tabular-nums'],
            }}
          >
            {receta.tiempo_preparacion} min
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: c.grisTexto, marginHorizontal: 10 }}>·</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colorEtapa.text }}>
          {ETAPA_LABEL[etapaPrimaria]}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Estado vacío canónico ───────────────────────────────────
function EstadoVacio({ c }: { c: ReturnType<typeof useColoresTema> }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 60, gap: 14 }}>
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: c.grisClaro,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name="film" size={26} color={c.grisTexto} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '700', color: c.negro }}>Próximamente</Text>
      <Text style={{ fontSize: 13, color: c.grisTexto, textAlign: 'center', lineHeight: 20 }}>
        Estamos preparando los videos paso a paso.{'\n'}Vuelve pronto para verlos.
      </Text>
    </View>
  );
}

// ─── Vista paywall para usuarios free ────────────────────────
const BENEFICIOS_VIDEOS: { icon: FeatherIcon; titulo: string; descripcion: string }[] = [
  {
    icon: 'play-circle',
    titulo: 'Videos cortos por receta',
    descripcion: 'Mira la preparación completa en clips paso a paso, claros y al grano.',
  },
  {
    icon: 'award',
    titulo: 'Técnica pensada para bebés',
    descripcion: 'Texturas, cortes y porciones seguras según la etapa de tu hijo.',
  },
  {
    icon: 'refresh-cw',
    titulo: 'Contenido nuevo cada semana',
    descripcion: 'Sumamos videos y recetas de forma constante para que nunca te aburras.',
  },
];

function VistaPaywall() {
  const c = useColoresTema();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
        >
          {/* ── HEADER EDITORIAL ── */}
          <View style={{ paddingTop: 20 }}>
            <View
              style={{
                backgroundColor: '#1A1714',
                borderRadius: 999,
                paddingHorizontal: 11,
                paddingVertical: 5,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                alignSelf: 'flex-start',
                marginBottom: 16,
              }}
            >
              <Feather name="star" size={11} color="#fff" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 }}>
                PREMIUM
              </Text>
            </View>

            <Text
              style={{
                fontSize: 30,
                fontWeight: '800',
                color: c.negro,
                letterSpacing: -0.6,
                lineHeight: 36,
              }}
            >
              Videos paso a paso
            </Text>
            <Text style={{ fontSize: 15, color: c.grisTexto, lineHeight: 22, marginTop: 12 }}>
              Aprende a preparar cada receta con videos cortos y claros, pensados para la
              alimentación de tu bebé.
            </Text>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: c.cardBorde,
              marginTop: 32,
              marginBottom: 24,
            }}
          />

          {/* ── BENEFICIOS — lista magazine ── */}
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: c.grisTexto,
              letterSpacing: 2,
              marginBottom: 20,
            }}
          >
            QUÉ INCLUYEN LOS VIDEOS
          </Text>

          {BENEFICIOS_VIDEOS.map((b, idx) => (
            <View
              key={b.titulo}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 16,
                paddingBottom: idx === BENEFICIOS_VIDEOS.length - 1 ? 0 : 20,
                marginBottom: idx === BENEFICIOS_VIDEOS.length - 1 ? 0 : 20,
                borderBottomWidth: idx === BENEFICIOS_VIDEOS.length - 1 ? 0 : 1,
                borderBottomColor: c.cardBorde,
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
                <Feather name={b.icon} size={20} color={c.verde} />
              </View>
              <View style={{ flex: 1, paddingTop: 2 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: c.negro,
                    letterSpacing: -0.2,
                    marginBottom: 4,
                  }}
                >
                  {b.titulo}
                </Text>
                <Text style={{ fontSize: 13, color: c.grisTexto, lineHeight: 19 }}>
                  {b.descripcion}
                </Text>
              </View>
            </View>
          ))}

          {/* ── CTA ── */}
          <View style={{ marginTop: 32 }}>
            <TouchableOpacity
              onPress={() => router.push('/premium')}
              activeOpacity={0.85}
              style={{
                paddingVertical: 17,
                borderRadius: 999,
                alignItems: 'center',
                backgroundColor: c.verde,
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 10,
                shadowColor: c.verde,
                shadowOpacity: 0.18,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <Feather name="unlock" size={18} color={c.blanco} />
              <Text
                style={{ color: c.blanco, fontWeight: '800', fontSize: 15, letterSpacing: 0.3 }}
              >
                Desbloquear videos
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 12,
                color: c.grisTexto,
                marginTop: 12,
                textAlign: 'center',
              }}
            >
              Cancela cuando quieras. Sin compromisos.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────
export default function VideosScreen() {
  const { esPremium, cargando } = useSuscripcionStore();
  const c = useColoresTema();

  if (cargando) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: c.fondoApp,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="small" color={c.verde} />
      </SafeAreaView>
    );
  }

  return esPremium ? <VistaPremium /> : <VistaPaywall />;
}
