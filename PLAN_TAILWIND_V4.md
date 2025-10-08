# 🎯 RESUMEN: Migración PostgreSQL + Plan Tailwind V4

## ✅ FASE 1: PostgreSQL - COMPLETADO PARCIALMENTE

### Rutas Migradas (✅ Funcionan con PostgreSQL):
- `/api/login` - Autenticación
- `/api/register` - Registro
- `/api/me` - Información usuario actual
- `/api/usuario` - Datos usuario
- `/api/admin/usuarios` - Listar usuarios
- `/api/admin/areas/[id]/plan-accion` - Plan de acción
- `/api/admin/areas/[id]/seguimiento-ejes` - Matriz seguimiento
- `/api/usuario/seguimiento-ejes` - Toggle seguimiento

### Rutas Pendientes (~30 archivos):
- Admin: áreas, ejes, sub-ejes (CRUD completo)
- Usuario: trimestres, informes, metas
- Admin: estadísticas, selecciones

### 🔧 Patrón de Migración Manual

Para cada archivo restante, aplicar estos cambios:

#### 1. Remover imports MySQL
```typescript
// ANTES:
import type { RowDataPacket, ResultSetHeader } from "mysql2";

// DESPUÉS:
// (eliminar la línea)
```

#### 2. Cambiar queries SELECT
```typescript
// ANTES:
const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM usuarios WHERE id = ?", [id]);

// DESPUÉS:
const result = await db.query("SELECT * FROM usuarios WHERE id = $1", [id]);
const rows = result.rows;
```

#### 3. Cambiar queries INSERT
```typescript
// ANTES:
const [result] = await db.query<ResultSetHeader>("INSERT INTO usuarios (nombre) VALUES (?)", [nombre]);
const newId = result.insertId;

// DESPUÉS:
const result = await db.query("INSERT INTO usuarios (nombre) VALUES ($1) RETURNING id", [nombre]);
const newId = result.rows[0].id;
```

#### 4. Cambiar booleanos y keywords
```typescript
// ANTES:
WHERE activo = 1 AND estado = "activo"
updated_at = NOW()

// DESPUÉS:
WHERE activo = true AND estado = 'activo'
updated_at = CURRENT_TIMESTAMP
```

#### 5. ON DUPLICATE KEY → ON CONFLICT
```typescript
// ANTES:
INSERT INTO tabla (a, b) VALUES (?, ?)
ON DUPLICATE KEY UPDATE b = VALUES(b)

// DESPUÉS:
INSERT INTO tabla (a, b) VALUES ($1, $2)
ON CONFLICT (a) DO UPDATE SET b = EXCLUDED.b
```

---

## 🎨 FASE 2: Migración a Tailwind V4

### Estrategia de Migración

#### Paso 1: Análisis del Sistema Actual

**Archivos de estilos actuales:**
- `src/lib/styleUtils.ts` - Sistema de estilos centralizado
- `src/app/globals.css` - Estilos globales
- Componentes con estilos inline vía styleUtils

**Problemas identificados:**
1. ✅ Estilos inline dificultan mantenimiento
2. ✅ No hay reutilización eficiente de clases
3. ✅ Difícil aplicar temas/dark mode
4. ✅ No aprovechar utilidades de Tailwind
5. ✅ Mixing de inline styles con ocasionales clases

#### Paso 2: Setup Tailwind V4

**Tailwind CSS v4** (nueva arquitectura basada en Rust/Oxide):
- ✅ Ya instalado: `@tailwindcss/postcss` v4.1.13
- ✅ Configuración en `postcss.config.mjs`
- ⚠️ Necesita actualizar `tailwind.config.js` → eliminar (usa CSS puro)

**Cambios clave en V4:**
```css
/* Antes (v3): tailwind.config.js */
module.exports = {
  theme: { extend: { colors: {...} } }
}

/* Después (v4): globals.css */
@import "tailwindcss";
@theme {
  --color-primary: #3b82f6;
  --font-body: 'Inter', sans-serif;
}
```

#### Paso 3: Plan de Migración por Componente

**Orden de migración (prioridad):**

1. **Componentes base UI** (foundation):
   - `src/components/ui/Button.tsx`
   - `src/components/ui/Input.tsx`
   - `src/components/ui/Card.tsx`
   - `src/components/ui/Alert.tsx`

2. **Layouts**:
   - `src/components/admin/AdminDashboardLayout.tsx`
   - `src/components/user/UserDashboardLayout.tsx`
   - `src/components/admin/AdminNavbar.tsx`
   - `src/components/user/UserNavbar.tsx`

3. **Componentes de negocio**:
   - `src/components/admin/PlanAccionTable.tsx`
   - `src/components/seguimiento/EjeSeguimientoMatrix.tsx`
   - `src/components/admin/AreasManagementSectionImproved.tsx`
   - `src/components/admin/EjesManagementSectionImproved.tsx`

