// src/components/admin/UsersModernTable.tsx
'use client';

import React, { useState } from 'react';
import { Edit2, Key, Trash2, Search, Mail, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/avatar';
import type { Usuario } from '@/types';

interface UsersModernTableProps {
  usuarios: Usuario[];
  isPending?: boolean;
  areas: Array<{ id: number; nombre_area: string }>;
  onEdit: (user: Usuario) => void;
  onDelete: (userId: number) => void;
  onApprove: (userId: number, areaId: number) => void;
  onReject: (userId: number) => void;
  onGeneratePassword: (userId: number) => void;
  getAreaName: (areaId: number | null) => string;
}

export const UsersModernTable: React.FC<UsersModernTableProps> = ({
  usuarios,
  isPending = false,
  areas,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onGeneratePassword,
  getAreaName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<{[key: number]: number}>({});

  // Filtrar usuarios
  const filteredUsers = usuarios.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const areaName = getAreaName(user.area_id).toLowerCase();
    return (
      user.nombre.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      areaName.includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
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
          placeholder="Buscar usuarios..."
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
                  Usuario
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
                  Contacto
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
                  Área
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
                  Rol
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#6B7280',
                  }}>
                    No hay usuarios que coincidan con la búsqueda
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id}
                    style={{ borderBottom: '1px solid #F3F4F6' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    {/* Usuario con Avatar */}
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar name={user.nombre} size="xl" />
                        <div>
                          <div style={{ 
                            fontWeight: '600', 
                            color: '#111827', 
                            fontSize: '15px',
                            marginBottom: '2px'
                          }}>
                            {user.nombre}
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#6B7280' 
                          }}>
                            {user.rol === 'admin' ? 'Administrador' : 'Usuario'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail style={{ width: '16px', height: '16px', color: '#9CA3AF' }} />
                        <span style={{ fontSize: '14px', color: '#374151' }}>{user.email}</span>
                      </div>
                    </td>

                    {/* Área */}
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      {isPending ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
                            <span style={{ fontSize: '13px', color: '#6B7280', fontStyle: 'italic' }}>
                              Solicita: {user.area_solicitada || 'No especificada'}
                            </span>
                          </div>
                          <select
                            value={selectedArea[user.id] || ''}
                            onChange={(e) => setSelectedArea({...selectedArea, [user.id]: parseInt(e.target.value)})}
                            style={{
                              padding: '6px 8px',
                              fontSize: '13px',
                              border: '1px solid #D1D5DB',
                              borderRadius: '6px',
                              outline: 'none',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              minWidth: '150px'
                            }}
                          >
                            <option value="">Seleccionar área</option>
                            {areas.map((area) => (
                              <option key={area.id} value={area.id}>
                                {area.nombre_area}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 style={{ width: '16px', height: '16px', color: '#9CA3AF' }} />
                          <span style={{ fontSize: '14px', color: '#111827' }}>
                            {getAreaName(user.area_id)}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Rol */}
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <Badge variant={user.rol === 'admin' ? 'default' : 'outline'}>
                        {user.rol === 'admin' ? 'Administrador' : 'Usuario'}
                      </Badge>
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      {isPending ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px' 
                        }}>
                          <button
                            onClick={() => {
                              if (!selectedArea[user.id]) {
                                alert('Por favor selecciona un área antes de aprobar');
                                return;
                              }
                              onApprove(user.id, selectedArea[user.id]);
                            }}
                            disabled={!selectedArea[user.id]}
                            style={{
                              padding: '8px 16px',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: 'white',
                              backgroundColor: selectedArea[user.id] ? '#10B981' : '#9CA3AF',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: selectedArea[user.id] ? 'pointer' : 'not-allowed',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (selectedArea[user.id]) {
                                e.currentTarget.style.backgroundColor = '#059669';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedArea[user.id]) {
                                e.currentTarget.style.backgroundColor = '#10B981';
                              }
                            }}
                            title={selectedArea[user.id] ? "Aprobar usuario" : "Selecciona un área primero"}
                          >
                            ✓ Aprobar
                          </button>
                          <button
                            onClick={() => onReject(user.id)}
                            style={{
                              padding: '8px 16px',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: 'white',
                              backgroundColor: '#EF4444',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#DC2626';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#EF4444';
                            }}
                            title="Rechazar usuario"
                          >
                            ✕ Rechazar
                          </button>
                        </div>
                      ) : (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '4px' 
                        }}>
                          <button
                            onClick={() => onEdit(user)}
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
                          {user.rol !== 'admin' && (
                            <button
                              onClick={() => onGeneratePassword(user.id)}
                              style={{
                                padding: '10px',
                                color: '#2563EB',
                                backgroundColor: 'transparent',
                                border: '1px solid #BFDBFE',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#EFF6FF';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="Generar contraseña"
                            >
                              <Key style={{ width: '16px', height: '16px' }} />
                            </button>
                          )}
                          {user.rol !== 'admin' && (
                            <button
                              onClick={() => onDelete(user.id)}
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
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con contador */}
        {filteredUsers.length > 0 && (
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
              Mostrando {filteredUsers.length} de {usuarios.length} resultados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
