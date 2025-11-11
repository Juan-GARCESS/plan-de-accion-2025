-- =====================================================
-- FIX: Eliminar envíos que se crearon sin evidencias
-- =====================================================
-- Este script limpia envíos que se crearon automáticamente
-- sin que el usuario hiciera click en "Enviar"

BEGIN;

-- 1. Ver envíos que NO tienen evidencias asociadas
SELECT 
  et.id,
  et.usuario_id,
  u.nombre,
  et.trimestre,
  et.estado,
  et.fecha_envio,
  COUNT(e.id) as evidencias_count
FROM envios_trimestre et
JOIN usuarios u ON et.usuario_id = u.id
LEFT JOIN evidencias e ON et.id = e.envio_id
GROUP BY et.id, et.usuario_id, u.nombre, et.trimestre, et.estado, et.fecha_envio
HAVING COUNT(e.id) = 0;

-- 2. Eliminar envíos sin evidencias (son los creados por error)
DELETE FROM envios_trimestre
WHERE id IN (
  SELECT et.id
  FROM envios_trimestre et
  LEFT JOIN evidencias e ON et.id = e.envio_id
  GROUP BY et.id
  HAVING COUNT(e.id) = 0
);

-- 3. Desvincular evidencias huérfanas (si las hay)
UPDATE evidencias
SET envio_id = NULL
WHERE envio_id IS NOT NULL
AND envio_id NOT IN (SELECT id FROM envios_trimestre);

-- 4. Mostrar resultado
SELECT 
  'Envíos limpiados correctamente' as mensaje,
  (SELECT COUNT(*) FROM envios_trimestre) as envios_restantes,
  (SELECT COUNT(*) FROM evidencias WHERE envio_id IS NOT NULL) as evidencias_con_envio,
  (SELECT COUNT(*) FROM evidencias WHERE envio_id IS NULL) as evidencias_sin_envio;

COMMIT;

-- =====================================================
-- CONSULTA DE VERIFICACIÓN
-- =====================================================
-- Ver estado actual de envíos y evidencias
SELECT 
  et.id as envio_id,
  u.nombre as usuario,
  et.trimestre,
  et.estado,
  COUNT(e.id) as total_evidencias,
  COUNT(CASE WHEN e.estado = 'pendiente' THEN 1 END) as pendientes,
  COUNT(CASE WHEN e.estado = 'aprobado' THEN 1 END) as aprobadas,
  COUNT(CASE WHEN e.estado = 'rechazado' THEN 1 END) as rechazadas
FROM envios_trimestre et
JOIN usuarios u ON et.usuario_id = u.id
LEFT JOIN evidencias e ON et.id = e.envio_id
GROUP BY et.id, u.nombre, et.trimestre, et.estado
ORDER BY et.fecha_envio DESC;
