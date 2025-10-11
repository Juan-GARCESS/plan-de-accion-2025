-- =====================================================
-- EJECUTAR EN NEON SQL EDITOR
-- Script para crear tabla de evidencias de usuarios
-- =====================================================

-- 1. Crear la tabla usuario_metas
CREATE TABLE IF NOT EXISTS usuario_metas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  meta_id INTEGER NOT NULL,
  trimestre INTEGER NOT NULL CHECK (trimestre IN (1, 2, 3, 4)),
  evidencia_texto TEXT,
  evidencia_url TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  observaciones TEXT,
  calificacion DECIMAL(5, 2),
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_revision TIMESTAMP,
  revisado_por INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, meta_id, trimestre)
);

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuario_metas_usuario ON usuario_metas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_metas_meta ON usuario_metas(meta_id);
CREATE INDEX IF NOT EXISTS idx_usuario_metas_trimestre ON usuario_metas(trimestre);
CREATE INDEX IF NOT EXISTS idx_usuario_metas_estado ON usuario_metas(estado);

-- 3. Agregar comentarios descriptivos
COMMENT ON TABLE usuario_metas IS 'Almacena las evidencias y metas enviadas por los usuarios para cada trimestre';
COMMENT ON COLUMN usuario_metas.estado IS 'Estado de la evidencia: pendiente, aprobado, rechazado';
COMMENT ON COLUMN usuario_metas.trimestre IS 'Número del trimestre (1-4)';
COMMENT ON COLUMN usuario_metas.evidencia_texto IS 'Descripción de la evidencia enviada por el usuario';
COMMENT ON COLUMN usuario_metas.evidencia_url IS 'URL opcional de la evidencia (Google Drive, etc.)';
COMMENT ON COLUMN usuario_metas.calificacion IS 'Calificación asignada por el administrador';
COMMENT ON COLUMN usuario_metas.observaciones IS 'Comentarios del evaluador';

-- 4. Verificar que la tabla se creó correctamente
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'usuario_metas'
ORDER BY ordinal_position;

-- 5. Mostrar mensaje de éxito
SELECT 'Tabla usuario_metas creada exitosamente!' as mensaje;
