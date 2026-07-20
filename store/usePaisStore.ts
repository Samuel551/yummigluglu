import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaisId } from '@/constants/Paises';

const CLAVE = 'yummigluglu-pais';

interface PaisState {
  pais: PaisId;
  /**
   * True apenas el usuario elige un país a mano. Sirve para que `hidratar()`
   * (que es async y en nativo puede tardar cientos de ms) NO pise una selección
   * más nueva que la del storage. Ver comentario en `hidratar`.
   */
  elegidoPorUsuario: boolean;
  setPais: (pais: PaisId) => Promise<void>;
  hidratar: () => Promise<void>;
}

export const usePaisStore = create<PaisState>((set, get) => ({
  pais: 'todos',
  elegidoPorUsuario: false,

  setPais: async (pais) => {
    set({ pais, elegidoPorUsuario: true });
    await AsyncStorage.setItem(CLAVE, pais);
  },

  hidratar: async () => {
    const guardado = await AsyncStorage.getItem(CLAVE);
    if (!guardado) return;

    // Race real en nativo: `hidratar()` arranca al montar el root layout, pero
    // AsyncStorage en dispositivo es un bridge nativo lento. Si el usuario llega
    // a Perfil y elige un país ANTES de que esta lectura resuelva, sin este guard
    // el valor viejo del storage pisaba la selección recién hecha y el catálogo
    // volvía silenciosamente al país anterior. En web no se veía porque
    // AsyncStorage usa localStorage y resuelve en un microtask.
    if (get().elegidoPorUsuario) return;

    set({ pais: guardado as PaisId });
  },
}));
