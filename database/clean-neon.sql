-- Script para LIMPIAR la base de datos en Neon
-- CUIDADO: Esto borrará TODAS las tablas y datos
-- Ejecutar SOLO si quieres empezar desde cero

-- Eliminar triggers primero
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
DROP TRIGGER IF EXISTS update_areas_updated_at ON areas;
DROP TRIGGER IF EXISTS update_informes_updated_at ON informes;
DROP TRIGGER IF EXISTS update_config_envios_updated_at ON config_envios;
DROP TRIGGER IF EXISTS update_selecciones_trimestre_updated_at ON selecciones_trimestre;
DROP TRIGGER IF EXISTS update_plan_accion_fecha ON plan_accion;
DROP TRIGGER IF EXISTS update_seguimiento_ejes_updated_at ON seguimiento_ejes;

-- Eliminar funciones
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_plan_accion_fecha_actualizacion();

-- Eliminar tablas (en orden inverso por foreign keys)
DROP TABLE IF EXISTS seguimiento_ejes CASCADE;
DROP TABLE IF EXISTS plan_accion CASCADE;
DROP TABLE IF EXISTS area_ejes CASCADE;
DROP TABLE IF EXISTS sub_ejes CASCADE;
DROP TABLE IF EXISTS ejes CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS selecciones_trimestre CASCADE;
DROP TABLE IF EXISTS config_envios CASCADE;
DROP TABLE IF EXISTS informes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS areas CASCADE;

-- Eliminar tipos ENUM
DROP TYPE IF EXISTS rol_usuario CASCADE;
DROP TYPE IF EXISTS estado_usuario CASCADE;
DROP TYPE IF EXISTS estado_informe CASCADE;
DROP TYPE IF EXISTS tipo_notificacion CASCADE;

-- Mensaje de confirmación
SELECT 'Base de datos limpia. Ahora ejecuta schema-postgres.sql' as mensaje;
