// src/components/admin/AreasManagementSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AreaForm } from './AreaForm';
import { AreaCard } from './AreaCard';
import type { Area } from '@/types';

interface AreasManagementSectionProps {
  areas: Area[];
  onCreate: (data: { nombre: string; descripcion: string }) => Promise<void>;
  onEdit: (areaId: number, data: { nombre: string; descripcion: string }) => Promise<void>;
  onDelete: (areaId: number) => Promise<void>;
}

export const AreasManagementSection: React.FC<AreasManagementSectionProps> = ({
  areas,
  onCreate,
  onEdit,
  onDelete,
}) => {
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleEdit = (area: Area) => {
    setEditingArea(area);
  };

  const handleSaveEdit = async (data: { nombre: string; descripcion: string }) => {
    if (!editingArea) return;
    await onEdit(editingArea.id, data);
    setEditingArea(null);
  };

  const handleCancelEdit = () => {
    setEditingArea(null);
  };

  return (
    <div style={{ marginBottom: isMobile ? '2rem' : '3rem', padding: isMobile ? '1rem' : '0' }}>
      {/* Formulario para crear/editar */}
      <div style={{ marginBottom: isMobile ? '2rem' : '3rem' }}>
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: '#f0f9ff',
            padding: isMobile ? '0.75rem' : '1rem',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              color: '#0c4a6e',
              margin: 0
            }}>
              {editingArea ? "✏️ Editar Área" : "➕ Crear Nueva Área"}
            </h3>
            <p style={{
              fontSize: isMobile ? '12px' : '14px',
              color: '#0369a1',
              margin: '0.5rem 0 0 0'
            }}>
              {editingArea ? "Modifica la información del área seleccionada" : "Crea una nueva área de trabajo para la empresa"}
            </p>
          </div>
          
          <div style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
            <AreaForm
              area={editingArea}
              onSubmit={editingArea ? handleSaveEdit : onCreate}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      </div>

      {/* Tabla de áreas existentes */}
      <div>
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#f0fdf4',
            padding: isMobile ? '0.75rem' : '1rem',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              color: '#166534',
              margin: 0
            }}>
              🏢 Áreas Existentes ({areas.length})
            </h3>
            <p style={{
              fontSize: isMobile ? '12px' : '14px',
              color: '#15803d',
              margin: '0.5rem 0 0 0'
            }}>
              Administra las áreas disponibles en el sistema
            </p>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {isMobile && areas.length > 0 && (
              <div style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#fffbeb',
                borderBottom: '1px solid #fef3c7',
                fontSize: '12px',
                color: '#92400e',
                textAlign: 'center'
              }}>
                👈 Desliza para ver más columnas
              </div>
            )}
            {areas.length === 0 ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🏢</div>
                <h4 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                  No hay áreas creadas
                </h4>
                <p style={{ margin: 0 }}>
                  Crea la primera área usando el formulario de arriba
                </p>
              </div>
            ) : (
              <table style={{
                width: '100%',
                minWidth: isMobile ? '800px' : 'auto',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{...tableHeaderStyle, fontSize: isMobile ? '12px' : '14px'}}>Nombre del Área</th>
                    <th style={{...tableHeaderStyle, fontSize: isMobile ? '12px' : '14px'}}>Descripción</th>
                    <th style={{...tableHeaderStyle, fontSize: isMobile ? '12px' : '14px'}}>Usuarios</th>
                    <th style={{...tableHeaderStyle, fontSize: isMobile ? '12px' : '14px'}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.map((area) => (
                    <AreaCard
                      key={area.id}
                      area={area}
                      onEdit={handleEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  borderBottom: '1px solid #e5e7eb'
};