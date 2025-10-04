-- ========================================
-- SCRIPT SQL PARA XAMPP/phpMyAdmin
-- NUEVO FLUJO DE TRIMESTRES
-- ========================================

-- 1. CREAR TABLA PARA SELECCIONES DE TRIMESTRES
CREATE TABLE `user_trimestre_selections` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `trimestre` tinyint(4) NOT NULL,
  `año` year(4) NOT NULL DEFAULT '2025',
  `selected_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `meta_asignada` longtext DEFAULT NULL,
  `meta_asignada_por` int(11) DEFAULT NULL,
  `meta_asignada_at` timestamp NULL DEFAULT NULL,
  `estado` enum('pendiente_meta','meta_asignada','upload_habilitado','informe_subido','completado') NOT NULL DEFAULT 'pendiente_meta',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. CREAR TABLA PARA NOTIFICACIONES DEL ADMIN
CREATE TABLE `admin_notificaciones` (
  `id` int(11) NOT NULL,
  `tipo` enum('nueva_seleccion','informe_subido','general') NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `selection_id` int(11) DEFAULT NULL,
  `titulo` varchar(200) NOT NULL,
  `mensaje` text NOT NULL,
  `leido` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. CREAR TABLA PARA INFORMES POR ÁREA
CREATE TABLE `informes_por_area` (
  `id` int(11) NOT NULL,
  `area_id` int(11) NOT NULL,
  `trimestre` tinyint(4) NOT NULL,
  `año` year(4) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `resumen_ejecutivo` longtext DEFAULT NULL,
  `total_usuarios` int(11) NOT NULL DEFAULT 0,
  `informes_completados` int(11) NOT NULL DEFAULT 0,
  `promedio_cumplimiento` decimal(5,2) DEFAULT NULL,
  `archivo_generado` varchar(255) DEFAULT NULL,
  `generado_por` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. MODIFICAR TABLA INFORMES - AGREGAR COLUMNAS
ALTER TABLE `informes` 
ADD COLUMN `selection_id` int(11) DEFAULT NULL AFTER `area_id`,
ADD COLUMN `porcentaje_cumplimiento` int(11) DEFAULT NULL AFTER `calificacion`,
ADD COLUMN `fecha_calificacion` timestamp NULL DEFAULT NULL AFTER `porcentaje_cumplimiento`;

-- 5. ACTUALIZAR ENUM DE ESTADOS EN INFORMES
ALTER TABLE `informes` 
MODIFY COLUMN `estado` enum('planificando','archivo_pendiente','pendiente','en_revision','aceptado','rechazado') NOT NULL DEFAULT 'planificando';

-- 6. AGREGAR CLAVES PRIMARIAS
ALTER TABLE `user_trimestre_selections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_trimestre` (`usuario_id`,`trimestre`,`año`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_meta_asignada_por` (`meta_asignada_por`);

ALTER TABLE `admin_notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_leido` (`leido`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_selection_id` (`selection_id`);

ALTER TABLE `informes_por_area`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_informe_area_trimestre` (`area_id`,`trimestre`,`año`),
  ADD KEY `idx_generado_por` (`generado_por`);

-- 7. AUTO INCREMENT
ALTER TABLE `user_trimestre_selections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `admin_notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `informes_por_area`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- 8. AGREGAR CLAVES FORÁNEAS
ALTER TABLE `user_trimestre_selections`
  ADD CONSTRAINT `fk_selection_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_selection_admin` FOREIGN KEY (`meta_asignada_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

ALTER TABLE `admin_notificaciones`
  ADD CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notif_selection` FOREIGN KEY (`selection_id`) REFERENCES `user_trimestre_selections` (`id`) ON DELETE CASCADE;

ALTER TABLE `informes_por_area`
  ADD CONSTRAINT `fk_informe_area_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_informe_area_admin` FOREIGN KEY (`generado_por`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT;

ALTER TABLE `informes`
  ADD CONSTRAINT `fk_informes_selection` FOREIGN KEY (`selection_id`) REFERENCES `user_trimestre_selections` (`id`) ON DELETE SET NULL;

-- 9. AGREGAR CONSTRAINT PARA PORCENTAJE
ALTER TABLE `informes` 
ADD CONSTRAINT `chk_porcentaje` CHECK (`porcentaje_cumplimiento` >= 0 AND `porcentaje_cumplimiento` <= 100);

-- 10. INSERTAR DATOS DE PRUEBA (OPCIONAL)
-- Descomenta estas líneas si quieres datos de prueba

/*
INSERT INTO `user_trimestre_selections` (`usuario_id`, `trimestre`, `año`, `estado`) VALUES
(3, 4, 2025, 'pendiente_meta'),
(6, 4, 2025, 'pendiente_meta'),
(8, 4, 2025, 'pendiente_meta');

INSERT INTO `admin_notificaciones` (`tipo`, `usuario_id`, `titulo`, `mensaje`) VALUES
('nueva_seleccion', 3, 'Nueva selección de trimestre', 'Usuario 1 ha seleccionado trabajar en el trimestre 4 de 2025'),
('nueva_seleccion', 6, 'Nueva selección de trimestre', 'Juan Garces ha seleccionado trabajar en el trimestre 4 de 2025'),
('nueva_seleccion', 8, 'Nueva selección de trimestre', 'prueba3 ha seleccionado trabajar en el trimestre 4 de 2025');
*/

-- ========================================
-- SCRIPT COMPLETADO
-- ========================================

-- VERIFICACIÓN - Ejecuta esto después para confirmar que todo esté bien:
-- SELECT COUNT(*) AS user_selections FROM user_trimestre_selections;
-- SELECT COUNT(*) AS admin_notificaciones FROM admin_notificaciones;
-- SELECT COUNT(*) AS informes_por_area FROM informes_por_area;
-- DESCRIBE informes;

-- ========================================
-- NUEVA ESTRUCTURA IMPLEMENTADA:
-- 1. ✅ Usuarios pueden seleccionar trimestres
-- 2. ✅ Admins reciben notificaciones automáticas
-- 3. ✅ Sistema de asignación de metas
-- 4. ✅ Control de habilitación de uploads
-- 5. ✅ Sistema de calificación 0-100%
-- 6. ✅ Generación de informes por área
-- ========================================