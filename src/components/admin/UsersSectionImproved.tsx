// src/components/admin/UsersSectionImproved.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  createCardStyle, 
  createButtonStyle, 
  createInputStyle,
  stylePresets, 
  colors, 
  spacing,
  borderRadius,
  shadows
} from '@/lib/styleUtils';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UsersModernTable } from '@/components/admin/UsersModernTable';
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

export const UsersSectionImproved: React.FC<UsersSectionProps> = ({
  usuarios,
  areas,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onGeneratePassword,
}) => {
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    email: '',
    password: '',
    area_id: 0
  });
  const [approvalAreaId, setApprovalAreaId] = useState<{[key: number]: number}>({});
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados para verificación de contraseña del admin
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [pendingAdminEdit, setPendingAdminEdit] = useState<Usuario | null>(null);
  
  // Estado para el modal de confirmación
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  // Detectar móvil
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Validar que usuarios sea un array
  const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
  const usuariosPendientes = usuariosArray.filter(u => u.estado === 'pendiente');
  const usuariosAprobados = usuariosArray.filter(u => u.estado === 'activo');
  
  // Validar que areas sea un array
  const areasArray = Array.isArray(areas) ? areas : [];
  
  // Separar admin y otros usuarios, admin siempre primero
  const adminUser = usuariosAprobados.find(u => u.rol === 'admin');
  const regularUsers = usuariosAprobados.filter(u => u.rol !== 'admin');
  const sortedAprobados = adminUser ? [adminUser, ...regularUsers] : regularUsers;

  const getAreaName = (areaId: number | null) => {
    if (!areaId) return 'Sin área';
    const area = areasArray.find(a => a.id === areaId);
    return area ? area.nombre_area : 'Área no encontrada';
  };

  // =============== ESTILOS USANDO EL NUEVO SISTEMA ===============
  
  const containerStyle = {
    ...createCardStyle('base'),
    maxWidth: '1200px',
    margin: '0 auto',
    padding: spacing.md,
  };

  const headerStyle = {
    ...stylePresets.text.heading2,
    color: colors.gray[900],
    marginBottom: spacing.lg,
  };

  const primaryButtonStyle = {
    ...createButtonStyle('primary', 'base'),
    backgroundColor: colors.gray[800],
    color: 'white',
    fontSize: '0.875rem',
    padding: `${spacing.sm} ${spacing.lg}`,
    border: 'none',
    borderRadius: borderRadius.md,
  };
  
  const secondaryButtonStyle = {
    ...createButtonStyle('secondary', 'base'),
    backgroundColor: colors.gray[200],
    color: colors.gray[700],
    fontSize: '0.875rem',
    padding: `${spacing.sm} ${spacing.lg}`,
    border: 'none',
    borderRadius: borderRadius.md,
  };

  const inputStyle = createInputStyle(false, false);

  const tableContainerStyle = {
    ...createCardStyle('base'),
    marginTop: spacing.md,
    maxWidth: '100%',
  };

  const tableWrapperStyle = {
    overflowX: 'auto' as const,
    overflowY: 'visible' as const,
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: isMobile ? '0.75rem' : '0.875rem',
    minWidth: isMobile ? '800px' : '500px',
  };

  const tableHeaderStyle = {
    backgroundColor: colors.gray[100],
    borderBottom: `1px solid ${colors.gray[300]}`,
  };

  const tableHeaderCellStyle = {
    padding: `${spacing.sm} ${spacing.md}`,
    textAlign: 'left' as const,
    fontWeight: '600',
    color: colors.gray[800],
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const tableRowStyle = {
    borderBottom: `1px solid ${colors.gray[200]}`,
    '&:hover': {
      backgroundColor: colors.gray[50],
    }
  };

  const tableCellStyle = {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: '0.8rem',
    color: colors.gray[700],
    verticalAlign: 'top' as const,
    lineHeight: '1.4',
    overflow: 'visible' as const,
  };

  const actionButtonStyle = {
    padding: `${spacing.xs} ${spacing.sm}`,
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    minWidth: '60px',
  };

  const approveButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: colors.gray[800],
    color: 'white',
  };

  const rejectButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: colors.gray[500],
    color: 'white',
  };

  const editButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: colors.gray[700],
    color: 'white',
  };

  const deleteButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: colors.gray[500],
    color: 'white',
  };

  const generateButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: colors.warning,
    color: 'white',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: spacing.xs,
    alignItems: 'center',
    marginTop: spacing.xs,
  };

  const modalOverlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalContentStyle = {
    ...createCardStyle('padded'),
    width: '450px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    overflow: 'auto',
    margin: spacing.md,
  };

  const sectionHeaderStyle = {
    ...stylePresets.text.heading3,
    color: colors.gray[800],
    marginBottom: spacing.md,
  };

  // =============== FUNCIONES DE USUARIO ===============

  const handleEdit = (user: Usuario) => {
    // Si es admin, pedir contraseña primero
    if (user.rol === 'admin') {
      setPendingAdminEdit(user);
      setShowAdminPasswordModal(true);
      setAdminPassword('');
    } else {
      // Usuario normal, editar directamente
      setEditingUser(user);
      setEditForm({
        nombre: user.nombre,
        email: user.email,
        password: '',
        area_id: user.area_id || 0
      });
    }
  };

  const verifyAdminPassword = async () => {
    if (!adminPassword) {
      toast.error('Ingresa la contraseña del administrador');
      return;
    }

    setVerifyingPassword(true);

    try {
      const response = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        toast.error('Contraseña incorrecta');
        setVerifyingPassword(false);
        return;
      }

      // Contraseña correcta, permitir edición
      toast.success('Verificación exitosa');
      setShowAdminPasswordModal(false);
      setAdminPassword('');
      
      if (pendingAdminEdit) {
        setEditingUser(pendingAdminEdit);
        setEditForm({
          nombre: pendingAdminEdit.nombre,
          email: pendingAdminEdit.email,
          password: '',
          area_id: pendingAdminEdit.area_id || 0
        });
        setPendingAdminEdit(null);
      }
    } catch (error) {
      toast.error('Error al verificar contraseña');
      console.error(error);
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editingUser) {
      const updateData: { nombre: string; email: string; password?: string; area_id?: number } = {
        nombre: editForm.nombre,
        email: editForm.email,
        area_id: editForm.area_id || undefined
      };
      
      if (editForm.password) {
        updateData.password = editForm.password;
      }
      
      try {
        await onEdit(editingUser.id, updateData);
        toast.success('¡Usuario actualizado!', {
          description: `Los datos de ${editForm.nombre} se guardaron correctamente.`
        });
        setEditingUser(null);
        setEditForm({ nombre: '', email: '', password: '', area_id: 0 });
      } catch (error) {
        toast.error('Error al actualizar usuario', {
          description: error instanceof Error ? error.message : 'Intenta nuevamente.'
        });
      }
    }
  };

  const handleApprove = async (userId: number) => {
    const areaId = approvalAreaId[userId];
    if (!areaId || areaId === 0) {
      toast.warning('Selecciona un área', {
        description: 'Debes asignar un área antes de aprobar al usuario.'
      });
      return;
    }
    try {
      await onApprove(userId, areaId);
      const user = usuarios.find(u => u.id === userId);
      toast.success('¡Usuario aprobado!', {
        description: `${user?.nombre || 'El usuario'} ha sido aprobado y notificado.`
      });
      setApprovalAreaId(prev => ({ ...prev, [userId]: 0 }));
    } catch (error) {
      toast.error('Error al aprobar usuario', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.'
      });
    }
  };

  const handleReject = async (userId: number) => {
    const user = usuarios.find(u => u.id === userId);
    
    setConfirmDialog({
      isOpen: true,
      title: 'Rechazar Solicitud',
      message: `¿Estás seguro de que quieres rechazar la solicitud de ${user?.nombre}?`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await onReject(userId);
          toast.success('Solicitud rechazada', {
            description: `${user?.nombre} ha sido notificado del rechazo.`
          });
        } catch (error) {
          toast.error('Error al rechazar usuario', {
            description: error instanceof Error ? error.message : 'Intenta nuevamente.'
          });
        }
      }
    });
  };

  const handleDelete = async (userId: number) => {
    const user = usuarios.find(u => u.id === userId);
    
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Usuario',
      message: `¿Eliminar a ${user?.nombre}? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await onDelete(userId);
          toast.success('Usuario eliminado', {
            description: `${user?.nombre} ha sido eliminado del sistema.`
          });
        } catch (error) {
          toast.error('Error al eliminar usuario', {
            description: error instanceof Error ? error.message : 'Intenta nuevamente.'
          });
        }
      }
    });
  };

  const handleGeneratePassword = async (userId: number) => {
    try {
      const password = await onGeneratePassword(userId);
      setGeneratedPassword(password);
      toast.success('¡Contraseña generada!', {
        description: `Nueva contraseña: ${password} (cópiala ahora, se ocultará en 3 segundos)`
      });
      setTimeout(() => setGeneratedPassword(''), 3000);
    } catch (error) {
      toast.error('Error al generar contraseña', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.'
      });
    }
  };

  // =============== RENDER ===============

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Gestión de Usuarios</h2>
      
      {/* Usuarios Pendientes */}
      <div style={{ marginBottom: spacing.xl }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: colors.gray[900],
          marginBottom: spacing.md
        }}>
          Usuarios Pendientes de Aprobación ({usuariosPendientes.length})
        </h3>
        
        {usuariosPendientes.length === 0 ? (
          <div style={{
            ...createCardStyle('padded'),
            textAlign: 'center',
            color: colors.gray[500]
          }}>
            No hay usuarios pendientes de aprobación
          </div>
        ) : (
          <UsersModernTable
            usuarios={usuariosPendientes}
            areas={areasArray}
            onEdit={() => {}}
            onDelete={() => {}}
            onApprove={(userId) => handleApprove(userId)}
            onReject={handleReject}
            onGeneratePassword={async () => {}}
            getAreaName={getAreaName}
            isPending={true}
          />
        )}
      </div>

      {/* Usuarios Aprobados */}
      <div>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: colors.gray[900],
          marginBottom: spacing.md
        }}>
          Usuarios Activos ({usuariosAprobados.length})
        </h3>
        
        {usuariosAprobados.length === 0 ? (
          <div style={{
            ...createCardStyle('padded'),
            textAlign: 'center',
            color: colors.gray[500]
          }}>
            No hay usuarios activos
          </div>
        ) : (
          <UsersModernTable
            usuarios={sortedAprobados}
            areas={areasArray}
            onEdit={(user) => {
              setEditingUser(user);
              setEditForm({
                nombre: user.nombre,
                email: user.email,
                password: '',
                area_id: user.area_id || 0
              });
            }}
            onDelete={handleDelete}
            onApprove={() => {}}
            onReject={() => {}}
            onGeneratePassword={handleGeneratePassword}
            getAreaName={getAreaName}
            isPending={false}
          />
        )}
      </div>

      {/* Modal de edición */}
      {editingUser && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={stylePresets.text.heading3}>Editar Usuario</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <input
                type="text"
                placeholder="Nombre completo"
                value={editForm.nombre}
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                required
                style={{ ...inputStyle, marginBottom: spacing.md }}
              />
              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
                style={{ ...inputStyle, marginBottom: spacing.md }}
              />
              <input
                type="password"
                placeholder="Nueva contraseña (opcional)"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                style={{ ...inputStyle, marginBottom: editingUser.rol === 'admin' ? spacing.lg : spacing.md }}
              />
              
              {/* Solo mostrar selector de área si NO es admin */}
              {editingUser.rol !== 'admin' && (
                <SearchableSelect
                  options={[
                    { value: 0, label: 'Sin área asignada' },
                    ...areasArray.map(area => ({
                      value: area.id,
                      label: area.nombre_area
                    }))
                  ]}
                  value={editForm.area_id}
                  onChange={(areaId) => setEditForm({ ...editForm, area_id: areaId })}
                  placeholder="Seleccionar área"
                  style={{ marginBottom: spacing.lg }}
                />
              )}
              
              <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={secondaryButtonStyle}
                >
                  Cancelar
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notificación de contraseña generada */}
      {generatedPassword && (
        <div style={{
          position: 'fixed',
          top: spacing.lg,
          right: spacing.lg,
          backgroundColor: colors.success,
          color: 'white',
          padding: spacing.md,
          borderRadius: borderRadius.md,
          boxShadow: shadows.lg,
          zIndex: 1001,
        }}>
          <div style={{ fontWeight: '600', marginBottom: spacing.xs }}>
            Nueva contraseña generada:
          </div>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '1.1rem',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: spacing.xs,
            borderRadius: borderRadius.sm,
          }}>
            {generatedPassword}
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: spacing.xs, opacity: 0.9 }}>
            Cópiala ahora, desaparecerá en 3 segundos
          </div>
        </div>
      )}

      {/* Modal de verificación de contraseña del admin */}
      {showAdminPasswordModal && (
        <div style={modalOverlayStyle}>
          <div style={{
            ...modalContentStyle,
            maxWidth: '400px'
          }}>
            <h3 style={{
              ...stylePresets.text.heading3,
              marginBottom: spacing.sm
            }}>
              🔒 Verificación de Seguridad
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: colors.gray[600],
              marginBottom: spacing.lg
            }}>
              Ingresa tu contraseña de administrador para continuar
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              verifyAdminPassword();
            }}>
              <input
                type="password"
                placeholder="Contraseña de administrador"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                disabled={verifyingPassword}
                autoFocus
                style={{
                  ...inputStyle,
                  marginBottom: spacing.lg
                }}
              />
              <div style={{
                display: 'flex',
                gap: spacing.sm,
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPasswordModal(false);
                    setAdminPassword('');
                    setPendingAdminEdit(null);
                  }}
                  disabled={verifyingPassword}
                  style={secondaryButtonStyle}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={verifyingPassword || !adminPassword}
                  style={{
                    ...primaryButtonStyle,
                    opacity: verifyingPassword || !adminPassword ? 0.6 : 1,
                    cursor: verifyingPassword || !adminPassword ? 'not-allowed' : 'pointer'
                  }}
                >
                  {verifyingPassword ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};