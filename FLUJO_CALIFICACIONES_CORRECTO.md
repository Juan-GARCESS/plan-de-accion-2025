# 🎯 SISTEMA DE CALIFICACIONES - FLUJO CORRECTO

## 📋 Resumen del Flujo

### Para el Usuario:
1. Usuario selecciona trimestre (1, 2, 3 o 4)
2. Envía TODAS sus metas asignadas para ese trimestre EN UN SOLO ENVÍO
3. Cada meta incluye: descripción, archivo adjunto, etc.

### Para el Administrador:
1. Recibe UN ENVÍO por usuario y por trimestre
2. Ve TODAS las metas del usuario en ese envío
3. Califica CADA META individualmente (0-100) ← Ya funciona con tabla `evidencias`
4. Después de revisar todas las metas, da una **CALIFICACIÓN GENERAL DEL TRIMESTRE** (0-100)
5. Este proceso se repite para los 4 trimestres

### Calificación Anual:
- Promedio de las 4 calificaciones generales de trimestre = Calificación anual del usuario

---

## 🗄️ Estructura de Base de Datos

### Tabla existente: `evidencias`
```sql
-- Ya existe, guarda:
- meta_id (qué meta es)
- usuario_id (quién la envió)
- trimestre (1, 2, 3 o 4)
- calificacion (0-100) ← Calificación individual de esa meta
- estado (pendiente, aprobado, rechazado)
- comentario_admin
```

### Tabla NUEVA: `calificaciones_trimestre`
```sql
-- Guarda la calificación GENERAL que el admin da por trimestre
CREATE TABLE calificaciones_trimestre (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,        -- Quién recibe la calificación
    area_id INTEGER NOT NULL,
    trimestre INTEGER NOT NULL,          -- 1, 2, 3 o 4
    anio INTEGER NOT NULL DEFAULT 2025,
    
    calificacion_general DECIMAL(5,2) NOT NULL,  -- 0-100 (LA CALIFICACIÓN GENERAL DEL TRIMESTRE)
    comentario_general TEXT,                      -- Comentario general del trimestre
    
    calificado_por INTEGER,               -- Admin que calificó
    fecha_calificacion TIMESTAMP,
    
    UNIQUE(usuario_id, trimestre, anio)   -- Una calificación general por trimestre/año
);
```

### Vista: `vista_calificaciones_anuales`
```sql
-- Calcula automáticamente el promedio anual
SELECT 
    usuario_id,
    usuario_nombre,
    area_nombre,
    cal_trimestre_1,     -- Calificación general del T1
    cal_trimestre_2,     -- Calificación general del T2
    cal_trimestre_3,     -- Calificación general del T3
    cal_trimestre_4,     -- Calificación general del T4
    calificacion_anual,  -- PROMEDIO de las 4 calificaciones generales
    trimestres_calificados
FROM vista_calificaciones_anuales;
```

---

## 📝 PASO 1: Ejecutar SQL en Neon

**Copia y pega** el contenido del archivo `database/sistema_calificaciones_correcto.sql` en Neon SQL Editor y ejecútalo.

Esto creará:
- ✅ Tabla `calificaciones_trimestre`
- ✅ Vista `vista_calificaciones_anuales`
- ✅ Vista `vista_resumen_calificaciones`
- ✅ Índices y triggers

---

## 🔧 PASO 2: Actualizar APIs

### API Nueva: `/api/admin/calificaciones-trimestre`

```typescript
// GET: Obtener calificación general de un trimestre
GET /api/admin/calificaciones-trimestre?usuario_id=2&trimestre=1

// POST: Guardar calificación general del trimestre
POST /api/admin/calificaciones-trimestre
Body: {
  usuario_id: 2,
  area_id: 1,
  trimestre: 1,
  calificacion_general: 85,
  comentario_general: "Buen desempeño general...",
  admin_id: 1
}

// PATCH: Actualizar calificación general
PATCH /api/admin/calificaciones-trimestre
Body: {
  usuario_id: 2,
  trimestre: 1,
  calificacion_general: 90,
  comentario_general: "Actualizado..."
}
```

---

## 🎨 PASO 3: Actualizar Interfaz del Admin

### Pantalla: Calificar Evidencias - Trimestre X

```
┌─────────────────────────────────────────────────────────┐
│  Calificar Evidencias - Trimestre 1                     │
│  Área: Calidad                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📦 Envío de: Juan Garces                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  Meta 1: Llegar a casa                            │  │
│  │  📎 Juan.jpg                                       │  │
│  │  Estado: ✅ Aprobado (100%)                        │  │
│  │  [Ver] [Editar] [Eliminar]                        │  │
│  │                                                     │  │
│  │  Meta 2: Indicador calaminar                      │  │
│  │  📎 archivo.pdf                                    │  │
│  │  Estado: ⏳ Pendiente                              │  │
│  │  [Calificar]                                       │  │
│  │                                                     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                           │
│  ⭐ CALIFICACIÓN GENERAL DEL TRIMESTRE                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Después de revisar todas las metas, asigna una    │  │
│  │ calificación general para este trimestre:         │  │
│  │                                                     │  │
│  │ Calificación (0-100): [____85____]                │  │
│  │ Comentario: [Buen desempeño general...]           │  │
│  │                                                     │  │
│  │ [Guardar Calificación General]                    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 PASO 4: Vista de Resumen Anual

```
┌─────────────────────────────────────────────────────────┐
│  Calificaciones Anuales - 2025                           │
│  Área: Calidad                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Usuario: Juan Garces                                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │ T1: 85  │  T2: 90  │  T3: 88  │  T4: 92           │  │
│  │                                                     │  │
│  │ 📊 CALIFICACIÓN ANUAL: 88.75                       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Ventajas de Este Flujo

1. **Simple y claro**: Un envío por trimestre con todas las metas
2. **Calificaciones separadas**:
   - Cada meta tiene su calificación individual
   - El trimestre tiene una calificación general
3. **Promedio correcto**: La calificación anual se calcula desde las calificaciones generales de trimestre, no desde las metas individuales
4. **Sin duplicación**: Una sola tabla `calificaciones_trimestre` en lugar de tablas complejas por meta
5. **Escalable**: Funciona para cualquier cantidad de usuarios y áreas

---

## 🚀 Próximos Pasos

1. ✅ Ejecuta el SQL en Neon
2. ✅ Crea el API route `/api/admin/calificaciones-trimestre`
3. ✅ Actualiza el componente `EvidenciasReview.tsx` para mostrar:
   - Lista de evidencias (metas) del usuario
   - Sección de calificación general del trimestre al final
4. ✅ Crea vista de resumen anual

---

## 📌 Diferencias Clave

| Antes (Confuso) | Ahora (Correcto) |
|-----------------|------------------|
| Calificaciones por meta con "Total General" | Calificaciones por meta + Calificación general del trimestre |
| Tabla `calificaciones_metas` compleja | Tabla `calificaciones_trimestre` simple |
| Promedio desde "Total General" de metas | Promedio desde calificaciones generales de trimestre |
| UI confusa con T1-T4 N/A | UI clara: metas arriba, calificación general abajo |

---

¡Este es el flujo correcto que necesitas!
