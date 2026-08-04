import { cargarModuloAds, getRecompensadoUnitId } from '@/lib/ads';
import { useSuscripcionStore } from '@/store/useSuscripcionStore';

/**
 * Manager singleton del anuncio recompensado (rewarded).
 *
 * A diferencia del intersticial, el rewarded es OPT-IN: el usuario elige verlo
 * a cambio de una recompensa (ej: desbloquear una receta premium 24h). Por eso
 * no tiene tope de frecuencia — lo dispara el usuario.
 *
 * Premium = no-op (ya tiene todo, no necesita recompensas). Web / dev client
 * sin recompilar = no-op silencioso.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- RewardedAd vive en el módulo nativo cargado perezosamente
let recompensado: any = null;
let cargado = false;
let cargando = false;

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
  if (cargando || recompensado) return;

  const { RewardedAd, RewardedAdEventType, AdEventType } = mod;
  cargando = true;
  cargado = false;

  const ad = RewardedAd.createForAdRequest(getRecompensadoUnitId());

  ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
    cargado = true;
    cargando = false;
  });

  ad.addAdEventListener(AdEventType.ERROR, (e: unknown) => {
    console.warn('AdMob rewarded: error de carga', e);
    cargado = false;
    cargando = false;
    recompensado = null;
  });

  ad.addAdEventListener(AdEventType.CLOSED, () => {
    // Cerrado (con o sin recompensa) → precargar el siguiente.
    cargado = false;
    recompensado = null;
    crearYcargar();
  });

  recompensado = ad;
  ad.load();
}

/** Arranca la precarga del primer rewarded. Idempotente. */
export function precargarRecompensado(): void {
  crearYcargar();
}

/** ¿Hay un rewarded cargado y listo para mostrarse ya? */
export function recompensadoDisponible(): boolean {
  return cargado && !!recompensado && !ocultarAnuncios();
}

/**
 * Muestra el rewarded. Resuelve `true` SOLO si el usuario ganó la recompensa
 * (vio el ad completo). Resuelve `false` si lo cerró antes, si no había ad
 * listo, o si el módulo no está disponible.
 */
export function mostrarRecompensado(): Promise<boolean> {
  return new Promise((resolve) => {
    const mod = cargarModuloAds();
    if (!mod || ocultarAnuncios() || !cargado || !recompensado) {
      resolve(false);
      return;
    }

    const { RewardedAdEventType, AdEventType } = mod;
    const ad = recompensado;
    let gano = false;
    let resuelto = false;

    const finalizar = (valor: boolean) => {
      if (resuelto) return;
      resuelto = true;
      resolve(valor);
    };

    ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      gano = true;
    });
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      finalizar(gano);
    });
    ad.addAdEventListener(AdEventType.ERROR, () => {
      finalizar(false);
    });

    try {
      ad.show();
    } catch (e) {
      console.warn('AdMob rewarded: no se pudo mostrar', e);
      finalizar(false);
    }
  });
}
