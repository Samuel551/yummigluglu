/**
 * Fork WEB de `lib/ads.ts` — Metro resuelve `.web.ts` antes que `.ts` al
 * bundlear para web, así que este archivo reemplaza al real en ese target.
 *
 * ¿Por qué existe? Metro arma el grafo de dependencias por análisis ESTÁTICO:
 * el `require('react-native-google-mobile-ads')` de ads.ts entra al bundle web
 * aunque viva detrás de un guard `Platform.OS === 'web'` (el guard protege el
 * runtime, no el bundleo). El módulo importa internals nativos de react-native
 * y el bundle web falla. Con este fork, ads.ts ni siquiera entra al grafo web.
 *
 * Debe exportar EXACTAMENTE la misma API que ads.ts, todo no-op.
 */

type ModuloAds = typeof import('react-native-google-mobile-ads');

export function cargarModuloAds(): ModuloAds | null {
  return null;
}

// Los IDs nunca se consumen en web (el módulo es null y todo hace no-op),
// pero se mantiene la firma para que los consumidores no distingan targets.
export function getBannerUnitId(): string {
  return '';
}

export function getIntersticialUnitId(): string {
  return '';
}

export function getRecompensadoUnitId(): string {
  return '';
}

export async function inicializarSdkAds(): Promise<boolean> {
  return false;
}
