import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnuncioBanner } from '@/components/AnuncioBanner';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePerfilStore } from '@/store/usePerfilStore';
import { useRecetasStore } from '@/store/useRecetasStore';
import { usePaisStore } from '@/store/usePaisStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { COLOR_ETAPA, ETAPA_LABEL, getEtapaInfo } from '@/constants/Etapas';
import { proximosHitos, tiempoHastaHito, mesesDiasHastaHito } from '@/constants/Hitos';
import { Receta, MomentoDia, PerfilHijo } from '@/types';

// ─── Helpers de hora ──────────────────────────────────────────────────────────

function getMomentoActual(hora: number): MomentoDia {
  if (hora >= 6 && hora < 11) return 'desayuno';
  if (hora >= 11 && hora < 15) return 'almuerzo';
  if (hora >= 15 && hora < 18) return 'snack';
  return 'cena';
}

function getSaludoPorHora(hora: number): string {
  if (hora >= 5 && hora < 12) return 'Buenos días';
  if (hora >= 12 && hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES_LARGOS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function formatearFechaLarga(d: Date): string {
  return `${DIAS_LARGOS[d.getDay()]} · ${d.getDate()} ${MESES_LARGOS[d.getMonth()]}`;
}

const MOMENTO_LABEL: Record<MomentoDia, string> = {
  desayuno: 'Desayuno',
  almuerzo: 'Almuerzo',
  cena: 'Cena',
  snack: 'Snack',
};

const ETAPA_DESCRIPCION: Record<string, string> = {
  lactancia: 'Solo leche · aún no empieza con sólidos',
  inicio: 'Primeros alimentos · 6 a 11 meses',
  transicion: 'Texturas variadas · 12 a 23 meses',
  preescolar: 'Platos completos · 2 años o más',
};

// ─── Pantalla ─────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const perfilActivo = usePerfilStore((state) => state.perfilActivo);
  const { recetas, cargando, cargarRecetas } = useRecetasStore();
  const pais = usePaisStore((s) => s.pais);
  const esLactancia = perfilActivo?.etapa === 'lactancia';

  const ahora = useMemo(() => new Date(), []);
  const momentoActual = getMomentoActual(ahora.getHours());
  const saludo = getSaludoPorHora(ahora.getHours());
  const fechaLarga = formatearFechaLarga(ahora);

  useEffect(() => {
    if (!perfilActivo) return;
    cargarRecetas({
      etapa: perfilActivo.etapa,
      excluir_alergenos: perfilActivo.alergias,
      pais,
    });
  }, [perfilActivo, pais, cargarRecetas]);

  // Hero: primera receta que matchea el momento actual; fallback a la primera.
  const recetaHero = useMemo<Receta | null>(() => {
    if (recetas.length === 0) return null;
    const matchMomento = recetas.find((r) => r.momento_dia.includes(momentoActual));
    return matchMomento ?? recetas[0];
  }, [recetas, momentoActual]);

  // Sugerencias "también para hoy": 3 recetas distintas al hero.
  const sugerencias = useMemo<Receta[]>(() => {
    if (recetas.length === 0) return [];
    return recetas.filter((r) => r.id !== recetaHero?.id).slice(0, 3);
  }, [recetas, recetaHero]);

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          {/* ── ENCABEZADO EDITORIAL ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: c.grisTexto,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
              >
                {fechaLarga}
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/perfil')}
                hitSlop={8}
                style={({ pressed }) => ({
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Feather name="settings" size={20} color={c.grisTexto} />
              </Pressable>
            </View>

            {/* Saludo editorial */}
            <Text
              style={{
                fontSize: 30,
                fontWeight: '800',
                color: c.negro,
                letterSpacing: -0.6,
                lineHeight: 36,
              }}
            >
              {saludo}.
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
                    marginBottom: 12,
                  }}
                >
                  {esLactancia ? (
                    <>
                      Acompañamos a <Text style={{ color: c.verde }}>{perfilActivo.nombre}</Text>{' '}
                      <Text style={{ fontSize: 28, lineHeight: 42 }}>
                        {perfilActivo.avatar_emoji}
                      </Text>
                    </>
                  ) : (
                    <>
                      ¿Qué cocinamos para{' '}
                      <Text style={{ color: c.verde }}>{perfilActivo.nombre}</Text>{' '}
                      <Text style={{ fontSize: 28, lineHeight: 42 }}>
                        {perfilActivo.avatar_emoji}
                      </Text>
                      ?
                    </>
                  )}
                </Text>
                <Text style={{ fontSize: 14, color: c.grisTexto, lineHeight: 20 }}>
                  {ETAPA_DESCRIPCION[perfilActivo.etapa] ?? perfilActivo.etapa}
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
                  marginBottom: 12,
                }}
              >
                Empieza creando el perfil de tu bebé.
              </Text>
            )}
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: c.cardBorde,
              marginHorizontal: 24,
              marginTop: 28,
              marginBottom: 24,
            }}
          />

          {perfilActivo && (
            <>
              {esLactancia && <HoldLactancia perfil={perfilActivo} />}

              {!esLactancia && (
                <>
                  {/* ── HERO DEL MOMENTO ACTUAL ── */}
                  <View style={{ paddingHorizontal: 24 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: c.grisTexto,
                          letterSpacing: 2,
                        }}
                      >
                        HOY · {MOMENTO_LABEL[momentoActual].toUpperCase()}
                      </Text>
                    </View>

                    {recetaHero ? (
                      <HeroDia receta={recetaHero} />
                    ) : cargando ? (
                      <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={c.verde} />
                      </View>
                    ) : (
                      <Text style={{ fontSize: 14, color: c.grisTexto, paddingVertical: 24 }}>
                        Aún no hay recetas para esta etapa.
                      </Text>
                    )}
                  </View>

                  {/* ── TAMBIÉN PARA HOY ── */}
                  {sugerencias.length > 0 && (
                    <>
                      <View
                        style={{
                          height: 1,
                          backgroundColor: c.cardBorde,
                          marginHorizontal: 24,
                          marginTop: 36,
                          marginBottom: 24,
                        }}
                      />
                      <View style={{ paddingHorizontal: 24 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 18,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '700',
                              color: c.grisTexto,
                              letterSpacing: 2,
                            }}
                          >
                            TAMBIÉN PARA HOY
                          </Text>
                          <TouchableOpacity
                            onPress={() => router.push('/(tabs)/recetas')}
                            activeOpacity={0.6}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: c.negro }}>
                                Ver todas
                              </Text>
                              <Feather name="arrow-right" size={14} color={c.negro} />
                            </View>
                          </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                          {sugerencias.map((r, idx) => (
                            <MiniCard
                              key={r.id}
                              receta={r}
                              esUltimo={idx === sugerencias.length - 1}
                            />
                          ))}
                        </View>
                      </View>
                    </>
                  )}

                  {/* ── POR MOMENTO DEL DÍA ── */}
                  <View
                    style={{
                      height: 1,
                      backgroundColor: c.cardBorde,
                      marginHorizontal: 24,
                      marginTop: 36,
                      marginBottom: 24,
                    }}
                  />
                  <View style={{ paddingHorizontal: 24 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: c.grisTexto,
                        letterSpacing: 2,
                        marginBottom: 16,
                      }}
                    >
                      POR MOMENTO DEL DÍA
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {(['desayuno', 'almuerzo', 'snack', 'cena'] as MomentoDia[]).map((m) => (
                        <MomentoPill
                          key={m}
                          momento={m}
                          esAhora={m === momentoActual}
                          onPress={() =>
                            router.push({ pathname: '/(tabs)/recetas', params: { momento: m } })
                          }
                        />
                      ))}
                    </View>
                  </View>
                </>
              )}

              {/* ── AGENDA — LINK EDITORIAL ── */}
              <View
                style={{
                  height: 1,
                  backgroundColor: c.cardBorde,
                  marginHorizontal: 24,
                  marginTop: 36,
                  marginBottom: 24,
                }}
              />
              <Pressable
                onPress={() => router.push('/agenda')}
                style={({ pressed }) => ({
                  paddingHorizontal: 24,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
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
                    <Feather name="bell" size={20} color={c.verde} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: c.negro,
                        marginBottom: 3,
                      }}
                    >
                      Tu agenda
                    </Text>
                    <Text style={{ fontSize: 13, color: c.grisTexto, lineHeight: 18 }}>
                      Recordatorios y próximos hitos de {perfilActivo.nombre}.
                    </Text>
                  </View>
                  <Feather name="arrow-right" size={18} color={c.grisTexto} />
                </View>
              </Pressable>

              {/* ── NUTRIBOT — LINK EDITORIAL ── */}
              <View
                style={{
                  height: 1,
                  backgroundColor: c.cardBorde,
                  marginHorizontal: 24,
                  marginTop: 28,
                  marginBottom: 24,
                }}
              />
              <Pressable
                onPress={() => router.push('/asistente')}
                style={({ pressed }) => ({
                  paddingHorizontal: 24,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
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
                    <Feather name="message-circle" size={20} color={c.verde} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: c.negro,
                        marginBottom: 3,
                      }}
                    >
                      Habla con NutriBot
                    </Text>
                    <Text style={{ fontSize: 13, color: c.grisTexto, lineHeight: 18 }}>
                      Resuelve dudas sobre la alimentación de {perfilActivo.nombre}.
                    </Text>
                  </View>
                  <Feather name="arrow-right" size={18} color={c.grisTexto} />
                </View>
              </Pressable>
            </>
          )}
        </ScrollView>
        <AnuncioBanner />
      </SafeAreaView>
    </View>
  );
}

