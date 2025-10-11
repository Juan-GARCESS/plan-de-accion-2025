// src/components/admin/AdminMainContent.tsx
'use client';

import React from 'react';
import type { Area } from '@/types';

interface AdminMainContentProps {
  children?: React.ReactNode;
  areas?: Area[]; // kept for future use if needed
}

export const AdminMainContent: React.FC<AdminMainContentProps> = ({ children }) => {
  return (
    <div style={containerStyle}>
      {children || (
        <div style={defaultContentStyle}>
          {/* Encabezado */}
          <div style={welcomeCardStyle}>
            <h1 style={titleStyle}>Plan de Accion</h1>
            <p style={subtitleStyle}>Bienvenido al sistema de gestión administrativa</p>
          </div>

          {/* Misión y Visión */}
          <div style={twoColGridStyle}>
            <div style={bwCardStyle}>
              <h3 style={bwCardTitleStyle}>Misión</h3>
              <p style={bwCardTextStyle}>
                Proporcionar herramientas de gestión eficientes y transparentes para el seguimiento de metas
                y objetivos, facilitando la toma de decisiones estratégicas y el crecimiento organizacional.
              </p>
            </div>
            <div style={bwCardStyle}>
              <h3 style={bwCardTitleStyle}>Visión</h3>
              <p style={bwCardTextStyle}>
                Ser la plataforma de referencia en gestión administrativa, promoviendo la excelencia operativa,
                la colaboración efectiva y el logro consistente de objetivos institucionales.
              </p>
            </div>
          </div>

          {/* Botón Plan de Acción General */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={() => window.open('/plan-accion-general.pdf', '_blank')}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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

// Estilos
const containerStyle: React.CSSProperties = {
  flex: 1,
  padding: '24px',
  backgroundColor: '#ffffff',
  color: '#111111',
  overflowY: 'auto'
};

const defaultContentStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto'
};

const welcomeCardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '32px',
  borderRadius: '16px',
  marginBottom: '32px',
  textAlign: 'center',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
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