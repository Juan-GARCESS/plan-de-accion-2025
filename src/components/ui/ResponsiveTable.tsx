// src/components/ui/ResponsiveTable.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
  minWidth?: string;
}

/**
 * Wrapper para tablas que las hace responsive con scroll horizontal en móvil
 */
export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ 
  children, 
  minWidth = '800px' 
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      width: '100%',
      overflowX: isMobile ? 'auto' : 'visible',
      WebkitOverflowScrolling: 'touch',
      position: 'relative',
      borderRadius: '8px',
      border: isMobile ? '1px solid #e5e7eb' : 'none'
    }}>
      {isMobile && (
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          padding: '8px 12px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>👈</span>
          <span>Desliza para ver más</span>
        </div>
      )}
      <div style={{ 
        minWidth: isMobile ? minWidth : 'auto',
        width: '100%'
      }}>
        {children}
      </div>
    </div>
  );
};
