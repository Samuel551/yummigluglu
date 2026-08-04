import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColoresTema } from '@/hooks/useColoresTema';
import { useAsistenteStore } from '@/store/useAsistenteStore';
import { usePerfilStore } from '@/store/usePerfilStore';
import { NUTRIBOT_MAX_CHARS, NUTRIBOT_SUGERENCIAS } from '@/constants/Nutribot';
import type { MensajeIA, ResumenConversacion } from '@/types';

/**
 * NutriBot — asistente de alimentación infantil (Fase 6).
 *
 * Presentación `modal`. El envío pasa SIEMPRE por la Edge Function `nutribot`,
 * que es quien aplica el cupo y habla con Anthropic. Acá no hay ninguna clave
 * ni ninguna lógica de límite: el cliente solo pinta lo que el servidor dice.
 */
export default function AsistenteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colores = useColoresTema();

  const perfilActivo = usePerfilStore((s) => s.perfilActivo);
  const {
    mensajes,
    conversacionId,
    conversaciones,
    cargandoConversaciones,
    enviando,
    error,
    cupo,
    limiteAlcanzado,
    enviar,
    cargarCupo,
    cargarConversaciones,
    abrirConversacion,
    eliminarConversacion,
    nuevaConversacion,
    limpiarError,
  } = useAsistenteStore();

  const [texto, setTexto] = useState('');
  const [tecladoAbierto, setTecladoAbierto] = useState(false);
  const [historialVisible, setHistorialVisible] = useState(false);
  const listaRef = useRef<FlatList<MensajeIA>>(null);

  useEffect(() => {
    cargarCupo();
    cargarConversaciones();
  }, [cargarCupo, cargarConversaciones]);

  /**
   * Con `edgeToEdgeEnabled` + `adjustResize`, `insets.bottom` sigue reportando la
   * barra de navegación aunque el teclado la tape. Si dejáramos ese padding fijo,
   * el disclaimer flotaría sobre el teclado con un hueco. Por eso el inset se
   * aplica SOLO con el teclado cerrado.
   */
  useEffect(() => {
    const mostrar = Keyboard.addListener('keyboardDidShow', () => setTecladoAbierto(true));
    const ocultar = Keyboard.addListener('keyboardDidHide', () => setTecladoAbierto(false));
    return () => {
      mostrar.remove();
      ocultar.remove();
    };
  }, []);

  // Sin confirmación a propósito: ya no se pierde nada. La conversación actual
  // queda guardada y sigue estando en el panel de historial.
  const alEmpezarNueva = useCallback(() => {
    if (mensajes.length === 0) return;
    Keyboard.dismiss();
    nuevaConversacion();
  }, [mensajes.length, nuevaConversacion]);

  const abrirHistorial = useCallback(() => {
    Keyboard.dismiss();
    cargarConversaciones();
    setHistorialVisible(true);
  }, [cargarConversaciones]);

  const alElegirConversacion = useCallback(
    (id: string) => {
      setHistorialVisible(false);
      if (id !== conversacionId) abrirConversacion(id);
    },
    [conversacionId, abrirConversacion]
  );

  const confirmarEliminar = useCallback(
    (conversacion: ResumenConversacion) => {
      Alert.alert(
        'Eliminar conversación',
        `Se eliminará "${conversacion.titulo ?? 'Conversación'}". Esta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => eliminarConversacion(conversacion.id),
          },
        ]
      );
    },
    [eliminarConversacion]
  );

  // Autoscroll al último mensaje. El delay deja que el layout se acomode antes
  // de medir — sin él, el scroll queda corto en Android.
  useEffect(() => {
    if (mensajes.length === 0) return;
    const t = setTimeout(() => listaRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(t);
  }, [mensajes.length, enviando]);

  const enviarTexto = useCallback(
    (valor: string) => {
      const limpio = valor.trim();
      if (!limpio || enviando || limiteAlcanzado) return;
      setTexto('');
      enviar(limpio, perfilActivo?.id ?? null);
    },
    [enviando, limiteAlcanzado, enviar, perfilActivo?.id]
  );

  const restantes = cupo ? Math.max(0, cupo.limite - cupo.usados) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondoApp, paddingTop: insets.top }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colores.cardBorde,
          backgroundColor: colores.card,
        }}
      >
        <Text style={{ fontSize: 28, lineHeight: 42, marginRight: 10 }}>🥑</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: colores.negro }}>NutriBot</Text>
          {/* numberOfLines NO es redundante con el maxLength del nombre: defiende de los
              perfiles ya guardados con nombres largos, que existen y no se migran. */}
          <Text style={{ fontSize: 12, color: colores.grisTexto }} numberOfLines={1}>
            {perfilActivo
              ? `Respondiendo sobre ${perfilActivo.nombre}`
              : 'Asistente de alimentación'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={abrirHistorial}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          style={{ marginRight: 20 }}
          accessibilityLabel="Ver conversaciones guardadas"
        >
          <Feather name="clock" size={20} color={colores.grisTexto} />
        </TouchableOpacity>
        {mensajes.length > 0 && (
          <TouchableOpacity
            onPress={alEmpezarNueva}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            style={{ marginRight: 20 }}
            accessibilityLabel="Nueva conversación"
          >
            <Feather name="edit" size={20} color={colores.grisTexto} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Cerrar"
        >
          <Feather name="x" size={22} color={colores.grisTexto} />
        </TouchableOpacity>
      </View>

      {/* ── Contador de cupo ───────────────────────────────────────────── */}
      {restantes !== null && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 6,
            backgroundColor: restantes === 0 ? colores.premiumFondo : colores.seccion,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              textAlign: 'center',
              color: restantes === 0 ? colores.premium : colores.grisTexto,
            }}
          >
            {cupo?.esPremium
              ? `${restantes} mensajes disponibles este mes`
              : `${restantes} de ${cupo?.limite} mensajes gratuitos este mes`}
          </Text>
        </View>
      )}

      {/*
        `behavior="padding"` es OBLIGATORIO en ambas plataformas. Con
        `edgeToEdgeEnabled` (app.json) Android llama `setDecorFitsSystemWindows(false)`
        y el teclado NO redimensiona la ventana: se dibuja ENCIMA. Sin esto el input
        queda tapado. Va sin `keyboardVerticalOffset` — el hueco que se veía antes no
        lo causaba este componente, sino el doble pago de `insets.bottom` más abajo.
      */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        {/* ── Mensajes ─────────────────────────────────────────────────── */}
        <FlatList
          ref={listaRef}
          data={mensajes}
          keyExtractor={(_, i) => String(i)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 16,
            gap: 12,
            flexGrow: 1,
            justifyContent: mensajes.length === 0 ? 'center' : 'flex-start',
          }}
          renderItem={({ item }) => <Burbuja mensaje={item} colores={colores} />}
          ListEmptyComponent={
            <EstadoVacio
              colores={colores}
              nombre={perfilActivo?.nombre}
              onSugerencia={enviarTexto}
              deshabilitado={limiteAlcanzado}
            />
          }
          ListFooterComponent={
            enviando ? (
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: colores.card,
                  borderRadius: 16,
                  borderBottomLeftRadius: 4,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: colores.cardBorde,
                }}
              >
                <ActivityIndicator size="small" color={colores.verde} />
              </View>
            ) : null
          }
        />

        {/* ── Error / límite ───────────────────────────────────────────── */}
        {error && (
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 8,
              padding: 12,
              borderRadius: 12,
              backgroundColor: limiteAlcanzado ? colores.premiumFondo : colores.seccion,
              borderWidth: 1,
              borderColor: limiteAlcanzado ? colores.premium : colores.error,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: limiteAlcanzado ? colores.premium : colores.error,
                marginBottom: limiteAlcanzado && !cupo?.esPremium ? 10 : 0,
              }}
            >
              {error}
            </Text>

            {limiteAlcanzado && !cupo?.esPremium ? (
              <TouchableOpacity
                onPress={() => router.push('/premium')}
                style={{
                  backgroundColor: colores.premium,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                  Hazte premium
                </Text>
              </TouchableOpacity>
            ) : (
              !limiteAlcanzado && (
                <TouchableOpacity onPress={limpiarError} style={{ marginTop: 6 }}>
                  <Text style={{ fontSize: 12, color: colores.grisTexto }}>Descartar</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* ── Input ────────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 8,
            paddingHorizontal: 16,
            paddingTop: 8,
            // Sin `insets.bottom`: el input no toca el borde de la pantalla, el
            // disclaimer va debajo. El inset lo paga UN solo elemento — el último.
            paddingBottom: 8,
            borderTopWidth: 1,
            borderTopColor: colores.cardBorde,
            backgroundColor: colores.card,
          }}
        >
          <TextInput
            value={texto}
            onChangeText={setTexto}
            editable={!limiteAlcanzado}
            placeholder={
              limiteAlcanzado ? 'Alcanzaste tu límite de este mes' : 'Escribe tu pregunta...'
            }
            placeholderTextColor={colores.grisTexto}
            multiline
            maxLength={NUTRIBOT_MAX_CHARS}
            style={{
              flex: 1,
              maxHeight: 120,
              minHeight: 44,
              paddingHorizontal: 14,
              paddingTop: 12,
              paddingBottom: 12,
              borderRadius: 22,
              backgroundColor: colores.seccion,
              color: colores.negro,
              fontSize: 15,
            }}
          />
          <TouchableOpacity
            onPress={() => enviarTexto(texto)}
            disabled={!texto.trim() || enviando || limiteAlcanzado}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                !texto.trim() || enviando || limiteAlcanzado ? colores.grisClaro : colores.verde,
            }}
            accessibilityLabel="Enviar mensaje"
          >
            <Text style={{ fontSize: 18, color: '#FFFFFF' }}>↑</Text>
          </TouchableOpacity>
        </View>

        {/* ── Disclaimer ───────────────────────────────────────────────── */}
        {/* Único elemento que toca el borde inferior → el único que paga el inset. */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 6,
            paddingBottom: tecladoAbierto ? 6 : Math.max(insets.bottom, 6),
            backgroundColor: colores.card,
          }}
        >
          <Text style={{ fontSize: 10, textAlign: 'center', color: colores.grisTexto }}>
            NutriBot orienta, no reemplaza a tu pediatra.
          </Text>
        </View>
      </KeyboardAvoidingView>

      <PanelHistorial
        visible={historialVisible}
        onCerrar={() => setHistorialVisible(false)}
        conversaciones={conversaciones}
        conversacionActiva={conversacionId}
        cargando={cargandoConversaciones}
        colores={colores}
        insets={insets}
        onElegir={alElegirConversacion}
        onEliminar={confirmarEliminar}
      />
    </View>
  );
}

// ── Panel de conversaciones guardadas ────────────────────────────────────────

/**
 * Fecha corta para la lista: "12:37" si es de hoy, "Ayer", "30 jul" dentro del
 * año, "30 jul 2025" si es de otro año. Más corto que una fecha completa y más
 * útil que un "hace X" que obliga a calcular mentalmente.
 */
function fechaCorta(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';

  const hoy = new Date();
  const mismoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (mismoDia(fecha, hoy)) {
    return fecha.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  if (mismoDia(fecha, ayer)) return 'Ayer';

  return fecha.toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    ...(fecha.getFullYear() !== hoy.getFullYear() ? { year: 'numeric' } : {}),
  });
}

function PanelHistorial({
  visible,
  onCerrar,
  conversaciones,
  conversacionActiva,
  cargando,
  colores,
  insets,
  onElegir,
  onEliminar,
}: {
  visible: boolean;
  onCerrar: () => void;
  conversaciones: ResumenConversacion[];
  conversacionActiva: string | null;
  cargando: boolean;
  colores: ReturnType<typeof useColoresTema>;
  insets: { top: number; bottom: number };
  onElegir: (id: string) => void;
  onEliminar: (conversacion: ResumenConversacion) => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent
      onRequestClose={onCerrar}
    >
      <View style={{ flex: 1, backgroundColor: colores.fondoApp, paddingTop: insets.top }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colores.cardBorde,
            backgroundColor: colores.card,
          }}
        >
          <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: colores.negro }}>
            Conversaciones
          </Text>
          <TouchableOpacity
            onPress={onCerrar}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Cerrar historial"
          >
            <Feather name="x" size={22} color={colores.grisTexto} />
          </TouchableOpacity>
        </View>

        {cargando && conversaciones.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colores.verde} />
          </View>
        ) : (
          <FlatList
            data={conversaciones}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{
              padding: 16,
              gap: 10,
              flexGrow: 1,
              paddingBottom: Math.max(insets.bottom, 16),
            }}
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 44, lineHeight: 66 }}>💬</Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: colores.grisTexto,
                    textAlign: 'center',
                    marginTop: 8,
                    paddingHorizontal: 24,
                    lineHeight: 21,
                  }}
                >
                  Todavía no tienes conversaciones guardadas. Las que tengas con NutriBot aparecerán
                  aquí.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const activa = item.id === conversacionActiva;
              return (
                <TouchableOpacity
                  onPress={() => onElegir(item.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: colores.card,
                    borderWidth: 1,
                    borderColor: activa ? colores.verde : colores.cardBorde,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 15,
                        fontWeight: activa ? '700' : '600',
                        color: colores.negro,
                      }}
                    >
                      {item.titulo ?? 'Conversación'}
                    </Text>
                    <Text style={{ fontSize: 12, color: colores.grisTexto, marginTop: 3 }}>
                      {activa ? 'Abierta ahora · ' : ''}
                      {fechaCorta(item.updated_at)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onEliminar(item)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel={`Eliminar ${item.titulo ?? 'conversación'}`}
                  >
                    <Feather name="trash-2" size={17} color={colores.grisTexto} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

// ── Burbuja de mensaje ────────────────────────────────────────────────────────

function Burbuja({
  mensaje,
  colores,
}: {
  mensaje: MensajeIA;
  colores: ReturnType<typeof useColoresTema>;
}) {
  const esUsuario = mensaje.role === 'user';
  return (
    <View
      style={{
        alignSelf: esUsuario ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        borderRadius: 16,
        borderBottomRightRadius: esUsuario ? 4 : 16,
        borderBottomLeftRadius: esUsuario ? 16 : 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: esUsuario ? colores.verde : colores.card,
        borderWidth: esUsuario ? 0 : 1,
        borderColor: colores.cardBorde,
      }}
    >
      <Text
        style={{
          fontSize: 15,
          lineHeight: 21,
          color: esUsuario ? '#FFFFFF' : colores.negro,
        }}
      >
        {mensaje.content}
      </Text>
    </View>
  );
}

// ── Estado vacío ──────────────────────────────────────────────────────────────

function EstadoVacio({
  colores,
  nombre,
  onSugerencia,
  deshabilitado,
}: {
  colores: ReturnType<typeof useColoresTema>;
  nombre?: string;
  onSugerencia: (texto: string) => void;
  deshabilitado: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: 8 }}>
      <Text style={{ fontSize: 56, lineHeight: 84 }}>🥑</Text>
      <Text
        style={{
          fontSize: 19,
          fontWeight: '700',
          color: colores.negro,
          marginTop: 8,
          textAlign: 'center',
        }}
      >
        Hola, soy NutriBot
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colores.grisTexto,
          textAlign: 'center',
          marginTop: 6,
          lineHeight: 20,
        }}
      >
        {nombre
          ? `Pregúntame lo que quieras sobre la alimentación de ${nombre}.`
          : 'Pregúntame lo que quieras sobre alimentación infantil.'}
      </Text>

      {!deshabilitado && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 8, paddingTop: 20 }}
          style={{ marginHorizontal: -16 }}
        >
          {NUTRIBOT_SUGERENCIAS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => onSugerencia(s)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 18,
                backgroundColor: colores.card,
                borderWidth: 1,
                borderColor: colores.cardBorde,
              }}
            >
              <Text style={{ fontSize: 13, color: colores.negro }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
