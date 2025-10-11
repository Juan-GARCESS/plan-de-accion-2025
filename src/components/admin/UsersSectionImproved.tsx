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
import type { Usuario, Area } from '@/types';

interface UsersSectionProps {
  usuarios: Usuario[];
  areas: Area[];
  onEdit: (userId: number, userData: { nombre: string; email: string; password?: string; area_id?: number }) => Promise<void>;
  onDelete: (userId: number) => Promise<void>;
  onGeneratePassword: (userId: number) => Promise<string>;
}

export const UsersSectionImproved: React.FC<UsersSectionProps> = ({
  usuarios,
  areas,
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
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  
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
    overflowX: 'visible' as const,
    overflowY: 'visible' as const,
    marginTop: spacing.md,
    maxWidth: '100%',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.875rem',
    minWidth: '500px',
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
    setEditingUser(user);
    setEditForm({
      nombre: user.nombre,
      email: user.email,
      password: '',
      area_id: user.area_id || 0
    });
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

  const handleDelete = async (userId: number) => {
    const user = usuarios.find(u => u.id === userId);
    if (!confirm(`¿Eliminar a ${user?.nombre}? Esta acción no se puede deshacer.`)) return;
    
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

      {/* Usuarios Aprobados */}
      <div>
        <h3 style={sectionHeaderStyle}>
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
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={tableHeaderCellStyle}>Usuario</th>
                  <th style={tableHeaderCellStyle}>Email</th>
                  <th style={tableHeaderCellStyle}>Área</th>
                  <th style={tableHeaderCellStyle}>Rol</th>
                  <th style={tableHeaderCellStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedAprobados.map((usuario) => (
                  <tr key={usuario.id} style={tableRowStyle}>
                    <td style={tableCellStyle}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: usuario.rol === 'admin' ? colors.warning : colors.gray[900] 
                      }}>
                        {usuario.nombre}
                        {usuario.rol === 'admin' && (
                          <span style={{ 
                            fontSize: '0.7rem', 
                            color: colors.warning,
                            marginLeft: spacing.xs 
                          }}>
                            (Admin)
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ color: colors.gray[600] }}>
                        {usuario.email}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ ...stylePresets.text.small, color: colors.gray[600] }}>
                        {getAreaName(usuario.area_id)}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: `${spacing.xs} ${spacing.sm}`,
                        borderRadius: borderRadius.sm,
                        fontSize: '0.7rem',
                        fontWeight: '500',
                        backgroundColor: usuario.rol === 'admin' ? colors.warning : colors.gray[200],
                        color: usuario.rol === 'admin' ? 'white' : colors.gray[700],
                      }}>
                        {usuario.rol === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={buttonGroupStyle}>
                        {usuario.rol !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleEdit(usuario)}
                              style={editButtonStyle}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleGeneratePassword(usuario.id)}
                              style={generateButtonStyle}
                            >
                              Nueva Clave
                            </button>
                            <button
                              onClick={() => handleDelete(usuario.id)}
                              style={deleteButtonStyle}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                        {usuario.rol === 'admin' && (
                          <span style={{
                            padding: `${spacing.xs} ${spacing.sm}`,
                            fontSize: '0.7rem',
                            color: colors.gray[500],
                            fontStyle: 'italic'
                          }}>
                            Protegido
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                style={{ ...inputStyle, marginBottom: spacing.md }}
              />
              <SearchableSelect
                options={[
                  { value: 0, label: 'Sin área asignada' },
                  ...areas.map(area => ({
                    value: area.id,
                    label: area.nombre_area
                  }))
                ]}
                value={editForm.area_id}
                onChange={(areaId) => setEditForm({ ...editForm, area_id: areaId })}
                placeholder="Seleccionar área"
                style={{ marginBottom: spacing.lg }}
              />
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
    </div>
  );
};