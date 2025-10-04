// src/components/admin/UsersSection.tsx
'use client';

import React from 'react';
import type { Usuario, Area } from '@/types';

interface UsersSectionProps {
  usuarios: Usuario[];
  areas: Area[];
  onApprove: (userId: number, areaId: number) => Promise<void>;
  onReject: (userId: number) => Promise<void>;
  onEdit: (userId: number, userData: { nombre: string; email: string; password?: string; area_id?: number }) => Promise<void>;
  onDelete: (userId: number) => Promise<void>;
  onGeneratePassword: (userId: number) => Promise<string>;
}

export const UsersSection: React.FC<UsersSectionProps> = ({
  usuarios,
  areas,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onGeneratePassword,
}) => {
  const usuariosPendientes = usuarios.filter(u => u.estado === 'pendiente');
  const usuariosAprobados = usuarios.filter(u => u.estado === 'activo');
  
  // Separar admin y otros usuarios, admin siempre primero
  const adminUser = usuariosAprobados.find(u => u.rol === 'admin');
  const regularUsers = usuariosAprobados.filter(u => u.rol !== 'admin');
  const sortedAprobados = adminUser ? [adminUser, ...regularUsers] : regularUsers;

  const getAreaName = (areaId: number | null) => {
    if (!areaId) return 'Sin área';
    const area = areas.find(a => a.id === areaId);
    return area ? area.nombre_area : 'Área no encontrada';
  };

  return (
    <div style={{ marginBottom: '3rem' }}>
      
      {/* Usuarios Pendientes - Siempre mostrar sección */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#fef3c7',
            padding: '1rem',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#92400e',
              margin: 0
            }}>
              Usuarios Pendientes de Aprobación ({usuariosPendientes.length})
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#a16207',
              margin: '0.5rem 0 0 0'
            }}>
              Revisa y aprueba a los nuevos usuarios que se han registrado
            </p>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {usuariosPendientes.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#64748b'
              }}>
                No hay usuarios pendientes de aprobación
              </div>
            ) : (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#fef9e7' }}>
                    <th style={tableHeaderStyle}>Nombre</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Área Solicitada</th>
                    <th style={tableHeaderStyle}>Fecha Registro</th>
                    <th style={tableHeaderStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosPendientes.map((user, index) => (
                    <PendingUserRow
                      key={user.id}
                      user={user}
                      areas={areas}
                      onApprove={onApprove}
                      onReject={onReject}
                      isEven={index % 2 === 0}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Usuarios Aprobados - Siempre mostrar sección */}
      <div>
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#dcfce7',
            padding: '1rem',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#166534',
              margin: 0
            }}>
              Usuarios Aprobados ({sortedAprobados.length})
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#15803d',
              margin: '0.5rem 0 0 0'
            }}>
              Gestiona los usuarios activos del sistema
            </p>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {sortedAprobados.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#64748b'
              }}>
                No hay usuarios aprobados
              </div>
            ) : (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0fdf4' }}>
                    <th style={tableHeaderStyle}>Nombre</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Área</th>
                    <th style={tableHeaderStyle}>Rol</th>
                    <th style={tableHeaderStyle}>Fecha Registro</th>
                    <th style={tableHeaderStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAprobados.map((user, index) => (
                    <ApprovedUserRow
                      key={user.id}
                      user={user}
                      areas={areas}
                      getAreaName={getAreaName}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onGeneratePassword={onGeneratePassword}
                      isEven={index % 2 === 0}
                      isAdmin={user.rol === 'admin'}
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

// Componente para filas de usuarios pendientes
interface PendingUserRowProps {
  user: Usuario;
  areas: Area[];
  onApprove: (userId: number, areaId: number) => Promise<void>;
  onReject: (userId: number) => Promise<void>;
  isEven: boolean;
}

const PendingUserRow: React.FC<PendingUserRowProps> = ({
  user,
  areas,
  onApprove,
  onReject,
  isEven
}) => {
  const [selectedAreaId, setSelectedAreaId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleApprove = async () => {
    if (!selectedAreaId) {
      alert('Por favor selecciona un área para el usuario');
      return;
    }
    
    setLoading(true);
    try {
      await onApprove(user.id, selectedAreaId);
    } catch (error) {
      console.error('Error al aprobar usuario:', error);
      alert('Error al aprobar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm(`¿Estás seguro de que quieres rechazar a ${user.nombre}?`)) return;
    
    setLoading(true);
    try {
      await onReject(user.id);
    } catch (error) {
      console.error('Error al rechazar usuario:', error);
      alert('Error al rechazar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr style={{
      backgroundColor: isEven ? '#fffbeb' : 'white',
      borderBottom: '1px solid #f1f5f9'
    }}>
      <td style={tableCellStyle}>{user.nombre}</td>
      <td style={tableCellStyle}>{user.email}</td>
      <td style={tableCellStyle}>{user.area_solicitada || 'No especificada'}</td>
      <td style={tableCellStyle}>Reciente</td>
      <td style={tableCellStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <select
            value={selectedAreaId || ''}
            onChange={(e) => setSelectedAreaId(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            disabled={loading}
          >
            <option value="">Seleccionar área</option>
            {areas.filter(area => area.nombre_area !== 'admin').map(area => (
              <option key={area.id} value={area.id}>
                {area.nombre_area}
              </option>
            ))}
          </select>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleApprove}
              disabled={loading || !selectedAreaId}
              style={{
                padding: '4px 8px',
                backgroundColor: selectedAreaId ? '#22c55e' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: selectedAreaId ? 'pointer' : 'not-allowed'
              }}
            >
              {loading ? 'Aprobando...' : 'Aprobar'}
            </button>
            
            <button
              onClick={handleReject}
              disabled={loading}
              style={{
                padding: '4px 8px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Rechazando...' : 'Rechazar'}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};

// Componente para filas de usuarios aprobados
interface ApprovedUserRowProps {
  user: Usuario;
  areas: Area[];
  getAreaName: (areaId: number | null) => string;
  onEdit: (userId: number, userData: { nombre: string; email: string; password?: string; area_id?: number }) => Promise<void>;
  onDelete: (userId: number) => Promise<void>;
  onGeneratePassword: (userId: number) => Promise<string>;
  isEven: boolean;
  isAdmin: boolean;
}

const ApprovedUserRow: React.FC<ApprovedUserRowProps> = ({
  user,
  areas,
  getAreaName,
  onEdit,
  onDelete,
  onGeneratePassword,
  isEven,
  isAdmin
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editData, setEditData] = React.useState({
    nombre: user.nombre,
    email: user.email,
    area_id: user.area_id || 0,
    newPassword: ''
  });

  const handleEdit = async () => {
    setLoading(true);
    try {
      await onEdit(user.id, {
        nombre: editData.nombre,
        email: editData.email,
        area_id: editData.area_id || undefined,
        password: editData.newPassword || undefined
      });
      setIsEditing(false);
      setEditData({ ...editData, newPassword: '' });
    } catch (error) {
      console.error('Error al editar usuario:', error);
      alert('Error al editar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${user.nombre}?`)) return;
    
    setLoading(true);
    try {
      await onDelete(user.id);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = async () => {
    setLoading(true);
    try {
      const newPassword = await onGeneratePassword(user.id);
      alert(`Nueva contraseña generada: ${newPassword}`);
    } catch (error) {
      console.error('Error al generar contraseña:', error);
      alert('Error al generar contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (isEditing && !isAdmin) {
    return (
      <tr style={{
        backgroundColor: isEven ? '#f8fafc' : 'white',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <td style={tableCellStyle}>
          <input
            type="text"
            value={editData.nombre}
            onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
            style={inputStyle}
          />
        </td>
        <td style={tableCellStyle}>
          <input
            type="email"
            value={editData.email}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            style={inputStyle}
          />
        </td>
        <td style={tableCellStyle}>
          <select
            value={editData.area_id}
            onChange={(e) => setEditData({ ...editData, area_id: Number(e.target.value) })}
            style={inputStyle}
          >
            <option value={0}>Sin área</option>
            {areas.filter(area => area.nombre_area !== 'admin').map(area => (
              <option key={area.id} value={area.id}>
                {area.nombre_area}
              </option>
            ))}
          </select>
        </td>
        <td style={tableCellStyle}>
          <span style={{
            backgroundColor: user.rol === 'admin' ? '#fef3c7' : '#dbeafe',
            color: user.rol === 'admin' ? '#92400e' : '#1e40af',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {user.rol}
          </span>
        </td>
        <td style={tableCellStyle}>Reciente</td>
        <td style={tableCellStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              type="password"
              placeholder="Nueva contraseña (opcional)"
              value={editData.newPassword}
              onChange={(e) => setEditData({ ...editData, newPassword: e.target.value })}
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleEdit}
                disabled={loading}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    nombre: user.nombre,
                    email: user.email,
                    area_id: user.area_id || 0,
                    newPassword: ''
                  });
                }}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{
      backgroundColor: isEven ? '#f8fafc' : 'white',
      borderBottom: '1px solid #f1f5f9'
    }}>
      <td style={tableCellStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {user.nombre}
          {isAdmin && (
            <span style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: '600'
            }}>
              ADMIN
            </span>
          )}
        </div>
      </td>
      <td style={tableCellStyle}>{user.email}</td>
      <td style={tableCellStyle}>{getAreaName(user.area_id)}</td>
      <td style={tableCellStyle}>
        <span style={{
          backgroundColor: user.rol === 'admin' ? '#fef3c7' : '#dbeafe',
          color: user.rol === 'admin' ? '#92400e' : '#1e40af',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {user.rol}
        </span>
      </td>
      <td style={tableCellStyle}>Reciente</td>
      <td style={tableCellStyle}>
        {isAdmin ? (
          <div style={{
            padding: '8px',
            backgroundColor: '#fef3c7',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#92400e',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            🔒 Usuario Protegido
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              style={{
                padding: '4px 8px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Editar
            </button>
            <button
              onClick={handleGeneratePassword}
              disabled={loading}
              style={{
                padding: '4px 8px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Nueva Contraseña
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              style={{
                padding: '4px 8px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Eliminar
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

// Estilos para las tablas
const tableHeaderStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  borderBottom: '1px solid #e5e7eb'
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
  color: '#374151',
  verticalAlign: 'top'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 8px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '12px'
};