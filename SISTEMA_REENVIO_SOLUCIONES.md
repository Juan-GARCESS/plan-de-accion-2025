# 🔄 SISTEMA DE REENVÍO/CORRECCIÓN DE EVIDENCIAS

## ✅ **SOLUCIÓN 1: PERMITIR EDICIÓN ANTES DE CALIFICAR** (IMPLEMENTADA)

### **Concepto:**
El usuario puede **eliminar y reenviar** SOLO si el admin NO ha calificado ninguna meta aún.

### **Ventajas:**
- ✅ Usuario puede corregir errores antes de la revisión
- ✅ Protege el trabajo del administrador
- ✅ Simple y seguro
- ✅ Evita conflictos con calificaciones existentes

### **Cómo Funciona:**
1. Usuario envía todas las metas
2. Si se da cuenta de un error **ANTES** de que el admin califique algo
3. Ve el botón rojo **"Eliminar Envío"** en el banner verde
4. Click → Confirma → Se elimina todo
5. Vuelve a completar las metas y reenvía

### **Flujo Visual:**
```
┌─────────────────────────────────────────────────┐
│ ✅ Envío del Trimestre 3 realizado              │
│ Todas tus metas han sido enviadas y están en    │
│ revisión por el administrador.                   │
│                                                  │
│ ⚠️ Puedes eliminar este envío y volver a enviar │
│ (aún no hay calificaciones)                      │
│                                    [🗑️ Eliminar] │ ← BOTÓN APARECE
└─────────────────────────────────────────────────┘
```

### **Casos:**
- **SIN calificaciones** → Botón visible → Puede eliminar ✅
- **CON calificaciones** → Botón NO aparece → NO puede eliminar ❌

### **Archivos Implementados:**
- ✅ `database/permitir_reenvio.sql` - Funciones SQL
- ✅ `src/app/api/usuario/eliminar-envio/route.ts` - API DELETE/GET
- ✅ `src/components/trimestre/TrimestreTableNew.tsx` - UI con botón

---

## 🔄 **SOLUCIÓN 2: SISTEMA DE VERSIONES** (ALTERNATIVA)

### **Concepto:**
Cada envío crea una **nueva versión**, el admin ve solo la última.

### **Ventajas:**
- ✅ Usuario puede reenviar siempre
- ✅ Se guarda historial completo
- ✅ Admin ve solo la versión actual
- ✅ Auditoría completa

### **Desventajas:**
- ❌ Más complejo
- ❌ Más espacio en DB
- ❌ Puede confundir al usuario

### **Estructura DB:**
```sql
-- Tabla envios_trimestre con versión
CREATE TABLE envios_trimestre (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  area_id INTEGER NOT NULL,
  trimestre INTEGER NOT NULL,
  anio INTEGER NOT NULL,
  version INTEGER NOT NULL DEFAULT 1, -- Nueva columna
  es_version_actual BOOLEAN DEFAULT TRUE, -- Solo una activa
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Al crear nueva versión, marcar anteriores como FALSE
  UNIQUE(usuario_id, area_id, trimestre, anio, version)
);

-- Trigger para manejar versiones
CREATE OR REPLACE FUNCTION crear_nueva_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Marcar versiones anteriores como inactivas
  UPDATE envios_trimestre
  SET es_version_actual = FALSE
  WHERE usuario_id = NEW.usuario_id
    AND area_id = NEW.area_id
    AND trimestre = NEW.trimestre
    AND anio = NEW.anio
    AND id != NEW.id;
  
  -- Asignar número de versión
  NEW.version := (
    SELECT COALESCE(MAX(version), 0) + 1
    FROM envios_trimestre
    WHERE usuario_id = NEW.usuario_id
      AND area_id = NEW.area_id
      AND trimestre = NEW.trimestre
      AND anio = NEW.anio
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### **Flujo:**
```
Envío 1 (v1) → Usuario reenvía → Envío 2 (v2, activa)
                                   ↓
                      Admin ve solo v2
                      Historial: v1 archivada
```

---

## ✏️ **SOLUCIÓN 3: EDICIÓN EN LÍNEA** (ALTERNATIVA COMPLEJA)

### **Concepto:**
El usuario puede **editar meta por meta** después del envío, sin eliminar todo.

### **Ventajas:**
- ✅ Flexibilidad máxima
- ✅ No pierde todo el trabajo
- ✅ Puede corregir solo una meta

### **Desventajas:**
- ❌ MUY complejo de implementar
- ❌ Conflictos con calificaciones
- ❌ Difícil de auditar

### **Estructura:**
```sql
ALTER TABLE evidencias 
ADD COLUMN permite_edicion BOOLEAN DEFAULT TRUE;

