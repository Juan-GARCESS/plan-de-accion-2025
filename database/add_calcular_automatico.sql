-- Agregar columna calcular_automatico a calificaciones_trimestre
-- Ejecutar en Neon SQL Editor

BEGIN;

-- Agregar columna si no existe
ALTER TABLE calificaciones_trimestre 
ADD COLUMN IF NOT EXISTS calcular_automatico BOOLEAN DEFAULT TRUE;

-- Comentario
COMMENT ON COLUMN calificaciones_trimestre.calcular_automatico IS 
'TRUE = calificacion es promedio automatico de metas, FALSE = calificacion manual del admin';

COMMIT;

SELECT 'Columna calcular_automatico agregada correctamente' as mensaje;
