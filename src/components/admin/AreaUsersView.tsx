// src/components/admin/AreaUsersView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Usuario, TrimestreEstadistica } from '@/types';
import { Crown, User as UserIcon, ClipboardList, CheckCircle, XCircle, Check, X, Edit2 } from 'lucide-react';

interface AreaUsersViewProps {
  areaId: number;
  areaName: string;
}

interface AreaUser extends Usuario {
  participacion_trimestres?: {
    [key: number]: boolean;
  };
  metas?: {
    [key: number]: string;
  };
  estados_informes?: {
    [key: number]: string;
  };
  calificaciones?: {
    [key: number]: number | null;
  };
  comentarios?: {
    [key: number]: string | null;
  };
}

export const AreaUsersView: React.FC<AreaUsersViewProps> = ({ areaId, areaName }) => {
  const [users, setUsers] = useState<AreaUser[]>([]);
  const [trimestres, setTrimestres] = useState<TrimestreEstadistica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreaData = async () => {
      try {
        setLoading(true);
        
        // Obtener usuarios del área
        const usersResponse = await fetch(`/api/admin/areas/${areaId}/users`);
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }

        // Obtener trimestres disponibles
        const trimestresResponse = await fetch('/api/admin/estadisticas-trimestres');
        if (trimestresResponse.ok) {
          const trimestresData = await trimestresResponse.json();
          // La API devuelve { estadisticas: [...] }, necesitamos solo el array
          setTrimestres(trimestresData.estadisticas || []);
        }
      } catch (error) {
        console.error('Error fetching area data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAreaData();
  }, [areaId]);

  const handleMetaChange = async (userId: number, trimestre: number, meta: string) => {
    try {
      console.log('Enviando meta:', { userId, trimestre, meta, areaId });
      
      const response = await fetch(`/api/admin/areas/${areaId}/users/${userId}/meta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trimestre, meta }),
      });

      const responseData = await response.json();
      console.log('Respuesta de API:', responseData);

      if (response.ok) {
        // Actualizar estado local
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId
              ? {
                  ...user,
                  metas: { ...user.metas, [trimestre]: meta }
                }
              : user
          )
        );
        console.log('Meta actualizada exitosamente');
        toast.success('Meta asignada correctamente', {
          description: `La meta para el trimestre ${trimestre} ha sido guardada.`
        });
      } else {
        console.error('Error en respuesta:', responseData);
        toast.error('Error al asignar meta', {
          description: responseData.error || 'Error desconocido. Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error updating meta:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor al asignar la meta.'
      });
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Cargando datos del área...</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ ...titleStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={24} />
          {areaName}
        </h2>
        <p style={subtitleStyle}>
          Gestión de usuarios y metas trimestrales
        </p>
      </div>

      {users.length === 0 ? (
        <div style={emptyStateStyle}>
          <p>No hay usuarios asignados a esta área</p>
        </div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={headerCellStyle}>Usuario</th>
                <th style={headerCellStyle}>Email</th>
                {Array.isArray(trimestres) && trimestres.map(trimestre => (
                  <th key={trimestre.trimestre} style={headerCellStyle}>
                    T{trimestre.trimestre} {trimestre.año}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={rowStyle}>
                  <td style={cellStyle}>
                    <div style={userInfoStyle}>
                      <strong>{user.nombre}</strong>
                      <span style={{ ...userRoleStyle, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {user.rol === 'admin' ? (
                          <><Crown size={14} /> Admin</>
                        ) : (
                          <><UserIcon size={14} /> Usuario</>
                        )}
                      </span>
                    </div>
                  </td>
                  <td style={cellStyle}>{user.email}</td>
                  {Array.isArray(trimestres) && trimestres.map(trimestre => (
                    <td key={trimestre.trimestre} style={cellStyle}>
                      <TrimestreCell
                        userId={user.id}
                        trimestre={trimestre.trimestre}
                        participando={user.participacion_trimestres?.[trimestre.trimestre] || false}
                        meta={user.metas?.[trimestre.trimestre] || ''}
                        onMetaChange={(meta) => handleMetaChange(user.id, trimestre.trimestre, meta)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

interface TrimestreCellProps {
  userId: number;
  trimestre: number;
  participando: boolean;
  meta: string;
  onMetaChange: (meta: string) => void;
}

const TrimestreCell: React.FC<TrimestreCellProps> = ({
  participando,
  meta,
  onMetaChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localMeta, setLocalMeta] = useState(meta);

  const handleSave = () => {
    onMetaChange(localMeta);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalMeta(meta);
    setIsEditing(false);
  };

  return (
    <div style={trimestreCellStyle}>
      <div style={statusStyle}>
        {participando ? (
          <span style={{ ...participatingStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={14} />
            Participa
          </span>
        ) : (
          <span style={{ ...notParticipatingStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <XCircle size={14} />
            No participa
          </span>
        )}
      </div>
      
      {participando && (
        <div style={metaContainerStyle}>
          {isEditing ? (
            <div style={editingContainerStyle}>
              <textarea
                value={localMeta}
                onChange={(e) => setLocalMeta(e.target.value)}
                style={textareaStyle}
                placeholder="Ingrese la meta..."
              />
              <div style={buttonsStyle}>
                <button onClick={handleSave} style={{ ...saveButtonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={16} />
                </button>
                <button onClick={handleCancel} style={{ ...cancelButtonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div style={metaDisplayStyle}>
              <p style={metaTextStyle}>
                {meta || 'Sin meta asignada'}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                style={{ ...editButtonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Estilos
const containerStyle: React.CSSProperties = {
  padding: '24px'
};

const headerStyle: React.CSSProperties = {
  marginBottom: '24px',
  borderBottom: '2px solid #e9ecef',
  paddingBottom: '16px'
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: '24px',
  fontWeight: '600',
  color: '#343a40'
};

const subtitleStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#6c757d'
};

const loadingStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px',
  color: '#6c757d'
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px',
  color: '#6c757d',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e9ecef'
};

const tableContainerStyle: React.CSSProperties = {
  overflowX: 'auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e9ecef'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse'
};

const headerRowStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa'
};

const headerCellStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#343a40',
  borderBottom: '2px solid #e9ecef'
};

const rowStyle: React.CSSProperties = {
  borderBottom: '1px solid #e9ecef'
};

const cellStyle: React.CSSProperties = {
  padding: '16px',
  verticalAlign: 'top'
};

const userInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const userRoleStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6c757d'
};

const trimestreCellStyle: React.CSSProperties = {
  minWidth: '200px'
};

const statusStyle: React.CSSProperties = {
  marginBottom: '8px'
};

const participatingStyle: React.CSSProperties = {
  color: '#28a745',
  fontSize: '12px',
  fontWeight: '500'
};

const notParticipatingStyle: React.CSSProperties = {
  color: '#dc3545',
  fontSize: '12px',
  fontWeight: '500'
};

const metaContainerStyle: React.CSSProperties = {
  marginTop: '8px'
};

const editingContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '60px',
  padding: '8px',
  border: '1px solid #ced4da',
  borderRadius: '4px',
  fontSize: '12px',
  resize: 'vertical'
};

const buttonsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px'
};

const saveButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

const metaDisplayStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px'
};

const metaTextStyle: React.CSSProperties = {
  margin: '0',
  flex: 1,
  fontSize: '12px',
  color: '#495057',
  lineHeight: '1.4'
};

const editButtonStyle: React.CSSProperties = {
  padding: '2px 6px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '10px'
};