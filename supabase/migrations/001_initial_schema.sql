-- ============================================================
-- Baby Bites — Schema inicial
-- Aplicar en Supabase Studio > SQL Editor
-- ============================================================

-- ─── Perfiles de hijos ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS perfiles_hijos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  etapa TEXT NOT NULL CHECK (etapa IN ('inicio', 'transicion', 'preescolar')),
  alergias TEXT[] DEFAULT '{}',
  objetivo_nutricional TEXT,
  avatar_emoji TEXT DEFAULT '🍼',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Recetas ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  momento_dia TEXT[] NOT NULL,
  etapas_compatibles TEXT[] NOT NULL,
  tiempo_preparacion INT NOT NULL,
  porciones_base INT DEFAULT 1,
  alergenos TEXT[] DEFAULT '{}',
  calorias DECIMAL,
  proteinas DECIMAL,
  carbohidratos DECIMAL,
  grasas DECIMAL,
  hierro DECIMAL,
  ingredientes JSONB NOT NULL DEFAULT '[]',
  pasos JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  es_premium BOOLEAN DEFAULT FALSE,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Favoritos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receta_id UUID REFERENCES recetas(id) ON DELETE CASCADE NOT NULL,
  perfil_id UUID REFERENCES perfiles_hijos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, receta_id)
);

-- ─── Conversaciones IA ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversaciones_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receta_id UUID REFERENCES recetas(id) ON DELETE SET NULL,
  perfil_id UUID REFERENCES perfiles_hijos(id) ON DELETE SET NULL,
  mensajes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Suscripciones ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'premium_anual')),
  activa BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  revenuecat_customer_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Índices para performance ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_recetas_etapas ON recetas USING GIN(etapas_compatibles);
CREATE INDEX IF NOT EXISTS idx_recetas_alergenos ON recetas USING GIN(alergenos);
CREATE INDEX IF NOT EXISTS idx_recetas_momento ON recetas USING GIN(momento_dia);
CREATE INDEX IF NOT EXISTS idx_recetas_tags ON recetas USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_favoritos_user ON favoritos(user_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_user ON perfiles_hijos(user_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_user ON conversaciones_ia(user_id);

-- ─── Row Level Security ───────────────────────────────────────
ALTER TABLE perfiles_hijos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;

-- Políticas de perfiles
CREATE POLICY "usuarios ven sus propios perfiles"
  ON perfiles_hijos FOR ALL
  USING (auth.uid() = user_id);

-- Políticas de favoritos
CREATE POLICY "usuarios ven sus propios favoritos"
  ON favoritos FOR ALL
  USING (auth.uid() = user_id);

-- Políticas de conversaciones
CREATE POLICY "usuarios ven sus propias conversaciones"
  ON conversaciones_ia FOR ALL
  USING (auth.uid() = user_id);

-- Políticas de suscripciones
CREATE POLICY "usuarios ven su propia suscripción"
  ON suscripciones FOR ALL
  USING (auth.uid() = user_id);

-- Recetas visibles para todos los autenticados (las premium se filtran en el cliente)
CREATE POLICY "recetas visibles para autenticados"
  ON recetas FOR SELECT
  USING (activa = TRUE AND auth.role() = 'authenticated');

-- ─── Trigger: actualizar updated_at en conversaciones ─────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conversaciones_updated_at
  BEFORE UPDATE ON conversaciones_ia
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_suscripciones_updated_at
  BEFORE UPDATE ON suscripciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
