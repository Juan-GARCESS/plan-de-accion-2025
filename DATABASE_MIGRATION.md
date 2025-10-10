# 🗄️ Cambios Necesarios en la Base de Datos

## 📊 **ESQUEMA ACTUAL**

```sql
-- Usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'usuario',
  area_id INTEGER REFERENCES areas(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Áreas
CREATE TABLE areas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ejes
CREATE TABLE ejes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  area_id INTEGER REFERENCES areas(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sub-Ejes
CREATE TABLE subejes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  eje_id INTEGER REFERENCES ejes(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✅ **CAMBIOS NECESARIOS**

### 1. **Tabla `usuarios`** - Agregar campos de estado y aprobación

```sql
-- Agregar columnas nuevas
ALTER TABLE usuarios 
ADD COLUMN estado VARCHAR(20) DEFAULT 'pendiente',
ADD COLUMN fecha_aprobacion TIMESTAMP,
ADD COLUMN aprobado_por INTEGER REFERENCES usuarios(id);

-- Actualizar usuarios existentes a 'aprobado'
UPDATE usuarios SET estado = 'aprobado' WHERE created_at < NOW();

-- Índice para búsquedas rápidas de pendientes
CREATE INDEX idx_usuarios_estado ON usuarios(estado);
```

**Valores de `estado`**:
- `'pendiente'` - Usuario registrado pero no aprobado
- `'aprobado'` - Usuario aprobado por admin
- `'rechazado'` - Usuario rechazado por admin
- `'inactivo'` - Usuario desactivado

---

### 2. **Nueva Tabla: `usuario_metas`** - Metas personalizadas por usuario

```sql
CREATE TABLE usuario_metas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  eje_id INTEGER NOT NULL REFERENCES ejes(id) ON DELETE CASCADE,
  subeje_id INTEGER REFERENCES subejes(id) ON DELETE SET NULL,
  
  -- Contenido de la meta
  meta TEXT NOT NULL,
  indicador TEXT,
  accion TEXT,
  presupuesto DECIMAL(12,2) DEFAULT 0,
  
  -- Seguimiento por trimestre
  trimestre_1 BOOLEAN DEFAULT false,
  trimestre_2 BOOLEAN DEFAULT false,
  trimestre_3 BOOLEAN DEFAULT false,
  trimestre_4 BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_usuario_metas_usuario ON usuario_metas(usuario_id);
