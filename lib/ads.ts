import { Platform } from 'react-native';

/**
 * Capa de acceso a AdMob (react-native-google-mobile-ads).
 *
 * Reglas de oro (ver CLAUDE.md § Anuncios):
 * - Los anuncios van SOLO para usuarios free. El gate `esPremium` se aplica en
 *   cada punto de consumo (banner, intersticial, rewarded).
 * - El módulo es NATIVO: no existe en web ni en un dev client sin recompilar.
 *   Por eso se carga de forma perezosa y con guard de plataforma — igual que el
 *   patrón defensivo de `useSuscripcionStore` con RevenueCat. Nunca crashea:
 *   si no está disponible, todo hace no-op.
 * - ⚠️ La carga perezosa protege solo el RUNTIME. Metro resuelve el `require()`
 *   literal en BUILD time aunque esté detrás del guard, así que el bundle web
 *   se salva con el fork `lib/ads.web.ts` (Metro lo prefiere sobre este archivo
 *   al bundlear web). Si cambiás la API exportada acá, replicala en el fork.
 * - Público declarado: adultos/padres → NO dirigido a niños. La app es de comida
 *   para bebés, así que además limitamos el rating de los ads a PG (brand-safe).
 */

type ModuloAds = typeof import('react-native-google-mobile-ads');

// IDs de PRUEBA oficiales de Google (Android). Se usan SIEMPRE en desarrollo
// (evita clicks inválidos sobre unidades reales) y como fallback seguro en
// producción si falta la env var. Mostrar un ad de test en prod es inofensivo;
// mostrar un ad real mal configurado viola la política de tráfico inválido.
const TEST_IDS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  intersticial: 'ca-app-pub-3940256099942544/1033173712',
  recompensado: 'ca-app-pub-3940256099942544/5224354917',
} as const;

let modulo: ModuloAds | null = null;
let moduloIntentado = false;

/**
 * Carga perezosa del módulo nativo. Se cachea el resultado (incluido el null)
 * tras el primer intento para no reintentar en cada render. En web este archivo
 * directamente no se bundlea (lo reemplaza `ads.web.ts`) — el guard de abajo
 * queda como cinturón y tirantes.
 */
export function cargarModuloAds(): ModuloAds | null {
  if (Platform.OS === 'web') return null;
  if (moduloIntentado) return modulo;
  moduloIntentado = true;
  try {
    modulo = require('react-native-google-mobile-ads') as ModuloAds;
  } catch (e) {
    console.warn('AdMob: módulo nativo no disponible (¿dev client sin recompilar?)', e);
    modulo = null;
  }
  return modulo;
}

// En dev SIEMPRE test. En prod, la env real si existe; si falta, test como red de seguridad.
function resolver(envVal: string | undefined, testId: string): string {
  if (__DEV__) return testId;
  const limpio = envVal?.trim();
  return limpio ? limpio : testId;
}

export function getBannerUnitId(): string {
  return resolver(process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID, TEST_IDS.banner);
}

export function getIntersticialUnitId(): string {
  return resolver(process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID, TEST_IDS.intersticial);
}

export function getRecompensadoUnitId(): string {
  return resolver(process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID, TEST_IDS.recompensado);
}

/**
 * Recolecta el consentimiento del usuario vía UMP (User Messaging Platform),
 * la CMP de Google. Se llama ANTES de `initialize()`, que es el orden que
 * Google exige: primero se sabe qué consintió el usuario, después se pide el ad.
 *
 * ⚠️ FUERA del EEE / Reino Unido / Suiza esto es un NO-OP. El SDK resuelve la
 * geografía del lado del servidor, devuelve `NOT_REQUIRED` y NO muestra nada.
 * Por eso está acá aunque hoy la app se publique solo en LATAM: no molesta a
 * ningún usuario actual y evita un build entero el día que se agregue España.
 *
 * ⚠️ NO hace falta instalar nada: `user-messaging-platform` ya viaja dentro del
 * APK como dependencia `api` de react-native-google-mobile-ads (ver su
 * `android/build.gradle`). Antes de esto el SDK estaba en el binario sin usarse.
 *
 * ⚠️ Si falla, se sigue igual. Un error acá NO puede dejar la app sin anuncios:
 * sin consentimiento AdMob sirve ads no personalizados, que es peor que lo ideal
 * pero infinitamente mejor que cero ingresos. Por eso el catch traga y no corta.
 *
 * 🔴 ESTA ES LA MITAD QUE DESBLOQUEA LOS ADS, NO EL CUMPLIMIENTO COMPLETO.
 * Si algún día se publica en el EEE, Google exige ADEMÁS un punto de entrada
 * permanente para que el usuario cambie de opinión: `showPrivacyOptionsForm()`
 * detrás de una fila en Perfil, visible solo cuando
 * `getConsentInfo().privacyOptionsRequirementStatus === 'REQUIRED'`. Eso todavía
 * NO está hecho — y no hace falta mientras no haya usuarios del EEE.
 */
async function recolectarConsentimiento(mod: ModuloAds): Promise<void> {
  try {
    await mod.AdsConsent.gatherConsent();
  } catch (e) {
    console.warn('AdMob: no se pudo recolectar el consentimiento — se sigue sin él', e);
  }
}

/**
 * Inicializa el SDK de AdMob. Devuelve true si quedó listo.
 * No-op seguro en web / sin módulo nativo.
 */
export async function inicializarSdkAds(): Promise<boolean> {
  const mod = cargarModuloAds();
  if (!mod) return false;
  try {
    const mobileAds = mod.default;
    await mobileAds().setRequestConfiguration({
      // App de comida para bebés → ads brand-safe (PG como máximo).
      maxAdContentRating: mod.MaxAdContentRating.PG,
      // Público declarado en Play: adultos/padres. NO dirigido a niños.
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    // El consentimiento va ANTES de initialize(). Ver el bloque de arriba.
    await recolectarConsentimiento(mod);
    await mobileAds().initialize();
    return true;
  } catch (e) {
    console.warn('AdMob: fallo al inicializar el SDK', e);
    return false;
  }
}
