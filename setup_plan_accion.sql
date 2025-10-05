-- ========================================
-- SCRIPT SQL PARA CONFIGURAR PLAN DE ACCIÓN
-- EJECUTAR EN phpMyAdmin o MySQL Workbench
-- ========================================

-- Agregar ejes de ejemplo
INSERT IGNORE INTO ejes (id, nombre_eje, descripcion, activo) VALUES
(1, 'Eje Estratégico 1', 'Primer eje estratégico de la organización', 1),
(2, 'Eje Estratégico 2', 'Segundo eje estratégico de la organización', 1),
(3, 'Eje Estratégico 3', 'Tercer eje estratégico de la organización', 1);

-- Agregar sub-ejes de ejemplo
INSERT IGNORE INTO sub_ejes (id, eje_id, nombre_sub_eje, descripcion, activo) VALUES
(1, 1, 'Sub-Eje 1.1', 'Primer sub-eje del eje 1', 1),
(2, 1, 'Sub-Eje 1.2', 'Segundo sub-eje del eje 1', 1),
(3, 2, 'Sub-Eje 2.1', 'Primer sub-eje del eje 2', 1),
(4, 2, 'Sub-Eje 2.2', 'Segundo sub-eje del eje 2', 1),
(5, 3, 'Sub-Eje 3.1', 'Primer sub-eje del eje 3', 1),
(6, 1, 'Sub-Eje 1.3', 'Tercer sub-eje del eje 1', 1),
(7, 2, 'Sub-Eje 2.3', 'Tercer sub-eje del eje 2', 1);

-- Asignar ejes a áreas
INSERT IGNORE INTO area_ejes (area_id, eje_id, fecha_asignacion, activo) VALUES
(2, 1, NOW(), 1),
(2, 2, NOW(), 1),
(1, 1, NOW(), 1),
(1, 3, NOW(), 1);

-- Crear registros de plan de acción de ejemplo
INSERT IGNORE INTO plan_accion (id, area_id, eje_id, sub_eje_id, meta, indicador, accion, presupuesto, activo) VALUES
(1, 2, 1, 1, 
 'Mejorar la calidad de los procesos organizacionales en un 25%',
 'Porcentaje de procesos certificados bajo normas ISO',
 NULL,
 NULL, 1),

(2, 2, 1, 2,
 'Reducir los tiempos de respuesta en atención al cliente',
 'Tiempo promedio de respuesta en horas',
 'Capacitar personal en servicio al cliente y crear protocolos',
 8000000.00, 1),

(3, 2, 2, 3,
 'Incrementar la satisfacción del cliente al 90%',
 'Porcentaje de satisfacción en encuestas',
 NULL,
 NULL, 1),

(4, 1, 1, 1,
 'Optimizar el presupuesto organizacional',
 'Reducción de gastos operativos en porcentaje',
 'Análisis de gastos y renegociación de contratos',
 5000000.00, 1),

(5, 1, 3, 5,
 'Mejorar la liquidez financiera de la organización',
 'Ratio de liquidez corriente',
 NULL,
 NULL, 1),

(6, 2, 1, 6,
 'Implementar nuevos controles de calidad',
 'Número de controles implementados',
 NULL,
 NULL, 1),

(7, 2, 2, 7,
 'Desarrollar sistema de seguimiento',
 'Sistema funcionando correctamente',
 'Desarrollar aplicación web de seguimiento',
 12000000.00, 1);

-- Verificar que las áreas estén activas
UPDATE areas SET activa = 1 WHERE id IN (1, 2);

-- Crear usuario admin de prueba si no existe
INSERT IGNORE INTO usuarios (email, password, nombre, rol, area_id, estado) VALUES
('admin@test.com', '$2b$10$doxHiuNxXMrerey1GadGq.wI/C6NSyWsKIDXbWZRCUxvDE4FThcKi', 'Administrador Test', 'admin', 5, 'activo');

