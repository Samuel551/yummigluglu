import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import { supabase } from '@/lib/supabase';
import { Receta } from '@/types';
import { getAlergenoById } from '@/constants/Alergias';
import { COLOR_ETAPA, ETAPA_LABEL, getEtapaInfo } from '@/constants/Etapas';
import { useColoresTema } from '@/hooks/useColoresTema';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import { extraerVideoId, urlThumbnail } from '@/lib/youtube';
import { registrarMomentoIntersticial } from '@/lib/intersticial';
import { useDesbloqueosStore } from '@/store/useDesbloqueosStore';
import {
  mostrarRecompensado,
  precargarRecompensado,
  recompensadoDisponible,
} from '@/lib/recompensado';
import { ModalRecompensa, OpcionRecompensa } from '@/components/ModalRecompensa';

const MOMENTO_LABEL: Record<string, string> = {
  desayuno: 'Desayuno',
  almuerzo: 'Almuerzo',
  cena: 'Cena',
  snack: 'Snack',
};

// Los videos viven en un canal de YouTube que no controlamos del todo: si uno se
// borra, se restringe o le apagan el embed, el player queda en negro sin decir
// nada. `react-native-youtube-iframe` nos avisa vía `onError` con estos nombres
// (mapea los códigos 2, 5, 100, 101 y 150 de la IFrame API).
// `video_not_found` y `embed_not_allowed` son permanentes: reintentar no sirve.
const ERRORES_VIDEO_PERMANENTES = ['video_not_found', 'embed_not_allowed'];

const MENSAJES_ERROR_VIDEO: Record<string, { titulo: string; detalle: string }> = {
  video_not_found: {
    titulo: 'Video no disponible',
    detalle:
      'Este video ya no está disponible. Puedes seguir la receta con el paso a paso escrito.',
  },
  embed_not_allowed: {
    titulo: 'Video no disponible',
    detalle:
      'Este video no se puede reproducir dentro de la app por ahora. El paso a paso escrito está completo más abajo.',
  },
};

const ERROR_VIDEO_GENERICO = {
  titulo: 'No pudimos reproducir el video',
  detalle: 'Revisa tu conexión e intenta de nuevo.',
};

