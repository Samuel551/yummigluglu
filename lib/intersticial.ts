import { cargarModuloAds, getIntersticialUnitId } from '@/lib/ads';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';

/**
 * Manager singleton del anuncio intersticial (pantalla completa).
 *
 * Filosofía anti-molestia (ver CLAUDE.md § Anuncios): un intersticial mal usado
 * espanta usuarios y arruina las reviews. Por eso NO se muestra en cada acción,
 * sino solo en "momentos naturales" y con doble tope:
 *   1. Recién a partir del Nº TRIGGERS_POR_AD momento natural registrado.
 *   2. Nunca más de uno cada MIN_MS_ENTRE_ADS.
 *
 * El estado vive en memoria (por sesión), que es donde más importa la molestia.
 * Premium = cero anuncios: todas las funciones hacen no-op si `esPremium`.
 */

const MIN_MS_ENTRE_ADS = 15 * 60 * 1000; // no más de 1 intersticial cada 15 minutos
const TRIGGERS_POR_AD = 3; // recién al 3er momento natural

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- el tipo InterstitialAd vive en el módulo nativo cargado perezosamente
let intersticial: any = null;
let cargado = false;
let cargando = false;
let ultimoMostrado = 0;
let triggers = 0;

/**
 * ¿Hay que ocultar los anuncios? Sí cuando el usuario es premium, y TAMBIÉN
 * mientras todavía no sabemos si lo es.
 *
 * Ese segundo caso es el que importa: los anuncios se inicializan apenas abre la
 * app, pero la suscripción llega por red unos instantes después, y hasta entonces
 * `esPremium` vale false por defecto. Preguntar solo por él dejaba una ventana
 * en la que un usuario premium veía publicidad en cada arranque en frío.
 *
 * Ante la duda, no mostrar.
 */
function ocultarAnuncios(): boolean {
  const { esPremium, suscripcionResuelta } = useSuscripcionStore.getState();
  return esPremium || !suscripcionResuelta;
}

function crearYcargar(): void {
  const mod = cargarModuloAds();
  if (!mod || ocultarAnuncios()) return;
  if (cargando || intersticial) return;

  const { InterstitialAd, AdEventType } = mod;
  cargando = true;
  cargado = false;

  const ad = InterstitialAd.createForAdRequest(getIntersticialUnitId());

  ad.addAdEventListener(AdEventType.LOADED, () => {
    cargado = true;
    cargando = false;
  });

  ad.addAdEventListener(AdEventType.CLOSED, () => {
    // El usuario cerró el ad → registrar el momento y precargar el siguiente.
    ultimoMostrado = Date.now();
    cargado = false;
    intersticial = null;
    crearYcargar();
  });

  ad.addAdEventListener(AdEventType.ERROR, (e: unknown) => {
    console.warn('AdMob intersticial: error de carga', e);
    cargado = false;
    cargando = false;
    intersticial = null;
  });

  intersticial = ad;
  ad.load();
}

/**
 * Arranca la precarga del primer intersticial. Se llama una vez, tras
 * inicializar el SDK. Idempotente.
 */
export function precargarIntersticial(): void {
  crearYcargar();
}

/**
 * Registra un "momento natural" (ej: el usuario abrió el detalle de una receta).
 * Solo muestra el ad si se cumplen ambos topes de frecuencia. Si no toca mostrar,
 * únicamente incrementa el contador. No-op si premium o sin módulo.
 */
export function registrarMomentoIntersticial(): void {
  const mod = cargarModuloAds();
  if (!mod || ocultarAnuncios()) return;

  triggers += 1;
  if (triggers < TRIGGERS_POR_AD) return;
  if (Date.now() - ultimoMostrado < MIN_MS_ENTRE_ADS) return;

  if (!cargado || !intersticial) {
    // Todavía no hay ad listo: aseguramos que se esté precargando para la próxima.
    crearYcargar();
    return;
  }

  triggers = 0;
  try {
    intersticial.show();
  } catch (e) {
    console.warn('AdMob intersticial: no se pudo mostrar', e);
  }
}
