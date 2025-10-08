-- Comando SQL para agregar/verificar administrador en Neon PostgreSQL
-- Ejecutar en el SQL Editor de Neon

-- 1. Verificar si el admin ya existe
SELECT id, nombre, email, rol, estado FROM usuarios WHERE email = 'admin@sistema.com';

-- 2. Si NO existe, crearlo (el schema ya lo debería haber creado):
INSERT INTO usuarios (nombre, email, password, area_id, rol, estado) 
SELECT 
  'Administrador', 
  'admin@sistema.com', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvFBvY4Fb7gNu6u',  -- Password: admin123
  (SELECT id FROM areas WHERE nombre_area = 'admin'),
  'admin',
  'activo'
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios WHERE email = 'admin@sistema.com'
);

-- 3. Verificar creación
SELECT 
  u.id, 
  u.nombre, 
  u.email, 
  u.rol, 
  u.estado,
  a.nombre_area as area
FROM usuarios u
LEFT JOIN areas a ON u.area_id = a.id
WHERE u.email = 'admin@sistema.com';

-- Resultado esperado:
-- id | nombre         | email                | rol   | estado | area
-- 1  | Administrador  | admin@sistema.com    | admin | activo | admin

-- CREDENCIALES DE LOGIN:
-- Email: admin@sistema.com
-- Password: admin123
