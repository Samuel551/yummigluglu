import { View } from 'react-native';
import { useAnunciosStore } from '@/store/useAnunciosStore';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';
import { useColoresTema } from '@/hooks/useColoresTema';
import { cargarModuloAds, getBannerUnitId } from '@/lib/ads';

/**
 * Banner de AdMob, pensado para ir ANCLADO al fondo de una pantalla (arriba de
 * la tab bar). Se renderiza SOLO para usuarios free y cuando el SDK está listo.
 *
 * Devuelve `null` (no ocupa espacio ni dibuja la barra) si:
 * - el usuario es premium  → regla innegociable: premium nunca ve ads.
 * - el SDK todavía no inicializó (`listo === false`).
 * - el módulo nativo no está disponible (web / dev client sin recompilar).
 */
export function AnuncioBanner() {
  const c = useColoresTema();
  const listo = useAnunciosStore((s) => s.listo);
  const esPremium = useSuscripcionStore((s) => s.esPremium);
  const suscripcionResuelta = useSuscripcionStore((s) => s.suscripcionResuelta);

  // `suscripcionResuelta` NO es redundante con `esPremium`: el SDK de anuncios se
  // inicializa apenas abre la app, mientras que la suscripción llega por red unos
  // instantes después. En esa ventana `esPremium` todavía vale false por defecto, y
  // sin este guard un usuario premium veía el banner en cada arranque en frío.
  if (!listo || !suscripcionResuelta || esPremium) return null;

  const mod = cargarModuloAds();
  if (!mod) return null;

  const { BannerAd, BannerAdSize } = mod;

  return (
    <View
      style={{
        alignItems: 'center',
        width: '100%',
        backgroundColor: c.fondoApp,
        borderTopWidth: 1,
        borderTopColor: c.cardBorde,
        paddingVertical: 4,
      }}
    >
      <BannerAd unitId={getBannerUnitId()} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}
