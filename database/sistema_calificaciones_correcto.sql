-- ==================================================
-- SISTEMA DE CALIFICACIONES CORRECTO
-- ==================================================
-- Flujo:
-- 1. Usuario envía TODAS las metas de un trimestre (1 envío por trimestre)
-- 2. Admin califica cada meta individualmente (tabla evidencias)
-- 3. Admin da una calificación GENERAL del trimestre (tabla calificaciones_trimestre)
-- 4. Calificación anual = promedio de las 4 calificaciones generales de trimestre
-- ==================================================

-- TABLA: Calificaciones generales por trimestre
-- Guarda la calificación general que el admin da por trimestre a cada usuario
CREATE TABLE IF NOT EXISTS calificaciones_trimestre (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
    anio INTEGER NOT NULL DEFAULT 2025,
    
    -- Calificación general del trimestre (0-100)
    calificacion_general DECIMAL(5,2) NOT NULL,
    
    -- Comentario general del trimestre
    comentario_general TEXT,
    
    -- Admin que calificó
    calificado_por INTEGER REFERENCES usuarios(id),
    fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamps
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricción: un usuario solo puede tener una calificación general por trimestre/año
    UNIQUE(usuario_id, trimestre, anio)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_calificaciones_trimestre_usuario ON calificaciones_trimestre(usuario_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_trimestre_area ON calificaciones_trimestre(area_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_trimestre_anio ON calificaciones_trimestre(trimestre, anio);

-- Vista: Calificación anual por usuario
-- Calcula el promedio de las 4 calificaciones generales de trimestre
CREATE OR REPLACE VIEW vista_calificaciones_anuales AS
SELECT 
    usuario_id,
    u.nombre as usuario_nombre,
    area_id,
    a.nombre as area_nombre,
    anio,
    -- Calificaciones por trimestre
    MAX(CASE WHEN trimestre = 1 THEN calificacion_general END) as cal_trimestre_1,
    MAX(CASE WHEN trimestre = 2 THEN calificacion_general END) as cal_trimestre_2,
    MAX(CASE WHEN trimestre = 3 THEN calificacion_general END) as cal_trimestre_3,
    MAX(CASE WHEN trimestre = 4 THEN calificacion_general END) as cal_trimestre_4,
    -- Promedio anual (solo trimestres calificados)
    ROUND(AVG(calificacion_general), 2) as calificacion_anual,
    -- Total de trimestres calificados
    COUNT(*) as trimestres_calificados
FROM calificaciones_trimestre ct
JOIN usuarios u ON ct.usuario_id = u.id
JOIN areas a ON ct.area_id = a.id
GROUP BY usuario_id, u.nombre, area_id, a.nombre, anio;

-- Vista: Resumen completo de calificaciones por usuario y trimestre
-- Muestra las metas individuales + la calificación general del trimestre
CREATE OR REPLACE VIEW vista_resumen_calificaciones AS
SELECT 
    e.usuario_id,
    u.nombre as usuario_nombre,
    e.trimestre,
    e.anio,
    e.area_id,
    a.nombre as area_nombre,
    -- Datos de la evidencia/meta
    e.id as evidencia_id,
    e.meta_id,
    pa.meta,
    e.calificacion as calificacion_meta,
    e.estado as estado_meta,
    e.comentario_admin,
    -- Calificación general del trimestre
    ct.calificacion_general as calificacion_trimestre,
    ct.comentario_general as comentario_trimestre,
    ct.fecha_calificacion as fecha_calificacion_trimestre
FROM evidencias e
JOIN usuarios u ON e.usuario_id = u.id
JOIN areas a ON e.area_id = a.id
JOIN plan_accion pa ON e.meta_id = pa.id
LEFT JOIN calificaciones_trimestre ct ON 
    ct.usuario_id = e.usuario_id AND 
    ct.trimestre = e.trimestre AND 
    ct.anio = e.anio
ORDER BY e.usuario_id, e.trimestre, e.meta_id;

-- Trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION trg_update_calificaciones_trimestre()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_calificaciones_trimestre
    BEFORE UPDATE ON calificaciones_trimestre
    FOR EACH ROW
    EXECUTE FUNCTION trg_update_calificaciones_trimestre();

-- Comentarios para documentación
COMMENT ON TABLE calificaciones_trimestre IS 'Calificaciones generales por trimestre que el admin asigna a cada usuario';
COMMENT ON COLUMN calificaciones_trimestre.calificacion_general IS 'Calificación general del trimestre (0-100) - usada para calcular promedio anual';
COMMENT ON VIEW vista_calificaciones_anuales IS 'Muestra el promedio anual calculado desde las 4 calificaciones generales de trimestre';
COMMENT ON VIEW vista_resumen_calificaciones IS 'Resumen completo: calificaciones por meta + calificación general del trimestre';