-- Bloquear edición cuando se califica
CREATE OR REPLACE FUNCTION bloquear_edicion_al_calificar()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado IN ('aprobado', 'rechazado') AND OLD.estado = 'pendiente' THEN
    NEW.permite_edicion := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### **UI:**
```
┌─────────────────────────────────────┐
│ Meta 1 [✅ Aprobada] - Bloqueada    │
│ Meta 2 [⏳ Pendiente] - [✏️ Editar] │ ← Puede editar
│ Meta 3 [⏳ Pendiente] - [✏️ Editar] │
└─────────────────────────────────────┘
```

---

## 📊 **COMPARACIÓN DE SOLUCIONES:**

| Característica | Sol. 1 (Implementada) | Sol. 2 (Versiones) | Sol. 3 (Edición) |
|----------------|----------------------|-------------------|------------------|
| **Complejidad** | 🟢 Baja | 🟡 Media | 🔴 Alta |
| **Flexibilidad** | 🟡 Media | 🟢 Alta | 🟢 Muy Alta |
| **Seguridad** | 🟢 Alta | 🟢 Alta | 🟡 Media |
| **Auditoría** | 🟡 Básica | 🟢 Completa | 🟡 Media |
| **UX Usuario** | 🟢 Simple | 🟢 Simple | 🟡 Compleja |
| **UX Admin** | 🟢 Claro | 🟢 Claro | 🟡 Confuso |
| **Implementación** | ✅ 30 min | ⏱️ 2 horas | ⏱️ 4+ horas |

---

## 🎯 **RECOMENDACIÓN:**

### **Usar SOLUCIÓN 1** (la implementada) porque:

1. ✅ **Simple y efectiva** - Hace exactamente lo que necesitas
2. ✅ **Protege al admin** - No pierde su trabajo de calificación
3. ✅ **UX clara** - Usuario sabe cuándo puede/no puede reenviar
4. ✅ **Rápida de implementar** - Ya está lista
5. ✅ **Fácil de mantener** - Código simple

### **Casos de Uso Cubiertos:**
- ✅ Usuario se equivoca en descripción → Elimina y reenvía
- ✅ Usuario sube archivo incorrecto → Elimina y reenvía
- ✅ Admin ya calificó algo → Usuario NO puede eliminar (protección)
- ✅ Usuario ve mensaje claro → "Puedes eliminar este envío"

### **Si necesitas más flexibilidad:**
- Implementa **Solución 2** (versiones) para auditoría completa
- NO implementes Solución 3 a menos que sea CRÍTICO

---

## 📝 **Instrucciones de Uso (Solución 1):**

### **Paso 1:** Ejecutar SQL adicional en Neon
```bash
# Archivo: database/permitir_reenvio.sql
```

### **Paso 2:** La API ya está creada
```
GET  /api/usuario/eliminar-envio  → Verificar si puede eliminar
DELETE /api/usuario/eliminar-envio → Eliminar envío
```

### **Paso 3:** El componente ya tiene el botón
- Aparece solo si puede eliminar
- Color rojo para indicar acción destructiva
- Confirmación antes de eliminar

---

## ✅ **Testing:**

1. **Login como usuario**
2. **Envía todas las metas** de un trimestre
3. **Verifica que aparece el botón rojo** "Eliminar Envío"
4. **Click en eliminar** → Confirma
5. **Verifica que vuelve al estado inicial**
6. **Reenvía las metas**

7. **Login como admin**
8. **Califica 1 meta**

9. **Login como usuario de nuevo**
10. **Verifica que el botón YA NO aparece** (porque hay calificaciones)

---

## 🔒 **Seguridad:**

- ✅ **Validación en backend** - No se puede eliminar si hay calificaciones
- ✅ **Confirmación en frontend** - Usuario debe confirmar
- ✅ **Verificación de permisos** - Solo el dueño puede eliminar
- ✅ **Transacciones DB** - Elimina evidencias + envío atómicamente

---

## 📊 **Consultas Útiles:**

```sql
-- Ver qué envíos pueden ser reeditados
SELECT 
  u.nombre,
  et.trimestre,
  COUNT(e.id) as total_metas,
  COUNT(CASE WHEN e.estado IN ('aprobado', 'rechazado') THEN 1 END) as calificadas,
  CASE 
    WHEN COUNT(CASE WHEN e.estado IN ('aprobado', 'rechazado') THEN 1 END) = 0 
    THEN '✅ Puede eliminar'
    ELSE '❌ Tiene calificaciones'
  END as puede_reenviar
FROM envios_trimestre et
JOIN usuarios u ON et.usuario_id = u.id
LEFT JOIN evidencias e ON et.id = e.envio_id
GROUP BY u.nombre, et.trimestre;
```

---

**🎉 SISTEMA COMPLETO DE REENVÍO IMPLEMENTADO Y LISTO PARA USAR!**