export default function DetalleRecetaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const { width: anchoP, height: altoP } = useWindowDimensions();
  const { esPremium } = useSuscripcionStore();
  const desbloqueada = useDesbloqueosStore((s) => (id ? s.estaDesbloqueada(id) : false));
  const desbloquear = useDesbloqueosStore((s) => s.desbloquear);
  const [videoVisible, setVideoVisible] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [receta, setReceta] = useState<Receta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalRecompensaVisible, setModalRecompensaVisible] = useState(false);
  const [procesandoRecompensa, setProcesandoRecompensa] = useState(false);

  // Leemos de la vista `recetas_teaser`: siempre devuelve el teaser, y el
  // contenido pesado (ingredientes, pasos, video) solo si el usuario tiene
  // derecho (premium o desbloqueo vigente). Reutilizable para refetch tras
  // desbloquear con un anuncio.
  const cargarReceta = useCallback(async () => {
    if (!id) {
      setErrorMsg('ID de receta inválido.');
      setCargando(false);
      return;
    }
    const { data, error } = await supabase.from('recetas_teaser').select('*').eq('id', id).single();

    if (error) {
      setErrorMsg('No se pudo cargar la receta. Intenta de nuevo.');
    } else if (data) {
      setReceta(data as Receta);
    }
    setCargando(false);
  }, [id]);

  useEffect(() => {
    cargarReceta();
  }, [cargarReceta]);

  // Solo al abrir el detalle (una vez): registrar el momento natural del
  // intersticial y asegurar que haya un rewarded precargado por si desbloquea.
  useEffect(() => {
    registrarMomentoIntersticial();
    precargarRecompensado();
  }, []);

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
        <ActivityIndicator size="large" color={c.verde} />
      </SafeAreaView>
    );
  }

  if (errorMsg || !receta) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: c.fondoApp,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 32, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ fontSize: 16, color: c.grisTexto, textAlign: 'center' }}>
          {errorMsg ?? 'Receta no encontrada.'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: c.verde, fontWeight: '600' }}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const etapaPrimaria = receta.etapas_compatibles[0] ?? 'inicio';
  const colorEtapa = COLOR_ETAPA[etapaPrimaria] ?? COLOR_ETAPA.inicio;
  const etapaInfo = getEtapaInfo(etapaPrimaria);
  const videoId = receta.video_url ? extraerVideoId(receta.video_url) : null;
  const thumbnailUrl = videoId ? urlThumbnail(videoId) : null;

  // Video bloqueado = el VIDEO es premium, el usuario no es premium y no lo desbloqueó.
  // La receta en sí SIEMPRE es free; solo se gatea el video.
  const videoBloqueado = receta.es_premium && !esPremium && !desbloqueada;

  const opcionesRecompensa: OpcionRecompensa[] = [
    {
      id: 'receta',
      titulo: 'Desbloquear el video',
      descripcion: 'Mira el video paso a paso de esta receta por 24 horas.',
      icon: 'unlock',
      disponible: true,
    },
    {
      id: 'ia',
      titulo: 'Mensajes extra con NutriBot',
      descripcion: 'Suma consultas al asistente de nutrición con IA.',
      icon: 'message-circle',
      disponible: false, // se habilita cuando exista la Fase 6 (NutriBot)
    },
  ];

  const handleElegirRecompensa = async (opcionId: string) => {
    if (opcionId !== 'receta' || !id) return;
    if (!recompensadoDisponible()) {
      precargarRecompensado();
      Alert.alert(
        'Anuncio no disponible',
        'El anuncio todavía se está cargando. Intenta de nuevo en unos segundos.'
      );
      return;
    }
    setProcesandoRecompensa(true);
    const gano = await mostrarRecompensado();
    if (!gano) {
      Alert.alert(
        'Anuncio incompleto',
        'Necesitas ver el anuncio completo para desbloquear la receta.'
      );
    } else if (await desbloquear(id)) {
      await cargarReceta(); // la vista ahora devuelve el contenido completo
    } else {
      // Vio el anuncio pero el canje no prosperó. Desde que la verificación es
      // server-side esto tiene un caso legítimo: el callback de Google todavía
      // no llegó tras los reintentos. Antes este camino era casi imposible y
      // quedaba en silencio; ahora hay que decir algo o el usuario cree que
      // perdió la recompensa.
      Alert.alert(
        'Un momento',
        'Estamos confirmando tu recompensa con el anuncio. Vuelve a intentarlo en unos segundos.'
      );
    }
    setProcesandoRecompensa(false);
    setModalRecompensaVisible(false);
  };

  // El embed de YouTube siempre arma un escenario 16:9 y mete el Short (9:16)
  // pillarboxed adentro. Si le damos al WebView una caja 9:16, el video termina
  // diminuto. Truco: agrandamos el WebView a lo ancho para que el escenario 16:9
  // tenga la ALTURA que queremos, y recortamos las bandas laterales con un
  // contenedor overflow:hidden centrado.
  const espacioHeader = 72;
  const altoDisponible = altoP - insets.top - insets.bottom - espacioHeader;
  // Caja visible: el Short ocupa todo lo que se pueda sin desbordar.
  const videoVisibleHeight = Math.min(altoDisponible, (anchoP * 0.96 * 16) / 9);
  const videoVisibleWidth = (videoVisibleHeight * 9) / 16;
  // WebView real: escenario 16:9 con esa altura.
  const escenarioHeight = videoVisibleHeight;
  const escenarioWidth = (escenarioHeight * 16) / 9;
  const offsetHorizontal = -(escenarioWidth - videoVisibleWidth) / 2;

  const abrirVideo = () => {
    setVideoError(null);
    setVideoVisible(true);
    setReproduciendo(false);
  };
  const cerrarVideo = () => {
    setReproduciendo(false);
    setVideoVisible(false);
  };
  // Al limpiar el error el player se vuelve a montar de cero (estaba desmontado
  // mientras se mostraba el fallback), así que reintenta solo.
  const reintentarVideo = () => {
    setVideoError(null);
    setReproduciendo(false);
  };
  const manejarErrorVideo = (error: string) => {
    // Dejamos rastro con el id de receta y de video: si un video se cae, esto es
    // lo único que dice CUÁL hay que revisar o reemplazar en el panel admin.
    console.warn(`Video de YouTube falló [${error}] — receta ${id}, videoId ${videoId}`);
    setVideoError(error);
    setReproduciendo(false);
  };

  const seccionLabelStyle = {
    fontSize: 11,
    fontWeight: '700' as const,
    color: c.grisTexto,
    letterSpacing: 2,
    marginBottom: 18,
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* HERO — imagen del plato o fallback con etapa */}
        <View style={{ position: 'relative' }}>
          {receta.imagen_url ? (
            <Image
              source={{ uri: receta.imagen_url }}
              style={{ width: '100%', aspectRatio: 4 / 3 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: '100%',
                aspectRatio: 4 / 3,
                backgroundColor: colorEtapa.bg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 96, lineHeight: 144 }}>{etapaInfo.emoji}</Text>
            </View>
          )}

          {/* Velo inferior suave para legibilidad del pill de etapa */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 100,
              backgroundColor: 'rgba(0,0,0,0.18)',
            }}
          />

          {/* Botón Volver flotante */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            style={{
              position: 'absolute',
              top: insets.top + 12,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.95)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1714' }}>←</Text>
          </TouchableOpacity>

          {/* Badge Premium flotante */}
          {receta.es_premium && (
            <View
              style={{
                position: 'absolute',
                top: insets.top + 18,
                right: 18,
                backgroundColor: '#1A1714',
                borderRadius: 999,
                paddingHorizontal: 11,
                paddingVertical: 5,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 11 }}>👑</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 }}>
                PREMIUM
              </Text>
            </View>
          )}

          {/* Pill de etapa abajo izquierda */}
          <View
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(255,255,255,0.96)',
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text style={{ fontSize: 14 }}>{etapaInfo.emoji}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#1A1714' }}>
              {ETAPA_LABEL[etapaPrimaria]}
            </Text>
          </View>
        </View>

        {/* Contenido editorial */}
        <View style={{ paddingHorizontal: 24, paddingTop: 28 }}>
          {/* Title */}
          <Text
            style={{
              fontSize: 30,
              fontWeight: '800',
              color: c.negro,
              letterSpacing: -0.6,
              lineHeight: 36,
              marginBottom: 10,
            }}
          >
            {receta.nombre}
          </Text>

          {/* Descripción */}
          <Text
            style={{
              fontSize: 16,
              color: c.grisTexto,
              lineHeight: 24,
              marginBottom: 22,
            }}
          >
            {receta.descripcion}
          </Text>

          {/* Stats inline */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: 24,
            }}
          >
            <StatInline emoji="⏱" texto={`${receta.tiempo_preparacion} min`} color={c.negro} />
            <Bullet color={c.grisTexto} />
            <StatInline emoji="🍽" texto={`${receta.porciones_base} porciones`} color={c.negro} />
            {receta.calorias != null && (
              <>
                <Bullet color={c.grisTexto} />
                <StatInline emoji="🔥" texto={`${receta.calorias} kcal`} color={c.negro} />
              </>
            )}
          </View>

          {/* Pills de momentos del día */}
          {receta.momento_dia.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
              {receta.momento_dia.map((momento) => (
                <View
                  key={momento}
                  style={{
                    backgroundColor: c.grisClaro,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                  }}
                >
                  <Text style={{ fontSize: 12, color: c.grisTexto, fontWeight: '500' }}>
                    {MOMENTO_LABEL[momento] ?? momento}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* VIDEO — gateado a nivel video (la receta es free; el video puede ser premium) */}
          {receta.es_premium && videoBloqueado ? (
            <UnlockCTA c={c} onVerAnuncio={() => setModalRecompensaVisible(true)} />
          ) : videoId ? (
            <TouchableOpacity
              onPress={abrirVideo}
              activeOpacity={0.9}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                marginBottom: 28,
              }}
            >
              <View
                style={{
                  width: 120,
                  aspectRatio: 9 / 16,
                  borderRadius: 14,
                  overflow: 'hidden',
                  backgroundColor: '#000',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {thumbnailUrl && (
                  <Image
                    source={{ uri: thumbnailUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                )}
                <View
                  style={{
                    position: 'absolute',
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: 'rgba(255,255,255,0.96)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 4,
                  }}
                >
                  <Text style={{ fontSize: 18, color: '#000', marginLeft: 3 }}>▶</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: c.verde,
                    letterSpacing: 1.5,
                    marginBottom: 4,
                  }}
                >
                  VIDEO · SHORT
                </Text>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '700',
                    color: c.negro,
                    marginBottom: 6,
                    lineHeight: 22,
                  }}
                >
                  Ver paso a paso
                </Text>
                <Text style={{ fontSize: 13, color: c.grisTexto, lineHeight: 18 }}>
                  Mira la preparación completa en un video corto.
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {/* Aviso de alérgenos */}
          {receta.alergenos.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: '#FDBA74',
                paddingVertical: 14,
                marginBottom: 28,
              }}
            >
              <Text style={{ fontSize: 20 }}>⚠</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: '#C2410C',
                    letterSpacing: 1.5,
                    marginBottom: 3,
                  }}
                >
                  CONTIENE
                </Text>
                <Text style={{ fontSize: 14, color: c.negro }}>
                  {receta.alergenos.map((a) => getAlergenoById(a)?.nombre ?? a).join(' · ')}
                </Text>
              </View>
            </View>
          )}

          {/* Separador */}
          <View style={{ height: 1, backgroundColor: c.cardBorde, marginBottom: 28 }} />

          {/* INGREDIENTES */}
          <Text style={seccionLabelStyle}>INGREDIENTES</Text>
          <View style={{ marginBottom: 32 }}>
            {receta.ingredientes.map((ing, idx) => (
              <View
                key={ing.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingVertical: 13,
                  borderBottomWidth: idx < receta.ingredientes.length - 1 ? 1 : 0,
                  borderBottomColor: c.cardBorde,
                }}
              >
                <Text style={{ fontSize: 15, color: c.negro, flex: 1, paddingRight: 12 }}>
                  {ing.nombre}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: c.grisTexto,
                    fontWeight: '500',
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {ing.cantidad} {ing.unidad}
                </Text>
              </View>
            ))}
          </View>

          {/* Separador */}
          <View style={{ height: 1, backgroundColor: c.cardBorde, marginBottom: 28 }} />

          {/* PREPARACIÓN */}
          <Text style={seccionLabelStyle}>PREPARACIÓN</Text>
          <View style={{ marginBottom: 32, gap: 22 }}>
            {receta.pasos.map((paso) => (
              <View key={paso.orden} style={{ flexDirection: 'row', gap: 16 }}>
                <Text
                  style={{
                    fontSize: 44,
                    fontWeight: '900',
                    color: colorEtapa.text,
                    letterSpacing: -1.5,
                    lineHeight: 44,
                    fontVariant: ['tabular-nums'],
                    width: 58,
                  }}
                >
                  {String(paso.orden).padStart(2, '0')}
                </Text>
                <View style={{ flex: 1, paddingTop: 6 }}>
                  <Text style={{ fontSize: 15, color: c.negro, lineHeight: 22 }}>
                    {paso.descripcion}
                  </Text>
                  {paso.duracion_min > 0 && (
                    <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 6 }}>
                      ⏱ {paso.duracion_min} min
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* NUTRICIÓN */}
          {receta.calorias != null && (
            <>
              <View style={{ height: 1, backgroundColor: c.cardBorde, marginBottom: 28 }} />
              <Text style={seccionLabelStyle}>NUTRICIÓN POR PORCIÓN</Text>
              <View>
                {[
                  { label: 'Calorías', valor: receta.calorias, unidad: 'kcal' },
                  { label: 'Proteínas', valor: receta.proteinas, unidad: 'g' },
                  { label: 'Carbohidratos', valor: receta.carbohidratos, unidad: 'g' },
                  { label: 'Grasas', valor: receta.grasas, unidad: 'g' },
                  { label: 'Hierro', valor: receta.hierro, unidad: 'mg' },
                ]
                  .filter((row) => row.valor != null)
                  .map((row, idx, arr) => (
                    <View
                      key={row.label}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        paddingVertical: 13,
                        borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                        borderBottomColor: c.cardBorde,
                      }}
                    >
                      <Text style={{ fontSize: 15, color: c.grisTexto }}>{row.label}</Text>
                      <Text
                        style={{
                          fontSize: 15,
                          color: c.negro,
                          fontWeight: '600',
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {row.valor} {row.unidad}
                      </Text>
                    </View>
                  ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal de video — aspect 9:16 propio para Shorts */}
      {videoId && (
        <Modal visible={videoVisible} animationType="slide" onRequestClose={cerrarVideo}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 14,
              }}
            >
              <Text
                style={{ color: '#fff', fontWeight: '700', fontSize: 15, flex: 1 }}
                numberOfLines={1}
              >
                {receta.nombre}
              </Text>
              <TouchableOpacity onPress={cerrarVideo} style={{ padding: 6 }}>
                <Text style={{ color: '#fff', fontSize: 24 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {videoError ? (
                <VideoNoDisponible
                  error={videoError}
                  ancho={videoVisibleWidth}
                  onReintentar={reintentarVideo}
                  onCerrar={cerrarVideo}
                />
              ) : (
                /* Ventana de recorte: solo se ve el centro del escenario 16:9 */
                <View
                  style={{
                    width: videoVisibleWidth,
                    height: videoVisibleHeight,
                    borderRadius: 18,
                    overflow: 'hidden',
                    backgroundColor: '#000',
                  }}
                >
                  <View style={{ marginLeft: offsetHorizontal }}>
                    <YoutubePlayer
                      width={escenarioWidth}
                      height={escenarioHeight}
                      videoId={videoId}
                      // Tap-to-play: el WebView de Android no permite autoplay, así
                      // que el usuario arranca con el botón de YouTube (con sonido).
                      // Sincronizamos el estado con lo que hace el player para que
                      // el prop `play` no pelee contra el tap del usuario.
                      play={reproduciendo}
                      onChangeState={(estado: string) => {
                        if (estado === 'playing') setReproduciendo(true);
                        else if (estado === 'paused' || estado === 'ended') setReproduciendo(false);
                      }}
                      onError={manejarErrorVideo}
                      initialPlayerParams={{
                        controls: false,
                        modestbranding: true,
                        rel: false,
                        showClosedCaptions: false,
                      }}
                      webViewProps={{
                        allowsInlineMediaPlayback: true,
                        mediaPlaybackRequiresUserAction: false,
                      }}
                    />
                  </View>
                </View>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      )}

      {/* Modal de elección de recompensa (rewarded ad) */}
      <ModalRecompensa
        visible={modalRecompensaVisible}
        onClose={() => setModalRecompensaVisible(false)}
        opciones={opcionesRecompensa}
        onElegir={handleElegirRecompensa}
        procesando={procesandoRecompensa}
      />
    </View>
  );
}

// ─── Fallback cuando el video de YouTube no se puede reproducir ──────────────
// Vive dentro del modal, que siempre es negro: los colores van fijos a propósito
// (no dependen del tema claro/oscuro).
function VideoNoDisponible({
  error,
  ancho,
  onReintentar,
  onCerrar,
}: {
  error: string;
  ancho: number;
  onReintentar: () => void;
  onCerrar: () => void;
}) {
  const permanente = ERRORES_VIDEO_PERMANENTES.includes(error);
  const { titulo, detalle } = MENSAJES_ERROR_VIDEO[error] ?? ERROR_VIDEO_GENERICO;

  return (
    <View style={{ width: Math.max(ancho, 260), alignItems: 'center', paddingHorizontal: 12 }}>
      <Text style={{ fontSize: 44, lineHeight: 66, marginBottom: 10 }}>📹</Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '800',
          color: '#fff',
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {titulo}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.72)',
          textAlign: 'center',
          lineHeight: 20,
          marginBottom: 24,
        }}
      >
        {detalle}
      </Text>

      {/* Reintentar solo tiene sentido en fallos transitorios (red, HTML5). Si el
          video no existe o no permite embed, reintentar falla igual. */}
      {permanente ? (
        <TouchableOpacity
          onPress={onCerrar}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#fff',
            borderRadius: 999,
            paddingVertical: 14,
            paddingHorizontal: 28,
            alignSelf: 'stretch',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#1A1714', fontWeight: '800', fontSize: 15 }}>
            Ver el paso a paso
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            onPress={onReintentar}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#fff',
              borderRadius: 999,
              paddingVertical: 14,
              paddingHorizontal: 28,
              alignSelf: 'stretch',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: '#1A1714', fontWeight: '800', fontSize: 15 }}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCerrar}
            activeOpacity={0.85}
            style={{ paddingVertical: 12, alignSelf: 'stretch', alignItems: 'center' }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.72)', fontWeight: '700', fontSize: 14 }}>
              Cerrar
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ─── Tarjeta de bloqueo premium con desbloqueo por anuncio ───────────────────
function UnlockCTA({
  c,
  onVerAnuncio,
}: {
  c: ReturnType<typeof useColoresTema>;
  onVerAnuncio: () => void;
}) {
  return (
    <View style={{ marginBottom: 28 }}>
      <View
        style={{
          borderRadius: 18,
          borderWidth: 1,
          borderColor: c.cardBorde,
          backgroundColor: c.card,
          padding: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#1A1714',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>👑</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#F28B3B', letterSpacing: 1.5 }}>
              VIDEO PREMIUM
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: c.negro, letterSpacing: -0.3 }}>
              Video exclusivo
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 14, color: c.grisTexto, lineHeight: 20, marginBottom: 18 }}>
          La receta es gratis, pero el video paso a paso es premium. Míralo gratis viendo un
          anuncio, o hazte premium para ver todos los videos sin límites.
        </Text>
        <TouchableOpacity
          onPress={onVerAnuncio}
          activeOpacity={0.85}
          style={{
            backgroundColor: c.verde,
            borderRadius: 999,
            paddingVertical: 15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 18 }}>🎁</Text>
          <Text style={{ color: c.blanco, fontWeight: '800', fontSize: 15 }}>
            Ver un anuncio y ver el video 24h
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/premium')}
          activeOpacity={0.85}
          style={{
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: c.cardBorde,
          }}
        >
          <Text style={{ color: c.negro, fontWeight: '700', fontSize: 14 }}>Hazte premium</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatInline({ emoji, texto, color }: { emoji: string; texto: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Text style={{ fontSize: 13 }}>{emoji}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color, fontVariant: ['tabular-nums'] }}>
        {texto}
      </Text>
    </View>
  );
}

function Bullet({ color }: { color: string }) {
  return <Text style={{ fontSize: 12, color, marginHorizontal: 10 }}>·</Text>;
}
