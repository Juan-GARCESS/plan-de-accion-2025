# 🔄 Guía de Conversión MySQL → PostgreSQL

## Patrones de Conversión Comunes

### 1. Imports

**ANTES (MySQL):**

```typescript
import type { RowDataPacket, ResultSetHeader } from "mysql2";
```

**DESPUÉS (PostgreSQL):**

```typescript
import type { QueryResult } from "pg";
// No necesitas tipos especiales, usaremos interfaces custom
```

---

### 2. Queries SELECT

**ANTES (MySQL):**

```typescript
const [rows] = await db.query<RowDataPacket[]>(
  "SELECT * FROM usuarios WHERE email = ?",
  [email]
);
const user = rows[0];
```

**DESPUÉS (PostgreSQL):**

```typescript
const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [
  email,
]);
const user = result.rows[0];
```

**Cambios:**

- ✅ Placeholders: `?` → `$1, $2, $3...`
- ✅ Resultado: `[rows]` → `result.rows`
- ✅ No necesitas destructuring `[rows]`

---

### 3. Queries INSERT

**ANTES (MySQL):**

```typescript
const [result] = await db.query<ResultSetHeader>(
  "INSERT INTO usuarios (nombre, email) VALUES (?, ?)",
  [nombre, email]
);
const newId = result.insertId;
```

**DESPUÉS (PostgreSQL):**

```typescript
const result = await db.query(
  "INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING id",
  [nombre, email]
);
const newId = result.rows[0].id;
```

**Cambios:**

- ✅ Usa `RETURNING id` para obtener el ID insertado
- ✅ El ID está en `result.rows[0].id`

---

### 4. Queries UPDATE

**ANTES (MySQL):**

```typescript
await db.query("UPDATE usuarios SET nombre = ? WHERE id = ?", [nombre, id]);
```

**DESPUÉS (PostgreSQL):**

```typescript
await db.query("UPDATE usuarios SET nombre = $1 WHERE id = $2", [nombre, id]);
```

**Cambios:**

- ✅ Solo placeholders: `?` → `$1, $2`

---

### 5. Queries DELETE

**ANTES (MySQL):**

```typescript
await db.query("DELETE FROM usuarios WHERE id = ?", [id]);
```

**DESPUÉS (PostgreSQL):**

```typescript
await db.query("DELETE FROM usuarios WHERE id = $1", [id]);
```

**Cambios:**

- ✅ Solo placeholders

---

### 6. ON DUPLICATE KEY UPDATE

**ANTES (MySQL):**

```typescript
await db.query(
  `
  INSERT INTO seguimiento_ejes (area_id, eje_id, trimestre, seleccionado)
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE seleccionado = VALUES(seleccionado)
`,
  [areaId, ejeId, trimestre, seleccionado]
);
```

**DESPUÉS (PostgreSQL):**

```typescript
await db.query(
  `
  INSERT INTO seguimiento_ejes (area_id, eje_id, trimestre, seleccionado)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (area_id, eje_id, trimestre) 
  DO UPDATE SET seleccionado = EXCLUDED.seleccionado
`,
  [areaId, ejeId, trimestre, seleccionado]
);
```

**Cambios:**

- ✅ `ON DUPLICATE KEY UPDATE` → `ON CONFLICT ... DO UPDATE`
- ✅ `VALUES(column)` → `EXCLUDED.column`

---

### 7. BOOLEAN values

**ANTES (MySQL):**

```typescript
// MySQL acepta 0/1 y TRUE/FALSE
const activo = true; // o 1
```

**DESPUÉS (PostgreSQL):**

```typescript
// PostgreSQL prefiere TRUE/FALSE o booleanos nativos
const activo = true; // siempre usar boolean nativo
```

**Cambios:**

- ✅ Usar `true`/`false` en vez de `1`/`0`
- ✅ En queries: `WHERE activo = TRUE` funciona igual

---

### 8. LIMIT / OFFSET

**ANTES Y DESPUÉS (igual):**

```typescript
SELECT * FROM usuarios LIMIT 10 OFFSET 20
```

**Cambios:**

- ✅ Sin cambios, sintaxis idéntica

---

### 9. Checking if rows exist

**ANTES (MySQL):**

```typescript
const [rows] = await db.query<RowDataPacket[]>(...);
if (rows.length > 0) { ... }
```

**DESPUÉS (PostgreSQL):**

```typescript
const result = await db.query(...);
if (result.rows.length > 0) { ... }
// O también:
if (result.rowCount && result.rowCount > 0) { ... }
```

---

### 10. Transacciones

**ANTES (MySQL):**

```typescript
const connection = await db.getConnection();
await connection.beginTransaction();
try {
  await connection.query("INSERT ...", []);
  await connection.query("UPDATE ...", []);
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

**DESPUÉS (PostgreSQL):**

```typescript
const client = await db.connect();
try {
  await client.query("BEGIN");
  await client.query("INSERT ...", []);
  await client.query("UPDATE ...", []);
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
}
```

---

## Resumen de Cambios Clave

| Aspecto          | MySQL                             | PostgreSQL                                |
| ---------------- | --------------------------------- | ----------------------------------------- |
| Placeholders     | `?`                               | `$1, $2, $3...`                           |
| Resultado SELECT | `const [rows] = await db.query()` | `const result = await db.query()`         |
| Acceso a filas   | `rows[0]`                         | `result.rows[0]`                          |
| INSERT ID        | `result.insertId`                 | Usar `RETURNING id` → `result.rows[0].id` |
| UPSERT           | `ON DUPLICATE KEY UPDATE`         | `ON CONFLICT ... DO UPDATE`               |
| Boolean          | `0/1` o `TRUE/FALSE`              | `true/false` (nativo)                     |
| Row count        | `result.affectedRows`             | `result.rowCount`                         |

---

## ⚠️ Importante

**Antes de migrar:**

1. Ejecuta el schema en Neon
2. Confirma que `npm install` funcionó
3. Prueba la conexión con `node test-connection.js`

**Después te ayudaré a migrar todas las rutas API una por una.**
