// src/components/ui/avatar.tsx
'use client';

import React from 'react';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
  className?: string;
}

const sizeStyles = {
  sm: { width: '32px', height: '32px', fontSize: '12px' },
  md: { width: '40px', height: '40px', fontSize: '14px' },
  lg: { width: '48px', height: '48px', fontSize: '16px' },
  xl: { width: '56px', height: '56px', fontSize: '18px' },
};

const colors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6366F1', // indigo
  '#F59E0B', // amber
  '#EF4444', // red
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#D946EF', // fuchsia
];

export const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  size = 'md',
  children, 
  className = '' 
}) => {
  if (children) {
    return (
      <div className={`relative inline-block ${className}`}>
        {children}
      </div>
    );
  }

  if (!name) return null;

  // Generar color basado en el nombre
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  // Obtener iniciales
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const sizeStyle = sizeStyles[size];

  return (
    <div 
      style={{
        ...sizeStyle,
        backgroundColor: bgColor,
        color: 'white',
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        flexShrink: 0,
      }}
      className={className}
    >
      {initials}
    </div>
  );
};
