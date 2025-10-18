// src/components/admin/AdminMainContent.tsx
'use client';

import React, { useEffect, useState } from 'react';
import type { Area } from '@/types';

interface AdminMainContentProps {
  children?: React.ReactNode;
  areas?: Area[]; // kept for future use if needed
}

export const AdminMainContent: React.FC<AdminMainContentProps> = ({ children }) => {
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
      flex: 1,
      padding: isMobile ? '16px' : '24px',
      backgroundColor: '#ffffff',
      color: '#111111',
      overflowY: 'auto'
    }}>
      {children || (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Encabezado */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: isMobile ? '20px' : '32px',
            borderRadius: '16px',
            marginBottom: isMobile ? '20px' : '32px',
            textAlign: 'center',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}>
            <h1 style={{
              fontSize: isMobile ? '1.75rem' : '2.25rem',
              fontWeight: '800',
              color: '#111111',
              margin: '0 0 8px 0'
            }}>
              Plan de Accion
            </h1>
            <p style={{
              fontSize: isMobile ? '0.875rem' : '1rem',
              color: '#64748b',
              margin: 0
            }}>
              Bienvenido al sistema de gestión administrativa
            </p>
          </div>

          {/* Misión y Visión */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '16px' : '24px',
            marginBottom: isMobile ? '20px' : '32px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              padding: isMobile ? '20px' : '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: '700',
                color: '#111111',
                marginTop: 0,
                marginBottom: '16px'
              }}>
                Misión
              </h3>
              <p style={{
                fontSize: isMobile ? '0.875rem' : '1rem',
                lineHeight: '1.6',
                color: '#374151',
                margin: 0
              }}>
                Proporcionar herramientas de gestión eficientes y transparentes para el seguimiento de metas
                y objetivos, facilitando la toma de decisiones estratégicas y el crecimiento organizacional.
              </p>
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              padding: isMobile ? '20px' : '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: '700',
                color: '#111111',
                marginTop: 0,
                marginBottom: '16px'
              }}>
                Visión
              </h3>
              <p style={{
                fontSize: isMobile ? '0.875rem' : '1rem',
                lineHeight: '1.6',
                color: '#374151',
                margin: 0
              }}>
                Ser la plataforma de referencia en gestión administrativa, promoviendo la excelencia operativa,
                la colaboración efectiva y el logro consistente de objetivos institucionales.
              </p>
            </div>
          </div>

          {/* Botón Plan de Acción General */}
          <div style={{ marginTop: isMobile ? '1.5rem' : '2rem', textAlign: 'center' }}>
            <button
              onClick={() => window.open('/plan-accion-general.pdf', '_blank')}
              style={{
                padding: isMobile ? '0.875rem 1.5rem' : '1rem 2rem',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: isMobile ? '0.875rem' : '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                width: isMobile ? '100%' : 'auto'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#334155';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1e293b';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              📄 Ver Plan de Acción General
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: '32px',
  fontWeight: '800',
  color: '#000000'
};

const subtitleStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '16px',
  color: '#374151'
};

const twoColGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '24px',
  alignItems: 'stretch',
  marginBottom: '28px'
};

const bwCardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
};

const bwCardTitleStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: '20px',
  fontWeight: '700',
  color: '#000000'
};

const bwCardTextStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.7',
  color: '#111111'
};
// (CTA styles removed)