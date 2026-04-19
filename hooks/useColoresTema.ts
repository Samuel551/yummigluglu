import { Colors, type ThemePalette } from '@/constants/Colors';
import { useTemaStore } from '@/store/useTemaStore';

/**
 * Devuelve la paleta de colores según el tema activo (light/dark).
 * Usar en pantallas con inline `style` o cuando se necesitan colores hex.
 * La fuente de verdad es `useTemaStore` — garantiza re-render al cambiar el tema.
 */
export function useColoresTema(): ThemePalette & { isDark: boolean } {
  const tema = useTemaStore((s) => s.tema);
  const isDark = tema === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;
  return { ...palette, isDark };
}