// ─── HoldLactancia (estado "solo leche" para bebés < 6 meses) ─────────────────

function HoldLactancia({ perfil }: { perfil: PerfilHijo }) {
  const c = useColoresTema();
  // Para un bebé < 6m el primer hito pendiente es "primeros alimentos" (6 meses).
  const proximos = proximosHitos(perfil.fecha_nacimiento, 4);
  const cuentaRegresiva = proximos[0]
    ? mesesDiasHastaHito(perfil.fecha_nacimiento, proximos[0])
    : null;

  return (
    <View style={{ paddingHorizontal: 24 }}>
      {/* Tarjeta cálida */}
      <View
        style={{
          backgroundColor: c.verdeClaro,
          borderRadius: 18,
          paddingVertical: 28,
          paddingHorizontal: 22,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 60, lineHeight: 88 }}>🍼</Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: c.negro,
            letterSpacing: -0.4,
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          Por ahora, solo leche
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: c.grisTexto,
            textAlign: 'center',
            lineHeight: 20,
            marginTop: 8,
          }}
        >
          La lactancia, materna o de fórmula, es todo lo que {perfil.nombre} necesita hasta cerca de
          los 6 meses.
        </Text>

        {cuentaRegresiva && (
          <View
            style={{
              marginTop: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: c.card,
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: c.cardBorde,
            }}
          >
            <Feather name="clock" size={14} color={c.verde} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: c.negro }}>
              Primeros alimentos: en {cuentaRegresiva}
            </Text>
          </View>
        )}
      </View>

      {/* Próximos hitos */}
      {proximos.length > 0 && (
        <>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: c.grisTexto,
              letterSpacing: 2,
              marginTop: 32,
              marginBottom: 16,
            }}
          >
            LO QUE VIENE
          </Text>
          <View style={{ gap: 12 }}>
            {proximos.map((h) => (
              <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    backgroundColor: c.card,
                    borderWidth: 1,
                    borderColor: c.cardBorde,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{h.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.negro }}>
                    {h.titulo}
                  </Text>
                  <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 2 }}>
                    {tiempoHastaHito(perfil.fecha_nacimiento, h)} · a los {h.edad_meses} meses
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Disclaimer médico */}
      <Text
        style={{
          fontSize: 12,
          color: c.grisTexto,
          lineHeight: 18,
          marginTop: 22,
          fontStyle: 'italic',
        }}
      >
        Cada bebé es único. Consulta con tu pediatra antes de comenzar la alimentación
        complementaria.
      </Text>
    </View>
  );
}

