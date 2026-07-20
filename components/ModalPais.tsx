import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PAISES, PaisId } from '@/constants/Paises';
import { BanderaPais } from '@/components/BanderaPais';
import { useColoresTema } from '@/hooks/useColoresTema';

/**
 * Selector de país (región) en modal.
 *
 * Vivía embebido en `app/(tabs)/perfil.tsx`. Se extrajo acá porque el catálogo
 * (`app/(tabs)/recetas.tsx`) también necesita dejar cambiar de país sin mandar
 * al usuario a Perfil a buscarlo. Duplicar la lista de países + el check de
 * seleccionado en dos pantallas era peor que compartir el componente.
 *
 * Es autosuficiente a propósito: resuelve la paleta con `useColoresTema()` en
 * vez de recibirla por prop, así cada call site solo pasa estado y callbacks.
 */
export function ModalPais({
  visible,
  paisActual,
  onSelect,
  onClose,
}: {
  visible: boolean;
  paisActual: PaisId;
  onSelect: (paisId: PaisId) => void;
  onClose: () => void;
}) {
  const c = useColoresTema();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: c.fondoApp,
            borderRadius: 20,
            width: '100%',
            maxWidth: 360,
            paddingTop: 24,
            paddingBottom: 16,
          }}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.grisTexto,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              REGIÓN
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: c.negro,
                letterSpacing: -0.4,
                lineHeight: 28,
              }}
            >
              Elige tu país
            </Text>
          </View>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: c.cardBorde,
              marginHorizontal: 24,
              marginBottom: 8,
            }}
          />

          {/* Lista */}
          <View style={{ paddingHorizontal: 24 }}>
            {PAISES.map((p, idx) => {
              const seleccionado = paisActual === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => onSelect(p.id)}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityState={{ selected: seleccionado }}
                  accessibilityLabel={`Ver recetas de ${p.nombre}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    borderTopWidth: idx > 0 ? 1 : 0,
                    borderTopColor: c.cardBorde,
                  }}
                >
                  <View style={{ marginRight: 14 }}>
                    <BanderaPais
                      uri={p.imagen}
                      emoji={p.bandera}
                      ancho={32}
                      alto={22}
                      colorPlaceholder={c.cardBorde}
                    />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      color: c.negro,
                      fontWeight: seleccionado ? '700' : '500',
                      letterSpacing: -0.1,
                    }}
                  >
                    {p.nombre}
                  </Text>
                  {seleccionado && <Feather name="check" size={18} color={c.verde} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
