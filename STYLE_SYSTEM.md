# 🎨 Guía de Estilos - Sistema Híbrido Mejorado

## 📋 **Resumen del Sistema**

Hemos implementado un **sistema híbrido** que mantiene todo el código existente funcionando, pero proporciona herramientas más limpias para nuevos desarrollos.

### ✅ **Lo que NO cambió (mantener así):**

- Todos los componentes existentes siguen funcionando
- Estilos inline actuales permanecen intactos
- Zero riesgo de romper funcionalidades

### 🚀 **Lo que usamos para NUEVOS componentes:**

## 🛠️ **Usando el nuevo sistema**

### **1. Importar las utilidades:**

```tsx
import {
  createCardStyle,
  createButtonStyle,
  stylePresets,
  colors,
} from "@/lib/styleUtils";
```

### **2. Crear componentes más limpios:**

#### ✅ **ANTES (código largo en TSX):**

```tsx
const cardStyle = {
  backgroundColor: "white",
  borderRadius: "0.5rem",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  border: "1px solid #e5e7eb",
  padding: "1.5rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
};
```

#### ✅ **AHORA (código limpio):**

```tsx
const cardStyle = createCardStyle("padded", { cursor: "pointer" });
```

### **3. Ejemplos prácticos:**

#### **Card simple:**

```tsx
<div style={createCardStyle("base")}>Contenido de la card</div>
```

#### **Button con variantes:**

```tsx
<button style={createButtonStyle("primary", "large")}>
  Botón primario grande
</button>
```

#### **Input con estados:**

```tsx
<input style={createInputStyle(hasError, isFocused)} onChange={handleChange} />
```

#### **Usando presets directamente:**

```tsx
<h1 style={stylePresets.text.heading1}>Título principal</h1>
<p style={stylePresets.text.muted}>Texto secundario</p>
```

## 🎯 **Valores predefinidos disponibles:**

### **Colores:**

```tsx
colors.primary; // #3b82f6
colors.success; // #10b981
colors.danger; // #ef4444
colors.warning; // #f59e0b
colors.gray[500]; // #6b7280
```

### **Espaciado:**

```tsx
spacing.xs; // 0.5rem (8px)
spacing.sm; // 0.75rem (12px)
spacing.md; // 1rem (16px)
spacing.lg; // 1.5rem (24px)
spacing.xl; // 2rem (32px)
```

### **Componentes preconfigurados:**

```tsx
stylePresets.card.base; // Card básica
stylePresets.card.padded; // Card con padding
stylePresets.button.primary; // Botón primario
stylePresets.input.base; // Input básico
stylePresets.text.heading1; // Título H1
stylePresets.badge.success; // Badge de éxito
```

## 📝 **Ejemplo completo - Nuevo componente:**

```tsx
// src/components/ui/NewComponent.tsx
import React from "react";
import {
  createCardStyle,
  createButtonStyle,
  stylePresets,
  colors,
} from "@/lib/styleUtils";

interface NewComponentProps {
  title: string;
  onSave: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  title,
  onSave,
}) => {
  return (
    <div style={createCardStyle("padded")}>
      <h2 style={stylePresets.text.heading2}>{title}</h2>
      <p style={stylePresets.text.muted}>
        Este componente usa el nuevo sistema de estilos
      </p>
      <button style={createButtonStyle("primary", "large")} onClick={onSave}>
        Guardar
      </button>
    </div>
  );
};
```

## 🎨 **Ventajas del nuevo sistema:**

### ✅ **Código más limpio:**

- TSX no se extiende con objetos de estilo largos
- Fácil de leer y mantener
- Consistencia automática

### ✅ **Reutilización:**

- Estilos estandarizados en toda la app
- Cambios centralizados en `styleUtils.ts`
- Menos duplicación de código

### ✅ **Flexibilidad:**

- Puedes combinar presets con estilos custom
- Sistema responsive incluido
- Compatible con el código existente

## 🚀 **Regla de oro para el futuro:**

**Para NUEVOS componentes:** Usa `styleUtils.ts`
**Para componentes EXISTENTES:** Déjalos como están (funcionan perfectamente)

## 🔧 **Personalización:**

Si necesitas nuevos presets, agrégalos a `src/lib/styleUtils.ts`:

```tsx
// Agregar nuevo preset
export const stylePresets = {
  // ... existentes

  // Nuevo preset
  modal: {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    } as React.CSSProperties,
  },
};
```

---

**✨ ¡Con este sistema tendrás código más limpio sin romper nada existente!**
