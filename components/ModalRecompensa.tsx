import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColoresTema } from '@/hooks/useColoresTema';

export interface OpcionRecompensa {
  id: string;
  titulo: string;
  descripcion: string;
  icon: keyof typeof Feather.glyphMap;
  disponible: boolean;
}

interface ModalRecompensaProps {
  visible: boolean;
  onClose: () => void;
  opciones: OpcionRecompensa[];
  onElegir: (id: string) => void;
  // true mientras se muestra el anuncio / se canjea el desbloqueo
  procesando?: boolean;
}

/**
 * Bottom sheet para elegir la recompensa de un anuncio recompensado.
 * Las opciones no disponibles se muestran atenuadas con "Próximamente"
 * (ej: mensajes extra de NutriBot hasta que exista la Fase 6).
 */
export function ModalRecompensa({
  visible,
  onClose,
  opciones,
  onElegir,
  procesando = false,
}: ModalRecompensaProps) {
  const c = useColoresTema();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        onPress={procesando ? undefined : onClose}
      >
        <Pressable
          style={{
            backgroundColor: c.fondoApp,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 32,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: c.cardBorde,
              marginBottom: 20,
            }}
          />

          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: '#F28B3B',
              letterSpacing: 1.5,
              marginBottom: 6,
            }}
          >
            RECOMPENSA GRATIS
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: c.negro,
              letterSpacing: -0.4,
              marginBottom: 18,
            }}
          >
            Elige tu recompensa
          </Text>

          {procesando ? (
            <View style={{ paddingVertical: 40, alignItems: 'center', gap: 14 }}>
              <ActivityIndicator size="large" color={c.verde} />
              <Text style={{ fontSize: 14, color: c.grisTexto, textAlign: 'center' }}>
                Cargando tu anuncio...
              </Text>
            </View>
          ) : (
            opciones.map((op) => (
              <TouchableOpacity
                key={op.id}
                disabled={!op.disponible}
                activeOpacity={0.85}
                onPress={() => onElegir(op.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: c.cardBorde,
                  backgroundColor: c.card,
                  marginBottom: 12,
                  opacity: op.disponible ? 1 : 0.5,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: op.disponible ? c.verdeClaro : c.grisClaro,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name={op.icon} size={20} color={op.disponible ? c.verde : c.grisTexto} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.negro }}>
                      {op.titulo}
                    </Text>
                    {!op.disponible && (
                      <View
                        style={{
                          backgroundColor: c.grisClaro,
                          borderRadius: 999,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ fontSize: 9, fontWeight: '700', color: c.grisTexto }}>
                          PRÓXIMAMENTE
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 13, color: c.grisTexto, lineHeight: 18, marginTop: 2 }}>
                    {op.descripcion}
                  </Text>
                </View>
                {op.disponible && <Feather name="chevron-right" size={20} color={c.grisTexto} />}
              </TouchableOpacity>
            ))
          )}

          {!procesando && (
            <TouchableOpacity
              onPress={onClose}
              style={{ paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: c.grisTexto }}>Ahora no</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
