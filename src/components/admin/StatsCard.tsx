// src/components/admin/StatsCard.tsx
'use client';

import React from 'react';
import { colors, spacing, borderRadius, shadows } from '@/lib/styleUtils';

interface StatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  color
}) => {
  const colorMap = {
    blue: {
      bg: '#eff6ff',
      border: '#dbeafe',
      icon: '#3b82f6',
      text: '#1e40af'
    },
    green: {
      bg: '#f0fdf4',
      border: '#dcfce7',
      icon: '#22c55e',
      text: '#15803d'
    },
    yellow: {
      bg: '#fefce8',
      border: '#fef3c7',
      icon: '#eab308',
      text: '#a16207'
    },
    purple: {
      bg: '#faf5ff',
      border: '#f3e8ff',
      icon: '#a855f7',
      text: '#7c3aed'
    },
    red: {
      bg: '#fef2f2',
      border: '#fecaca',
      icon: '#ef4444',
      text: '#dc2626'
    }
  };

  const cardColors = colorMap[color];

  const cardStyle: React.CSSProperties = {
    backgroundColor: cardColors.bg,
    border: `1px solid ${cardColors.border}`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    boxShadow: shadows.sm,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: colors.gray[600],
    marginBottom: spacing.xs
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: cardColors.text,
    marginBottom: spacing.xs
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: colors.gray[500],
    margin: 0
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = shadows.md;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = shadows.sm;
      }}
    >
      <div style={titleStyle}>{title}</div>
      <div style={valueStyle}>{value.toLocaleString()}</div>
      <div style={subtitleStyle}>{subtitle}</div>
    </div>
  );
};