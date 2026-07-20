import { create } from 'zustand';
import { inicializarSdkAds } from '@/lib/ads';
import { precargarIntersticial } from '@/lib/intersticial';
import { precargarRecompensado } from '@/lib/recompensado';

/**
 * Estado global de anuncios. Fuente de verdad reactiva de si el SDK ya está listo,
 * para que el banner (y futuros formatos) se rendericen recién cuando AdMob puede
 * servir. Sigue el patrón de stores del proyecto (Zustand, llamada directa).
 */
interface AnunciosState {
  listo: boolean;
  inicializar: () => Promise<void>;
}

export const useAnunciosStore = create<AnunciosState>((set, get) => ({
  listo: false,

  inicializar: async () => {
    if (get().listo) return;
    const ok = await inicializarSdkAds();
    if (!ok) return; // web / dev client sin recompilar → queda en no-op silencioso
    set({ listo: true });
    // Arrancamos la precarga de los formatos on-demand apenas el SDK está listo.
    precargarIntersticial();
    precargarRecompensado();
  },
}));
