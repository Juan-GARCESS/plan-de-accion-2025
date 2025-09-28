# Guía de Estilos - Sistema de Diseño

Esta guía muestra cómo usar los nuevos estilos globales mejorados para tu aplicación de login.

## 🎨 Colores Principales

### Variables CSS disponibles:
- `--primary-500`: Azul principal (#3b82f6)
- `--primary-600`: Azul más oscuro (#2563eb)
- `--gray-50` a `--gray-900`: Escala de grises
- `--success-500`: Verde de éxito (#22c55e)
- `--error-500`: Rojo de error (#ef4444)
- `--warning-500`: Amarillo de advertencia (#f59e0b)

## 🔘 Botones

### Clases disponibles:
```html
<!-- Botón primario -->
<button class="btn btn-primary">Botón primario</button>

<!-- Botón secundario -->
<button class="btn btn-secondary">Botón secundario</button>

<!-- Botón de éxito -->
<button class="btn btn-success">Botón de éxito</button>

<!-- Botón de peligro -->
<button class="btn btn-danger">Botón de peligro</button>

<!-- Botón con borde -->
<button class="btn btn-outline">Botón con borde</button>

<!-- Tamaños -->
<button class="btn btn-primary btn-sm">Pequeño</button>
<button class="btn btn-primary">Normal</button>
<button class="btn btn-primary btn-lg">Grande</button>
```

### Componente React:
```tsx
import { Button } from '../components/ui/Button';

<Button variant="primary" size="lg" loading={isLoading}>
  Enviar
</Button>
```

## 📝 Inputs

### Clases disponibles:
```html
<!-- Input básico -->
<input class="input" type="text" placeholder="Texto aquí" />

<!-- Input con error -->
<input class="input input-error" type="text" />

<!-- Grupo de formulario completo -->
<div class="form-group">
  <label class="form-label">Etiqueta</label>
  <input class="input" type="text" />
  <p class="form-help">Texto de ayuda</p>
  <p class="form-error">Mensaje de error</p>
</div>
```

### Componente React:
```tsx
import { Input } from '../components/ui/Input';

<Input
  label="Correo electrónico"
  type="email"
  placeholder="tu@email.com"
  error="Campo requerido"
  helpText="Ingresa un correo válido"
/>
```

## 📋 Cards

### Clases disponibles:
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Título</h3>
    <p class="card-subtitle">Subtítulo</p>
  </div>
  <p>Contenido de la tarjeta</p>
</div>
```

### Componente React:
```tsx
import { Card, CardHeader, CardTitle } from '../components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Mi Título</CardTitle>
  </CardHeader>
  <p>Contenido</p>
</Card>
```

## 🚨 Alertas

### Clases disponibles:
```html
<!-- Alerta de éxito -->
<div class="alert alert-success">Mensaje de éxito</div>

<!-- Alerta de error -->
<div class="alert alert-error">Mensaje de error</div>

<!-- Alerta de advertencia -->
<div class="alert alert-warning">Mensaje de advertencia</div>

<!-- Alerta informativa -->
<div class="alert alert-info">Mensaje informativo</div>
```

### Componente React:
```tsx
import { Alert } from '../components/ui/Alert';

<Alert type="success">¡Operación exitosa!</Alert>
<Alert type="error">Ocurrió un error</Alert>
```

## 📏 Espaciado y Layout

### Contenedores:
```html
<!-- Container principal (max-width: 1280px) -->
<div class="container">Contenido</div>

<!-- Container pequeño (max-width: 672px) -->
<div class="container-sm">Contenido</div>
```

### Secciones:
```html
<!-- Sección con padding estándar -->
<section class="section">Contenido</section>

<!-- Sección pequeña -->
<section class="section-sm">Contenido</section>

<!-- Sección grande -->
<section class="section-lg">Contenido</section>
```

### Espaciado responsivo:
```html
<div class="space-y-responsive">
  <div>Elemento 1</div>
  <div>Elemento 2</div>
  <div>Elemento 3</div>
</div>
```

## 🏷️ Badges

```html
<span class="badge badge-primary">Primario</span>
<span class="badge badge-success">Éxito</span>
<span class="badge badge-warning">Advertencia</span>
<span class="badge badge-danger">Peligro</span>
```

## 📊 Tablas

```html
<table class="table">
  <thead>
    <tr>
      <th class="table-header">Cabecera</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="table-cell">Celda</td>
    </tr>
  </tbody>
</table>
```

## 🔗 Navegación

```html
<nav>
  <a class="nav-link">Enlace normal</a>
  <a class="nav-link nav-link-active">Enlace activo</a>
</nav>
```

## 🎯 Clases de Utilidad

### Efectos:
```html
<!-- Elevación al hacer hover -->
<div class="hover-lift">Contenido</div>

<!-- Enfoque accesible -->
<button class="focus-outline">Botón</button>
```

### Gradientes:
```html
<div class="gradient-primary">Fondo con gradiente primario</div>
<div class="gradient-card">Fondo de tarjeta con gradiente</div>
```

### Loading:
```html
<div class="spinner h-6 w-6"></div>
```

### Divisores:
```html
<hr class="divider" />
```

## 📱 Responsividad

Todas las clases están diseñadas para ser responsivas. Usa los prefijos de Tailwind para ajustes específicos:

```html
<div class="p-4 sm:p-6 lg:p-8">Padding responsivo</div>
<div class="text-sm sm:text-base">Texto responsivo</div>
```

## 🌙 Soporte para Modo Oscuro

El sistema incluye soporte básico para modo oscuro usando `prefers-color-scheme`. Las variables CSS se ajustan automáticamente.

## 📖 Ejemplos de Páginas Completas

Revisa estos archivos para ver implementaciones completas:
- `src/app/page-improved-example.tsx` - Login mejorado
- `src/app/register/page-improved-example.tsx` - Registro mejorado

## 🚀 Cómo Aplicar los Cambios

1. **Usar los componentes React**: Importa los componentes de `src/components/ui/`
2. **Usar las clases CSS**: Aplica directamente las clases en tu HTML/JSX
3. **Personalizar**: Modifica las variables CSS en `globals.css` para ajustar colores y espaciados

## 🎨 Paleta de Colores Visual

- **Primario**: Azul moderno y profesional
- **Éxito**: Verde claro y optimista  
- **Error**: Rojo claro pero no agresivo
- **Advertencia**: Amarillo/naranja llamativo
- **Neutros**: Escala de grises equilibrada

¡Tu aplicación ahora tiene un sistema de diseño consistente y profesional! 🎉