// ─── HeroDia ──────────────────────────────────────────────────────────────────

function HeroDia({ receta }: { receta: Receta }) {
  const c = useColoresTema();
  const etapaPrimaria = receta.etapas_compatibles[0] ?? 'inicio';
  const colorEtapa = COLOR_ETAPA[etapaPrimaria] ?? COLOR_ETAPA.inicio;
  const etapaInfo = getEtapaInfo(etapaPrimaria);

  return (
    <Pressable
      onPress={() => router.push(`/receta/${receta.id}`)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
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

        {receta.es_premium && (
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
            <Feather name="star" size={11} color="#fff" />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 }}>
              PREMIUM
            </Text>
          </View>
        )}
      </View>

      {/* Título + stats */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: c.negro,
          letterSpacing: -0.4,
          lineHeight: 28,
          marginTop: 16,
        }}
      >
        {receta.nombre}
      </Text>
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

// ─── MiniCard (sugerencia) ────────────────────────────────────────────────────

function MiniCard({ receta, esUltimo }: { receta: Receta; esUltimo: boolean }) {
  const c = useColoresTema();
  const etapaPrimaria = receta.etapas_compatibles[0] ?? 'inicio';
  const colorEtapa = COLOR_ETAPA[etapaPrimaria] ?? COLOR_ETAPA.inicio;
  const etapaInfo = getEtapaInfo(etapaPrimaria);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/receta/${receta.id}`)}
      activeOpacity={0.85}
      style={{
        flex: 1,
        marginRight: esUltimo ? 0 : 10,
      }}
    >
      <View
        style={{
          aspectRatio: 1,
          borderRadius: 14,
          overflow: 'hidden',
          backgroundColor: colorEtapa.bg,
          marginBottom: 10,
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
            <Text style={{ fontSize: 44, lineHeight: 66 }}>{etapaInfo.emoji}</Text>
          </View>
        )}
        {receta.es_premium && (
          <View
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              backgroundColor: 'rgba(26,23,20,0.92)',
              borderRadius: 999,
              width: 22,
              height: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="star" size={11} color="#fff" />
          </View>
        )}
      </View>
      <Text
        style={{ fontSize: 13, fontWeight: '600', color: c.negro, lineHeight: 17 }}
        numberOfLines={2}
      >
        {receta.nombre}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: c.grisTexto,
          marginTop: 4,
          fontVariant: ['tabular-nums'],
        }}
      >
        {receta.tiempo_preparacion} min
      </Text>
    </TouchableOpacity>
  );
}

// ─── MomentoPill ──────────────────────────────────────────────────────────────

function MomentoPill({
  momento,
  esAhora,
  onPress,
}: {
  momento: MomentoDia;
  esAhora: boolean;
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
        borderColor: esAhora ? c.negro : c.cardBorde,
        backgroundColor: esAhora ? c.negro : c.card,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: esAhora ? c.fondoApp : c.negro,
        }}
      >
        {MOMENTO_LABEL[momento]}
      </Text>
      {esAhora && (
        <Text
          style={{
            fontSize: 9,
            fontWeight: '800',
            color: c.fondoApp,
            letterSpacing: 1.2,
            opacity: 0.7,
            marginLeft: 6,
          }}
        >
          AHORA
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Inline atoms (mismo patrón que receta/[id].tsx) ──────────────────────────

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
