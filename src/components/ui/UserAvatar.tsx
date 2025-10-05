// src/components/ui/UserAvatar.tsx
import React from 'react';
import { combineStyles } from '@/styles/components';
import type { Usuario } from '@/types';

interface UserAvatarProps {
  user: Pick<Usuario, 'nombre' | 'rol'>;
  size?: 'sm' | 'md' | 'lg';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md'
}) => {
  const sizeMap = {
    sm: { width: '32px', height: '32px', fontSize: '0.875rem' },
    md: { width: '40px', height: '40px', fontSize: '1rem' },
    lg: { width: '50px', height: '50px', fontSize: '1.25rem' },
  };

  const containerStyle = combineStyles(
    {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '9999px',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      fontWeight: 600,
    },
    sizeMap[size],
    user.rol === 'admin'
      ? { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }
      : { backgroundColor: '#e5e7eb', color: '#374151', border: '1px solid #d1d5db' }
  );

  return (
    <div style={containerStyle}>
      <span>
        {user.nombre[0]?.toUpperCase() || 'U'}
      </span>
    </div>
  );
};