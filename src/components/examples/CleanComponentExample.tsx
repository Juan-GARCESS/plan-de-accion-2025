// src/components/examples/CleanComponentExample.tsx
/**
 * EJEMPLO: Componente usando el nuevo sistema de estilos
 * Este es un ejemplo de cómo crear componentes más limpios y mantenibles
 */

import React, { useState } from 'react';
import { 
  createCardStyle, 
  createButtonStyle, 
  createInputStyle,
  stylePresets, 
  colors, 
  spacing 
} from '@/lib/styleUtils';

interface CleanComponentExampleProps {
  title: string;
  onSave: (data: string) => void;
  onCancel: () => void;
}

export const CleanComponentExample: React.FC<CleanComponentExampleProps> = ({
  title,
  onSave,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSave = () => {
    if (!inputValue.trim()) {
      setHasError(true);
      return;
    }
    setHasError(false);
    onSave(inputValue);
  };

  // ✅ Estilos usando el nuevo sistema - MUCHO MÁS LIMPIO
  const containerStyle = createCardStyle('padded');
  const primaryButtonStyle = createButtonStyle('primary', 'base');
  const secondaryButtonStyle = createButtonStyle('secondary', 'base');
  const inputStyle = createInputStyle(hasError, isFocused);

  const buttonsContainerStyle = {
    display: 'flex',
    gap: spacing.md,
    marginTop: spacing.lg,
    justifyContent: 'flex-end',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <h2 style={stylePresets.text.heading2}>{title}</h2>
      
      {/* Descripción */}
      <p style={stylePresets.text.muted}>
        Este es un ejemplo de componente usando el nuevo sistema de estilos.
        El código TSX es mucho más limpio y mantenible.
      </p>

      {/* Input con manejo de estados */}
      <div style={{ marginTop: spacing.lg }}>
        <label style={stylePresets.text.body}>
          Ingresa algunos datos:
        </label>
        <input
          type="text"
          style={inputStyle}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setHasError(false);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Escribe algo aquí..."
        />
        {hasError && (
          <p style={{ ...stylePresets.text.small, color: colors.danger, marginTop: spacing.xs }}>
            Este campo es requerido
          </p>
        )}
      </div>

      {/* Botones de acción */}
      <div style={buttonsContainerStyle}>
        <button style={secondaryButtonStyle} onClick={onCancel}>
          Cancelar
        </button>
        <button style={primaryButtonStyle} onClick={handleSave}>
          Guardar
        </button>
      </div>
    </div>
  );
};

// ========================================
// COMPARACIÓN: ANTES vs AHORA
// ========================================

/* 
❌ ANTES (código largo y repetitivo):

const containerStyle = {
  backgroundColor: 'white',
  borderRadius: '0.5rem',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  border: '1px solid #e5e7eb',
  padding: '1.5rem',
};

const primaryButtonStyle = {
  padding: '0.75rem 1rem',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease-in-out',
  border: 'none',
  backgroundColor: '#3b82f6',
  color: 'white',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: hasError ? '1px solid #ef4444' : '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  backgroundColor: 'white',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  outline: 'none',
  ...(isFocused && {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  }),
};

✅ AHORA (código limpio y mantenible):

const containerStyle = createCardStyle('padded');
const primaryButtonStyle = createButtonStyle('primary', 'base');
const inputStyle = createInputStyle(hasError, isFocused);
*/