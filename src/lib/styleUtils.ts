// src/lib/styleUtils.ts
/**
 * Utilidades de estilo mejoradas - Sistema híbrido optimizado
 * Para evitar que el código TSX se extienda mucho
 */

import React from 'react';

// Función para combinar estilos (mejorada)
export const combineStyles = (...styles: (React.CSSProperties | undefined | false)[]): React.CSSProperties => {
  return styles
    .filter((style): style is React.CSSProperties => Boolean(style))
    .reduce((acc, style) => ({ ...acc, ...style }), {} as React.CSSProperties);
};

// Paleta de colores centralizada
export const colors = {
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  secondary: '#6b7280',
  success: '#10b981',
  successHover: '#059669',
  danger: '#ef4444',
  dangerHover: '#dc2626',
  warning: '#f59e0b',
  warningHover: '#d97706',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',
};

// Espaciado estandarizado
export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
};

// Tamaños de fuente estandarizados
export const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
};

// Sombras estandarizadas
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Bordes redondeados estandarizados
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
};

// **COMPONENTES DE ESTILO PRECONFIGURADOS**
// Esto es lo que hace que el código TSX sea más limpio

export const stylePresets = {
  // Cards
  card: {
    base: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.base,
      border: `1px solid ${colors.gray[200]}`,
    } as React.CSSProperties,
    
    padded: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.base,
      border: `1px solid ${colors.gray[200]}`,
      padding: spacing.lg,
    } as React.CSSProperties,

    hover: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.base,
      border: `1px solid ${colors.gray[200]}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties,
  },

  // Buttons
  button: {
    base: {
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: borderRadius.md,
      fontSize: fontSize.sm,
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s ease-in-out',
      border: 'none',
    } as React.CSSProperties,

    primary: {
      backgroundColor: colors.primary,
      color: colors.white,
      border: `1px solid ${colors.primary}`,
    } as React.CSSProperties,

    secondary: {
      backgroundColor: colors.white,
      color: colors.gray[700],
      border: `1px solid ${colors.gray[300]}`,
    } as React.CSSProperties,

    danger: {
      backgroundColor: colors.danger,
      color: colors.white,
      border: `1px solid ${colors.danger}`,
    } as React.CSSProperties,

    small: {
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: fontSize.xs,
    } as React.CSSProperties,

    large: {
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: fontSize.base,
    } as React.CSSProperties,
  },

  // Inputs
  input: {
    base: {
      width: '100%',
      padding: `${spacing.sm} ${spacing.md}`,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: colors.gray[300],
      borderRadius: borderRadius.md,
      fontSize: fontSize.sm,
      backgroundColor: colors.white,
      transition: 'border-color 0.2s, box-shadow 0.2s',
    } as React.CSSProperties,

    error: {
      borderColor: colors.danger,
      boxShadow: `0 0 0 3px ${colors.danger}20`,
    } as React.CSSProperties,

    focus: {
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px ${colors.primary}20`,
      outline: 'none',
    } as React.CSSProperties,
  },

  // Typography
  text: {
    heading1: {
      fontSize: fontSize['4xl'],
      fontWeight: '700',
      color: colors.gray[900],
      marginBottom: spacing.sm,
    } as React.CSSProperties,

    heading2: {
      fontSize: fontSize['3xl'],
      fontWeight: '600',
      color: colors.gray[900],
      marginBottom: spacing.sm,
    } as React.CSSProperties,

    heading3: {
      fontSize: fontSize['2xl'],
      fontWeight: '600',
      color: colors.gray[900],
      marginBottom: spacing.sm,
    } as React.CSSProperties,

    body: {
      fontSize: fontSize.base,
      color: colors.gray[700],
      lineHeight: '1.5',
    } as React.CSSProperties,

    muted: {
      fontSize: fontSize.sm,
      color: colors.gray[500],
    } as React.CSSProperties,

    small: {
      fontSize: fontSize.xs,
      color: colors.gray[400],
    } as React.CSSProperties,
  },

  // Layout
  layout: {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: `0 ${spacing.md}`,
    } as React.CSSProperties,

    page: {
      minHeight: 'calc(100vh - 80px)',
      backgroundColor: colors.gray[50],
      padding: spacing.lg,
    } as React.CSSProperties,

    sidebar: {
      width: '256px',
      backgroundColor: colors.white,
      borderRight: `1px solid ${colors.gray[200]}`,
      overflowY: 'auto' as const,
    } as React.CSSProperties,

    mainContent: {
      flex: 1,
      padding: spacing.lg,
      backgroundColor: colors.white,
      overflowY: 'auto' as const,
    } as React.CSSProperties,
  },

  // Tables
  table: {
    container: {
      overflowX: 'auto' as const,
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      border: `1px solid ${colors.gray[200]}`,
    } as React.CSSProperties,

    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
    } as React.CSSProperties,

    headerCell: {
      padding: `${spacing.md} ${spacing.lg}`,
      textAlign: 'left' as const,
      fontWeight: '600',
      color: colors.gray[700],
      borderBottom: `2px solid ${colors.gray[200]}`,
      backgroundColor: colors.gray[50],
    } as React.CSSProperties,

    cell: {
      padding: `${spacing.md} ${spacing.lg}`,
      fontSize: fontSize.sm,
      color: colors.gray[700],
      borderBottom: `1px solid ${colors.gray[200]}`,
    } as React.CSSProperties,
  },

  // Status badges
  badge: {
    base: {
      padding: `${spacing.xs} ${spacing.sm}`,
      borderRadius: borderRadius.full,
      fontSize: fontSize.xs,
      fontWeight: '600',
      textTransform: 'uppercase' as const,
      display: 'inline-flex',
      alignItems: 'center',
    } as React.CSSProperties,

    success: {
      backgroundColor: `${colors.success}20`,
      color: colors.success,
    } as React.CSSProperties,

    warning: {
      backgroundColor: `${colors.warning}20`,
      color: colors.warning,
    } as React.CSSProperties,

    danger: {
      backgroundColor: `${colors.danger}20`,
      color: colors.danger,
    } as React.CSSProperties,

    info: {
      backgroundColor: `${colors.primary}20`,
      color: colors.primary,
    } as React.CSSProperties,
  },
};

