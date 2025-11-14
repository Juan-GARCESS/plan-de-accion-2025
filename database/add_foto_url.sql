-- Agregar campo foto_url a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN foto_url TEXT NULL AFTER email;
