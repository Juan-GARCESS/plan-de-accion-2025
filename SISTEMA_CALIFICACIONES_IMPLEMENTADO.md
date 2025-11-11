# Sistema de Calificaciones - Implementación Completa

## Resumen del Sistema

Se ha implementado un nuevo sistema de calificaciones para administradores con las siguientes características:

### Estructura de Calificaciones

1. **Calificaciones por Trimestre (Informativas)**
   - Se guardan automáticamente al aprobar/rechazar evidencias
   - Son de referencia: T1, T2, T3, T4
   - Rango: 0-100 puntos

2. **Calificación Total General (Decisiva)**
   - Es la calificación que cuenta para el promedio del área
   - Se asigna por meta, no por trimestre
   - Rango: 0-100 puntos
   - Puede incluir comentario general

### Cálculo de Promedios

```
Promedio del Área = AVG(todas las Calificaciones Total General de las metas del área)
```

## Archivos Implementados

### 1. Base de Datos
**Archivo**: `database/crear_tabla_calificaciones.sql`

**Contenido**:
- Tabla `calificaciones_metas`:
  - Campos trimestre: `cal_trimestre_1`, `cal_trimestre_2`, `cal_trimestre_3`, `cal_trimestre_4`
  - Campo decisivo: `calificacion_total_general`
  - Comentarios y fechas
  
- Vista `vista_promedios_area`:
  - Calcula promedios automáticamente desde las calificaciones Total General
  - Agrupa por área_id y área_nombre

- Vista `vista_calificaciones_detalle`:
  - Muestra información completa de metas con sus calificaciones
  - Join entre plan_accion, areas, calificaciones_metas

- Trigger `trg_update_calificaciones_metas`:
  - Actualiza `fecha_actualizacion` automáticamente

**Estado**: ✅ Ejecutado en Neon

### 2. TypeScript Types
**Archivo**: `src/types/calificaciones.ts`

**Interfaces definidas**:
```typescript
// Entidad completa
interface CalificacionMeta {
  id?: number;
  meta_id: number;
  meta: string;
  cal_trimestre_1: number | null;
  cal_trimestre_2: number | null;
  cal_trimestre_3: number | null;
  cal_trimestre_4: number | null;
  calificacion_total_general: number | null;
  comentario_general: string | null;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

// Input para POST (guardar calificación trimestral)
interface CalificacionTrimestreInput {
  meta_id: number;
  trimestre: number;
  calificacion: number; // 0-100
}

// Input para PATCH (guardar Total General)
interface CalificacionGeneralInput {
  meta_id: number;
  calificacion_total_general: number; // 0-100
  comentario_general?: string;
}

// Para consultas con joins
interface MetaConCalificaciones {
  meta_id: number;
  meta: string;
  area_id: number;
  area_nombre: string;
  cal_trimestre_1: number | null;
  cal_trimestre_2: number | null;
  cal_trimestre_3: number | null;
  cal_trimestre_4: number | null;
  calificacion_total_general: number | null;
  comentario_general: string | null;
}

// Para promedios
interface PromedioArea {
  area_id: number;
  area_nombre: string;
  promedio: number;
  total_metas: number;
}
```

### 3. API Routes

#### A. `/api/admin/calificaciones`
**Archivo**: `src/app/api/admin/calificaciones/route.ts`

**Métodos**:

**GET** - Obtener calificaciones
```typescript
// Por meta específica
GET /api/admin/calificaciones?metaId=123

// Por área (todas las metas del área)
GET /api/admin/calificaciones?areaId=456
```

**POST** - Guardar calificación trimestral
```typescript
POST /api/admin/calificaciones
Body: {
  meta_id: number,
  trimestre: number, // 1-4
  calificacion: number // 0-100
}
```

**PATCH** - Actualizar/Crear Total General
```typescript
PATCH /api/admin/calificaciones
Body: {
  meta_id: number,
  calificacion_total_general: number, // 0-100
  comentario_general?: string
}
```

