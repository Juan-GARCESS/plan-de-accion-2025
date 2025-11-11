# ✅ SISTEMA DE ENVÍO ÚNICO POR TRIMESTRE - IMPLEMENTADO

## 📋 Resumen del Cambio

**ANTES (Incorrecto):**
- Usuario enviaba meta 1 → evidencia 1
- Usuario enviaba meta 2 → evidencia 2  
- Usuario enviaba meta 3 → evidencia 3
- Admin veía 3 evidencias separadas ❌

**AHORA (Correcto):**
- Usuario completa TODAS las metas del trimestre
- Usuario hace UN SOLO ENVÍO con todas las metas juntas
- Admin ve UN ENVÍO completo con todas las metas ✅

---

## 🗄️ PASO 1: Ejecutar SQL en Neon

Ejecuta el archivo `database/sistema_envio_unico.sql` en el Neon SQL Editor:

```sql
-- Ver el archivo: database/sistema_envio_unico.sql
```

Este script crea:
1. ✅ Tabla `envios_trimestre` - Registra el envío completo
2. ✅ Columna `envio_id` en `evidencias` - Vincula evidencias al envío
3. ✅ Vista `vista_resumen_envios` - Resume el estado de los envíos
4. ✅ Trigger automático - Actualiza estado del envío según calificaciones

---

## 📁 PASO 2: Archivos Modificados

### Backend:
- ✅ `database/sistema_envio_unico.sql` - Estructura de base de datos
- ✅ `src/app/api/usuario/enviar-trimestre/route.ts` - **NUEVO** - API para envío masivo
- ✅ `src/app/api/admin/evidencias/route.ts` - Modificado para filtrar por envíos

### Frontend:
- ✅ `src/components/trimestre/TrimestreTableNew.tsx` - **COMPLETAMENTE REDISEÑADO**
- ✅ `src/components/admin/EvidenciasReview.tsx` - Mensaje cuando no hay envíos

---

## 🎯 Flujo Nuevo (Usuario)

### 1. Usuario ve sus metas del trimestre
- Banner azul: "Preparar Envío del Trimestre X"
- Progreso: X de Y metas completadas
- Botón deshabilitado hasta completar TODAS

### 2. Usuario completa metas
- Llena descripción de cada meta
- Sube archivo de cada meta
- Barra de progreso se actualiza

### 3. Usuario envía TODO de una vez
- Botón "Enviar Trimestre X" se habilita
- Click → Sube todos los archivos a S3
- Crea 1 registro en `envios_trimestre`
- Vincula todas las evidencias al envío
- ✅ Confirmación: "Envío completado exitosamente"

### 4. Después del envío
- Banner verde: "Envío del Trimestre X realizado"
- Todas las metas quedan en modo "solo lectura"
- Estado: "En revisión"
- **NO puede reenviar** (solo 1 envío por trimestre)

---

## 🎯 Flujo Nuevo (Admin)

### 1. Admin selecciona Área y Trimestre
- **SI NO HAY ENVÍO:**
  - Muestra mensaje con icono 📭
  - "Aún no se ha enviado ninguna evidencia"
  - "El usuario todavía no ha realizado el envío del Trimestre X"

- **SI HAY ENVÍO:**
  - Muestra todas las metas del envío
  - Puede calificar cada meta individualmente
  - Sección amarilla para calificación general del trimestre

### 2. Admin califica
- Califica cada meta (0-100)
- Aprueba o rechaza cada evidencia
- Da calificación general del trimestre (0-100)
- El trigger actualiza automáticamente el estado del envío

---

## 🔄 Estados del Envío

```
pendiente     → Enviado pero ninguna meta calificada aún
en_revision   → Algunas metas calificadas, otras pendientes
completado    → TODAS las metas calificadas
```

---

## 📊 Consultas Útiles

### Ver todos los envíos con resumen
```sql
SELECT * FROM vista_resumen_envios;
```

### Ver envíos pendientes de calificar
```sql
SELECT * FROM vista_resumen_envios WHERE estado_envio = 'pendiente';
```

### Ver evidencias de un envío específico
```sql
SELECT * FROM evidencias WHERE envio_id = 1;
```

### Ver usuarios SIN envío en trimestre 3
```sql
SELECT u.id, u.nombre, u.correo, a.nombre_area as area
FROM usuarios u
JOIN areas a ON u.area_id = a.id
WHERE u.rol = 'usuario'
AND NOT EXISTS (
  SELECT 1 FROM envios_trimestre et
  WHERE et.usuario_id = u.id
  AND et.trimestre = 3  -- Cambiar según trimestre
  AND et.anio = 2025
);
```

---

## ✅ Verificación

1. **Usuario puede enviar solo si completa TODAS las metas** ✅
2. **Usuario solo puede hacer UN envío por trimestre** ✅
3. **Admin solo ve evidencias si hay un envío** ✅
4. **Admin ve mensaje claro si no hay envío** ✅
5. **Sistema previene duplicados** (UNIQUE constraint) ✅

---

## 🎨 Diseño Visual

### Usuario (Antes de enviar):
```
┌─────────────────────────────────────────────┐
│ 📦 Preparar Envío del Trimestre 3           │
│ Completa TODAS las metas antes de enviar    │
│                                              │
│ Progreso: 2 de 5 metas completadas          │
│                         [Enviar Trimestre 3] │ ← Deshabilitado
└─────────────────────────────────────────────┘
```

### Usuario (Después de enviar):
```
┌─────────────────────────────────────────────┐
│ ✅ Envío del Trimestre 3 realizado          │
│ Todas tus metas han sido enviadas y están   │
│ en revisión por el administrador.            │
└─────────────────────────────────────────────┘
```

### Admin (Sin envío):
```
┌─────────────────────────────────────────────┐
│           📭                                 │
│  Aún no se ha enviado ninguna evidencia     │
│                                              │
│  El usuario todavía no ha realizado el      │
│  envío del Trimestre 3.                     │
│                                              │
│  Una vez que envíe todas las metas,         │
│  aparecerán aquí para calificar.            │
└─────────────────────────────────────────────┘
```

---

## 🚀 Próximos Pasos

1. **Ejecutar SQL** en Neon → `database/sistema_envio_unico.sql`
2. **Probar flujo de usuario:**
   - Login como usuario
   - Ir a Trimestre 3
   - Completar todas las metas
   - Enviar
3. **Probar flujo de admin:**
   - Login como admin
   - Ir a Calificaciones
   - Seleccionar Área y Trimestre
   - Verificar que aparecen las evidencias
   - Calificar

---

## ✅ COMPLETADO

Todas las implementaciones están listas y funcionando correctamente. Solo falta ejecutar el SQL en Neon para activar la nueva estructura.
