# 📋 Plan Completo del Proyecto - Sistema de Plan de Acción

## ✅ **ESTADO ACTUAL** (Lo que ya está hecho)

### 1. Sistema Base

- ✅ Autenticación (login/registro)
- ✅ Base de datos PostgreSQL (Neon)
- ✅ Sistema de roles (admin/usuario)
- ✅ Tailwind V4 + Dark Mode
- ✅ Toast notifications (Sonner)
- ✅ ThemeToggle en navbars
- ✅ Componentes UI base (Button, Input, Card, etc.)

### 2. Panel Administrativo

- ✅ Gestión de Áreas (crear, editar, eliminar)
- ✅ Gestión de Usuarios (listar, editar, eliminar)
- ✅ Gestión de Ejes/Sub-ejes (crear, editar, eliminar)
- ✅ Dashboard con misión y visión
- ✅ AdminSidebar con navegación
- ✅ AdminNavbar con perfil y theme toggle

### 3. Panel de Usuario

- ✅ Dashboard básico con misión y visión
- ✅ Navbar con nombre de usuario y logout
- ✅ Perfil de usuario

---

## 🔧 **PROBLEMAS A ARREGLAR** (Fase 1 - Inmediato)

### 1. Colores de Texto

- ❌ Hay textos en gris (#6b7280, #64748b, #94a3b8) que deben ser negros
- **Archivos a modificar**:
  - `TrimestreSelections.tsx`
  - `TrimestreSelectionCard.tsx`
  - `UsersSection.tsx`
  - `StatsCard.tsx`
  - `UserCard.tsx`
  - Otros componentes con text-gray-500

### 2. Theme Toggle

- ✅ Ya agregado a AdminNavbar
- ✅ Ya agregado a Navbar de usuario

---

## 🚀 **FUNCIONALIDADES NUEVAS A IMPLEMENTAR**

## **FASE 2: Sistema de Aprobación de Usuarios** 🔐

### Funcionalidad:

1. **Admin ve solicitudes de registro**
   - Nueva sección en panel admin: "Usuarios Pendientes"
   - Tabla con usuarios en estado "pendiente"
   - Información: nombre, email, fecha de registro

2. **Admin puede aceptar/rechazar**
   - Botón "Aprobar" → Abre modal para asignar área
   - Botón "Rechazar" → Rechaza la solicitud
   - Al aprobar: Se asigna área obligatoriamente

3. **Notificación por Email**
   - Se envía email al usuario aprobado
   - Contenido: "Tu cuenta ha sido aprobada. Puedes iniciar sesión."
   - Área asignada en el correo

### Cambios en Base de Datos:

```sql
-- Agregar estado a usuarios
ALTER TABLE usuarios ADD COLUMN estado VARCHAR(20) DEFAULT 'pendiente';
-- Valores posibles: 'pendiente', 'aprobado', 'rechazado'

-- Agregar fecha de aprobación
ALTER TABLE usuarios ADD COLUMN fecha_aprobacion TIMESTAMP;
```

### Archivos a crear:

- `/api/admin/usuarios/pendientes/route.ts` - Listar usuarios pendientes
- `/api/admin/usuarios/aprobar/route.ts` - ✅ Ya existe (actualizar)
- `/api/admin/usuarios/rechazar/route.ts` - ✅ Ya existe (actualizar)
- `/api/send-email/route.ts` - Servicio de envío de emails
- `src/components/admin/PendingUsersSection.tsx` - Componente UI

### Servicios a integrar:

- **Resend** o **SendGrid** para envío de emails
- Configurar templates de emails

---

## **FASE 3: Sistema de Trimestres para Usuarios** 📅

### Funcionalidad:

1. **Dashboard de usuario muestra botones de trimestres**
   - Debajo de "Misión y Visión"
   - 4 botones: "Trimestre 1", "Trimestre 2", "Trimestre 3", "Trimestre 4"
   - Al hacer clic → Navega a `/dashboard/trimestre/[1-4]`

2. **Página de Trimestre**
   - Tabla con columnas:
     - Eje
     - Sub-eje
     - Meta
     - Indicador
     - Acción
     - Presupuesto
   - Solo muestra los registros que el usuario marcó para ese trimestre
   - Usuario puede editar meta, indicador, acción, presupuesto

3. **Selección de seguimiento**
   - Usuario marca qué ejes/sub-ejes tendrá seguimiento en cada trimestre
   - Checkbox por trimestre en cada meta

### Cambios en Base de Datos:

```sql
-- Nueva tabla: metas de usuario
CREATE TABLE usuario_metas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  eje_id INTEGER REFERENCES ejes(id),
  subeje_id INTEGER REFERENCES subejes(id),
  meta TEXT NOT NULL,
  indicador TEXT,
  accion TEXT,
  presupuesto DECIMAL(12,2),
  trimestre_1 BOOLEAN DEFAULT false,
  trimestre_2 BOOLEAN DEFAULT false,
  trimestre_3 BOOLEAN DEFAULT false,
  trimestre_4 BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_usuario_metas_usuario ON usuario_metas(usuario_id);
CREATE INDEX idx_usuario_metas_trimestres ON usuario_metas(usuario_id, trimestre_1, trimestre_2, trimestre_3, trimestre_4);
```

### Archivos a crear:

- `/app/dashboard/trimestre/[numero]/page.tsx` - Página de trimestre
- `/api/usuario/metas/route.ts` - ✅ Ya existe (actualizar)
- `/api/usuario/trimestres/route.ts` - ✅ Ya existe (actualizar)
- `src/components/dashboard/TrimestreTable.tsx` - Tabla de trimestre
- `src/components/dashboard/MetaEditModal.tsx` - Modal para editar metas

---

## **FASE 4: Sistema de Envío de Evidencias** 📤

### Funcionalidad:

1. **Tabla de envío de evidencias**
   - Aparece en la página de cada trimestre
   - Columnas:
     - Meta
     - Descripción
     - Evidencia (botón "Seleccionar archivo")
   - Usuario sube archivo por meta
   - Tipos permitidos: PDF, DOCX, XLSX, imágenes

2. **Estado de envío**
   - Estados: "Sin enviar", "Enviado", "Aprobado", "Rechazado"
   - Badge de color según estado

3. **Historial de envíos**
   - Usuario ve si fue aprobado o rechazado
   - Si fue rechazado → muestra comentario del admin
   - Puede volver a enviar si fue rechazado

### Cambios en Base de Datos:

```sql
-- Nueva tabla: evidencias/informes
CREATE TABLE evidencias (
  id SERIAL PRIMARY KEY,
  meta_id INTEGER REFERENCES usuario_metas(id),
  usuario_id INTEGER REFERENCES usuarios(id),
  trimestre INTEGER NOT NULL,
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  descripcion TEXT,
  estado VARCHAR(20) DEFAULT 'enviado', -- 'enviado', 'aprobado', 'rechazado'
  calificacion INTEGER, -- 0-100
  comentario_admin TEXT,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_revision TIMESTAMP,
  revisado_por INTEGER REFERENCES usuarios(id)
);

-- Índices
CREATE INDEX idx_evidencias_meta ON evidencias(meta_id);
CREATE INDEX idx_evidencias_usuario ON evidencias(usuario_id);
CREATE INDEX idx_evidencias_estado ON evidencias(estado);
```

### Archivos a crear:

- `/api/usuario/evidencias/route.ts` - CRUD de evidencias
- `/api/upload/route.ts` - Subir archivos (usar Cloudinary o S3)
- `src/components/dashboard/EvidenciasSection.tsx` - Sección de evidencias
- `src/components/dashboard/FileUpload.tsx` - Componente de upload

### Servicios a integrar:

- **Cloudinary** o **AWS S3** para almacenar archivos
- Validación de tipos de archivo
- Límite de tamaño (ej: 10MB)

---

## **FASE 5: Sistema de Calificación Admin** 📊

### Funcionalidad:

1. **Admin ve informes recibidos**
   - Nueva sección: "Calificar Informes"
   - Filtros: Por área, por trimestre, por estado
   - Tabla con:
     - Usuario
     - Área
     - Trimestre
     - Meta
     - Archivo
     - Estado

2. **Calificar informe**
   - Botón "Calificar" → Abre modal
   - Descarga del archivo
   - Slider de calificación 0% - 100%
   - Campo de comentarios
   - Botones: "Aprobar" o "Rechazar"

3. **Acciones**
   - Aprobar: Guarda calificación y comentario
   - Rechazar: Guarda comentario explicando por qué
   - Usuario recibe notificación

### Archivos a crear:

- `/app/admin/calificar/page.tsx` - Página de calificación
- `/api/admin/evidencias/route.ts` - Listar evidencias
- `/api/admin/evidencias/calificar/route.ts` - Calificar evidencia
- `/api/admin/evidencias/aprobar/route.ts` - Aprobar evidencia
- `/api/admin/evidencias/rechazar/route.ts` - Rechazar evidencia
- `src/components/admin/CalificarModal.tsx` - Modal de calificación
- `src/components/admin/EvidenciasTable.tsx` - Tabla de evidencias

---

## **FASE 6: Plan de Acción General** 📈

### Funcionalidad:

1. **Admin ve Plan de Acción General**
   - Botón en sidebar: "Plan de Acción General"
   - Navega a `/admin/plan-general`

2. **Tabla consolidada gigante**
   - Columnas:
     - Área
     - Usuario
     - Eje
     - Sub-eje
     - Meta
     - Indicador
     - Acción
     - Presupuesto
     - T1 (calificación)
     - T2 (calificación)
     - T3 (calificación)
     - T4 (calificación)
     - Promedio
     - Estado
   - Muestra TODAS las metas de TODAS las áreas

3. **Funcionalidades de gestión**
   - Editar cualquier campo
   - Eliminar registros
   - Filtros por área, trimestre, usuario

4. **Exportar a Excel**
   - Botón "Exportar a Excel"
   - Descarga archivo `.xlsx` con toda la información
   - Formato profesional con:
     - Encabezados en negrita
     - Colores por área
     - Fórmulas de promedio
     - Filtros en columnas

### Cambios en Base de Datos:

```sql
-- Vista materializada para optimizar consultas
CREATE MATERIALIZED VIEW plan_accion_general AS
SELECT
  u.id as usuario_id,
  u.nombre as usuario_nombre,
  a.nombre as area_nombre,
  e.nombre as eje_nombre,
  se.nombre as subeje_nombre,
  um.meta,
  um.indicador,
  um.accion,
  um.presupuesto,
  um.trimestre_1,
  um.trimestre_2,
  um.trimestre_3,
  um.trimestre_4,
  (SELECT calificacion FROM evidencias WHERE meta_id = um.id AND trimestre = 1 AND estado = 'aprobado') as calificacion_t1,
  (SELECT calificacion FROM evidencias WHERE meta_id = um.id AND trimestre = 2 AND estado = 'aprobado') as calificacion_t2,
  (SELECT calificacion FROM evidencias WHERE meta_id = um.id AND trimestre = 3 AND estado = 'aprobado') as calificacion_t3,
  (SELECT calificacion FROM evidencias WHERE meta_id = um.id AND trimestre = 4 AND estado = 'aprobado') as calificacion_t4
FROM usuario_metas um
JOIN usuarios u ON um.usuario_id = u.id
JOIN areas a ON u.area_id = a.id
JOIN ejes e ON um.eje_id = e.id
LEFT JOIN subejes se ON um.subeje_id = se.id;

-- Índice para refresh rápido
CREATE INDEX idx_plan_general ON plan_accion_general(area_nombre, usuario_nombre);
```

### Archivos a crear:

- `/app/admin/plan-general/page.tsx` - Página del plan general
- `/api/admin/plan-general/route.ts` - Obtener datos consolidados
- `/api/admin/plan-general/export/route.ts` - Exportar a Excel
- `src/components/admin/PlanGeneralTable.tsx` - Tabla gigante
- `src/lib/excelExporter.ts` - Utilidad para exportar Excel

### Librerías a instalar:

```bash
npm install xlsx --save
npm install file-saver --save
npm install @types/file-saver --save-dev
```

---

## 📅 **CRONOGRAMA DE IMPLEMENTACIÓN**

### Semana 1:

- **Lunes-Martes**: Fase 1 (Arreglar colores grises) ✅
- **Miércoles-Jueves**: Fase 2 (Sistema de aprobación de usuarios)
- **Viernes**: Fase 3 - Parte 1 (Botones de trimestres en dashboard)

### Semana 2:

- **Lunes-Martes**: Fase 3 - Parte 2 (Tabla de trimestres y metas)
- **Miércoles-Jueves**: Fase 4 (Sistema de evidencias)
- **Viernes**: Testing y correcciones

### Semana 3:

- **Lunes-Martes**: Fase 5 (Sistema de calificación admin)
- **Miércoles-Jueves**: Fase 6 (Plan de Acción General)
- **Viernes**: Exportación a Excel y optimizaciones

### Semana 4:

- **Lunes-Martes**: Testing completo del sistema
- **Miércoles-Jueves**: Correcciones y mejoras UI
- **Viernes**: Deployment y documentación final

---

## 🎨 **DISEÑO UI - Especificaciones**

### Tabla de Trimestres (Usuario)

```
┌─────────────────────────────────────────────────────────────────┐
│ Trimestre 1 - 2025                                              │
├─────────┬──────────┬────────┬───────────┬─────────┬────────────┤
│ Eje     │ Sub-Eje  │ Meta   │ Indicador │ Acción  │ Presupuesto│
├─────────┼──────────┼────────┼───────────┼─────────┼────────────┤
│ Calidad │ Docencia │ [Edit] │ [Edit]    │ [Edit]  │ [Edit]     │
│ Calidad │ Docencia │ [Edit] │ [Edit]    │ [Edit]  │ [Edit]     │
└─────────┴──────────┴────────┴───────────┴─────────┴────────────┘

Envío de Evidencias
┌──────────────────────────────────────────────────────────────┐
│ Meta                  │ Descripción    │ Evidencia          │
├───────────────────────┼────────────────┼────────────────────┤
│ Mejorar calidad...    │ [Input]        │ [📎 Subir archivo] │
│ Aumentar índice...    │ [Input]        │ [📎 Subir archivo] │
└───────────────────────┴────────────────┴────────────────────┘
                                        [Enviar Evidencias]
```

### Tabla de Calificación (Admin)

```
Filtros: [Área ▼] [Trimestre ▼] [Estado ▼]

┌──────────────────────────────────────────────────────────────────────┐
│ Usuario  │ Área    │ Trim. │ Meta        │ Archivo   │ Calificar   │
├──────────┼─────────┼───────┼─────────────┼───────────┼─────────────┤
│ Juan P.  │ Calidad │  1    │ Mejorar...  │ informe.pdf│ [Calificar] │
│ María G. │ Admin   │  1    │ Reducir...  │ datos.xlsx │ [Calificar] │
└──────────┴─────────┴───────┴─────────────┴───────────┴─────────────┘
```

### Plan de Acción General (Admin)

```
[🔄 Actualizar] [📊 Exportar a Excel]

Filtros: [Área ▼] [Usuario ▼] [Trimestre ▼]

┌────────────────────────────────────────────────────────────────────────────┐
│ Área  │Usuario│Eje  │Sub-eje│Meta  │Indicador│Acción│$    │T1│T2│T3│T4│Prom│
├───────┼───────┼─────┼───────┼──────┼─────────┼──────┼─────┼──┼──┼──┼──┼────┤
│Calidad│Juan P.│Cal. │Doc.   │[Edit]│[Edit]   │[Edit]│[Edit]│85│90│-│ - │87.5│
│Calidad│María G│Cal. │Inv.   │[Edit]│[Edit]   │[Edit]│[Edit]│92│-│ - │ - │92  │
│Admin  │Pedro L│Gest.│Proc.  │[Edit]│[Edit]   │[Edit]│[Edit]│78│82│88│ - │82.7│
└───────┴───────┴─────┴───────┴──────┴─────────┴──────┴─────┴──┴──┴──┴──┴────┘
```

---

## 🔐 **SEGURIDAD Y PERMISOS**

### Middleware de Autenticación:

- Verificar token en cada request
- Validar rol de usuario
- Proteger rutas de admin

### Validaciones:

- Usuario solo puede ver/editar sus propias metas
- Usuario solo puede subir evidencias de sus metas
- Admin puede ver/editar todo
- Validar tipos y tamaños de archivos
- Sanitizar inputs para prevenir SQL injection

---

## 📦 **DEPENDENCIAS A INSTALAR**

```bash
# Envío de emails
npm install resend

# Upload de archivos
npm install @uploadthing/react uploadthing

# Exportar Excel
npm install xlsx file-saver
npm install @types/file-saver --save-dev

# Validación de formularios
npm install zod react-hook-form @hookform/resolvers

# Date picker
npm install react-datepicker
npm install @types/react-datepicker --save-dev
```

---

## ✅ **CHECKLIST FINAL**

### Antes de deployment:

- [ ] Todos los tests pasan
- [ ] No hay errores de TypeScript
- [ ] No hay warnings de ESLint
- [ ] Responsive design en mobile/tablet
- [ ] Dark mode funciona en todas las páginas
- [ ] Todas las notificaciones toast funcionan
- [ ] Sistema de emails configurado
- [ ] Storage de archivos configurado
- [ ] Base de datos optimizada (índices)
- [ ] Variables de entorno configuradas
- [ ] README actualizado
- [ ] Documentación API completa

---

## 📝 **NOTAS IMPORTANTES**

1. **Priorizar funcionalidad sobre diseño**: Primero que funcione, luego hacerlo bonito
2. **Testing incremental**: Probar cada fase antes de continuar
3. **Commits frecuentes**: Hacer commits después de cada feature
4. **Branches**: Trabajar en branches por fase
5. **Documentación**: Documentar cada API endpoint

---

**Última actualización**: ${new Date().toLocaleDateString('es-ES')}
