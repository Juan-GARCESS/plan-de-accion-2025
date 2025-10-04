// src/components/admin/AdminSidebar.tsx
'use client';

import React, { useState } from 'react';
import type { Area } from '@/types';

interface AdminSidebarProps {
  areas: Area[];
  onAreaSelect?: (areaId: number) => void;
  selectedAreaId?: number | null;
  onDashboardSelect?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  areas,
  onAreaSelect,
  selectedAreaId,
  onDashboardSelect,
  isOpen = true,
  onToggle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Proteger contra arrays undefined/null y elementos sin nombre_area
  const safeareas = Array.isArray(areas) ? areas : [];
  const filteredAreas = safeareas.filter(area => 
    area && area.nombre_area && 
    area.nombre_area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={sidebarStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>Panel Admin</h2>
      </div>

      {/* Dashboard Option */}
      <div style={sectionStyle}>
        <button
          onClick={onDashboardSelect}
          style={{
            ...itemStyle,
            ...(selectedAreaId === null ? selectedItemStyle : {})
          }}
        >
          📊 Dashboard Principal
        </button>
      </div>

      {/* Areas Section */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Áreas</h3>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Buscar área..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />

        {/* Areas List */}
        <div style={listStyle}>
          {filteredAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => onAreaSelect?.(area.id)}
              style={{
                ...itemStyle,
                ...(selectedAreaId === area.id ? selectedItemStyle : {})
              }}
            >
              🏢 {area.nombre_area}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Estilos
const sidebarStyle: React.CSSProperties = {
  width: '280px',
  height: '100vh',
  backgroundColor: '#f8f9fa',
  borderRight: '1px solid #e9ecef',
  padding: '0',
  overflowY: 'auto'
};

const headerStyle: React.CSSProperties = {
  padding: '20px',
  borderBottom: '1px solid #e9ecef',
  backgroundColor: '#ffffff'
};

const titleStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '18px',
  fontWeight: '600',
  color: '#343a40'
};

const sectionStyle: React.CSSProperties = {
  padding: '16px'
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: '14px',
  fontWeight: '600',
  color: '#6c757d',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ced4da',
  borderRadius: '6px',
  fontSize: '14px',
  marginBottom: '12px',
  outline: 'none'
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const itemStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  border: 'none',
  backgroundColor: 'transparent',
  textAlign: 'left',
  fontSize: '14px',
  color: '#495057',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const selectedItemStyle: React.CSSProperties = {
  backgroundColor: '#007bff',
  color: '#ffffff'
};