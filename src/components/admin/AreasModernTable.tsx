// src/components/admin/AreasModernTable.tsx
'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, Search, FileText, Calendar } from 'lucide-react';
import type { Area } from '@/types';

interface AreasModernTableProps {
  areas: Area[];
  onEdit: (area: Area) => void;
  onDelete: (areaId: number) => void;
  onView?: (areaId: number) => void;
}

export const AreasModernTable: React.FC<AreasModernTableProps> = ({
  areas,
  onEdit,
  onDelete,
  onView,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar áreas
  const filteredAreas = areas.filter(area => {
    const searchLower = searchTerm.toLowerCase();
    return (
      area.nombre_area.toLowerCase().includes(searchLower) ||
      (area.descripcion && area.descripcion.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div style={{ marginTop: '24px' }}>
      {/* Barra de búsqueda */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search 
          style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            color: '#9CA3AF'
          }} 
        />
        <input
          type="text"
          placeholder="Buscar áreas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '40px',
            paddingRight: '16px',
            paddingTop: '10px',
            paddingBottom: '10px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#111827';
            e.target.style.boxShadow = '0 0 0 3px rgba(17, 24, 39, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#E5E7EB';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Tabla */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Nombre del Área
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Descripción
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Fecha de Creación
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#6B7280',
                  }}>
                    No hay áreas que coincidan con la búsqueda
                  </td>
                </tr>
              ) : (
                filteredAreas.map((area) => (
                  <tr 
                    key={area.id}
                    style={{ borderBottom: '1px solid #F3F4F6' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    {/* Nombre del Área */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#111827', 
                        fontSize: '15px',
                      }}>
                        {area.nombre_area}
                      </div>
                    </td>

                    {/* Descripción */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: '#6B7280',
                        fontSize: '14px',
                      }}>
                        <FileText style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                        <span style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {area.descripcion || 'Sin descripción'}
                        </span>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: '#6B7280',
                        fontSize: '14px',
                      }}>
                        <Calendar style={{ width: '16px', height: '16px' }} />
                        <span>
                          {area.created_at 
                            ? new Date(area.created_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-'
                          }
                        </span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '4px' 
                      }}>
                        <button
                          onClick={() => onEdit(area)}
                          style={{
                            padding: '10px',
                            color: '#374151',
                            backgroundColor: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F3F4F6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Editar"
                        >
                          <Edit2 style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button
                          onClick={() => onDelete(area.id)}
                          style={{
                            padding: '10px',
                            color: '#DC2626',
                            backgroundColor: 'transparent',
                            border: '1px solid #FECACA',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FEF2F2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Eliminar"
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con contador */}
        {filteredAreas.length > 0 && (
          <div style={{
            padding: '12px 24px',
            backgroundColor: '#F9FAFB',
            borderTop: '1px solid #E5E7EB',
          }}>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: '#6B7280',
            }}>
              Mostrando {filteredAreas.length} de {areas.length} resultados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
