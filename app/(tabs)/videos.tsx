import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { COLOR_ETAPA, ETAPA_LABEL, getEtapaInfo } from '@/constants/Etapas';
import { EtapaAlimentaria } from '@/types';
import { extraerVideoId, urlThumbnail } from '@/lib/youtube';

interface RecetaConVideo {
  id: string;
  nombre: string;
  imagen_url: string | null;
  // Viene de recetas_teaser: null si el video es premium y el user no tiene
  // derecho (ni suscripción ni desbloqueo vigente). Con valor => reproducible.
  video_url: string | null;
  etapas_compatibles: EtapaAlimentaria[];
  es_premium: boolean;
  tiempo_preparacion: number;
}

type Colores = ReturnType<typeof useColoresTema>;

// ─── Pantalla principal ───────────────────────────────────────
// Vista ÚNICA para free y premium. La vista recetas_teaser ya gatea
// video_url server-side: al premium le llega todo reproducible, al free
// le llegan los gratis con URL y los premium en null (=> card con candado).
export default function VideosScreen() {
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const { esPremium, cargando: cargandoSub } = useSuscripcionStore();
  const { perfilActivo } = usePerfilStore();
  const [recetas, setRecetas] = useState<RecetaConVideo[]>([]);
  const [cargando, setCargando] = useState(true);
  // Filtro marketing: mostrar solo los videos 100% gratis (rotación semanal).
  const [soloGratis, setSoloGratis] = useState(false);

  // useFocusEffect (no useEffect): si el user desbloquea un video con el
  // anuncio recompensado en el detalle y vuelve a esta tab, hay que
  // re-consultar el teaser para que la card pase de bloqueada a reproducible.
  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargar = async () => {
        // Tiene video si video_url llegó con valor (gratis o con derecho) O si
        // es_premium = true (video premium gateado en null para este user).
        let query = supabase
          .from('recetas_teaser')
          .select(
            'id, nombre, imagen_url, video_url, etapas_compatibles, es_premium, tiempo_preparacion'
          )
          .or('video_url.not.is.null,es_premium.eq.true');

        if (perfilActivo?.etapa) {
          query = query.contains('etapas_compatibles', [perfilActivo.etapa]);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!activo) return;
        if (error) {
          console.warn('Error cargando videos:', error);
        }

        // Reproducibles primero (sort estable: dentro de cada grupo se
        // mantiene el orden por fecha) — el free ve el valor gratis de una.
        const ordenadas = ((data as RecetaConVideo[]) ?? [])
          .slice()
          .sort((a, b) => Number(!!b.video_url) - Number(!!a.video_url));

        setRecetas(ordenadas);
        setCargando(false);
      };

      cargar();
      return () => {
        activo = false;
      };
    }, [perfilActivo?.etapa])
  );

  if (cargandoSub || (cargando && recetas.length === 0)) {
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

  const eyebrow = perfilActivo?.etapa
    ? `VIDEOS · ${ETAPA_LABEL[perfilActivo.etapa].toUpperCase()}`
    : 'VIDEOS';

  // Un video es gratis cuando la receta NO es premium (es_premium=false). En el
  // set cargado, un !es_premium siempre trae video_url (el .or de la query lo
  // garantiza), así que basta con es_premium para separar gratis de premium.
  // Solo mostramos el control si hay MEZCLA — si todo es gratis o todo premium,
  // el filtro no cambiaría nada y sería ruido.
  const hayGratis = recetas.some((r) => !r.es_premium);
  const hayPremium = recetas.some((r) => r.es_premium);
  const mostrarFiltro = hayGratis && hayPremium;
  const filtroActivo = mostrarFiltro && soloGratis;
  const recetasVisibles = filtroActivo ? recetas.filter((r) => !r.es_premium) : recetas;

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
              {esPremium
                ? 'Mira la preparación completa de cada receta en clips cortos y claros.'
                : 'Cada semana hay videos gratis para ti. Los demás se desbloquean con Premium o viendo un anuncio.'}
            </Text>
          </View>

          {/* Filtro gratis/todos — solo con mezcla de ambos tipos */}
          {mostrarFiltro && <FiltroVideos soloGratis={soloGratis} onCambio={setSoloGratis} c={c} />}

          {recetasVisibles.length === 0 ? (
            <EstadoVacio c={c} />
          ) : (
            recetasVisibles.map((receta) =>
              receta.video_url ? (
                <CardVideo key={receta.id} receta={receta} c={c} />
              ) : (
                <CardVideoBloqueado key={receta.id} receta={receta} c={c} />
              )
            )
          )}

          {!esPremium && recetasVisibles.length > 0 && <CtaPremium c={c} />}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Card de un video reproducible ───────────────────────────
function CardVideo({ receta, c }: { receta: RecetaConVideo; c: Colores }) {
  const videoId = receta.video_url ? extraerVideoId(receta.video_url) : null;
  if (!videoId) return null;

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
          backgroundColor: colorEtapaDe(receta).bg,
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

        {/* Badge GRATIS — solo si el video es libre para todos (no premium
            desbloqueado): refuerza la rotación de marketing del catálogo */}
        {!receta.es_premium && <BadgePill bg={c.verde} icon="play" texto="GRATIS" />}
      </View>

      <MetaVideo receta={receta} c={c} />
    </TouchableOpacity>
  );
}

