-- =====================================================
-- CREAR TABLA usuario_metas - VERSIÓN SIMPLE
-- Ejecuta esto en Neon SQL Editor
-- =====================================================

-- Paso 1: Eliminar tabla si existe
DROP TABLE IF EXISTS usuario_metas CASCADE;

-- Paso 2: Crear tabla sin foreign keys primero
CREATE TABLE usuario_metas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  plan_accion_id INTEGER NOT NULL,
  trimestre INTEGER NOT NULL CHECK (trimestre IN (1, 2, 3, 4)),
  evidencia_texto TEXT,
  evidencia_url TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  observaciones TEXT,
  calificacion DECIMAL(5, 2),
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_revision TIMESTAMP,
  revisado_por INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, plan_accion_id, trimestre)
);

-- Paso 3: Crear índices
CREATE INDEX idx_usuario_metas_usuario ON usuario_metas(usuario_id);
CREATE INDEX idx_usuario_metas_plan_accion ON usuario_metas(plan_accion_id);
CREATE INDEX idx_usuario_metas_trimestre ON usuario_metas(trimestre);
CREATE INDEX idx_usuario_metas_estado ON usuario_metas(estado);

-- Paso 4: Verificar
SELECT 'Tabla usuario_metas creada exitosamente!' as resultado;

-- Paso 5: Ver estructura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuario_metas' 
ORDER BY ordinal_position;