// **HELPER FUNCTIONS PARA HACER EL CÓDIGO AÚN MÁS LIMPIO**

// Crear estilos de botón completos
export const createButtonStyle = (
  variant: 'primary' | 'secondary' | 'danger' = 'primary',
  size: 'small' | 'base' | 'large' = 'base'
) => {
  return combineStyles(
    stylePresets.button.base,
    stylePresets.button[variant],
    size !== 'base' ? stylePresets.button[size] : false
  );
};

// Crear estilos de card completos
export const createCardStyle = (
  variant: 'base' | 'padded' | 'hover' = 'base',
  customStyles?: React.CSSProperties
) => {
  return combineStyles(
    stylePresets.card[variant],
    customStyles
  );
};

// Crear estilos de input con estados
export const createInputStyle = (
  hasError: boolean = false,
  isFocused: boolean = false,
  customStyles?: React.CSSProperties
) => {
  return combineStyles(
    stylePresets.input.base,
    hasError ? stylePresets.input.error : false,
    isFocused ? stylePresets.input.focus : false,
    customStyles
  );
};

// Responsive utilities
export const responsive = {
  isMobile: () => typeof window !== 'undefined' && window.innerWidth < 768,
  isTablet: () => typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024,
  isDesktop: () => typeof window !== 'undefined' && window.innerWidth >= 1024,
  
  getResponsiveValue: <T>(mobile: T, tablet?: T, desktop?: T): T => {
    if (typeof window === 'undefined') return mobile;
    if (window.innerWidth < 768) return mobile;
    if (window.innerWidth < 1024) return tablet || mobile;
    return desktop || tablet || mobile;
  },
};