CREATE INDEX idx_usuario_metas_eje ON usuario_metas(eje_id);
CREATE INDEX idx_usuario_metas_subeje ON usuario_metas(subeje_id);
CREATE INDEX idx_usuario_metas_trimestres ON usuario_metas(
  usuario_id, 
  trimestre_1, 
  trimestre_2, 
  trimestre_3, 
  trimestre_4
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_usuario_metas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usuario_metas_update_timestamp
BEFORE UPDATE ON usuario_metas
FOR EACH ROW
EXECUTE FUNCTION update_usuario_metas_timestamp();
```

---

### 3. **Nueva Tabla: `evidencias`** - Informes y archivos subidos

```sql
CREATE TABLE evidencias (
  id SERIAL PRIMARY KEY,
  meta_id INTEGER NOT NULL REFERENCES usuario_metas(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  
  -- Información del trimestre
  trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
  año INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  
  -- Archivo
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  archivo_tipo VARCHAR(50),
  archivo_tamaño INTEGER, -- en bytes
  
  -- Contenido
  descripcion TEXT,
  
  -- Estado y calificación
  estado VARCHAR(20) DEFAULT 'enviado' CHECK (estado IN ('enviado', 'en_revision', 'aprobado', 'rechazado')),
  calificacion INTEGER CHECK (calificacion >= 0 AND calificacion <= 100),
  comentario_admin TEXT,
  
  -- Auditoría
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_revision TIMESTAMP,
  revisado_por INTEGER REFERENCES usuarios(id),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_evidencias_meta ON evidencias(meta_id);
CREATE INDEX idx_evidencias_usuario ON evidencias(usuario_id);
CREATE INDEX idx_evidencias_trimestre ON evidencias(trimestre, año);
CREATE INDEX idx_evidencias_estado ON evidencias(estado);
CREATE INDEX idx_evidencias_revisor ON evidencias(revisado_por);

-- Índice compuesto para búsquedas comunes
CREATE INDEX idx_evidencias_usuario_trimestre ON evidencias(usuario_id, trimestre, año);

-- Trigger para updated_at
CREATE TRIGGER evidencias_update_timestamp
BEFORE UPDATE ON evidencias
FOR EACH ROW
EXECUTE FUNCTION update_usuario_metas_timestamp();
```

---

### 4. **Nueva Tabla: `notificaciones`** - Sistema de notificaciones

```sql
CREATE TABLE notificaciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  
  -- Contenido
  tipo VARCHAR(50) NOT NULL, -- 'aprobacion', 'rechazo_evidencia', 'calificacion', etc.
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  
  -- Enlaces
  url_accion VARCHAR(500),
  
  -- Estado
  leida BOOLEAN DEFAULT false,
  fecha_lectura TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(usuario_id, leida);
CREATE INDEX idx_notificaciones_tipo ON notificaciones(tipo);
```

---

### 5. **Nueva Tabla: `emails_enviados`** - Log de emails

```sql
CREATE TABLE emails_enviados (
  id SERIAL PRIMARY KEY,
  destinatario VARCHAR(255) NOT NULL,
  asunto VARCHAR(500) NOT NULL,
  cuerpo TEXT NOT NULL,
  tipo VARCHAR(50), -- 'aprobacion', 'rechazo', 'calificacion', etc.
  
  -- Estado de envío
  enviado BOOLEAN DEFAULT false,
  error TEXT,
  
  -- Metadata
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  intentos INTEGER DEFAULT 0
);

-- Índices
CREATE INDEX idx_emails_destinatario ON emails_enviados(destinatario);
CREATE INDEX idx_emails_tipo ON emails_enviados(tipo);
CREATE INDEX idx_emails_enviado ON emails_enviados(enviado);
```

---

### 6. **Vista Materializada: `plan_accion_general`** - Para el reporte general

```sql
CREATE MATERIALIZED VIEW plan_accion_general AS
SELECT 
  -- Información de usuario
  u.id as usuario_id,
  u.nombre as usuario_nombre,
  u.email as usuario_email,
  
  -- Información de área
  a.id as area_id,
  a.nombre as area_nombre,
  
  -- Información de eje y sub-eje
  e.id as eje_id,
  e.nombre as eje_nombre,
  se.id as subeje_id,
  se.nombre as subeje_nombre,
  
  -- Información de la meta
  um.id as meta_id,
  um.meta,
  um.indicador,
  um.accion,
  um.presupuesto,
  
  -- Trimestres seleccionados
  um.trimestre_1,
  um.trimestre_2,
  um.trimestre_3,
  um.trimestre_4,
  
  -- Calificaciones por trimestre
  (
    SELECT calificacion 
    FROM evidencias 
    WHERE meta_id = um.id 
      AND trimestre = 1 
      AND estado = 'aprobado' 
    ORDER BY fecha_revision DESC 
    LIMIT 1
  ) as calificacion_t1,
  (
    SELECT calificacion 
    FROM evidencias 
    WHERE meta_id = um.id 
      AND trimestre = 2 
      AND estado = 'aprobado' 
    ORDER BY fecha_revision DESC 
    LIMIT 1
  ) as calificacion_t2,
  (
    SELECT calificacion 
    FROM evidencias 
    WHERE meta_id = um.id 
      AND trimestre = 3 
      AND estado = 'aprobado' 
    ORDER BY fecha_revision DESC 
    LIMIT 1
  ) as calificacion_t3,
  (
    SELECT calificacion 
    FROM evidencias 
    WHERE meta_id = um.id 
      AND trimestre = 4 
      AND estado = 'aprobado' 
    ORDER BY fecha_revision DESC 
    LIMIT 1
  ) as calificacion_t4,
  
  -- Promedio de calificaciones
  (
    SELECT AVG(calificacion)::DECIMAL(5,2)
    FROM evidencias
    WHERE meta_id = um.id AND estado = 'aprobado'
  ) as promedio_calificaciones,
  
  -- Metadata
  um.created_at,
  um.updated_at
  
FROM usuario_metas um
INNER JOIN usuarios u ON um.usuario_id = u.id
INNER JOIN areas a ON u.area_id = a.id
INNER JOIN ejes e ON um.eje_id = e.id
LEFT JOIN subejes se ON um.subeje_id = se.id
WHERE u.estado = 'aprobado';

-- Índices en la vista materializada
CREATE INDEX idx_plan_general_area ON plan_accion_general(area_nombre);
CREATE INDEX idx_plan_general_usuario ON plan_accion_general(usuario_nombre);
CREATE INDEX idx_plan_general_eje ON plan_accion_general(eje_nombre);

-- Función para refrescar la vista
CREATE OR REPLACE FUNCTION refresh_plan_accion_general()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY plan_accion_general;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 **SCRIPT DE MIGRACIÓN COMPLETO**

```sql
-- ==============================================
-- MIGRACIÓN: Sistema de Plan de Acción Completo
-- Fecha: 2025-01-XX
-- ==============================================

BEGIN;

-- 1. Agregar campos a usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente',
ADD COLUMN IF NOT EXISTS fecha_aprobacion TIMESTAMP,
ADD COLUMN IF NOT EXISTS aprobado_por INTEGER REFERENCES usuarios(id);

-- Actualizar usuarios existentes
UPDATE usuarios SET estado = 'aprobado' WHERE created_at < NOW();

-- 2. Crear tabla usuario_metas
CREATE TABLE IF NOT EXISTS usuario_metas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  eje_id INTEGER NOT NULL REFERENCES ejes(id) ON DELETE CASCADE,
  subeje_id INTEGER REFERENCES subejes(id) ON DELETE SET NULL,
  meta TEXT NOT NULL,
  indicador TEXT,
  accion TEXT,
  presupuesto DECIMAL(12,2) DEFAULT 0,
  trimestre_1 BOOLEAN DEFAULT false,
  trimestre_2 BOOLEAN DEFAULT false,
  trimestre_3 BOOLEAN DEFAULT false,
  trimestre_4 BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear tabla evidencias
CREATE TABLE IF NOT EXISTS evidencias (
  id SERIAL PRIMARY KEY,
  meta_id INTEGER NOT NULL REFERENCES usuario_metas(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
  año INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  archivo_tipo VARCHAR(50),
  archivo_tamaño INTEGER,
  descripcion TEXT,
  estado VARCHAR(20) DEFAULT 'enviado' CHECK (estado IN ('enviado', 'en_revision', 'aprobado', 'rechazado')),
  calificacion INTEGER CHECK (calificacion >= 0 AND calificacion <= 100),
  comentario_admin TEXT,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_revision TIMESTAMP,
  revisado_por INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear tabla notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  url_accion VARCHAR(500),
  leida BOOLEAN DEFAULT false,
  fecha_lectura TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Crear tabla emails_enviados
CREATE TABLE IF NOT EXISTS emails_enviados (
  id SERIAL PRIMARY KEY,
  destinatario VARCHAR(255) NOT NULL,
  asunto VARCHAR(500) NOT NULL,
  cuerpo TEXT NOT NULL,
  tipo VARCHAR(50),
  enviado BOOLEAN DEFAULT false,
  error TEXT,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  intentos INTEGER DEFAULT 0
);

-- 6. Crear índices
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);
CREATE INDEX IF NOT EXISTS idx_usuario_metas_usuario ON usuario_metas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_metas_eje ON usuario_metas(eje_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_meta ON evidencias(meta_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_usuario ON evidencias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_estado ON evidencias(estado);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_emails_destinatario ON emails_enviados(destinatario);

-- 7. Crear función de timestamp
CREATE OR REPLACE FUNCTION update_usuario_metas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear triggers
DROP TRIGGER IF EXISTS usuario_metas_update_timestamp ON usuario_metas;
CREATE TRIGGER usuario_metas_update_timestamp
BEFORE UPDATE ON usuario_metas
FOR EACH ROW
EXECUTE FUNCTION update_usuario_metas_timestamp();

DROP TRIGGER IF EXISTS evidencias_update_timestamp ON evidencias;
CREATE TRIGGER evidencias_update_timestamp
BEFORE UPDATE ON evidencias
FOR EACH ROW
EXECUTE FUNCTION update_usuario_metas_timestamp();

COMMIT;

-- Mensaje de confirmación
SELECT 'Migración completada exitosamente' as status;
```

---

## ✅ **CÓMO EJECUTAR LA MIGRACIÓN**

### Opción 1: Desde pgAdmin o cliente PostgreSQL
1. Conectarse a la base de datos
2. Copiar y pegar el script completo
3. Ejecutar

### Opción 2: Desde la terminal con psql
```bash
psql "postgresql://neondb_owner:npg_vc9djoEer1Rl@ep-frosty-moon-acux7z3k-pooler.sa-east-1.aws.neon.tech/neondb" < migracion.sql
```

### Opción 3: Crear API endpoint de migración
```typescript
// /api/admin/migrate/route.ts
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Ejecutar script de migración
    await pool.query(`
      -- Script completo aquí
    `);
    
    return Response.json({ 
      success: true, 
      message: 'Migración completada' 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

---

## 🔍 **VERIFICACIÓN POST-MIGRACIÓN**

```sql
-- Verificar que todas las tablas existan
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar índices creados
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verificar triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Contar registros en cada tabla
SELECT 
  'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'areas', COUNT(*) FROM areas
UNION ALL
SELECT 'ejes', COUNT(*) FROM ejes
UNION ALL
SELECT 'subejes', COUNT(*) FROM subejes
UNION ALL
SELECT 'usuario_metas', COUNT(*) FROM usuario_metas
UNION ALL
SELECT 'evidencias', COUNT(*) FROM evidencias
UNION ALL
SELECT 'notificaciones', COUNT(*) FROM notificaciones
UNION ALL
SELECT 'emails_enviados', COUNT(*) FROM emails_enviados;
```

---

## ⚠️ **IMPORTANTE**

1. **Hacer backup antes de migrar**:
   ```bash
   pg_dump "connection_string" > backup_antes_migracion.sql
   ```

2. **Probar en ambiente de desarrollo primero**

3. **La migración es segura**: Usa `IF NOT EXISTS` para evitar errores si ya existen tablas

4. **Usuarios existentes**: Se marcarán automáticamente como 'aprobado'

5. **Rollback**: Si algo falla, el `BEGIN` y `COMMIT` permiten revertir cambios

---

**Última actualización**: ${new Date().toLocaleDateString('es-ES')}
