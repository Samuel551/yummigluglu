import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  saludosActivos,
  setSaludosActivos,
  reprogramarSaludos,
  cancelarSaludos,
  MESES_CUMPLEMES_MAX,
  probarSaludosAhora,
} from '@/lib/saludos';
import { solicitarPermisosNotificaciones } from '@/lib/notificaciones';
import { formatearVencimiento } from '@/lib/planes';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { usePerfilStore, MAX_PERFILES_FREE } from '@/store/usePerfilStore';
import { useTemaStore } from '@/store/useTemaStore';
import { usePaisStore } from '@/store/usePaisStore';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { useEsAdmin } from '@/hooks/useEsAdmin';
import { formatearEdad } from '@/constants/Etapas';
import { getPais } from '@/constants/Paises';
import { BanderaPais } from '@/components/BanderaPais';
import { ModalPais } from '@/components/ModalPais';

export default function PerfilScreen() {
  const c = useColoresTema();
  const insets = useSafeAreaInsets();
  const setTema = useTemaStore((s) => s.setTema);
  const { usuario, cerrarSesion, cargando } = useAuthStore();
  const { perfiles, perfilActivo, setPerfilActivo } = usePerfilStore();
  const { pais, setPais } = usePaisStore();
  const esPremium = useSuscripcionStore((s) => s.esPremium);
  const suscripcion = useSuscripcionStore((s) => s.suscripcion);
  const vencimientoPremium = formatearVencimiento(suscripcion?.expires_at);
  const esAdmin = useEsAdmin();
  const [modalPaisVisible, setModalPaisVisible] = useState(false);
  const limiteAlcanzadoFree = perfiles.length >= MAX_PERFILES_FREE && !esPremium;
  const paisActual = getPais(pais);

  /**
   * Saludos de cumpleaños. La preferencia vive en AsyncStorage (es por
   * DISPOSITIVO: las notificaciones locales las programa el teléfono que las
   * tiene), así que hay que hidratarla al montar en vez de leerla de un store.
   */
  const [saludos, setSaludos] = useState(true);

  useEffect(() => {
    saludosActivos().then(setSaludos);
  }, []);

  const cambiarSaludos = async (activos: boolean) => {
    setSaludos(activos); // optimista: el Switch no puede quedarse trabado

    if (!activos) {
      await setSaludosActivos(false);
      // Al apagar hay que CANCELAR lo ya programado: las notificaciones locales
      // viven en el SISTEMA y seguirían sonando aunque la preferencia diga que no.
      await cancelarSaludos().catch(() => {});
      return;
    }

    // ⚠️ Prender el switch sin permiso dejaría un control que dice "activado" y
    // no manda nada nunca — la peor clase de bug, porque el usuario no tiene
    // forma de darse cuenta. Se piden acá, que además es el momento en contexto:
    // acaba de decir que los quiere. Este es también el único camino para quien
    // ya tenía la app instalada y nunca pasó por el onboarding nuevo.
    const permiso = await solicitarPermisosNotificaciones().catch(() => false);
    if (!permiso) {
      setSaludos(false);
      Alert.alert(
        'Permiso necesario',
        'Para enviarte los saludos necesitamos permiso para mostrar notificaciones. Puedes activarlo en los ajustes de tu teléfono.'
      );
      return;
    }

    await setSaludosActivos(true);
    await reprogramarSaludos(perfiles).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.fondoApp }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          {/* ── HEADER EDITORIAL ── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
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
              MI CUENTA
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
              {esPremium ? (
                <>
                  Tu cuenta <Text style={{ color: c.verde }}>Premium</Text>
                </>
              ) : (
                'Tu cuenta'
              )}
            </Text>
            {usuario?.email && (
              <Text
                style={{
                  fontSize: 14,
                  color: c.grisTexto,
                  lineHeight: 20,
                  marginTop: 8,
                }}
                numberOfLines={1}
              >
                {usuario.email}
              </Text>
            )}
          </View>

          {/* ── ACCESO A LA PANTALLA PREMIUM (solo para premium) ──
              🔴 Sin esto, un suscriptor NO TIENE forma de llegar a `/premium`.
              La única fila que navegaba ahí es la de "Agregar otro hijo", y solo
              aparece cuando un usuario FREE llega al límite de perfiles.
              O sea: arreglamos la pantalla y la puerta seguía sin existir.
              Un estado sin salida no se arregla arreglando el destino. */}
          {esPremium ? (
            <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
              <TouchableOpacity onPress={() => router.push('/premium')} activeOpacity={0.85}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    backgroundColor: c.verdeClaro,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: c.verde,
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: c.verde,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name="award" size={20} color={c.blanco} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: c.negro }}>
                      Tu Premium está activo
                    </Text>
                    <Text style={{ fontSize: 12.5, color: c.grisTexto, marginTop: 3 }}>
                      {/* Sin fecha = premium de cortesía: no renueva nada.
                          Decir "se renueva" ahí sería mentirle al usuario. */}
                      {vencimientoPremium
                        ? `Se renueva el ${vencimientoPremium}`
                        : 'Ver detalles y administrar'}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={c.verde} />
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Separador */}
          <Separator c={c} />

          {/* ── CUENTA ── */}
          <Eyebrow label="CUENTA" c={c} />
          <SectionList c={c}>
            <RowItem
              icon="mail"
              label="Email"
              valor={usuario?.email ?? '—'}
              onPress={() => router.push('/editar-cuenta')}
              c={c}
              isFirst
            />
            <RowItem
              icon="lock"
              label="Contraseña"
              valor="••••••••"
              onPress={() => router.push('/editar-cuenta')}
              c={c}
            />
            {/* Fila propia aunque lleve a la misma pantalla que las de arriba: Google
                exige que la eliminación de cuenta sea FÁCIL DE ENCONTRAR, y escondida
                detrás de "Email" no lo es. */}
            <RowItem
              icon="trash-2"
              label="Eliminar cuenta"
              valor=""
              onPress={() => router.push('/editar-cuenta')}
              c={c}
            />
          </SectionList>

          {/* ── PERFILES ── */}
          <Eyebrow
            label="PERFILES"
            c={c}
            microcopy={
              !esPremium ? `${perfiles.length} de ${MAX_PERFILES_FREE} en plan gratuito` : undefined
            }
          />
          <SectionList c={c}>
            {perfiles.map((p, idx) => {
              const esActivo = perfilActivo?.id === p.id;
              return (
                <View
                  key={p.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 13,
                    borderTopWidth: idx > 0 ? 1 : 0,
                    borderTopColor: c.cardBorde,
                  }}
                >
                  {/* Avatar — tap selecciona perfil activo */}
                  <TouchableOpacity
                    onPress={() => setPerfilActivo(p)}
                    activeOpacity={0.7}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: esActivo ? c.verdeClaro : c.grisClaro,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                      borderWidth: esActivo ? 2 : 0,
                      borderColor: c.verde,
                    }}
                    accessibilityLabel={
                      esActivo ? `${p.nombre} (perfil activo)` : `Activar perfil de ${p.nombre}`
                    }
                  >
                    <Text style={{ fontSize: 22 }}>{p.avatar_emoji}</Text>
                  </TouchableOpacity>

                  {/* Info perfil — tap edita */}
                  <TouchableOpacity
                    onPress={() => router.push(`/editar-perfil/${p.id}`)}
                    activeOpacity={0.6}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    accessibilityLabel={`Editar perfil de ${p.nombre}`}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 15,
                          fontWeight: '700',
                          color: c.negro,
                          letterSpacing: -0.1,
                        }}
                      >
                        {p.nombre}
                      </Text>
                      <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 2 }}>
                        {formatearEdad(p.fecha_nacimiento)}
                      </Text>
                    </View>

                    {esActivo && (
                      <View
                        style={{
                          backgroundColor: c.verdeClaro,
                          borderRadius: 999,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          marginRight: 10,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: c.verde,
                            fontWeight: '700',
                            letterSpacing: 0.8,
                          }}
                        >
                          ACTIVO
                        </Text>
                      </View>
                    )}
                    <Feather name="chevron-right" size={16} color={c.grisTexto} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </SectionList>

          {/* Agregar hijo — dos variantes */}
          <View style={{ paddingHorizontal: 24, marginTop: 4 }}>
            {limiteAlcanzadoFree ? (
              <TouchableOpacity
                onPress={() => router.push('/premium')}
                activeOpacity={0.85}
                style={{
                  backgroundColor: c.card,
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderWidth: 1.5,
                  borderColor: c.naranja,
                  borderStyle: 'dashed',
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#1A1714',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="star" size={16} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: c.naranja,
                      letterSpacing: 1.5,
                      marginBottom: 2,
                    }}
                  >
                    PREMIUM
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: c.negro,
                      letterSpacing: -0.1,
                    }}
                  >
                    Agregar más hijos
                  </Text>
                  <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 2 }}>
                    El plan gratuito incluye hasta {MAX_PERFILES_FREE} perfiles.
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/onboarding')}
                activeOpacity={0.8}
                style={{
                  backgroundColor: c.card,
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderWidth: 1.5,
                  borderColor: c.verde,
                  borderStyle: 'dashed',
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: c.verdeClaro,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="user-plus" size={18} color={c.verde} />
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: c.verde,
                    letterSpacing: -0.1,
                  }}
                >
                  Agregar otro hijo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── REGIÓN ── */}
          <Eyebrow label="REGIÓN" c={c} />
          <SectionList c={c}>
            <TouchableOpacity
              onPress={() => setModalPaisVisible(true)}
              activeOpacity={0.6}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 13,
              }}
              accessibilityLabel="Cambiar país"
            >
              <View
                style={{
                  width: 28,
                  alignItems: 'center',
                  marginRight: 14,
                }}
              >
                <Feather name="globe" size={18} color={c.negro} style={{ opacity: 0.85 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: c.grisTexto,
                    fontWeight: '600',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  País para recetas
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: c.negro,
                    fontWeight: '600',
                    letterSpacing: -0.1,
                  }}
                >
                  {paisActual.nombre}
                </Text>
              </View>
              <View style={{ marginRight: 10 }}>
                <BanderaPais
                  uri={paisActual.imagen}
                  emoji={paisActual.bandera}
                  ancho={28}
                  alto={20}
                  colorPlaceholder={c.grisClaro}
                />
              </View>
              <Feather name="chevron-right" size={16} color={c.grisTexto} />
            </TouchableOpacity>
          </SectionList>

          {/* ── APARIENCIA ── */}
          <Eyebrow label="APARIENCIA" c={c} />
          <SectionList c={c}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 13,
              }}
            >
              <View
                style={{
                  width: 28,
                  alignItems: 'center',
                  marginRight: 14,
                }}
              >
                <Feather
                  name={c.isDark ? 'moon' : 'sun'}
                  size={18}
                  color={c.negro}
                  style={{ opacity: 0.85 }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: c.negro,
                    letterSpacing: -0.1,
                  }}
                >
                  Modo oscuro
                </Text>
                <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 2 }}>
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
          </SectionList>

          {/* ── NOTIFICACIONES ──
              🔴 Este toggle NO es un lujo. Sin él, el único modo que tiene un
              padre de dejar de recibir los saludos es apagar las notificaciones
              de la app entera desde Ajustes de Android — y ahí se lleva puestos
              también los recordatorios de comida de la agenda. Un interruptor
              propio evita que un "esto me molesta" se convierta en perder todo. */}
          <Eyebrow label="NOTIFICACIONES" c={c} />
          <SectionList c={c}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13 }}>
              <View style={{ width: 28, alignItems: 'center', marginRight: 14 }}>
                <Text style={{ fontSize: 18, lineHeight: 27 }}>🎂</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: c.negro,
                    letterSpacing: -0.1,
                  }}
                >
                  Saludos de cumpleaños
                </Text>
                <Text style={{ fontSize: 12, color: c.grisTexto, marginTop: 2 }}>
                  Cumpleaños y cumplemés hasta los {MESES_CUMPLEMES_MAX} meses
                </Text>
              </View>
              <Switch
                value={saludos}
                onValueChange={cambiarSaludos}
                trackColor={{ false: '#D1D5DB', true: c.verde }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* 🔴 SOLO EN DESARROLLO. `__DEV__` es `false` en cualquier build de
                preview o producción, así que este bloque NO existe para ningún
                usuario final — Metro lo elimina del bundle.
                Existe porque los saludos apuntan a fechas reales y sin esto la
                única forma de probarlos sería esperar semanas o mentirle el
                reloj al teléfono. */}
            {__DEV__ ? (
              <TouchableOpacity
                onPress={async () => {
                  const resumen = await probarSaludosAhora(perfiles);
                  Alert.alert('Prueba de saludos', resumen);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 13,
                    borderTopWidth: 1,
                    borderTopColor: c.cardBorde,
                  }}
                >
                  <View style={{ width: 28, alignItems: 'center', marginRight: 14 }}>
                    <Text style={{ fontSize: 16, lineHeight: 24 }}>🧪</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: c.negro }}>
                      Probar saludo ahora
                    </Text>
                    <Text style={{ fontSize: 11.5, color: c.grisTexto, marginTop: 2 }}>
                      Solo en desarrollo · llega en 10 segundos
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={c.grisTexto} />
                </View>
              </TouchableOpacity>
            ) : null}
          </SectionList>

          {/* ── AVANZADO — solo para admins ──
              No se renderiza para el resto: ni el título de la sección.
              🔴 Esto es UI, NO seguridad. El gate real es RLS + es_admin(). */}
          {esAdmin && (
            <>
              <Eyebrow label="AVANZADO" c={c} />
              <SectionList c={c}>
                <RowItem
                  icon="shield"
                  label="Panel admin"
                  valor=""
                  onPress={() => router.push('/admin')}
                  c={c}
                  isFirst
                />
              </SectionList>
            </>
          )}

          {/* ── CERRAR SESIÓN ── */}
          <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
            <TouchableOpacity
              onPress={cerrarSesion}
              disabled={cargando}
              activeOpacity={0.7}
              style={{
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                borderWidth: 1.5,
                borderColor: '#FCA5A5',
                backgroundColor: c.card,
              }}
              accessibilityLabel="Cerrar sesión"
            >
              {cargando ? (
                <ActivityIndicator color="#DC2626" size="small" />
              ) : (
                <>
                  <Feather name="log-out" size={15} color="#DC2626" />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: '#DC2626',
                      letterSpacing: 0.2,
                    }}
                  >
                    Cerrar sesión
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modal selector de país */}
      <ModalPais
        visible={modalPaisVisible}
        paisActual={pais}
        onSelect={(p) => {
          setPais(p);
          setModalPaisVisible(false);
        }}
        onClose={() => setModalPaisVisible(false)}
      />
    </View>
  );
}

