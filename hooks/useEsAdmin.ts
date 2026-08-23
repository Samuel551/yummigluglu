import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Indica si el usuario de la sesión figura en la tabla `admins`.
 *
 * 🔴 Sirve SOLO para decidir qué se DIBUJA. Esconder el acceso al panel no es una
 * medida de seguridad: cualquiera puede navegar a `/admin` escribiendo la ruta.
 * La autorización real la hace RLS con `es_admin()`, que bloquea lectura y
 * escritura aunque la pantalla se abra. Esto es prolijidad de UI, nada más.
 *
 * Arranca en `false` a propósito: mientras la consulta viaja, la fila no se
 * muestra. Un parpadeo de más es preferible a que un usuario común llegue a ver
 * "Panel admin" en su perfil.
 *
 * La policy de `admins` es `select ... using (auth.uid() = user_id)`, así que un
 * usuario que no es admin recibe **cero filas, sin error** — no hay que tratar
 * ese caso como un fallo.
 */
export function useEsAdmin(): boolean {
  const usuario = useAuthStore((s) => s.usuario);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    if (!usuario) {
      setEsAdmin(false);
      return;
    }

    let cancelado = false;

    const verificar = async () => {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', usuario.id)
        .maybeSingle();

      if (cancelado) return;

      if (error) {
        // Ante la duda, no mostrar. Fallar hacia el lado discreto.
        console.warn('No se pudo verificar si el usuario es admin:', error);
        setEsAdmin(false);
        return;
      }

      setEsAdmin(data !== null);
    };

    verificar();

    return () => {
      cancelado = true;
    };
  }, [usuario]);

  return esAdmin;
}
