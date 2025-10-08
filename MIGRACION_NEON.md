# 🚀 Migración a PostgreSQL (Neon) - Instrucciones

## ✅ Pasos que debes realizar MANUALMENTE:

### 1. Ejecutar el esquema SQL en Neon

1. Ve a tu panel de Neon: https://console.neon.tech/
2. Selecciona tu proyecto "clov"
3. Ve a la sección "SQL Editor" o "Query"
4. Copia TODO el contenido del archivo: `database/schema-postgres.sql`
5. Pégalo en el editor SQL de Neon
6. Ejecuta el script (botón "Run" o "Execute")
7. Verifica que todas las tablas se crearon correctamente

### 2. Instalar dependencias de Node.js

En la terminal de tu proyecto, ejecuta:

```powershell
npm install
```

Esto instalará:

- `pg@^8.13.1` (cliente PostgreSQL)
- `@types/pg@^8.11.10` (tipos TypeScript)

Y removerá:

- `mysql2` (ya no necesario)

### 3. Verificar la conexión

Después de instalar las dependencias, inicia el servidor de desarrollo:

```powershell
npm run dev
```

Deberías ver en la consola:

```
✅ Conectado a PostgreSQL (Neon)
```

---

## 📝 Cambios Realizados Automáticamente

### Archivos modificados:

1. **`package.json`**

   - ✅ Reemplazado `mysql2` por `pg` y `@types/pg`

2. **`.env.local`**

   - ✅ Actualizada cadena de conexión a Neon PostgreSQL

3. **`src/lib/db.ts`**

   - ✅ Reemplazado pool de MySQL por Pool de PostgreSQL
   - ✅ Agregado soporte SSL para Neon
   - ✅ Helper function `query()` para debugging

4. **`database/schema-postgres.sql`**
   - ✅ Nuevo esquema convertido de MySQL a PostgreSQL
   - ✅ Incluye todas las tablas (usuarios, áreas, ejes, plan_accion, etc.)
   - ✅ Triggers automáticos para `updated_at`
   - ✅ Datos iniciales (admin, trimestres 2025)

---

## 🔄 Próximos Pasos

Una vez que hayas ejecutado los 3 pasos manuales arriba, te confirmarás que:

1. ✅ Las tablas están creadas en Neon
2. ✅ El servidor Next.js se conecta exitosamente
3. ✅ Puedes hacer login con: `admin@sistema.com` / `admin123`

**IMPORTANTE:** Aún falta adaptar TODAS las rutas API de MySQL a PostgreSQL.
Te ayudaré con eso después de que confirmes que la conexión funciona.

---

## ⚠️ Diferencias clave MySQL vs PostgreSQL

### Sintaxis de Queries:

- **Placeholders:** `?` (MySQL) → `$1, $2, $3` (PostgreSQL)
- **Resultados:** `[rows, fields]` (MySQL) → `{ rows, fields }` (PostgreSQL)
- **LIMIT:** `LIMIT 10` (igual en ambos)
- **RETURNING:** PostgreSQL soporta `RETURNING *` en INSERT/UPDATE

### Tipos de datos:

- `AUTO_INCREMENT` → `SERIAL` o `GENERATED ALWAYS AS IDENTITY`
- `TINYINT(1)` → `BOOLEAN`
- `DATETIME` → `TIMESTAMP`
- `ENUM('a','b')` → Tipo personalizado `CREATE TYPE`

---

## 🐛 Si algo sale mal

Si ves errores de conexión:

1. Verifica que `.env.local` tenga la cadena correcta
2. Confirma que ejecutaste `npm install`
3. Revisa que el script SQL se ejecutó sin errores en Neon

**Escríbeme cuando hayas completado estos pasos y continuaré con la conversión de las rutas API.**
