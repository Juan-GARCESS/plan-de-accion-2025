// src/components/ui/StatsCard.tsx
import React from 'react';
import { styles, combineStyles } from '@/styles/components';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  onClick,
}) => {
  const colorMap = {
    blue: '#2563eb',
    green: '#059669',
    yellow: '#f59e0b',
    red: '#dc2626',
  };

  const cardStyle = combineStyles(
    styles.card,
    { padding: '1.5rem' },
    onClick ? { cursor: 'pointer' } : {}
  );

  return (
    <div style={cardStyle} onClick={onClick}>
      <h3 style={{
        fontSize: '1rem',
        fontWeight: '500',
        color: '#6b7280',
        margin: '0 0 0.5rem 0'
      }}>
        {icon && <span style={{ marginRight: '0.5rem' }}>{icon}</span>}
        {title}
      </h3>
      <p style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: colorMap[color],
        margin: 0
      }}>
        {value}
      </p>
    </div>
  );
};