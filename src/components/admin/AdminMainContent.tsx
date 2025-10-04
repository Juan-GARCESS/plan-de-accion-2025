// src/components/admin/AdminMainContent.tsx
'use client';

import React from 'react';
import type { Area } from '@/types';

interface AdminMainContentProps {
  children?: React.ReactNode;
  areas?: Area[];
}

export const AdminMainContent: React.FC<AdminMainContentProps> = ({ children, areas = [] }) => {
  return (
    <div style={containerStyle}>
      {children || (
        <div style={defaultContentStyle}>
          <div style={welcomeCardStyle}>
            <h1 style={titleStyle}>Panel de Administración</h1>
            <p style={subtitleStyle}>Bienvenido al sistema de gestión administrativa</p>
          </div>

          <div style={cardsGridStyle}>
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>🎯 Misión</h3>
              <p style={cardTextStyle}>
                Proporcionar herramientas de gestión eficientes y transparentes 
                para el seguimiento de metas y objetivos trimestrales, facilitando 
                la toma de decisiones estratégicas y el crecimiento organizacional.
              </p>
            </div>

            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>👁️ Visión</h3>
              <p style={cardTextStyle}>
                Ser la plataforma de referencia en gestión administrativa, 
                promoviendo la excelencia operativa, la colaboración efectiva 
                y el logro consistente de objetivos institucionales.
              </p>
            </div>

            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>⚡ Funcionalidades</h3>
              <ul style={listStyle}>
                <li>Gestión de áreas y usuarios</li>
                <li>Asignación de metas trimestrales</li>
                <li>Seguimiento de participación</li>
                <li>Reportes y estadísticas</li>
                <li>Control de acceso administrativo</li>
              </ul>
            </div>

            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>🏢 Áreas Disponibles</h3>
              {areas.length > 0 ? (
                <div style={areasListStyle}>
                  {areas.map((area, index) => (
                    <div key={area.id} style={areaItemStyle}>
                      <span style={areaNumberStyle}>{index + 1}.</span>
                      <div style={areaInfoStyle}>
                        <strong style={areaNameStyle}>{area.nombre_area}</strong>
                        <p style={areaDescStyle}>{area.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={noAreasStyle}>No hay áreas creadas aún</p>
              )}
            </div>
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
  overflowY: 'auto'
};

const defaultContentStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto'
};

const welcomeCardStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  padding: '32px',
  borderRadius: '12px',
  marginBottom: '32px',
  textAlign: 'center',
  border: '1px solid #e9ecef'
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: '32px',
  fontWeight: '700',
  color: '#343a40'
};

const subtitleStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '18px',
  color: '#6c757d'
};

const cardsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '24px'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #e9ecef',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
};

const cardTitleStyle: React.CSSProperties = {
  margin: '0 0 16px 0',
  fontSize: '20px',
  fontWeight: '600',
  color: '#343a40'
};

const cardTextStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#495057'
};

const listStyle: React.CSSProperties = {
  margin: '0',
  paddingLeft: '20px',
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#495057'
};

const areasListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  maxHeight: '300px',
  overflowY: 'auto'
};

const areaItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  padding: '8px',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  border: '1px solid #e9ecef'
};

const areaNumberStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#007bff',
  minWidth: '20px'
};

const areaInfoStyle: React.CSSProperties = {
  flex: 1
};

const areaNameStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#343a40',
  marginBottom: '4px'
};

const areaDescStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '12px',
  color: '#6c757d',
  lineHeight: '1.4'
};

const noAreasStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#6c757d',
  fontStyle: 'italic',
  textAlign: 'center',
  padding: '20px'
};