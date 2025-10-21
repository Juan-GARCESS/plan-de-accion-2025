-- Script para agrandar el campo archivo_tipo
-- El problema: algunos tipos MIME son muy largos
-- Ejemplo: application/vnd.openxmlformats-officedocument.wordprocessingml.document (72 caracteres)

-- Aumentar el tamaño del campo archivo_tipo a 200 caracteres
ALTER TABLE evidencias 
ALTER COLUMN archivo_tipo TYPE VARCHAR(200);

-- Verificar el cambio
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'evidencias' AND column_name = 'archivo_tipo';
