-- Base de datos para Sistema de Gestión de Informes Trimestrales
-- Esquema PostgreSQL para Neon
-- Ejecutar este script en Neon para crear las tablas necesarias

-- 1. Tipos ENUM personalizados
CREATE TYPE rol_usuario AS ENUM ('admin', 'usuario');
CREATE TYPE estado_usuario AS ENUM ('pendiente', 'activo', 'rechazado');
CREATE TYPE estado_informe AS ENUM ('esperando_meta', 'meta_asignada', 'pendiente', 'aceptado', 'rechazado');
CREATE TYPE tipo_notificacion AS ENUM ('info', 'success', 'warning', 'error');

-- 2. Tabla de áreas (crear primero por las foreign keys)
CREATE TABLE IF NOT EXISTS areas (
    id SERIAL PRIMARY KEY,
    nombre_area VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(155) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    area_id INTEGER NULL REFERENCES areas(id) ON DELETE SET NULL,
    rol rol_usuario NOT NULL DEFAULT 'usuario',
    estado estado_usuario DEFAULT 'pendiente',
    area_solicitada VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de informes trimestrales
CREATE TABLE IF NOT EXISTS informes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    trimestre INTEGER NOT NULL,
    año INTEGER NOT NULL,
    archivo VARCHAR(255) NULL,
    meta_trimestral TEXT NULL,
    estado estado_informe DEFAULT 'esperando_meta',
    comentario_admin TEXT NULL,
    calificacion INTEGER NULL,
    fecha_meta_creada TIMESTAMP NULL,
    fecha_archivo_subido TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_trimestre UNIQUE (usuario_id, trimestre, año)
);

-- 5. Tabla de configuración de envíos (trimestres)
CREATE TABLE IF NOT EXISTS config_envios (
    id SERIAL PRIMARY KEY,
    trimestre INTEGER NOT NULL,
    año INTEGER NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    abierto BOOLEAN DEFAULT false,
    habilitado_manualmente BOOLEAN DEFAULT false,
    dias_habilitados INTEGER NULL,
    fecha_habilitacion_manual TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_trimestre_año UNIQUE (trimestre, año)
);

-- 6. Tabla de selecciones de trimestre
CREATE TABLE IF NOT EXISTS selecciones_trimestre (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    trimestre INTEGER NOT NULL,
    año INTEGER NOT NULL,
    participando BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_trimestre_seleccion UNIQUE (usuario_id, trimestre, año)
);

-- 7. Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT false,
    tipo tipo_notificacion DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabla para los Ejes
CREATE TABLE IF NOT EXISTS ejes (
    id SERIAL PRIMARY KEY,
    nombre_eje VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- 9. Tabla para los Sub-ejes
CREATE TABLE IF NOT EXISTS sub_ejes (
    id SERIAL PRIMARY KEY,
    eje_id INTEGER NOT NULL REFERENCES ejes(id) ON DELETE CASCADE,
    nombre_sub_eje VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- 10. Tabla para asignar Ejes a Áreas
CREATE TABLE IF NOT EXISTS area_ejes (
    id SERIAL PRIMARY KEY,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    eje_id INTEGER NOT NULL REFERENCES ejes(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_area_eje UNIQUE (area_id, eje_id)
);

-- 11. Tabla para el Plan de Acción
CREATE TABLE IF NOT EXISTS plan_accion (
    id SERIAL PRIMARY KEY,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    eje_id INTEGER NOT NULL REFERENCES ejes(id) ON DELETE CASCADE,
    sub_eje_id INTEGER NOT NULL REFERENCES sub_ejes(id) ON DELETE CASCADE,
    meta TEXT,
    indicador TEXT,
    accion TEXT,
    presupuesto DECIMAL(15,2),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_plan UNIQUE (area_id, eje_id, sub_eje_id)
);

-- 12. Tabla de seguimiento de ejes (nueva funcionalidad)
CREATE TABLE IF NOT EXISTS seguimiento_ejes (
    id SERIAL PRIMARY KEY,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    eje_id INTEGER NOT NULL REFERENCES ejes(id) ON DELETE CASCADE,
    trimestre INTEGER NOT NULL,
    seleccionado BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uniq_area_eje_trim UNIQUE (area_id, eje_id, trimestre)
);

-- FUNCIONES para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función especial para plan_accion que usa fecha_actualizacion
CREATE OR REPLACE FUNCTION update_plan_accion_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- TRIGGERS para actualizar updated_at en las tablas
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON areas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_informes_updated_at BEFORE UPDATE ON informes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_envios_updated_at BEFORE UPDATE ON config_envios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_selecciones_trimestre_updated_at BEFORE UPDATE ON selecciones_trimestre 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_accion_fecha BEFORE UPDATE ON plan_accion 
    FOR EACH ROW EXECUTE FUNCTION update_plan_accion_fecha_actualizacion();

CREATE TRIGGER update_seguimiento_ejes_updated_at BEFORE UPDATE ON seguimiento_ejes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ÍNDICES para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_area ON usuarios(area_id);
CREATE INDEX IF NOT EXISTS idx_informes_estado ON informes(estado);
CREATE INDEX IF NOT EXISTS idx_informes_trimestre ON informes(trimestre, año);
CREATE INDEX IF NOT EXISTS idx_selecciones_trimestre_usuario ON selecciones_trimestre(usuario_id);
CREATE INDEX IF NOT EXISTS idx_selecciones_trimestre_periodo ON selecciones_trimestre(trimestre, año);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_sub_ejes_eje ON sub_ejes(eje_id);
CREATE INDEX IF NOT EXISTS idx_area_ejes_area ON area_ejes(area_id);
CREATE INDEX IF NOT EXISTS idx_area_ejes_eje ON area_ejes(eje_id);
CREATE INDEX IF NOT EXISTS idx_plan_accion_area ON plan_accion(area_id);
CREATE INDEX IF NOT EXISTS idx_plan_accion_eje ON plan_accion(eje_id);
CREATE INDEX IF NOT EXISTS idx_plan_accion_sub_eje ON plan_accion(sub_eje_id);

-- DATOS INICIALES

-- Crear área admin
INSERT INTO areas (nombre_area, descripcion) VALUES 
('admin', 'Área administrativa del sistema')
ON CONFLICT (nombre_area) DO NOTHING;

-- Crear usuario administrador (password: admin123)
-- Hash generado con bcrypt para 'admin123'
INSERT INTO usuarios (nombre, email, password, area_id, rol, estado) 
SELECT 'Administrador', 'admin@sistema.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvFBvY4Fb7gNu6u', 
       (SELECT id FROM areas WHERE nombre_area = 'admin'), 'admin', 'activo'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@sistema.com');

-- Configuración de trimestres para 2025
INSERT INTO config_envios (trimestre, año, fecha_inicio, fecha_fin, abierto) VALUES 
(1, 2025, '2025-01-01', '2025-03-31', true),
(2, 2025, '2025-04-01', '2025-06-30', true),
(3, 2025, '2025-07-01', '2025-09-30', true),
(4, 2025, '2025-10-01', '2025-12-31', true)
ON CONFLICT (trimestre, año) DO NOTHING;

-- Mensaje de éxito
SELECT 'Base de datos PostgreSQL creada exitosamente!' as mensaje;
