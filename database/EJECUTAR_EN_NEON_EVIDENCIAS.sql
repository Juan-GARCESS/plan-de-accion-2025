-- =====================================================
-- EJECUTAR EN NEON SQL EDITOR
-- Script para crear tabla de evidencias de usuarios
-- =====================================================

-- 1. Eliminar tabla si existe (para empezar limpio)
DROP TABLE IF EXISTS usuario_metas CASCADE;

-- 2. Crear la tabla usuario_metas
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

-- 3. Crear índices para mejorar el rendimiento
CREATE INDEX idx_usuario_metas_usuario ON usuario_metas(usuario_id);
CREATE INDEX idx_usuario_metas_plan_accion ON usuario_metas(plan_accion_id);
CREATE INDEX idx_usuario_metas_trimestre ON usuario_metas(trimestre);
CREATE INDEX idx_usuario_metas_estado ON usuario_metas(estado);

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
