-- Base de datos para Sistema de Gestión de Informes Trimestrales
-- Ejecutar este script en MySQL para crear las tablas necesarias

-- 1. Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(155) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    area_id INT NULL,
    rol ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
    estado ENUM('pendiente', 'activo', 'rechazado') DEFAULT 'pendiente',
    area_solicitada VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabla de áreas
CREATE TABLE areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_area VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabla de informes trimestrales
CREATE TABLE informes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    area_id INT NOT NULL,
    trimestre INT NOT NULL,
    año INT NOT NULL,
    archivo VARCHAR(255) NULL,
    meta_trimestral TEXT NULL,
    estado ENUM('esperando_meta', 'meta_asignada', 'pendiente', 'aceptado', 'rechazado') DEFAULT 'esperando_meta',
    comentario_admin TEXT NULL,
    calificacion INT NULL,
    fecha_meta_creada TIMESTAMP NULL,
    fecha_archivo_subido TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_trimestre (usuario_id, trimestre, año),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
);

-- 4. Tabla de configuración de envíos (trimestres)
CREATE TABLE config_envios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trimestre INT NOT NULL,
    año INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    abierto BOOLEAN DEFAULT false,
    habilitado_manualmente BOOLEAN DEFAULT false,
    dias_habilitados INT NULL,
    fecha_habilitacion_manual TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_trimestre_año (trimestre, año)
);

-- 5. Tabla de selecciones de trimestre (para usuarios que deciden participar o no)
CREATE TABLE selecciones_trimestre (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    trimestre INT NOT NULL,
    año INT NOT NULL,
    participando BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_trimestre_seleccion (usuario_id, trimestre, año),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 6. Tabla de notificaciones (opcional - para futuras funcionalidades)
CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT false,
    tipo ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 7. Datos iniciales

-- Crear área admin (solo para el administrador)
INSERT INTO areas (nombre_area, descripcion) VALUES 
('admin', 'Área administrativa del sistema');

-- Crear usuario administrador (password: admin123)
-- Hash generado con bcrypt para 'admin123'
INSERT INTO usuarios (nombre, email, password, area_id, rol, estado) VALUES 
('Administrador', 'admin@sistema.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvFBvY4Fb7gNu6u', 1, 'admin', 'activo');

-- Configuración de trimestres para el año actual (ejemplo 2025)
INSERT INTO config_envios (trimestre, año, fecha_inicio, fecha_fin, abierto) VALUES 
(1, 2025, '2025-01-01', '2025-03-31', true),
(2, 2025, '2025-04-01', '2025-06-30', true),
(3, 2025, '2025-07-01', '2025-09-30', true),
(4, 2025, '2025-10-01', '2025-12-31', true);

-- Índices adicionales para mejorar el rendimiento
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);
CREATE INDEX idx_usuarios_area ON usuarios(area_id);
CREATE INDEX idx_informes_estado ON informes(estado);
CREATE INDEX idx_informes_trimestre ON informes(trimestre, año);
CREATE INDEX idx_selecciones_trimestre_usuario ON selecciones_trimestre(usuario_id);
CREATE INDEX idx_selecciones_trimestre_periodo ON selecciones_trimestre(trimestre, año);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);

-- Mostrar resumen de la base de datos
SELECT 'Base de datos creada exitosamente!' as mensaje;
SELECT 'Tablas creadas:' as info;
SHOW TABLES;