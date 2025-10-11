-- =====================================================
-- VERIFICAR ESTRUCTURA DE plan_accion
-- Ejecuta esto primero en Neon SQL Editor
-- =====================================================

-- Ver TODAS las columnas de plan_accion
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'plan_accion'
ORDER BY ordinal_position;

-- Ver las claves primarias de plan_accion
SELECT
  kcu.column_name,
  kcu.ordinal_position
FROM information_schema.table_constraints tco
JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_name = tco.constraint_name
  AND kcu.constraint_schema = tco.constraint_schema
WHERE tco.constraint_type = 'PRIMARY KEY'
  AND kcu.table_name = 'plan_accion';

-- Ver datos de ejemplo (primeras 3 filas)
SELECT * FROM plan_accion LIMIT 3;
