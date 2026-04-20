-- ============================================================
-- Baby Bites — Cierre del bootstrap de admin (A1 QA 2026-04-18)
-- ============================================================
-- ANTES: registrar_primer_admin() permitia que CUALQUIER autenticado
-- se promoviera a admin si la tabla estaba vacia (vector de escalada).
--
-- AHORA:
--   1) Bootstrap directo de samfrasan@gmail.com como admin owner.
--   2) Drop de la funcion vulnerable.
--
-- A futuro, agregar admins se hace con INSERT manual en Studio:
--   INSERT INTO admins (user_id) SELECT id FROM auth.users
--     WHERE email = '...' ON CONFLICT DO NOTHING;
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'samfrasan@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'El usuario samfrasan@gmail.com no existe en auth.users. Registralo en la app primero.';
  END IF;

  INSERT INTO admins (user_id) VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END $$;

DROP FUNCTION IF EXISTS registrar_primer_admin();