#### B. `/api/admin/promedios`
**Archivo**: `src/app/api/admin/promedios/route.ts`

**Métodos**:

**GET** - Obtener promedios de áreas
```typescript
// Todos los promedios
GET /api/admin/promedios

// Por área específica
GET /api/admin/promedios?areaId=123
```

### 4. Componente UI
**Archivo**: `src/components/admin/EvidenciasReview.tsx`

**Modificaciones realizadas**:

#### A. Imports añadidos
```typescript
import { Star, TrendingUp } from 'lucide-react';
```

#### B. Nueva interfaz
```typescript
interface CalificacionMeta {
  meta_id: number;
  meta: string;
  cal_trimestre_1: number | null;
  cal_trimestre_2: number | null;
  cal_trimestre_3: number | null;
  cal_trimestre_4: number | null;
  calificacion_total_general: number | null;
  comentario_general: string | null;
}
```

#### C. Estados añadidos
```typescript
const [calificacionesMetas, setCalificacionesMetas] = useState<CalificacionMeta[]>([]);
const [calificacionGeneralModal, setCalificacionGeneralModal] = useState<CalificacionMeta | null>(null);
const [calificacionGeneral, setCalificacionGeneral] = useState(0);
const [comentarioGeneral, setComentarioGeneral] = useState('');
const [showCalificacionesGenerales, setShowCalificacionesGenerales] = useState(false);
```

#### D. Funciones añadidas

**fetchCalificacionesMetas()**
- Se ejecuta en useEffect junto con fetchEvidencias
- Carga calificaciones del área actual
- Endpoint: GET `/api/admin/calificaciones?areaId=${areaId}`

**handleCalificar() - Modificada**
- Ahora guarda automáticamente la calificación trimestral
- Endpoint: POST `/api/admin/calificaciones`
- Se ejecuta al aprobar/rechazar evidencia

**handleGuardarCalificacionGeneral()**
- Guarda/actualiza la calificación Total General
- Validaciones: 0-100, no vacío
- Endpoint: PATCH `/api/admin/calificaciones`
- Refresca datos después de guardar

#### E. UI - Sección Total General

**Botón Toggle**
```tsx
<button onClick={() => setShowCalificacionesGenerales(!showCalificacionesGenerales)}>
  <Star /> {showCalificacionesGenerales ? 'Ocultar' : 'Ver'} Calificaciones Generales
</button>
```

**Grid de Calificaciones**
- Muestra todas las metas del área
- Por cada meta:
  - Nombre de la meta
  - Calificaciones T1-T4 (informativas)
  - Total General (en grande, destacado)
  - Botón "Calificar" / "Editar" dependiendo si existe

**Modal de Calificación**
- Input numérico para calificación (0-100)
- Textarea para comentario (opcional)
- Botones: Guardar / Cancelar
- Validación: no permite guardar si calificación = 0

## Flujo de Trabajo

### Para el Administrador

1. **Revisar Evidencias**
   - El admin ve evidencias pendientes por trimestre
   - Al calificar una evidencia:
     - Aprueba/Rechaza con comentario
     - Se guarda automáticamente la calificación trimestral (informativa)

2. **Ver Calificaciones Generales**
   - Click en botón "Ver Calificaciones Generales"
   - Se muestra grid con todas las metas del área
   - Para cada meta ve:
     - T1, T2, T3, T4 (referencias)
     - Total General (la calificación decisiva)

3. **Asignar/Editar Total General**
   - Click en "Calificar" o "Editar" en la meta deseada
   - Se abre modal
   - Ingresa calificación 0-100
   - Opcionalmente añade comentario
   - Guarda

4. **Calcular Promedios**
   - Los promedios se calculan automáticamente
   - Se puede consultar en `/api/admin/promedios`
   - Fórmula: AVG(Total General de todas las metas del área)

