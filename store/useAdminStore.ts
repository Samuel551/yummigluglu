import { create } from 'zustand';

const HASH_ADMIN = process.env.EXPO_PUBLIC_ADMIN_PASSWORD_HASH ?? '';

async function sha256(texto: string): Promise<string> {
  const encoder = new TextEncoder();
  const datos = encoder.encode(texto);
  const buffer = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface AdminState {
  autenticado: boolean;
  autenticar: (password: string) => Promise<boolean>;
  cerrarAdmin: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  autenticado: false,

  autenticar: async (password) => {
    const hash = await sha256(password);
    const ok = hash === HASH_ADMIN;
    if (ok) set({ autenticado: true });
    return ok;
  },

  cerrarAdmin: () => set({ autenticado: false }),
}));
