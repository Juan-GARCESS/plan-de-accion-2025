-- Plan de Acción - Nuevas tablas para Ejes y Sub-ejes
-- Ejecutar en phpMyAdmin para agregar las nuevas funcionalidades

-- 1. Tabla para los Ejes
CREATE TABLE IF NOT EXISTS ejes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_eje VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- 2. Tabla para los Sub-ejes (ligados a un eje)
CREATE TABLE IF NOT EXISTS sub_ejes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eje_id INT NOT NULL,
    nombre_sub_eje VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (eje_id) REFERENCES ejes(id) ON DELETE CASCADE
);

-- 3. Tabla para asignar Ejes a Áreas (relación muchos a muchos)
CREATE TABLE IF NOT EXISTS area_ejes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    area_id INT NOT NULL,
    eje_id INT NOT NULL,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE,
    FOREIGN KEY (eje_id) REFERENCES ejes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_area_eje (area_id, eje_id)
);

-- 4. Tabla para las Metas e Indicadores (lo que llena el admin en el dashboard)
CREATE TABLE IF NOT EXISTS plan_accion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    area_id INT NOT NULL,
    eje_id INT NOT NULL,
    sub_eje_id INT NOT NULL,
    meta TEXT,
    indicador TEXT,
    accion TEXT, -- Lo llenará el usuario normal más adelante
    presupuesto DECIMAL(15,2), -- Lo llenará el usuario normal más adelante
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE,
    FOREIGN KEY (eje_id) REFERENCES ejes(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_eje_id) REFERENCES sub_ejes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_plan (area_id, eje_id, sub_eje_id)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_sub_ejes_eje ON sub_ejes(eje_id);
CREATE INDEX idx_area_ejes_area ON area_ejes(area_id);
CREATE INDEX idx_area_ejes_eje ON area_ejes(eje_id);
CREATE INDEX idx_plan_accion_area ON plan_accion(area_id);
CREATE INDEX idx_plan_accion_eje ON plan_accion(eje_id);
CREATE INDEX idx_plan_accion_sub_eje ON plan_accion(sub_eje_id);

-- Datos de ejemplo (opcional - puedes ejecutar o no)
-- INSERT INTO ejes (nombre_eje, descripcion) VALUES 
-- ('Eje Académico', 'Gestión y mejoramiento de procesos académicos'),
-- ('Eje Administrativo', 'Optimización de procesos administrativos'),
-- ('Eje Financiero', 'Control y gestión de recursos financieros');

-- INSERT INTO sub_ejes (eje_id, nombre_sub_eje, descripcion) VALUES 
-- (1, 'Calidad Educativa', 'Mejoramiento de la calidad en programas académicos'),
-- (1, 'Investigación', 'Fortalecimiento de la investigación institucional'),
-- (2, 'Recursos Humanos', 'Gestión del talento humano'),
-- (2, 'Infraestructura', 'Mejoramiento de espacios físicos'),
-- (3, 'Presupuesto', 'Control y seguimiento presupuestal'),
-- (3, 'Inversiones', 'Gestión de inversiones institucionales');