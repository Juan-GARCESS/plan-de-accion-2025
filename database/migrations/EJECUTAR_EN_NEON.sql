-- ========================================
-- MIGRACIÓN: Agregar columnas t1, t2, t3, t4 a plan_accion
-- Fecha: 2025-10-10
-- Descripción: Agrega columnas booleanas para los trimestres
-- ========================================

-- Agregar las 4 columnas de trimestres
ALTER TABLE plan_accion 
ADD COLUMN IF NOT EXISTS t1 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS t2 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS t3 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS t4 BOOLEAN DEFAULT FALSE;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'plan_accion' 
ORDER BY ordinal_position;

-- Ver datos actuales (opcional - solo columnas propias de plan_accion)
SELECT id, meta, indicador, accion, presupuesto, t1, t2, t3, t4
FROM plan_accion
LIMIT 5;
