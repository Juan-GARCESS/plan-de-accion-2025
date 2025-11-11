-- ==================================================
-- SISTEMA DE CALIFICACIONES POR META
-- ==================================================
-- Este script crea el sistema de calificaciones donde:
-- - Cada meta tiene calificaciones por trimestre (informativas)
-- - Cada meta tiene una calificación Total General (usada para promedio)
-- - El promedio del área se calcula con los Totales Generales
-- ==================================================

-- Crear tabla de calificaciones por meta
CREATE TABLE IF NOT EXISTS calificaciones_metas (
    id SERIAL PRIMARY KEY,
    meta_id INTEGER NOT NULL REFERENCES plan_accion(id) ON DELETE CASCADE,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    anio INTEGER NOT NULL DEFAULT 2025,
    
    -- Calificaciones trimestrales (informativas, no afectan promedio)
    cal_trimestre_1 DECIMAL(5,2) DEFAULT NULL,  -- NULL si no está asignada, 0-100 si está asignada
    cal_trimestre_2 DECIMAL(5,2) DEFAULT NULL,
    cal_trimestre_3 DECIMAL(5,2) DEFAULT NULL,
    cal_trimestre_4 DECIMAL(5,2) DEFAULT NULL,
    
    -- Calificación Total General (LA IMPORTANTE)
    calificacion_total_general DECIMAL(5,2) DEFAULT NULL,  -- 0-100, la que califica el admin al final
    
    -- Comentarios por trimestre (opcional)
    comentario_t1 TEXT,
    comentario_t2 TEXT,
    comentario_t3 TEXT,
    comentario_t4 TEXT,
    comentario_general TEXT,
    
    -- Fechas de calificación
    fecha_calificacion_t1 TIMESTAMP,
    fecha_calificacion_t2 TIMESTAMP,
    fecha_calificacion_t3 TIMESTAMP,
    fecha_calificacion_t4 TIMESTAMP,
    fecha_calificacion_general TIMESTAMP,
    
    -- Admin que calificó
    calificado_por_t1 INTEGER REFERENCES usuarios(id),
    calificado_por_t2 INTEGER REFERENCES usuarios(id),
    calificado_por_t3 INTEGER REFERENCES usuarios(id),
    calificado_por_t4 INTEGER REFERENCES usuarios(id),
    calificado_por_general INTEGER REFERENCES usuarios(id),
    
    -- Timestamps generales
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: Una fila por meta por año
    UNIQUE(meta_id, anio)
);

-- Crear índices para mejorar performance
CREATE INDEX idx_calificaciones_meta_id ON calificaciones_metas(meta_id);
CREATE INDEX idx_calificaciones_area_id ON calificaciones_metas(area_id);
CREATE INDEX idx_calificaciones_anio ON calificaciones_metas(anio);

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_calificaciones_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_calificaciones_timestamp
BEFORE UPDATE ON calificaciones_metas
FOR EACH ROW
EXECUTE FUNCTION update_calificaciones_timestamp();

-- Insertar registros iniciales para todas las metas existentes del 2025
INSERT INTO calificaciones_metas (meta_id, area_id, anio)
SELECT 
    pa.id as meta_id,
    pa.area_id,
    2025 as anio
FROM plan_accion pa
WHERE NOT EXISTS (
    SELECT 1 FROM calificaciones_metas cm 
    WHERE cm.meta_id = pa.id AND cm.anio = 2025
);

-- ==================================================
-- VISTAS PARA CONSULTAS
-- ==================================================

