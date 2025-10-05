// src/components/admin/AdminSidebar.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomeIcon, WrenchScrewdriverIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon as SearchSolidIcon } from '@heroicons/react/20/solid';
import type { Area } from '@/types';

interface AdminSidebarProps {
  areas: Area[];
  onAreaSelect?: (areaId: number) => void;
  selectedAreaId?: number | null;
  onDashboardSelect?: () => void;
  userName?: string;
  onGestionSelect?: () => void;
  isGestionSelected?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  areas,
  onAreaSelect,
  selectedAreaId,
  onDashboardSelect,
  userName,
  onGestionSelect,
  isGestionSelected
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  // Ajuste fino vertical del icono de búsqueda (px). Positivo = abajo, Negativo = arriba
  const SEARCH_ICON_OFFSET_PX = -5; // ajusta a gusto: -2, -1, 0, 1, 2
  
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
        <button
          onClick={onDashboardSelect}
          style={headerButtonStyle}
          title="Ir al inicio (Misión y Visión)"
        >
          <h2 style={titleStyle}>Panel de Administración</h2>
          <span style={welcomeStyle}>Bienvenido{userName ? `, ${userName}` : ''}</span>
        </button>
      </div>

      {/* Removed explicit Dashboard button; use the header click to return to landing */}

      {/* Inicio */}
      <div style={sectionStyle}>
        <button
          onClick={onDashboardSelect}
          style={{
            ...itemStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: selectedAreaId === null && !isGestionSelected ? '#e5e7eb' : 'transparent',
            color: selectedAreaId === null && !isGestionSelected ? '#111827' : '#111111',
            border: selectedAreaId === null && !isGestionSelected ? '1px solid #d1d5db' : '1px solid transparent'
          }}
        >
          <HomeIcon style={iconStyle} />
          <span>Inicio</span>
        </button>

        {/* Gestión */}
        <button
          onClick={() => onGestionSelect ? onGestionSelect() : router.push('/admin')}
          style={{
            ...itemStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '8px',
            backgroundColor: isGestionSelected ? '#e5e7eb' : 'transparent',
            color: isGestionSelected ? '#111827' : '#111111',
            border: isGestionSelected ? '1px solid #d1d5db' : '1px solid transparent'
          }}
        >
          <WrenchScrewdriverIcon style={iconStyle} />
          <span>Gestión</span>
        </button>
      </div>

      {/* Áreas Section */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Áreas</h3>

        {/* Search */}
        <div style={searchWrapperStyle}>
          <SearchSolidIcon
            style={{
              ...iconStyle,
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: `translateY(calc(-50% + ${SEARCH_ICON_OFFSET_PX}px))`,
              color: '#9ca3af',
              pointerEvents: 'none',
              display: 'block',
              width: '16px',
              height: '16px'
            }}
          />

          <input
            type="text"
            placeholder="Buscar área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        {/* Areas List */}
        <div style={listStyle}>
          {filteredAreas.map((area) => {
            const isSelected = selectedAreaId === area.id && !isGestionSelected;
            return (
              <button
                key={area.id}
                onClick={() => onAreaSelect?.(area.id)}
                style={{
                  ...itemStyle,
                  ...(isSelected ? selectedItemStyle : {}),
                }}
                title={area.nombre_area}
              >
                <BuildingOfficeIcon style={{ ...iconStyle, width: '16px', height: '16px' }} />
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {area.nombre_area}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Estilos
const sidebarStyle: React.CSSProperties = {
  width: '280px',
  height: '100%',
  backgroundColor: '#ffffff',
  borderRight: '1px solid #e5e7eb',
  padding: '0',
  overflowY: 'visible'
};

const headerStyle: React.CSSProperties = {
  padding: '20px',
  borderBottom: '1px solid #e5e7eb',
  backgroundColor: '#ffffff'
};

const titleStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '18px',
  fontWeight: 800,
  color: '#000000'
};

const welcomeStyle: React.CSSProperties = {
  display: 'block',
  marginTop: '4px',
  fontSize: '12px',
  color: '#6b7280',
  fontWeight: 500
};

const headerButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  textAlign: 'left'
};

const sectionStyle: React.CSSProperties = {
  padding: '16px'
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: '14px',
  fontWeight: 800,
  color: '#000000',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px 10px 36px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  marginBottom: '12px',
  outline: 'none',
  color: '#111111',
  backgroundColor: '#ffffff',
  height: '40px'
};

const searchWrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%'
};


const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const itemStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid transparent',
  backgroundColor: 'transparent',
  textAlign: 'left',
  fontSize: '14px',
  color: '#111111',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const selectedItemStyle: React.CSSProperties = {
  backgroundColor: '#e5e7eb',
  color: '#111827',
  border: '1px solid #d1d5db'
};

const iconStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  color: 'currentColor',
  display: 'block'
};