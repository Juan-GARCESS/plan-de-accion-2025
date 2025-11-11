-- ========================================
-- SCRIPT PARA LIMPIAR ENVÍOS DE TRIMESTRE
-- ========================================
-- ⚠️ USAR SOLO EN DESARROLLO/TESTING
-- ⚠️ Elimina todos los envíos y sus evidencias asociadas

-- Opción 1: Limpiar TODO (envíos + evidencias + calificaciones)
-- ===============================================================
BEGIN;

-- 1. Eliminar calificaciones de trimestre
DELETE FROM calificaciones_trimestre;
RAISE NOTICE '✅ Calificaciones eliminadas';

-- 2. Desvincular evidencias de envíos (poner envio_id en NULL)
UPDATE evidencias 
SET envio_id = NULL 
WHERE envio_id IS NOT NULL;
RAISE NOTICE '✅ Evidencias desvinculadas de envíos';

-- 3. Eliminar todos los envíos
DELETE FROM envios_trimestre;
RAISE NOTICE '✅ Envíos eliminados';

-- 4. Opcional: Eliminar también las evidencias
DELETE FROM evidencias;
RAISE NOTICE '✅ Evidencias eliminadas';

-- 5. Reiniciar secuencias (opcional, para empezar desde ID 1)
ALTER SEQUENCE envios_trimestre_id_seq RESTART WITH 1;
ALTER SEQUENCE evidencias_id_seq RESTART WITH 1;
ALTER SEQUENCE calificaciones_trimestre_id_seq RESTART WITH 1;
RAISE NOTICE '✅ Secuencias reiniciadas';

COMMIT;

RAISE NOTICE '🎉 Base de datos limpiada completamente';


-- Opción 2: Limpiar SOLO envíos (mantener evidencias individuales)
-- =================================================================
-- Descomenta si quieres mantener las evidencias pero quitar los envíos

-- BEGIN;
-- 
-- -- Desvincular evidencias
-- UPDATE evidencias 
-- SET envio_id = NULL 
-- WHERE envio_id IS NOT NULL;
-- 
-- -- Eliminar envíos
-- DELETE FROM envios_trimestre;
-- 
-- -- Reiniciar secuencia
-- ALTER SEQUENCE envios_trimestre_id_seq RESTART WITH 1;
-- 
-- COMMIT;
-- 
-- RAISE NOTICE '✅ Envíos eliminados, evidencias mantenidas';


-- Opción 3: Limpiar envíos de UN USUARIO específico
-- ===================================================
-- Descomenta y cambia el correo

-- BEGIN;
-- 
-- WITH usuario_envios AS (
--   SELECT et.id 
--   FROM envios_trimestre et
--   JOIN usuarios u ON et.usuario_id = u.id
--   WHERE u.email = 'usuario@ejemplo.com' -- ⚠️ CAMBIAR AQUÍ
-- )
-- DELETE FROM envios_trimestre 
-- WHERE id IN (SELECT id FROM usuario_envios);
-- 
-- COMMIT;


-- Opción 4: Limpiar envíos de UN TRIMESTRE específico
-- ====================================================
-- Descomenta y cambia trimestre/año

-- BEGIN;
-- 
-- DELETE FROM envios_trimestre 
-- WHERE trimestre = 3 AND anio = 2025; -- ⚠️ CAMBIAR AQUÍ
-- 
-- COMMIT;


-- ========================================
-- CONSULTAS DE VERIFICACIÓN
-- ========================================

-- Ver cuántos registros quedan
SELECT 
  (SELECT COUNT(*) FROM envios_trimestre) as envios,
  (SELECT COUNT(*) FROM evidencias WHERE envio_id IS NOT NULL) as evidencias_vinculadas,
  (SELECT COUNT(*) FROM evidencias WHERE envio_id IS NULL) as evidencias_sin_envio,
  (SELECT COUNT(*) FROM calificaciones_trimestre) as calificaciones;
