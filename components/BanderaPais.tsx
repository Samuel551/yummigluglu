import { useState } from 'react';
import { View, Image, Text } from 'react-native';

/**
 * Bandera de país con placeholder.
 *
 * Las banderas vienen de flagcdn.com (imágenes remotas). Sin placeholder, al
 * abrir el modal se veían 6 huecos vacíos hasta que resolvían las requests.
 *
 * Por qué NO usamos el emoji (🇨🇱) como render principal, que sería instantáneo
 * y sin red: los emoji de bandera NO renderizan en buena parte de los Android
 * (varía por fabricante y versión) — ahí se ven como dos letras sueltas ("CL"),
 * que queda peor que la imagen. La imagen se ve igual en todos lados y trae los
 * escudos correctos (México, Venezuela). El costo de red es de una sola vez:
 * el Image de RN cachea en disco, así que a partir de la segunda apertura del
 * modal es instantáneo.
 */
export function BanderaPais({
  uri,
  emoji,
  ancho = 32,
  alto = 22,
  colorPlaceholder,
}: {
  uri: string | null;
  emoji: string;
  ancho?: number;
  alto?: number;
  colorPlaceholder: string;
}) {
  const [cargada, setCargada] = useState(false);

  // Sin imagen (caso "Todos" 🌎) → el emoji, que no es bandera y sí renderiza.
  if (!uri) {
    return <Text style={{ fontSize: alto + 4, lineHeight: alto + 10 }}>{emoji}</Text>;
  }

  return (
    <View
      style={{
        width: ancho,
        height: alto,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: cargada ? 'transparent' : colorPlaceholder,
      }}
    >
      <Image
        source={{ uri }}
        style={{ width: ancho, height: alto }}
        resizeMode="cover"
        onLoad={() => setCargada(true)}
      />
    </View>
  );
}
