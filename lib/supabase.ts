import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // AsyncStorage para persistir la sesión entre cierres de app
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // En mobile los tokens del deep link se parsean a mano en _layout.tsx
    // (detectSessionInUrl solo funciona en web). En web SÍ lo necesitamos:
    // es lo que captura la sesión al volver del redirect OAuth de Google.
    detectSessionInUrl: Platform.OS === 'web',
  },
});
