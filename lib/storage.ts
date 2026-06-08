import { supabase } from './supabase';

const BUCKET_RECETAS_IMAGENES = 'recetas-imagenes';

/**
 * Sube una imagen local (URI de expo-image-picker) al bucket de Supabase Storage.
 *
 * Convierte el URI local a ArrayBuffer (la forma recomendada por Supabase para RN)
 * y sube con nombre `{recetaId}-{timestamp}.jpg`. El timestamp evita problemas de cache
 * y permite mantener histórico de subidas si fuera necesario.
 *
 * @returns URL pública de la imagen subida
 * @throws Error si el upload falla (incluye mensaje legible)
 */
export async function subirImagenReceta(uri: string, recetaId: string): Promise<string> {
  // 1) Leer el archivo local como ArrayBuffer
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('No se pudo leer la imagen seleccionada.');
  }
  const arrayBuffer = await response.arrayBuffer();

  // 2) Generar nombre único — receta + timestamp en seg
  const timestamp = Math.floor(Date.now() / 1000);
  const path = `${recetaId}-${timestamp}.jpg`;

  // 3) Subir a Supabase Storage
  const { error: errorUpload } = await supabase.storage
    .from(BUCKET_RECETAS_IMAGENES)
    .upload(path, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (errorUpload) {
    throw new Error(errorUpload.message || 'No se pudo subir la imagen.');
  }

  // 4) Obtener URL pública (el bucket es público, getPublicUrl no falla)
  const { data } = supabase.storage.from(BUCKET_RECETAS_IMAGENES).getPublicUrl(path);
  return data.publicUrl;
}
