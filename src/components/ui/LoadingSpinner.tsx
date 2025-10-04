// src/components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando',
  fullScreen = true
}) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    ...(fullScreen ? {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    } : {
      padding: '2rem'
    })
  };

  return (
    <div style={containerStyle}>
      <p style={{ 
        color: '#9ca3af', 
        margin: 0, 
        fontSize: '14px',
        fontWeight: '400'
      }}>
        {message}
      </p>
    </div>
  );
};