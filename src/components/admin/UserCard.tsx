// src/components/admin/UserCard.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useResponsive } from '@/hooks/useResponsive';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { styles, combineStyles } from '@/styles/components';
import type { Usuario, Area } from '@/types';
import { Key, Trash2 } from 'lucide-react';

interface UserCardProps {
  user: Usuario;
  areas: Area[];
  onApprove: (userId: number, areaId: number) => Promise<void>;
  onReject: (userId: number) => Promise<void>;
  onEdit: (user: Usuario) => void;
  onDelete: (userId: number) => Promise<void>;
  onGeneratePassword: (userId: number) => Promise<string>;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  areas,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onGeneratePassword,
}) => {
  const { isMobile } = useResponsive();
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const handleApprove = async () => {
    if (!selectedAreaId) return;
    setLoading(true);
    try {
      await onApprove(user.id, selectedAreaId);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject(user.id);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de eliminar a ${user.nombre}? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setLoading(true);
        try {
          await onDelete(user.id);
          toast.success('Usuario eliminado exitosamente');
        } catch (error) {
          toast.error('Error al eliminar usuario');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleGeneratePassword = async () => {
    setLoading(true);
    try {
      const newPassword = await onGeneratePassword(user.id);
      setTempPassword(newPassword);
      setShowPassword(true);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = combineStyles(
    styles.card,
    styles.cardPadding(isMobile),
    { display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }
  );

  return (
    <div style={cardStyle}>
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          <UserAvatar user={user} />
          <div style={{ marginLeft: '0.75rem' }}>
            <p style={{
              fontWeight: '600',
              color: '#111827',
              fontSize: '1rem',
              margin: 0
            }}>
              {user.nombre}
            </p>
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              margin: 0
            }}>
              {user.email}
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <p style={{
            color: '#374151',
            fontSize: '0.875rem',
            margin: 0,
            fontWeight: '500'
          }}>
            Área solicitada: <span style={{ color: '#111827', fontWeight: '600' }}>
              {user.area_solicitada || "N/A"}
            </span>
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {user.estado === 'pendiente' && (
          <>
            <select
              style={styles.input.base}
              value={selectedAreaId || ''}
              onChange={(e) => setSelectedAreaId(Number(e.target.value))}
            >
              <option value="">Seleccionar área</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre_area}
                </option>
              ))}
            </select>

            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                style={combineStyles(
                  styles.button.base,
                  styles.button.primary,
                  { flex: 1 },
                  (!selectedAreaId || loading) ? { opacity: 0.5 } : {}
                )}
                onClick={handleApprove}
                disabled={!selectedAreaId || loading}
              >
                ✓ Aprobar
              </button>
              <button
                style={combineStyles(
                  styles.button.base,
                  styles.button.danger,
                  { flex: 1 },
                  loading ? { opacity: 0.5 } : {}
                )}
                onClick={handleReject}
                disabled={loading}
              >
                ✗ Rechazar
              </button>
            </div>
          </>
        )}

        {user.estado === 'aprobado' && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <button
              style={combineStyles(
                styles.button.base,
                styles.button.primary,
                { flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }
              )}
              onClick={() => onEdit(user)}
            >
              ✏️ Editar
            </button>
            <button
              onClick={handleGeneratePassword}
              disabled={loading}
              style={{
                ...combineStyles(
                  styles.button.base,
                  styles.button.secondary,
                  { flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }
                ),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem'
              }}
            >
              <Key size={14} /> Nueva Clave
            </button>
            <button
              style={{
                ...combineStyles(
                  styles.button.base,
                  styles.button.danger,
                  { flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }
                ),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem'
              }}
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        )}

        {showPassword && tempPassword && (
          <div style={{
            backgroundColor: '#dcfce7',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #22c55e'
          }}>
            <p style={{
              margin: '0 0 0.5rem 0',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#166534'
            }}>
              Nueva contraseña:
            </p>
            <code style={{
              backgroundColor: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              color: '#111827'
            }}>
              {tempPassword}
            </code>
          </div>
        )}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        type={confirmDialog.type}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};