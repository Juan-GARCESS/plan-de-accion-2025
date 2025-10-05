// src/lib/styles.ts
/**
 * Sistema de utilidades de estilo usando Tailwind CSS
 * Migración desde objetos de estilo inline a clases optimizadas
 */

// Utilidades para combinar clases de Tailwind
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Mapeo de colores del sistema
export const colors = {
  primary: {
    50: 'bg-blue-50',
    100: 'bg-blue-100', 
    500: 'bg-blue-500',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
    text: 'text-blue-600',
    border: 'border-blue-500'
  },
  success: {
    50: 'bg-green-50',
    500: 'bg-green-500',
    600: 'bg-green-600',
    text: 'text-green-600',
    border: 'border-green-500'
  },
  danger: {
    50: 'bg-red-50',
    500: 'bg-red-500',
    600: 'bg-red-600',
    text: 'text-red-600',
    border: 'border-red-500'
  },
  warning: {
    50: 'bg-yellow-50',
    500: 'bg-yellow-500',
    600: 'bg-yellow-600',
    text: 'text-yellow-600',
    border: 'border-yellow-500'
  },
  gray: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    400: 'bg-gray-400',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    800: 'bg-gray-800',
    900: 'bg-gray-900',
  }
};

// Componentes base reutilizables
export const baseStyles = {
  // Cards (reemplaza styles.card)
  card: 'bg-white rounded-lg shadow-sm border border-gray-200',
  cardPadding: 'p-4 md:p-6',
  cardHeader: 'border-b border-gray-200 pb-4 mb-4',
  
  // Buttons (reemplaza styles.button)
  button: {
    base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
    sizes: {
      sm: 'h-9 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8 text-base'
    }
  },
  
  // Inputs (reemplaza styles.input)
  input: {
    base: 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    error: 'border-red-500 focus:ring-red-500 focus:border-red-500'
  },
  
  // Typography (reemplaza styles.heading y styles.text)
  text: {
    h1: 'text-4xl font-bold text-gray-900 mb-2',
    h2: 'text-3xl font-semibold text-gray-900 mb-2', 
    h3: 'text-2xl font-semibold text-gray-900 mb-2',
    h4: 'text-xl font-semibold text-gray-900 mb-1',
    base: 'text-base text-gray-700',
    muted: 'text-sm text-gray-500',
    small: 'text-xs text-gray-400'
  },
  
  // Layout
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  page: 'min-h-screen bg-gray-50',
  
  // Tables
  table: {
    container: 'overflow-x-auto bg-white rounded-lg border border-gray-200',
    table: 'w-full border-collapse',
    header: 'bg-gray-50',
    headerCell: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-200',
    row: 'border-b border-gray-200 hover:bg-gray-50',
    cell: 'px-4 py-4 text-sm text-gray-900'
  },
  
  // Status badges
  badge: {
    base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800', 
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800'
  },
  
  // Loading states
  loading: 'flex flex-col items-center justify-center p-12 text-gray-500',
  
  // Empty states
  empty: 'text-center p-12 bg-gray-50 rounded-lg border border-gray-200 text-gray-500',
  
  // Navigation
  nav: {
    container: 'bg-white border-b border-gray-200 sticky top-0 z-50',
    content: 'flex justify-between items-center px-6 py-3',
    title: 'text-xl font-bold text-gray-900',
    subtitle: 'text-xs text-gray-500 mt-1',
    links: 'flex gap-3',
    button: 'px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors'
  },
  
  // Sidebar
  sidebar: {
    container: 'w-64 bg-white border-r border-gray-200 overflow-y-auto',
    content: 'p-6',
    title: 'text-lg font-semibold text-gray-900 mb-6',
    searchInput: 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500',
    list: 'flex flex-col gap-1',
    item: 'w-full px-4 py-3 text-left text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors',
    itemActive: 'bg-blue-600 text-white hover:bg-blue-700'
  }
};

// Hook para estilos responsivos (mantiene funcionalidad existente)
export const useResponsiveStyles = (
  mobile: string,
  tablet?: string,
  desktop?: string
) => {
  // Tailwind maneja esto automáticamente con prefijos sm:, md:, lg:
  return cn(mobile, tablet && `md:${tablet}`, desktop && `lg:${desktop}`);
};