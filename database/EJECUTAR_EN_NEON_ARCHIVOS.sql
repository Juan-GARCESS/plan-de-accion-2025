-- ====================================
-- EJECUTAR ESTE SCRIPT EN NEON SQL EDITOR
-- ====================================
-- Actualiza la tabla evidencias para soportar archivos subidos
-- Fecha: 21 de octubre, 2025

-- 1. Agregar columnas para metadata de archivos
ALTER TABLE evidencias 
ADD COLUMN IF NOT EXISTS nombre_archivo VARCHAR(500);

ALTER TABLE evidencias 
ADD COLUMN IF NOT EXISTS tipo_archivo VARCHAR(100);

ALTER TABLE evidencias 
ADD COLUMN IF NOT EXISTS tamano_archivo INTEGER;

-- 2. Actualizar url_evidencia para permitir URLs más largas (S3)
ALTER TABLE evidencias 
ALTER COLUMN url_evidencia TYPE TEXT;

-- 3. Agregar comentarios para documentación (solo si las columnas existen)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='evidencias' AND column_name='nombre_archivo') THEN
        COMMENT ON COLUMN evidencias.nombre_archivo IS 'Nombre original del archivo subido por el usuario';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='evidencias' AND column_name='tipo_archivo') THEN
        COMMENT ON COLUMN evidencias.tipo_archivo IS 'MIME type del archivo (application/pdf, image/jpeg, etc)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='evidencias' AND column_name='tamano_archivo') THEN
        COMMENT ON COLUMN evidencias.tamano_archivo IS 'Tamaño del archivo en bytes';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='evidencias' AND column_name='url_evidencia') THEN
        COMMENT ON COLUMN evidencias.url_evidencia IS 'URL del archivo en AWS S3 o enlace externo';
    END IF;
END $$;

-- 4. Crear índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_evidencias_tipo_archivo ON evidencias(tipo_archivo);
CREATE INDEX IF NOT EXISTS idx_evidencias_fecha_subida ON evidencias(fecha_subida DESC);
CREATE INDEX IF NOT EXISTS idx_evidencias_usuario_meta ON evidencias(usuario_meta_id);

-- 5. Verificar que las columnas se crearon correctamente
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'evidencias'
  AND column_name IN ('nombre_archivo', 'tipo_archivo', 'tamano_archivo', 'url_evidencia')
ORDER BY ordinal_position;

-- ====================================
-- RESULTADO ESPERADO:
-- ====================================
-- nombre_archivo    | character varying | 500  | YES
-- tipo_archivo      | character varying | 100  | YES
-- tamano_archivo    | integer           | NULL | YES
-- url_evidencia     | text              | NULL | YES
