-- =====================================================
-- LIMPIEZA COMPLETA: ENVÍOS Y EVIDENCIAS
-- =====================================================
-- ⚠️ EJECUTAR EN NEON SQL EDITOR
-- Esto eliminará todos los envíos y evidencias, dejando solo
-- las metas del plan de acción

BEGIN;

-- 1. Ver qué se va a eliminar (opcional)
SELECT 
  'ANTES DE LIMPIAR' as estado,
  (SELECT COUNT(*) FROM envios_trimestre) as total_envios,
  (SELECT COUNT(*) FROM evidencias) as total_evidencias,
  (SELECT COUNT(*) FROM calificaciones_trimestre) as total_calificaciones;

-- 2. Eliminar calificaciones de trimestre
DELETE FROM calificaciones_trimestre;

-- 3. Eliminar todas las evidencias
DELETE FROM evidencias;

-- 4. Eliminar todos los envíos
DELETE FROM envios_trimestre;

-- 5. Reiniciar secuencias (IDs comienzan desde 1)
ALTER SEQUENCE IF EXISTS envios_trimestre_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS evidencias_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS calificaciones_trimestre_id_seq RESTART WITH 1;

-- 6. Verificar limpieza
SELECT 
  'DESPUÉS DE LIMPIAR' as estado,
  (SELECT COUNT(*) FROM envios_trimestre) as total_envios,
  (SELECT COUNT(*) FROM evidencias) as total_evidencias,
  (SELECT COUNT(*) FROM calificaciones_trimestre) as total_calificaciones;

COMMIT;

-- Mensaje de éxito
SELECT '✅ Base de datos limpiada completamente' as resultado;
