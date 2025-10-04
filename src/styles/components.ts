import React from 'react';

// Función para combinar estilos
export const combineStyles = (...styles: (React.CSSProperties | undefined)[]): React.CSSProperties => {
  return styles.filter((style): style is React.CSSProperties => Boolean(style)).reduce((acc, style) => {
    return { ...acc, ...style };
  }, {} as React.CSSProperties);
};

// Estilos base del sistema
export const styles = {
  // Estilos de tarjetas
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  } as React.CSSProperties,

  // Padding dinámico para tarjetas
  cardPadding: (isMobile: boolean) => ({
    padding: isMobile ? '1rem' : '1.5rem',
  }),

  // Estilos de botones
  button: {
    base: {
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s ease-in-out',
    } as React.CSSProperties,
    
    primary: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: '1px solid #3b82f6',
    } as React.CSSProperties,
    
    secondary: {
      backgroundColor: 'white',
      color: '#374151',
      border: '1px solid #d1d5db',
    } as React.CSSProperties,
    
    danger: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: '1px solid #ef4444',
    } as React.CSSProperties,
  },

  // Estilos de inputs
  input: {
    base: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      backgroundColor: 'white',
    } as React.CSSProperties,
    
    error: {
      borderColor: '#ef4444',
    } as React.CSSProperties,
  },

  // Estilos de tipografía
  heading: {
    h1: {
      fontSize: '2.25rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '0.5rem',
    } as React.CSSProperties,
    
    h2: {
      fontSize: '1.875rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem',
    } as React.CSSProperties,
    
    h3: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem',
    } as React.CSSProperties,
  },

  // Estilos de texto
  text: {
    base: {
      fontSize: '1rem',
      color: '#374151',
    } as React.CSSProperties,
    
    muted: {
      fontSize: '0.875rem',
      color: '#6b7280',
    } as React.CSSProperties,
    
    small: {
      fontSize: '0.75rem',
      color: '#9ca3af',
    } as React.CSSProperties,
  },

  // Layout
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  page: {
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f3f4f6',
  },
};
