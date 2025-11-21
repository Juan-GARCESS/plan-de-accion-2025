// src/components/admin/PendingUsersCard.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import type { Usuario, Area } from '@/types';
import { colors, spacing, borderRadius } from '@/lib/styleUtils';
import { AlertTriangle, Loader2, Check, X } from 'lucide-react';

interface PendingUsersCardProps {
  usuarios: Usuario[];
  areas: Area[];
  onApprove: (userId: number, areaId: number) => Promise<void>;
  onReject: (userId: number, motivo?: string) => Promise<void>;
}

export const PendingUsersCard: React.FC<PendingUsersCardProps> = ({
  usuarios,
  areas,
  onApprove,
  onReject
}) => {
  const [selectedAreas, setSelectedAreas] = useState<{ [key: number]: number }>({});
  const [loadingUser, setLoadingUser] = useState<number | null>(null);
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

  const usuariosPendientes = usuarios.filter(u => u.estado === 'pendiente');

  const handleApprove = async (usuario: Usuario) => {
    const areaId = selectedAreas[usuario.id];
    
    if (!areaId || areaId === 0) {
      toast.warning('Asigna un área primero', {
        description: 'Debes seleccionar un área antes de aprobar al usuario.'
      });
      return;
    }

    setLoadingUser(usuario.id);
    try {
      await onApprove(usuario.id, areaId);
      toast.success('¡Usuario aprobado! 🎉', {
        description: `${usuario.nombre} ha recibido un email de bienvenida.`,
        duration: 4000
      });
      setSelectedAreas(prev => {
        const newState = { ...prev };
        delete newState[usuario.id];
        return newState;
      });
    } catch (error) {
      toast.error('Error al aprobar', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.'
      });
    } finally {
      setLoadingUser(null);
    }
  };

  const handleReject = async (usuario: Usuario) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Rechazar Solicitud',
      message: `¿Estás seguro de rechazar la solicitud de ${usuario.nombre}? Se le enviará un correo de notificación.`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setLoadingUser(usuario.id);
        try {
          await onReject(usuario.id);
          toast.success('Solicitud rechazada', {
            description: `${usuario.nombre} ha sido notificado por email.`
          });
        } catch (error) {
          toast.error('Error al rechazar', {
            description: error instanceof Error ? error.message : 'Intenta nuevamente.'
          });
        } finally {
          setLoadingUser(null);
        }
      }
    });
  };

  if (usuariosPendientes.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      border: '2px solid #fbbf24',
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.xl
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md
      }}>
        <AlertTriangle size={24} color="#f59e0b" />
        <h3 style={{
          margin: 0,
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#92400e'
        }}>
          Usuarios Pendientes de Aprobación ({usuariosPendientes.length})
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: spacing.md
      }}>
        {usuariosPendientes.map(usuario => {
          const isLoading = loadingUser === usuario.id;
          const areaSeleccionada = selectedAreas[usuario.id];

          return (
            <div
              key={usuario.id}
              style={{
                backgroundColor: 'white',
                borderRadius: borderRadius.md,
                padding: spacing.md,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                opacity: isLoading ? 0.6 : 1,
                pointerEvents: isLoading ? 'none' : 'auto',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ marginBottom: spacing.md }}>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: colors.gray[900],
                  marginBottom: spacing.xs
                }}>
                  {usuario.nombre}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: colors.gray[600],
                  marginBottom: spacing.xs
                }}>
                  {usuario.email}
                </div>
                {usuario.area_solicitada && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: colors.gray[500],
                    backgroundColor: colors.gray[100],
                    padding: `${spacing.xs} ${spacing.sm}`,
                    borderRadius: borderRadius.sm,
                    display: 'inline-block',
                    marginTop: spacing.xs
                  }}>
                    Área solicitada: {usuario.area_solicitada}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: spacing.md }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: colors.gray[700],
                  marginBottom: spacing.xs,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Asignar Área *
                </label>
                <SearchableSelect
                  options={areas.map(a => ({
                    value: a.id,
                    label: a.nombre_area
                  }))}
                  value={areaSeleccionada || 0}
                  onChange={(value) => setSelectedAreas(prev => ({
                    ...prev,
                    [usuario.id]: value
                  }))}
                  placeholder="Selecciona un área..."
                />
              </div>

              <div style={{
                display: 'flex',
                gap: spacing.sm
              }}>
                <button
                  onClick={() => handleApprove(usuario)}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: `${spacing.sm} ${spacing.md}`,
                    backgroundColor: colors.success,
                    color: 'white',
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: (areaSeleccionada && !isLoading) ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (areaSeleccionada && !isLoading) {
                      e.currentTarget.style.backgroundColor = '#059669';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.success;
                  }}
                >
                  {isLoading ? <Loader2 size={14} style={{ display: 'inline', marginRight: 4 }} className="animate-spin" /> : <Check size={14} style={{ display: 'inline', marginRight: 4 }} />}
                  Aprobar
                </button>

                <button
                  onClick={() => handleReject(usuario)}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: `${spacing.sm} ${spacing.md}`,
                    backgroundColor: colors.gray[500],
                    color: 'white',
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.gray[500];
                  }}
                >
                  {isLoading ? <Loader2 size={14} style={{ display: 'inline', marginRight: 4 }} className="animate-spin" /> : <X size={14} style={{ display: 'inline', marginRight: 4 }} />}
                  Rechazar
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        type={confirmDialog.type}
        confirmText="Rechazar"
        cancelText="Cancelar"
      />
    </div>
  );
};