// ─── Card de video premium bloqueado (solo la ve el user free) ──
// Sin video_url no hay thumbnail de YouTube: usa la imagen de la receta
// (contenido free) con overlay + candado. Toca => detalle de la receta,
// donde ya vive el UnlockCTA (ver anuncio 24h / hazte premium).
function CardVideoBloqueado({ receta, c }: { receta: RecetaConVideo; c: Colores }) {
  const etapaInfo = getEtapaInfo(receta.etapas_compatibles[0] ?? 'inicio');

  return (
    <TouchableOpacity
      onPress={() => router.push(`/receta/${receta.id}`)}
      activeOpacity={0.9}
      style={{ marginBottom: 28 }}
    >
      <View
        style={{
          width: '100%',
          aspectRatio: 16 / 9,
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: colorEtapaDe(receta).bg,
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
            <Text style={{ fontSize: 72, lineHeight: 108 }}>{etapaInfo.emoji}</Text>
          </View>
        )}

        {/* Velo oscuro + candado */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(26,23,20,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
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
            }}
          >
            <Feather name="lock" size={22} color="#1A1714" />
          </View>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 0.3 }}>
            Toca para desbloquear
          </Text>
        </View>

        <BadgePill bg="#1A1714" icon="star" texto="PREMIUM" />
      </View>

      <MetaVideo receta={receta} c={c} />
    </TouchableOpacity>
  );
}

// ─── Piezas compartidas ──────────────────────────────────────
function colorEtapaDe(receta: RecetaConVideo) {
  const etapaPrimaria = receta.etapas_compatibles[0] ?? 'inicio';
  return COLOR_ETAPA[etapaPrimaria] ?? COLOR_ETAPA.inicio;
}

function BadgePill({
  bg,
  icon,
  texto,
}: {
  bg: string;
  icon: keyof typeof Feather.glyphMap;
  texto: string;
}) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 14,
        right: 14,
        backgroundColor: bg,
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <Feather name={icon} size={11} color="#fff" />
      <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 }}>
        {texto}
      </Text>
    </View>
  );
}

// ─── Filtro gratis / todos ───────────────────────────────────
function FiltroVideos({
  soloGratis,
  onCambio,
  c,
}: {
  soloGratis: boolean;
  onCambio: (solo: boolean) => void;
  c: Colores;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 26 }}>
      <ChipFiltro label="Todos" activo={!soloGratis} onPress={() => onCambio(false)} c={c} />
      <ChipFiltro
        label="Solo gratis"
        icon="play"
        activo={soloGratis}
        onPress={() => onCambio(true)}
        c={c}
      />
    </View>
  );
}

function ChipFiltro({
  label,
  icon,
  activo,
  onPress,
  c,
}: {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  activo: boolean;
  onPress: () => void;
  c: Colores;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 999,
        backgroundColor: activo ? c.verde : c.card,
        borderWidth: 1,
        borderColor: activo ? c.verde : c.cardBorde,
      }}
    >
      {icon && <Feather name={icon} size={12} color={activo ? c.blanco : c.grisTexto} />}
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: activo ? c.blanco : c.grisTexto,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MetaVideo({ receta, c }: { receta: RecetaConVideo; c: Colores }) {
  const etapaPrimaria = receta.etapas_compatibles[0] ?? 'inicio';

  return (
    <>
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
        <Text style={{ fontSize: 13, fontWeight: '600', color: colorEtapaDe(receta).text }}>
          {ETAPA_LABEL[etapaPrimaria]}
        </Text>
      </View>
    </>
  );
}

// ─── CTA premium al pie (solo user free) ─────────────────────
function CtaPremium({ c }: { c: Colores }) {
  return (
    <View style={{ marginTop: 8 }}>
      <View
        style={{
          height: 1,
          backgroundColor: c.cardBorde,
          marginBottom: 24,
        }}
      />
      <Text
        style={{
          fontSize: 15,
          color: c.grisTexto,
          lineHeight: 22,
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        Con Premium desbloqueas todos los videos, sin anuncios.
      </Text>
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
        <Text style={{ color: c.blanco, fontWeight: '800', fontSize: 15, letterSpacing: 0.3 }}>
          Desbloquear todos los videos
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
  );
}

// ─── Estado vacío canónico ───────────────────────────────────
function EstadoVacio({ c }: { c: Colores }) {
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
