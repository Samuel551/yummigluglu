import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme as nwColorScheme } from 'nativewind';

const CLAVE_TEMA = 'yummigluglu-tema';

export type Tema = 'light' | 'dark';

interface TemaState {
  tema: Tema;
  hidratado: boolean;
  hidratar: () => Promise<void>;
  setTema: (t: Tema) => Promise<void>;
  alternar: () => Promise<void>;
}

export const useTemaStore = create<TemaState>((set, get) => ({
  tema: 'light',
  hidratado: false,

  hidratar: async () => {
    const guardado = await AsyncStorage.getItem(CLAVE_TEMA);
    const tema: Tema = guardado === 'dark' ? 'dark' : 'light';
    nwColorScheme.set(tema);
    set({ tema, hidratado: true });
  },

  setTema: async (t) => {
    nwColorScheme.set(t);
    set({ tema: t });
    await AsyncStorage.setItem(CLAVE_TEMA, t);
  },

  alternar: async () => {
    const actual = get().tema;
    await get().setTema(actual === 'dark' ? 'light' : 'dark');
  },
}));