// ─── Atoms reutilizables ──────────────────────────────────────────────────────

function Eyebrow({
  label,
  c,
  microcopy,
}: {
  label: string;
  c: ReturnType<typeof useColoresTema>;
  microcopy?: string;
}) {
  return (
    <View style={{ paddingHorizontal: 24, marginTop: 24, marginBottom: 8 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: c.grisTexto,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      {microcopy && (
        <Text style={{ fontSize: 11, color: c.grisTexto, marginTop: 4, opacity: 0.8 }}>
          {microcopy}
        </Text>
      )}
    </View>
  );
}

function SectionList({
  children,
  c: _c,
}: {
  children: React.ReactNode;
  c: ReturnType<typeof useColoresTema>;
}) {
  return <View style={{ paddingHorizontal: 24 }}>{children}</View>;
}

function Separator({ c }: { c: ReturnType<typeof useColoresTema> }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: c.cardBorde,
        marginHorizontal: 24,
        marginTop: 28,
        marginBottom: 0,
      }}
    />
  );
}

function RowItem({
  icon,
  label,
  valor,
  onPress,
  c,
  isFirst,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  valor: string;
  onPress: () => void;
  c: ReturnType<typeof useColoresTema>;
  isFirst?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: c.cardBorde,
      }}
    >
      <View style={{ width: 28, alignItems: 'center', marginRight: 14 }}>
        <Feather name={icon} size={18} color={c.negro} style={{ opacity: 0.85 }} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 11,
            color: c.grisTexto,
            fontWeight: '600',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            marginBottom: valor ? 2 : 0,
          }}
        >
          {label}
        </Text>
        {valor !== '' && (
          <Text
            style={{
              fontSize: 15,
              color: c.negro,
              fontWeight: '600',
              letterSpacing: -0.1,
            }}
            numberOfLines={1}
          >
            {valor}
          </Text>
        )}
      </View>
      <Feather name="chevron-right" size={16} color={c.grisTexto} />
    </TouchableOpacity>
  );
}
