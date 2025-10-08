# ✅ Solución al Error de PostgreSQL

## 🔴 Problema Encontrado

El error `function update_plan_accion_fecha_actualizacion() does not exist` ocurrió porque intentamos crear un TRIGGER antes de crear la FUNCTION.

## ✅ Solución Aplicada

### 1. Esquema SQL Corregido

**Archivo actualizado:** `database/schema-postgres.sql`

**Cambios:**

- ✅ Movimos la creación de AMBAS funciones ANTES de los triggers
- ✅ Eliminamos triggers duplicados
- ✅ Orden correcto: CREATE FUNCTION → CREATE TRIGGER

### 2. Rutas API Migradas a PostgreSQL

**Archivos actualizados:**

1. **`src/app/api/admin/areas/[id]/plan-accion/route.ts`**

   - ✅ Removido `import type { RowDataPacket, ResultSetHeader } from 'mysql2'`
   - ✅ Cambiado `?` → `$1, $2, $3`
   - ✅ Cambiado `[rows]` → `result.rows`
   - ✅ Cambiado `result.insertId` → `RETURNING id` → `result.rows[0].id`
   - ✅ Cambiado `activo = 1` → `activo = true`
   - ✅ Cambiado `NOW()` → `CURRENT_TIMESTAMP`

2. **`src/app/api/admin/areas/[id]/seguimiento-ejes/route.ts`**

   - ✅ Removido imports de MySQL
   - ✅ Removido CREATE TABLE (ya existe en schema)
   - ✅ Actualizado sintaxis PostgreSQL
   - ✅ `activo = 1` → `activo = true`

3. **`src/app/api/usuario/seguimiento-ejes/route.ts`**
   - ✅ Cambiado a sintaxis PostgreSQL
   - ✅ `ON DUPLICATE KEY UPDATE` → `ON CONFLICT ... DO UPDATE`
   - ✅ `VALUES(seleccionado)` → `EXCLUDED.seleccionado`
   - ✅ Removido CREATE TABLE dinámico

---

## 📋 PASOS PARA EJECUTAR

### Paso 1: Limpiar la base de datos en Neon

En el SQL Editor de Neon, ejecuta el contenido de:

```
database/clean-neon.sql
```

Este script eliminará todas las tablas, funciones y triggers anteriores.

### Paso 2: Ejecutar el nuevo esquema corregido

Ahora ejecuta el contenido de:

```
database/schema-postgres.sql
```

**Deberías ver:**

- ✅ 4 tipos ENUM creados
- ✅ 12 tablas creadas
- ✅ 2 funciones creadas
- ✅ 7 triggers creados
- ✅ 16 índices creados
- ✅ 3 inserts de datos iniciales
- ✅ Sin errores

### Paso 3: Verificar la instalación

Ejecuta en tu terminal:

```powershell
node test-connection.js
```

**Deberías ver:**

```
✅ Conexión exitosa a PostgreSQL
✅ Tablas encontradas en la base de datos:
   - areas
   - usuarios
   - informes
   - config_envios
   - selecciones_trimestre
   - notificaciones
   - ejes
   - sub_ejes
   - area_ejes
   - plan_accion
   - seguimiento_ejes
✅ Usuario administrador encontrado
   ID: 1
   Nombre: Administrador
   Email: admin@sistema.com
   Rol: admin
```

### Paso 4: Probar la aplicación

```powershell
npm run dev
```

Deberías ver:

```
✅ Conectado a PostgreSQL (Neon)
▲ Next.js 15.5.4 (Turbopack)
- Local: http://localhost:3000
```

Luego ve a http://localhost:3000 y prueba:

- Login con: `admin@sistema.com` / `admin123`
- Navegar a Plan de Acción
- Probar Ejecución Efectiva

---

## 📁 Archivos Creados

1. **`database/clean-neon.sql`** - Script para limpiar la BD
2. **`database/schema-postgres.sql`** - Esquema corregido
3. **`test-connection.js`** - Script de prueba

---

## 🔄 Rutas Restantes por Migrar

Estas rutas AÚN usan sintaxis MySQL y necesitan conversión:

### Prioridad ALTA (autenticación):

- ❌ `src/app/api/login/route.ts`
- ❌ `src/app/api/register/route.ts`
- ❌ `src/app/api/logout/route.ts`
- ❌ `src/app/api/me/route.ts`

### Prioridad MEDIA (admin):

- ❌ `src/app/api/admin/usuarios/route.ts`
- ❌ `src/app/api/admin/usuarios/aprobar/route.ts`
- ❌ `src/app/api/admin/usuarios/rechazar/route.ts`
- ❌ `src/app/api/admin/usuarios/editar/route.ts`
- ❌ `src/app/api/admin/usuarios/eliminar/route.ts`
- ❌ `src/app/api/admin/areas/route.ts`
- ❌ `src/app/api/admin/ejes/route.ts`
- ❌ `src/app/api/admin/sub-ejes/route.ts`

### Prioridad BAJA (usuario):

- ❌ `src/app/api/usuario/route.ts`
- ❌ `src/app/api/usuario/trimestres/route.ts`
- ❌ `src/app/api/usuario/informes/route.ts`
- ❌ Otras rutas de usuario...

---

## ⚠️ Importante

**NO inicies la aplicación (`npm run dev`) hasta:**

1. ✅ Haber ejecutado `clean-neon.sql`
2. ✅ Haber ejecutado `schema-postgres.sql`
3. ✅ Haber verificado con `node test-connection.js`

**Una vez confirmado que funciona, te ayudaré a migrar TODAS las rutas restantes.**

---

## 🐛 Si algo sale mal

**Error de conexión:**

- Verifica `.env.local` tiene la cadena correcta
- Confirma que ejecutaste `npm install`

**Error en SQL:**

- Ejecuta primero `clean-neon.sql`
- Luego ejecuta `schema-postgres.sql`
- Si falla una línea, copia el error exacto

**Errores en rutas API:**

- Espera a que migremos TODAS las rutas
- Por ahora solo funcionan: plan-accion y seguimiento-ejes