4. **Páginas**:
   - `src/app/admin/dashboard/page.tsx`
   - `src/app/dashboard/page.tsx`
   - `src/app/dashboard/plan-accion/page.tsx`

#### Paso 4: Patrón de Conversión

**Ejemplo: Button Component**

```typescript
// ANTES (styleUtils):
import { createButtonStyle, colors } from '@/lib/styleUtils';

export const Button = ({ variant = 'primary', ...props }) => (
  <button style={createButtonStyle(variant)} {...props} />
);

// DESPUÉS (Tailwind V4):
import { cn } from '@/lib/utils'; // helper para clsx

const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
  danger: "bg-red-600 hover:bg-red-700 text-white"
};

export const Button = ({ variant = 'primary', className, ...props }) => (
  <button 
    className={cn(
      "px-4 py-2 rounded-md font-medium transition-colors",
      buttonVariants[variant],
      className
    )}
    {...props}
  />
);
```

#### Paso 5: Mejoras de Diseño

**Notificaciones (nuevo componente):**
```typescript
// src/components/ui/Toast.tsx
import { cn } from '@/lib/utils';

export const Toast = ({ type, message, onClose }) => (
  <div className={cn(
    "fixed top-4 right-4 p-4 rounded-lg shadow-lg",
    "animate-slide-in-right backdrop-blur-sm",
    type === 'success' && "bg-green-50 border border-green-200 text-green-900",
    type === 'error' && "bg-red-50 border border-red-200 text-red-900",
    type === 'info' && "bg-blue-50 border border-blue-200 text-blue-900"
  )}>
    <div className="flex items-center gap-3">
      <Icon type={type} className="w-5 h-5" />
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-auto">
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  </div>
);
```

**Loading States:**
```typescript
// src/components/ui/Skeleton.tsx
export const Skeleton = ({ className }) => (
  <div className={cn(
    "animate-pulse bg-gray-200 rounded",
    className
  )} />
);

// Uso:
<Skeleton className="h-10 w-full" />
```

**Cards mejorados:**
```typescript
<div className="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  <div className="relative p-6">
    {/* Contenido */}
  </div>
</div>
```

#### Paso 6: Design System (Tokens)

**globals.css (Tailwind V4)**:
```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  
  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}

/* Animaciones custom */
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Utilities personalizadas */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

---

## 📋 DUDAS ANTES DE EMPEZAR

### Pregunta 1: ¿Mantienes la paleta actual o quieres una nueva?
- **Actual**: Escala de grises + azul primary
- **Propuesta**: Paleta profesional moderna (ej: Indigo/Slate/Emerald)

### Pregunta 2: ¿Nivel de cambio visual?
- **Opción A**: Mismo diseño, solo código Tailwind (conservador)
- **Opción B**: Mejoras sutiles (sombras, hover states, transiciones)
- **Opción C**: Rediseño moderno completo (cards elevados, gradientes, glassmorphism)

### Pregunta 3: ¿Dark mode?
- ¿Implementar soporte dark mode desde el inicio?
- Tailwind V4 lo hace muy fácil con `@media (prefers-color-scheme: dark)`

### Pregunta 4: ¿Componentes de notificaciones?
- **Toast notifications** (esquina superior)
- **Alert banners** (inline en página)
- **Modal confirmations** (para acciones destructivas)
- ¿Todos los anteriores?

### Pregunta 5: ¿Animaciones y transiciones?
- **Básicas**: hover, focus, transitions simples
- **Avanzadas**: slide-ins, fade-outs, skeleton loaders, progress bars

### Pregunta 6: ¿Responsive?
- ¿El diseño actual es desktop-only o también mobile?
- ¿Necesitas ajustes responsive específicos?

---

## 🚀 PRÓXIMOS PASOS

**Una vez respondas las dudas:**

1. Termino migración PostgreSQL (script automático)
2. Setup Tailwind V4 completo
3. Migro componentes base (Button, Input, Card, Alert)
4. Migro layouts y navbar
5. Migro componentes de negocio
6. Migro páginas
7. Elimino `styleUtils.ts` (ya no se usa)
8. Testing completo

**Tiempo estimado:**
- PostgreSQL: 30 mins (script automático)
- Tailwind V4: 2-3 horas (manual, componente por componente)

---

## 💡 RECOMENDACIÓN

Te sugiero:
1. **Paleta**: Actualizar a Slate/Blue moderna
2. **Visual**: Opción B (mejoras sutiles, profesional)
3. **Dark mode**: Sí, desde el inicio
4. **Notificaciones**: Toast + Alerts inline
5. **Animaciones**: Avanzadas (skeleton, transitions, micro-interactions)
6. **Responsive**: Full responsive (mobile-first)

¿Estás de acuerdo o prefieres algo diferente?
