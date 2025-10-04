// src/components/ui/UserAvatar.tsx
import React from 'react';
import { styles, combineStyles } from '@/styles/components';
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
    styles.avatar.container,
    sizeMap[size],
    user.rol === 'admin' ? styles.avatar.admin : styles.avatar.user
  );

  return (
    <div style={containerStyle}>
      <span>
        {user.nombre[0]?.toUpperCase() || 'U'}
      </span>
    </div>
  );
};