-- ============================================================
-- Yummi Glu Glu — Bucket de imágenes de recetas
-- ============================================================
-- Bucket público para hostear las imágenes/screenshots de recetas.
-- SELECT abierto (la app lee imágenes públicamente).
-- INSERT/UPDATE/DELETE solo para usuarios en la tabla admins.
-- ============================================================

-- ─── Crear bucket público ─────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recetas-imagenes',
  'recetas-imagenes',
  TRUE,
  10485760, -- 10 MB por archivo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─── Policies ─────────────────────────────────────────────────
-- Cualquiera (anon + authenticated) puede LEER (bucket público).
DROP POLICY IF EXISTS "publico lee imagenes recetas" ON storage.objects;
CREATE POLICY "publico lee imagenes recetas"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'recetas-imagenes');

-- Solo admins pueden SUBIR.
DROP POLICY IF EXISTS "admins suben imagenes recetas" ON storage.objects;
CREATE POLICY "admins suben imagenes recetas"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'recetas-imagenes'
    AND EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Solo admins pueden ACTUALIZAR (sobreescribir).
DROP POLICY IF EXISTS "admins actualizan imagenes recetas" ON storage.objects;
CREATE POLICY "admins actualizan imagenes recetas"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'recetas-imagenes'
    AND EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  )
  WITH CHECK (
    bucket_id = 'recetas-imagenes'
    AND EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Solo admins pueden ELIMINAR.
DROP POLICY IF EXISTS "admins eliminan imagenes recetas" ON storage.objects;
CREATE POLICY "admins eliminan imagenes recetas"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'recetas-imagenes'
    AND EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );
