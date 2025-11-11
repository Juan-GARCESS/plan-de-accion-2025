# Sistema de Gestión de Plan de Acción 2025

Sistema web para la gestión y seguimiento de planes de acción institucionales por áreas, con carga de evidencias trimestrales y calificación administrativa.

## Descripción

Plataforma que permite a diferentes áreas de una institución gestionar sus metas anuales divididas en trimestres, cargar evidencias de cumplimiento, y recibir calificaciones del equipo administrativo. El sistema implementa un flujo completo de envío, revisión, aprobación/rechazo y reenvío de evidencias.

## Tecnologías Utilizadas

### Lenguajes de Programación

#### TypeScript 5.x
- **Qué es**: Superset de JavaScript que añade tipado estático
- **Cómo lo usamos**: 
  - Todo el código del proyecto está escrito en TypeScript
  - Definición de tipos e interfaces en `/src/types/`
  - Tipado de componentes React, props y estados
  - Tipado de respuestas de API y queries a base de datos
  - Autocompletado y detección de errores en tiempo de desarrollo
- **Por qué**: Mayor seguridad de tipos, mejor experiencia de desarrollo, menos bugs en producción

#### JavaScript (ES6+)
- **Qué es**: Lenguaje base de TypeScript, se ejecuta en el navegador y Node.js
- **Cómo lo usamos**:
  - TypeScript se compila a JavaScript para ejecución
  - Archivos de configuración (next.config.ts, tailwind.config.js)
  - Funciones asíncronas (async/await) para peticiones HTTP
  - Manipulación del DOM en componentes React
- **Por qué**: Estándar de la web, compatible con todos los navegadores

#### SQL (PostgreSQL)
- **Qué es**: Lenguaje de consultas estructuradas para bases de datos relacionales
- **Cómo lo usamos**:
  - Queries parametrizadas con `pg` (PostgreSQL client)
  - Scripts de migración en `/database/`
  - Consultas SELECT con JOINs complejos (usuarios, áreas, evidencias)
  - INSERT/UPDATE/DELETE para operaciones CRUD
  - Transacciones para operaciones críticas
- **Por qué**: Base de datos relacional robusta, escalable y con integridad referencial

#### CSS
- **Qué es**: Lenguaje de estilos en cascada
- **Cómo lo usamos**:
  - Estilos inline en componentes React (style prop)
  - Archivo global `globals.css` para estilos base
  - Variables CSS para temas (modo claro/oscuro)
  - Flexbox y Grid para layouts responsivos
  - Media queries para diseño adaptativo
- **Por qué**: Flexibilidad total en el diseño, sin dependencia de frameworks CSS pesados

### Frameworks y Librerías

#### Next.js 15.5.4
- **Qué es**: Framework de React para aplicaciones web full-stack
- **Cómo lo usamos**:
  - **App Router**: Sistema de rutas basado en carpetas (`/app/`)
  - **Server Components**: Componentes que se renderizan en el servidor
  - **API Routes**: Endpoints REST en `/app/api/`
  - **File-based Routing**: `/admin/dashboard` = `app/admin/dashboard/page.tsx`
  - **Server Actions**: Acciones del servidor para formularios
  - **Turbopack**: Compilador ultra rápido para desarrollo
- **Por qué**: SSR (Server-Side Rendering), SEO mejorado, rendimiento óptimo

#### React 19.1.0
- **Qué es**: Librería de JavaScript para interfaces de usuario
- **Cómo lo usamos**:
  - Componentes funcionales con hooks
  - `useState` para estado local (formularios, modales)
  - `useEffect` para efectos secundarios (fetch de datos)
  - `useContext` para estado global (tema, autenticación)
  - Custom hooks en `/src/hooks/` (useAuth, useAdminDashboard)
  - Composición de componentes (reutilización)
- **Por qué**: Declarativo, componible, ecosistema maduro

#### Node.js
- **Qué es**: Runtime de JavaScript en el servidor
- **Cómo lo usamos**:
  - Ejecuta el servidor de Next.js
  - Procesa las API Routes
  - Maneja conexiones a PostgreSQL
  - Integración con AWS SDK para S3
  - Procesamiento de archivos (FormData, uploads)
- **Por qué**: Permite JavaScript en backend, mismo lenguaje frontend/backend

### Base de Datos

#### PostgreSQL (Neon)
- **Qué es**: Sistema de gestión de base de datos relacional open-source
- **Cómo lo usamos**:
  - Neon.tech como proveedor cloud (serverless)
  - Librería `pg` para conexiones desde Node.js
  - Pool de conexiones para rendimiento
  - Esquema normalizado (3ra forma normal)
  - Índices en columnas frecuentemente consultadas
  - Foreign keys para integridad referencial
- **Por qué**: Confiable, escalable, sin gestión de infraestructura

### Almacenamiento en la Nube

#### AWS S3 (Amazon Simple Storage Service)
- **Qué es**: Servicio de almacenamiento de objetos en la nube
- **Cómo lo usamos**:
  - SDK de AWS (`@aws-sdk/client-s3`) en Node.js
  - Almacenamiento de archivos de evidencias (PDF, Word, Excel, imágenes)
  - Estructura jerárquica: `evidencias/año/usuario_id/trimestre/archivo`
  - URLs públicas para descarga de archivos
  - Metadatos de archivo (tipo, tamaño, fecha)
- **Por qué**: Escalable, económico, alta disponibilidad

### Servicios de Email

#### Resend
- **Qué es**: API de envío de emails transaccionales
- **Cómo lo usamos**:
  - Notificaciones a usuarios cuando admin califica evidencia
  - Emails de aprobación/rechazo con comentarios
  - Templates HTML personalizados
  - Integración vía API REST desde Next.js
- **Por qué**: Simple, confiable, sin configuración de servidor SMTP

### Librerías de UI

#### Lucide React
- **Qué es**: Librería de iconos SVG para React
- **Cómo lo usamos**:
  - Iconos en botones (Save, Edit, Delete, Upload)
  - Iconos de navegación (Home, Users, Settings)
  - Indicadores de estado (CheckCircle, XCircle, Clock)
  - Importación selectiva para bundle pequeño
- **Por qué**: Modernos, consistentes, optimizados para React

#### Sonner
- **Qué es**: Librería de notificaciones toast para React
- **Cómo lo usamos**:
  - Feedback inmediato de acciones (éxito, error, info)
  - Notificaciones no intrusivas
  - Personalización de duración y posición
  - Estados: `toast.success()`, `toast.error()`, `toast.loading()`
- **Por qué**: UX mejorada, ligera, fácil de usar

### Herramientas de Desarrollo

#### npm (Node Package Manager)
- **Qué es**: Gestor de paquetes de Node.js
- **Cómo lo usamos**:
  - Instalación de dependencias (`npm install`)
  - Scripts de desarrollo y producción (`package.json`)
  - Gestión de versiones de paquetes
- **Por qué**: Estándar de facto en el ecosistema Node.js

#### Turbopack
- **Qué es**: Compilador incremental escrito en Rust
- **Cómo lo usamos**:
  - Bundling ultra rápido en desarrollo
  - Hot Module Replacement (HMR) instantáneo
  - Activado por defecto en Next.js 15
- **Por qué**: 10x más rápido que Webpack

#### ESLint
- **Qué es**: Herramienta de análisis estático de código
- **Cómo lo usamos**:
  - Detecta errores y problemas de estilo
  - Configuración en `eslint.config.mjs`
  - Integración con VS Code
  - Pre-commit hooks (opcional)
- **Por qué**: Código consistente, menos bugs

### Seguridad

#### bcrypt
- **Qué es**: Librería para hashing de contraseñas
- **Cómo lo usamos**:
  - Hash de contraseñas antes de guardar en BD
  - Validación de contraseñas en login
  - Salt rounds configurables (costo computacional)
- **Por qué**: Algoritmo seguro, resistente a fuerza bruta

#### Cookies HTTP-only
- **Qué es**: Cookies no accesibles desde JavaScript del navegador
- **Cómo lo usamos**:
  - Almacenamiento de `userId` después del login
  - Validación en cada petición API
  - Expiración automática
- **Por qué**: Prevención de XSS, seguridad mejorada

### Autenticación y Autorización

#### Sistema basado en Cookies + Roles
- **Qué es**: Mecanismo propio de autenticación
- **Cómo lo usamos**:
  - Cookie `userId` creada en `/api/login`
  - Middleware de validación en API routes
  - Roles: `admin` y `usuario`
  - Permisos verificados en cada endpoint
  - Redirección según rol después del login
- **Por qué**: Simple, sin dependencias externas, control total

## Requisitos Previos

- Node.js 18.x o superior
- npm o yarn
- Cuenta en Neon (PostgreSQL)
- Cuenta en AWS S3
- Cuenta en Resend (opcional, para emails)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Juan-GARCESS/plan-de-accion-2025.git
cd plan-de-accion-2025/login-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Base de datos PostgreSQL (Neon)
DATABASE_URL=postgresql://usuario:password@host/database?sslmode=require

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_S3_BUCKET_NAME=nombre-bucket

# Resend (emails)
RESEND_API_KEY=re_xxxxxxxxxx

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Configurar base de datos

Ejecutar los scripts SQL ubicados en `/database/` en orden:

1. `schema-postgres.sql` - Estructura de tablas
2. `insert_areas.sql` - Áreas iniciales
3. `nuevas_tablas_ejes.sql` - Ejes y sub-ejes

### 5. Ejecutar el proyecto

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

El sistema estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
login-app/
├── src/
│   ├── app/                    # Rutas y páginas (App Router)
│   │   ├── admin/              # Panel administrativo
│   │   ├── dashboard/          # Panel de usuario
│   │   ├── api/                # Endpoints de API
│   │   └── register/           # Registro de usuarios
│   ├── components/             # Componentes React
│   │   ├── admin/              # Componentes de administrador
│   │   ├── dashboard/          # Componentes de usuario
│   │   ├── trimestre/          # Gestión de trimestres
│   │   ├── ui/                 # Componentes UI base
│   │   └── shared/             # Componentes compartidos
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilidades y configuración
│   └── types/                  # Definiciones TypeScript
├── database/                   # Scripts SQL
└── public/                     # Archivos estáticos
```

## Base de Datos

### Diagrama Entidad-Relación (MER)

```
┌─────────────────┐         ┌──────────────────┐
│    USUARIOS     │         │      AREAS       │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │────┐    │ id (PK)          │
│ nombre          │    │    │ nombre_area      │
│ email (unique)  │    │    │ descripcion      │
│ password        │    │    │ estado           │
│ rol             │    │    │ fecha_creacion   │
│ area_id (FK) ───┼────┘    └──────────────────┘
│ estado          │              │
│ fecha_registro  │              │
└─────────────────┘              │
                                 │
┌──────────────────┐             │
│      EJES        │             │
├──────────────────┤             │
│ id (PK)          │             │
│ nombre_eje       │             │
│ descripcion      │             │
└──────────────────┘             │
        │                        │
        │                        │
┌──────────────────┐             │
│    SUB_EJES      │             │
├──────────────────┤             │
│ id (PK)          │             │
│ eje_id (FK) ─────┤             │
│ nombre_sub_eje   │             │
│ descripcion      │             │
└──────────────────┘             │
        │                        │
        │                        │
┌─────────────────────────────────┤
│        PLAN_ACCION              │
├─────────────────────────────────┤
│ id (PK)                         │
│ area_id (FK) ───────────────────┘
│ eje_id (FK) ────────────────────┐
│ sub_eje_id (FK) ────────────────┘
│ meta                            │
│ indicador                       │
│ accion                          │
│ presupuesto                     │
│ t1, t2, t3, t4 (boolean)        │
└─────────────────────────────────┘
        │
        │
┌─────────────────────────────────┤
│        EVIDENCIAS               │
├─────────────────────────────────┤
│ id (PK)                         │
│ meta_id (FK) ────────────────────┘
│ usuario_id (FK)                 │
│ trimestre (1-4)                 │
│ anio                            │
│ descripcion                     │
│ archivo_url                     │
│ archivo_nombre                  │
│ archivo_tipo                    │
│ archivo_tamano                  │
│ estado (pendiente/aprobado/     │
│        rechazado)               │
│ calificacion (0-100)            │
│ comentario_admin                │
│ fecha_envio                     │
│ fecha_revision                  │
│ revisado_por (FK)               │
└─────────────────────────────────┘
```

### Relaciones

- **USUARIOS** pertenece a **AREAS** (N:1)
- **PLAN_ACCION** pertenece a **AREAS** (N:1)
- **PLAN_ACCION** pertenece a **EJES** (N:1)
- **PLAN_ACCION** pertenece a **SUB_EJES** (N:1)
- **SUB_EJES** pertenece a **EJES** (N:1)
- **EVIDENCIAS** pertenece a **PLAN_ACCION** (N:1) via meta_id
- **EVIDENCIAS** pertenece a **USUARIOS** (N:1) via usuario_id
- **EVIDENCIAS** es revisada por **USUARIOS** (N:1) via revisado_por

### Descarga de Base de Datos desde Neon

#### Opción 1: Exportar desde Dashboard de Neon

1. Acceder a https://console.neon.tech
2. Seleccionar el proyecto correspondiente
3. Ir a la pestaña "SQL Editor"
4. Ejecutar el comando de exportación:
```sql
pg_dump -h <host> -U <usuario> -d <database> -f backup.sql
```

#### Opción 2: Usar pg_dump localmente

```bash
# Instalar PostgreSQL client tools
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Exportar esquema completo
pg_dump "postgresql://usuario:password@host/database?sslmode=require" > backup.sql

# Exportar solo esquema (sin datos)
pg_dump --schema-only "postgresql://usuario:password@host/database?sslmode=require" > schema.sql

# Exportar solo datos
pg_dump --data-only "postgresql://usuario:password@host/database?sslmode=require" > data.sql
```

#### Opción 3: Backup desde Neon CLI

```bash
# Instalar Neon CLI
npm install -g neonctl

# Autenticar
neonctl auth

# Listar proyectos
neonctl projects list

# Crear branch (backup automático)
neonctl branches create --project-id <id> --name backup-$(date +%Y%m%d)
```

## Arquitectura del Sistema

### Flujo de Autenticación

1. Usuario ingresa credenciales en `/`
2. Sistema valida contra tabla `usuarios`
3. Se crea cookie de sesión con `userId`
4. Redirección según rol:
   - `admin` -> `/admin/dashboard`
   - `usuario` -> `/dashboard`

### Flujo de Gestión de Evidencias

#### Usuario Normal

1. Accede a `/dashboard/plan-accion`
2. Marca checkboxes de trimestres (T1, T2, T3, T4)
3. Accede a `/dashboard/trimestre/[1-4]`
4. Visualiza metas asignadas según checkboxes
5. Carga descripción y archivo de evidencia
6. Envío crea registro en tabla `evidencias`
7. Estado inicial: `pendiente`

#### Administrador

1. Accede a `/admin/dashboard`
2. Selecciona área y trimestre a calificar
3. Visualiza evidencias pendientes en formato de tarjetas
4. Puede:
   - Ver archivo adjunto
   - Asignar calificación (0-100)
   - Agregar comentario
   - Aprobar o Rechazar
   - Editar calificación existente
   - Eliminar evidencia

### Estados de Evidencias

| Estado | Descripción | Acciones Usuario | Acciones Admin |
|--------|-------------|------------------|----------------|
| No enviada | Meta sin evidencia | Crear y enviar | - |
| Pendiente | Enviada, esperando revisión | Solo visualizar | Calificar |
| Aprobada | Calificada positivamente | Solo visualizar | Editar o eliminar |
| Rechazada | Calificada negativamente | Reenviar con correcciones | Editar o eliminar |

### Flujo de Reenvío (Evidencias Rechazadas)

1. Usuario ve evidencia en filtro "Rechazados"
2. Visualiza:
   - Comentario del administrador
   - Archivo rechazado (link de descarga)
   - Descripción rechazada
3. Carga nueva descripción y nuevo archivo
4. Click en "Reenviar"
5. Sistema actualiza mismo registro (UPDATE)
6. Estado cambia a `pendiente`
7. Campos reseteados: `fecha_revision`, `comentario_admin`

### Almacenamiento de Archivos (AWS S3)

```
Estructura de bucket:
evidencias/
├── 2025/
│   ├── usuario_1/
│   │   ├── trimestre_1/
│   │   │   └── meta_123_20250104_archivo.pdf
│   │   ├── trimestre_2/
│   │   └── ...
│   └── usuario_2/
│       └── ...
```

Proceso de carga:
1. Validación de tipo y tamaño en frontend
2. Conversión a FormData
3. Envío a `/api/usuario/upload-evidencia`
4. Validación en backend
5. Generación de nombre único
6. Upload a S3 con SDK de AWS
7. Guardado de URL en base de datos

## APIs Principales

### Autenticación

**POST** `/api/login`
- Body: `{ email, password }`
- Response: Cookie de sesión + datos de usuario

**POST** `/api/logout`
- Limpia cookie de sesión

**GET** `/api/me`
- Retorna usuario autenticado actual

### Usuarios (Admin)

**GET** `/api/admin/usuarios`
- Lista todos los usuarios
- Requiere rol admin

**POST** `/api/admin/usuarios`
- Crea nuevo usuario
- Body: `{ nombre, email, password, area_id, rol }`

**PUT** `/api/admin/usuarios/[id]`
- Actualiza usuario existente

**DELETE** `/api/admin/usuarios/[id]`
- Elimina usuario (soft delete)

### Áreas (Admin)

**GET** `/api/admin/areas`
- Lista todas las áreas

**POST** `/api/admin/areas`
- Crea nueva área
- Body: `{ nombre_area, descripcion }`

**GET** `/api/admin/areas/[id]/plan-accion`
- Obtiene plan de acción de un área específica

**PUT** `/api/admin/areas/plan-accion/update`
- Actualiza meta del plan de acción
- Body: `{ id, accion?, presupuesto?, t1?, t2?, t3?, t4? }`

### Evidencias (Usuario)

**GET** `/api/usuario/trimestre-metas`
- Params: `trimestre`, `area_id`
- Retorna metas del trimestre con evidencias del usuario

**POST** `/api/usuario/upload-evidencia`
- FormData: `file`, `meta_id`, `trimestre`, `descripcion`
- Carga archivo a S3 y crea/actualiza registro de evidencia

**GET** `/api/usuario/evidencias-aprobadas`
- Params: `areaId`
- Retorna evidencias aprobadas del área del usuario

### Evidencias (Admin)

**GET** `/api/admin/evidencias`
- Params: `areaId?`, `trimestre?`
- Retorna evidencias para calificar

**POST** `/api/admin/calificar-evidencia`
- Body: `{ evidencia_id, calificacion, comentario, estado }`
- Califica evidencia y envía email al usuario

**PATCH** `/api/admin/evidencias/[id]`
- Body: `{ calificacion, comentario_admin }`
- Edita calificación de evidencia existente

**DELETE** `/api/admin/evidencias/[id]`
- Elimina evidencia completamente de la base de datos

**GET** `/api/admin/plan-accion-general`
- Params: `areaId?`
- Retorna todas las evidencias aprobadas para reporte

## Componentes Principales

### Administrador

- **AdminDashboard** - Panel principal con selección de área y trimestre
- **EvidenciasReview** - Tarjetas de evidencias con opciones de calificación
- **PlanAccionGeneralTable** - Tabla de todas las evidencias aprobadas
- **UsersSectionImproved** - Gestión de usuarios
- **AreasManagementSectionImproved** - Gestión de áreas
- **EjesManagementSection** - Gestión de ejes y sub-ejes

### Usuario

- **UserDashboardLayout** - Layout principal del dashboard
- **PlanAccionUserTable** - Tabla editable del plan de acción del área
- **TrimestreTableNew** - Tabla de metas por trimestre con carga de evidencias
- **EvidenciasAprobadas** - Visualización de evidencias aprobadas del área

### Compartidos

- **PlanAccionModernTable** - Tabla moderna reutilizable para plan de acción
- **FileUpload** - Componente de carga de archivos con validación
- **ConfirmDialog** - Diálogo de confirmación para acciones críticas

## Roles y Permisos

### Usuario Normal

Puede:
- Ver y editar plan de acción de su área (solo acción y presupuesto)
- Marcar trimestres activos
- Cargar evidencias por trimestre
- Ver estado de sus evidencias
- Reenviar evidencias rechazadas
- Ver evidencias aprobadas de su área

No puede:
- Acceder a otras áreas
- Calificar evidencias
- Gestionar usuarios
- Eliminar evidencias

### Administrador

Puede:
- Acceso completo a todas las áreas
- Gestión de usuarios (crear, editar, eliminar)
- Gestión de áreas (crear, editar)
- Gestión de ejes y sub-ejes
- Calificar evidencias de cualquier área
- Editar calificaciones existentes
- Eliminar evidencias
- Ver reportes generales

## Configuración de Servicios Externos

### AWS S3

1. Crear bucket en AWS S3
2. Configurar política de acceso público para lectura:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::nombre-bucket/*"
    }
  ]
}
```
3. Crear usuario IAM con permisos de escritura
4. Generar Access Key y Secret Key
5. Configurar en `.env.local`

### Resend (Emails)

1. Crear cuenta en https://resend.com
2. Verificar dominio de envío
3. Generar API Key
4. Configurar en `.env.local`

Plantilla de email incluida en `/api/admin/calificar-evidencia`

### Neon (PostgreSQL)

1. Crear cuenta en https://neon.tech
2. Crear nuevo proyecto
3. Crear base de datos
4. Copiar connection string
5. Ejecutar scripts SQL de `/database/`
6. Configurar en `.env.local`

## Despliegue

### Vercel (Recomendado)

1. Conectar repositorio de GitHub
2. Configurar variables de entorno en Vercel Dashboard
3. Deploy automático en cada push a master

### Servidor propio

```bash
# Build
npm run build

# Ejecutar
npm start

# PM2 (proceso persistente)
npm install -g pm2
pm2 start npm --name "plan-accion" -- start
pm2 save
pm2 startup
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Linting
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit
```

## Seguridad

- Contraseñas hasheadas con bcrypt
- Validación de roles en cada endpoint API
- Cookies HTTP-only para sesiones
- Validación de tipos de archivo en upload
- Límite de tamaño de archivo (10MB)
- SQL preparado (prevención de SQL injection)
- Validación de pertenencia a área en queries

## Licencia

Proyecto propietario - Todos los derechos reservados

## Contacto

Para soporte o consultas, contactar al equipo de desarrollo.
