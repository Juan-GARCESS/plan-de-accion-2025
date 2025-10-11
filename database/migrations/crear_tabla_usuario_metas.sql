-- Crear tabla para las metas y evidencias de usuarios
CREATE TABLE IF NOT EXISTS usuario_metas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  plan_accion_id INTEGER NOT NULL REFERENCES plan_accion(id) ON DELETE CASCADE,
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
  UNIQUE(usuario_id, plan_accion_id, trimestre)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_usuario_metas_usuario ON usuario_metas(usuario_id);
CREATE INDEX idx_usuario_metas_plan_accion ON usuario_metas(plan_accion_id);
CREATE INDEX idx_usuario_metas_trimestre ON usuario_metas(trimestre);
CREATE INDEX idx_usuario_metas_estado ON usuario_metas(estado);

-- Comentarios
COMMENT ON TABLE usuario_metas IS 'Almacena las evidencias y metas enviadas por los usuarios para cada trimestre';
COMMENT ON COLUMN usuario_metas.estado IS 'Estado de la evidencia: pendiente, aprobado, rechazado';
COMMENT ON COLUMN usuario_metas.trimestre IS 'Número del trimestre (1-4)';
