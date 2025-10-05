-- SQL ADICIONAL PARA COMPLETAR LA FUNCIONALIDAD
-- Ejecutar después del script principal

-- Agregar más sub-ejes para tener suficientes datos
INSERT IGNORE INTO sub_ejes (id, eje_id, nombre_sub_eje, descripcion, activo) VALUES
(6, 1, 'Sub-Eje Correspondiente', 'Sub-eje adicional para eje 1', 1),
(7, 2, 'Sub-Eje Correspondiente', 'Sub-eje adicional para eje 2', 1),
(8, 3, 'Sub-Eje Correspondiente', 'Sub-eje adicional para eje 3', 1);

-- Agregar más registros al plan de acción para simular la imagen
INSERT IGNORE INTO plan_accion (area_id, eje_id, sub_eje_id, meta, indicador, accion, presupuesto, activo) VALUES
(2, 1, 6, 
 'Meta definida por admin para este sub-eje',
 'Indicador específico de medición',
 NULL,
 NULL, 1),

(2, 2, 7,
 'Segunda meta estratégica del área',
 'Segundo indicador de seguimiento', 
 NULL,
 NULL, 1),

(1, 1, 6,
 'Meta financiera específica',
 'Indicador de rentabilidad',
 'Implementar nueva estrategia financiera',
 25000000.00, 1);

-- Verificar que todas las relaciones estén correctas
SELECT 'Verificación de datos' as estado, COUNT(*) as total_plan_accion 
FROM plan_accion WHERE activo = 1;