-- Vista para calcular promedios por área
CREATE OR REPLACE VIEW vista_promedios_area AS
SELECT 
    cm.area_id,
    a.nombre_area,
    cm.anio,
    COUNT(cm.id) as total_metas,
    COUNT(cm.calificacion_total_general) as metas_calificadas,
    ROUND(AVG(cm.calificacion_total_general), 2) as promedio_general_area,
    -- Promedio por trimestre (informativo)
    ROUND(AVG(cm.cal_trimestre_1), 2) as promedio_t1,
    ROUND(AVG(cm.cal_trimestre_2), 2) as promedio_t2,
    ROUND(AVG(cm.cal_trimestre_3), 2) as promedio_t3,
    ROUND(AVG(cm.cal_trimestre_4), 2) as promedio_t4
FROM calificaciones_metas cm
JOIN areas a ON cm.area_id = a.id
WHERE cm.calificacion_total_general IS NOT NULL
GROUP BY cm.area_id, a.nombre_area, cm.anio;

-- Vista detallada por meta con información completa
CREATE OR REPLACE VIEW vista_calificaciones_detalle AS
SELECT 
    cm.id,
    cm.meta_id,
    pa.meta as nombre_meta,
    pa.indicador,
    cm.area_id,
    a.nombre_area,
    e.nombre_eje,
    se.nombre_sub_eje,
    cm.anio,
    
    -- Checkboxes de trimestres asignados
    pa.t1 as asignado_t1,
    pa.t2 as asignado_t2,
    pa.t3 as asignado_t3,
    pa.t4 as asignado_t4,
    
    -- Calificaciones trimestrales (informativas)
    CASE WHEN pa.t1 THEN COALESCE(cm.cal_trimestre_1, 0) ELSE 0 END as calificacion_t1,
    CASE WHEN pa.t2 THEN COALESCE(cm.cal_trimestre_2, 0) ELSE 0 END as calificacion_t2,
    CASE WHEN pa.t3 THEN COALESCE(cm.cal_trimestre_3, 0) ELSE 0 END as calificacion_t3,
    CASE WHEN pa.t4 THEN COALESCE(cm.cal_trimestre_4, 0) ELSE 0 END as calificacion_t4,
    
    -- Calificación Total General (LA IMPORTANTE)
    cm.calificacion_total_general,
    
    -- Comentarios
    cm.comentario_t1,
    cm.comentario_t2,
    cm.comentario_t3,
    cm.comentario_t4,
    cm.comentario_general,
    
    -- Fechas
    cm.fecha_calificacion_t1,
    cm.fecha_calificacion_t2,
    cm.fecha_calificacion_t3,
    cm.fecha_calificacion_t4,
    cm.fecha_calificacion_general
    
FROM calificaciones_metas cm
JOIN plan_accion pa ON cm.meta_id = pa.id
JOIN areas a ON cm.area_id = a.id
LEFT JOIN ejes e ON pa.eje_id = e.id
LEFT JOIN sub_ejes se ON pa.sub_eje_id = se.id;

-- ==================================================
-- COMENTARIOS EXPLICATIVOS
-- ==================================================
COMMENT ON TABLE calificaciones_metas IS 'Almacena las calificaciones por meta. Cada meta tiene calificaciones por trimestre (informativas) y una calificación Total General (usada para promedio)';
COMMENT ON COLUMN calificaciones_metas.cal_trimestre_1 IS 'Calificación del trimestre 1 (0-100). Solo informativa, no afecta promedio. NULL si no está asignada';
COMMENT ON COLUMN calificaciones_metas.cal_trimestre_2 IS 'Calificación del trimestre 2 (0-100). Solo informativa, no afecta promedio. NULL si no está asignada';
COMMENT ON COLUMN calificaciones_metas.cal_trimestre_3 IS 'Calificación del trimestre 3 (0-100). Solo informativa, no afecta promedio. NULL si no está asignada';
COMMENT ON COLUMN calificaciones_metas.cal_trimestre_4 IS 'Calificación del trimestre 4 (0-100). Solo informativa, no afecta promedio. NULL si no está asignada';
COMMENT ON COLUMN calificaciones_metas.calificacion_total_general IS 'Calificación Total General (0-100). Esta ES la que se usa para calcular el promedio del área';
