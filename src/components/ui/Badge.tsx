// src/components/ui/Badge.tsx
'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: {
    backgroundColor: '#111827',
    color: '#ffffff',
    border: 'none',
  },
  outline: {
    backgroundColor: '#F9FAFB',
    color: '#374151',
    border: '1px solid #E5E7EB',
  },
  success: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    border: 'none',
  },
  warning: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    border: 'none',
  },
  danger: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    border: 'none',
  },
};

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
    ...variantStyles[variant],
  };

  return (
    <span style={baseStyle} className={className}>
      {children}
    </span>
  );
};
