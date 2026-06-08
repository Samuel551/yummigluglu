import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaisId } from '@/constants/Paises';

const CLAVE = 'yummigluglu-pais';

interface PaisState {
  pais: PaisId;
  setPais: (pais: PaisId) => Promise<void>;
  hidratar: () => Promise<void>;
}

export const usePaisStore = create<PaisState>((set) => ({
  pais: 'todos',

  setPais: async (pais) => {
    set({ pais });
    await AsyncStorage.setItem(CLAVE, pais);
  },

  hidratar: async () => {
    const guardado = await AsyncStorage.getItem(CLAVE);
    if (guardado) set({ pais: guardado as PaisId });
  },
}));
