-- Script para agregar todas las áreas a la base de datos
-- Ejecutar en Neon PostgreSQL

INSERT INTO areas (nombre_area, descripcion) VALUES
('Activos Fijos', 'Gestión y control de activos fijos de la institución'),
('Autoevaluación', 'Procesos de autoevaluación y mejora continua'),
('Bienestar', 'Bienestar universitario y servicios estudiantiles'),
('CAD', 'Centro de Apoyo y Desarrollo'),
('Centro de conciliación y consultorio jurídico', 'Servicios jurídicos y de conciliación'),
('Compras', 'Gestión de compras y adquisiciones'),
('Comunicaciones', 'Comunicación institucional y relaciones públicas'),
('Contabilidad', 'Gestión contable y financiera'),
('DARC', 'Departamento de Admisiones, Registro y Control'),
('E-learning APA', 'Plataforma de aprendizaje en línea APA'),
('ETDH / Centro de Idiomas', 'Enseñanza de idiomas y desarrollo humano'),
('Extensión y Proyección Social', 'Programas de extensión y proyección a la comunidad'),
('Administración de Empresas', 'Programa académico de Administración de Empresas'),
('Especialización Gestión del Talento Humano', 'Programa de especialización en Talento Humano'),
('Contaduría', 'Programa académico de Contaduría Pública'),
('Especialización Gerencia de Impuestos', 'Programa de especialización en Gerencia de Impuestos'),
('Derecho', 'Programa académico de Derecho'),
('Especialización Contratación Estatal', 'Programa de especialización en Contratación Estatal'),
('Especialización Derecho Laboral', 'Programa de especialización en Derecho Laboral'),
('Gestión Humana', 'Gestión del talento humano institucional'),
('Infraestructura Física', 'Mantenimiento y desarrollo de infraestructura'),
('Infraestructura Tecnológica', 'Gestión de infraestructura y servicios tecnológicos'),
('Mercadeo', 'Marketing y comunicación comercial'),
('Planeación y Efectividad', 'Planeación estratégica y medición de efectividad'),
('Ingeniería de Sistemas', 'Programa académico de Ingeniería de Sistemas'),
('Especialización Seguridad de la información', 'Programa de especialización en Seguridad de la Información'),
('Psicología', 'Programa académico de Psicología'),
('Especialización Promoción Psicosocial', 'Programa de especialización en Promoción Psicosocial'),
('SIB', 'Sistema Integrado de Bibliotecas'),
('Tesorería', 'Gestión de tesorería y pagos')
ON CONFLICT (nombre_area) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT id, nombre_area, descripcion FROM areas ORDER BY nombre_area;