## Características del Diseño

### Colores
- Esquema: Blanco, Negro, Gris
- Primary color: `colors.primary`
- Grises: `colors.gray[50-900]`

### Iconos
- Star: Para calificaciones generales
- TrendingUp: Para visualización de promedios
- NO se usan emojis

### Espaciado
- Consistente con `spacing.xs`, `spacing.sm`, `spacing.md`, `spacing.lg`

## Validaciones Implementadas

### Backend (API)
- Calificaciones entre 0-100
- Trimestre entre 1-4
- meta_id debe existir
- Manejo de errores con status codes apropiados

### Frontend
- Calificación no puede ser 0 (campo requerido)
- Input type="number" con min=0, max=100
- Deshabilita botón guardar si calificación = 0
- Deshabilita botones durante submitting

## Testing Recomendado

### 1. Flujo Completo
```
1. Crear/cargar evidencias para un usuario
2. Admin aprueba evidencia con calificación 85
   ✓ Verificar que se guardó en cal_trimestre_X
3. Admin va a Calificaciones Generales
   ✓ Verificar que muestra la meta con T1=85 (o el trimestre correspondiente)
4. Admin asigna Total General = 92
   ✓ Verificar que se guardó calificacion_total_general
5. Consultar promedio del área
   ✓ Verificar que usa la calificación Total General (92, no 85)
```

### 2. Validaciones
```
- Intentar guardar calificación < 0: rechazado
- Intentar guardar calificación > 100: rechazado
- Guardar sin calificación: botón deshabilitado
- Editar Total General existente: sobrescribe correctamente
```

### 3. UI
```
- Toggle show/hide calificaciones generales funciona
- Grid responsive muestra todas las metas
- Modal abre/cierra correctamente
- Comentarios se guardan y muestran
- Loading states durante fetch/submit
```

## SQL de Consulta Útil

### Ver todas las calificaciones de un área
```sql
SELECT * FROM vista_calificaciones_detalle
WHERE area_id = 1;
```

### Ver promedios de todas las áreas
```sql
SELECT * FROM vista_promedios_area
ORDER BY promedio DESC;
```

### Ver calificaciones de una meta específica
```sql
SELECT * FROM calificaciones_metas
WHERE meta_id = 123;
```

## Notas Importantes

1. **Total General es la calificación que cuenta**
   - Las calificaciones trimestrales son solo referencias
   - El promedio del área se calcula SOLO con Total General

2. **Una calificación por meta, no por trimestre**
   - Total General no está atada a un trimestre específico
   - Representa el desempeño general de toda la meta

3. **Actualización automática**
   - Triggers mantienen fecha_actualizacion
   - Views calculan promedios en tiempo real

4. **Modificar, no crear nuevas rutas**
   - Se modificó EvidenciasReview.tsx existente
   - No se crearon nuevos componentes/rutas
   - Mantiene consistencia con arquitectura existente

## Estado de Implementación

✅ Base de datos creada y ejecutada en Neon
✅ TypeScript types definidos
✅ API routes implementadas (calificaciones CRUD + promedios)
✅ Componente UI modificado con nueva funcionalidad
✅ Modal de calificación Total General
✅ Integración completa evidencias → calificaciones
✅ Sin errores de compilación TypeScript
✅ Diseño mantiene esquema de colores (blanco/negro/gris)
✅ Sin emojis en código nuevo

## Próximos Pasos Sugeridos

1. **Testing en desarrollo**
   - Probar flujo completo con datos reales
   - Verificar cálculo de promedios
   - Validar UI en diferentes resoluciones

2. **Documentación para usuarios**
   - Crear guía para administradores
   - Explicar diferencia entre calificaciones trimestrales y Total General

3. **Posibles mejoras futuras**
   - Dashboard de promedios por área
   - Gráficas de evolución de calificaciones
   - Exportar reportes de calificaciones
   - Notificaciones cuando se asigna Total General
