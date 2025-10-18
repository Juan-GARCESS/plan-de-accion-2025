'use client';

import React, { useState } from 'react';
import { HomeIcon, WrenchScrewdriverIcon, BuildingOfficeIcon, XMarkIcon, RectangleGroupIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon as SearchSolidIcon } from '@heroicons/react/20/solid';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { Area } from '@/types';

interface AdminSidebarProps {
  areas: Area[];
  onAreaSelect?: (areaId: number) => void;
  selectedAreaId?: number | null;
  onDashboardSelect?: () => void;
  userName?: string;
  onGestionSelect?: () => void;
  isGestionSelected?: boolean;
  onAreasManagementSelect?: () => void;
  isAreasManagementSelected?: boolean;
  onEjesManagementSelect?: () => void;
  isEjesManagementSelected?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  areas,
  onAreaSelect,
  selectedAreaId,
  onDashboardSelect,
  userName,
  onGestionSelect,
  isGestionSelected,
  onAreasManagementSelect,
  isAreasManagementSelected,
  onEjesManagementSelect,
  isEjesManagementSelected,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const safeAreas = Array.isArray(areas) ? areas : [];
  const filteredAreas = safeAreas.filter(area => 
    area && area.nombre_area && 
    area.nombre_area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid #e5e7eb',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        position: 'relative'
      }}>
        {/* Botón de cerrar para móvil */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Cerrar menú"
          >
            <XMarkIcon style={{ width: '20px', height: '20px', color: '#64748b' }} />
          </button>
        )}
        
        <button
          onClick={onDashboardSelect}
          style={{
            width: onClose ? 'calc(100% - 40px)' : '100%',
            textAlign: 'left',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0
          }}
          title="Ir al inicio"
        >
          <h2 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0,
            lineHeight: '1.4'
          }}>
            Panel de Administración
          </h2>
        </button>
      </div>

      {/* User Info */}
      {userName && (
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f8fafc'
        }}>
          <p style={{
            fontSize: '11px',
            color: '#64748b',
            margin: '0 0 4px 0',
            fontWeight: '400'
          }}>
            Bienvenido,
          </p>
          <p style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#1e293b',
            margin: 0
          }}>
            {userName}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* Inicio Button */}
        <button
          onClick={onDashboardSelect}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            marginBottom: '8px',
            border: 'none',
            borderRadius: '8px',
            background: !isGestionSelected && selectedAreaId === null ? '#1e293b' : 'transparent',
            color: !isGestionSelected && selectedAreaId === null ? 'white' : '#475569',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!(!isGestionSelected && selectedAreaId === null)) {
              e.currentTarget.style.background = '#f1f5f9';
            }
          }}
          onMouseLeave={(e) => {
            if (!(!isGestionSelected && selectedAreaId === null)) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <HomeIcon style={{ width: '18px', height: '18px' }} />
          <span>Inicio</span>
        </button>

        {/* Gestión Button */}
        <button
          onClick={onGestionSelect}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            marginBottom: '8px',
            border: 'none',
            borderRadius: '8px',
            background: isGestionSelected ? '#1e293b' : 'transparent',
            color: isGestionSelected ? 'white' : '#475569',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isGestionSelected) {
              e.currentTarget.style.background = '#f1f5f9';
            }
          }}
          onMouseLeave={(e) => {
            if (!isGestionSelected) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <WrenchScrewdriverIcon style={{ width: '18px', height: '18px' }} />
          <span>Gestión de Usuarios</span>
        </button>

        {/* Gestión de Áreas Button */}
        <button
          onClick={onAreasManagementSelect}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            marginBottom: '8px',
            border: 'none',
            borderRadius: '8px',
            background: isAreasManagementSelected ? '#1e293b' : 'transparent',
            color: isAreasManagementSelected ? 'white' : '#475569',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isAreasManagementSelected) {
              e.currentTarget.style.background = '#f1f5f9';
            }
          }}
          onMouseLeave={(e) => {
            if (!isAreasManagementSelected) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <RectangleGroupIcon style={{ width: '18px', height: '18px' }} />
          <span>Gestión de Áreas</span>
        </button>

        {/* Gestión de Ejes Button */}
        <button
          onClick={onEjesManagementSelect}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            marginBottom: '20px',
            border: 'none',
            borderRadius: '8px',
            background: isEjesManagementSelected ? '#1e293b' : 'transparent',
            color: isEjesManagementSelected ? 'white' : '#475569',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isEjesManagementSelected) {
              e.currentTarget.style.background = '#f1f5f9';
            }
          }}
          onMouseLeave={(e) => {
            if (!isEjesManagementSelected) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Squares2X2Icon style={{ width: '18px', height: '18px' }} />
          <span>Gestión de Ejes</span>
        </button>

        {/* ÁREAS Section */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 12px 8px'
          }}>
            ÁREAS
          </h3>
          
          {/* Search Box */}
          <div style={{
            position: 'relative',
            marginBottom: '12px'
          }}>
            <SearchSolidIcon style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#94a3b8'
            }} />
            <input
              type="text"
              placeholder="Buscar área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: '13px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                background: '#f8fafc',
                color: '#1e293b',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.background = 'white';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = '#f8fafc';
              }}
            />
          </div>

          {/* Areas List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => onAreaSelect?.(area.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  background: selectedAreaId === area.id ? '#e2e8f0' : 'transparent',
                  color: selectedAreaId === area.id ? '#1e293b' : '#475569',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: selectedAreaId === area.id ? '500' : '400',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedAreaId !== area.id) {
                    e.currentTarget.style.background = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAreaId !== area.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <BuildingOfficeIcon style={{ 
                  width: '16px', 
                  height: '16px',
                  flexShrink: 0 
                }} />
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {area.nombre_area}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer - Solo ThemeToggle */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        background: '#f8fafc'
      }}>
        <ThemeToggle />
      </div>
    </div>
  );
};
