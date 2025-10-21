-- Actualizar tabla evidencias para soportar archivos
-- Ejecutar en Neon SQL Editor

-- Agregar columnas para metadata de archivos
ALTER TABLE evidencias 
ADD COLUMN IF NOT EXISTS nombre_archivo VARCHAR(500),
ADD COLUMN IF NOT EXISTS tipo_archivo VARCHAR(100),
ADD COLUMN IF NOT EXISTS tamano_archivo INTEGER;

-- Comentarios para documentación
COMMENT ON COLUMN evidencias.nombre_archivo IS 'Nombre original del archivo subido';
COMMENT ON COLUMN evidencias.tipo_archivo IS 'MIME type del archivo (application/pdf, etc)';
COMMENT ON COLUMN evidencias.tamano_archivo IS 'Tamaño del archivo en bytes';

-- Actualizar url_evidencia para permitir URLs más largas (S3)
ALTER TABLE evidencias 
ALTER COLUMN url_evidencia TYPE TEXT;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_evidencias_tipo_archivo ON evidencias(tipo_archivo);
CREATE INDEX IF NOT EXISTS idx_evidencias_fecha_subida ON evidencias(fecha_subida DESC);
