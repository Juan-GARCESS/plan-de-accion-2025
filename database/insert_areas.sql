-- Script para agregar todas las áreas a la base de datos
-- Ejecutar en Neon PostgreSQL

INSERT INTO areas (nombre_area, descripcion, fecha_creacion) VALUES
('Activos Fijos', 'Gestión y control de activos fijos de la institución', NOW()),
('Autoevaluación', 'Procesos de autoevaluación y mejora continua', NOW()),
('Bienestar', 'Bienestar universitario y servicios estudiantiles', NOW()),
('CAD', 'Centro de Apoyo y Desarrollo', NOW()),
('Centro de conciliación y consultorio jurídico', 'Servicios jurídicos y de conciliación', NOW()),
('Compras', 'Gestión de compras y adquisiciones', NOW()),
('Comunicaciones', 'Comunicación institucional y relaciones públicas', NOW()),
('Contabilidad', 'Gestión contable y financiera', NOW()),
('DARC', 'Departamento de Admisiones, Registro y Control', NOW()),
('E-learning APA', 'Plataforma de aprendizaje en línea APA', NOW()),
('ETDH / Centro de Idiomas', 'Enseñanza de idiomas y desarrollo humano', NOW()),
('Extensión y Proyección Social', 'Programas de extensión y proyección a la comunidad', NOW()),
('Administración de Empresas', 'Programa académico de Administración de Empresas', NOW()),
('Especialización Gestión del Talento Humano', 'Programa de especialización en Talento Humano', NOW()),
('Contaduría', 'Programa académico de Contaduría Pública', NOW()),
('Especialización Gerencia de Impuestos', 'Programa de especialización en Gerencia de Impuestos', NOW()),
('Derecho', 'Programa académico de Derecho', NOW()),
('Especialización Contratación Estatal', 'Programa de especialización en Contratación Estatal', NOW()),
('Especialización Derecho Laboral', 'Programa de especialización en Derecho Laboral', NOW()),
('Gestión Humana', 'Gestión del talento humano institucional', NOW()),
('Infraestructura Física', 'Mantenimiento y desarrollo de infraestructura', NOW()),
('Infraestructura Tecnológica', 'Gestión de infraestructura y servicios tecnológicos', NOW()),
('Mercadeo', 'Marketing y comunicación comercial', NOW()),
('Planeación y Efectividad', 'Planeación estratégica y medición de efectividad', NOW()),
('Ingeniería de Sistemas', 'Programa académico de Ingeniería de Sistemas', NOW()),
('Especialización Seguridad de la información', 'Programa de especialización en Seguridad de la Información', NOW()),
('Psicología', 'Programa académico de Psicología', NOW()),
('Especialización Promoción Psicosocial', 'Programa de especialización en Promoción Psicosocial', NOW()),
('SIB', 'Sistema Integrado de Bibliotecas', NOW()),
('Tesorería', 'Gestión de tesorería y pagos', NOW())
ON CONFLICT (nombre_area) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT id, nombre_area, descripcion FROM areas ORDER BY nombre_area;
