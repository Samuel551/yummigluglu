import { create } from 'zustand';
import { sha256 } from 'js-sha256';

// js-sha256 es JS puro (no nativo) — funciona en native, web y Node sin rebuild de APK.
// crypto.subtle (Web Crypto API) NO existe en React Native runtime.
const HASH_ADMIN = process.env.EXPO_PUBLIC_ADMIN_PASSWORD_HASH ?? '';

interface AdminState {
  autenticado: boolean;
  autenticar: (password: string) => Promise<boolean>;
  cerrarAdmin: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  autenticado: false,

  autenticar: async (password) => {
    const hash = sha256(password);
    const ok = hash === HASH_ADMIN;
    if (ok) set({ autenticado: true });
    return ok;
  },

  cerrarAdmin: () => set({ autenticado: false }),
}));
