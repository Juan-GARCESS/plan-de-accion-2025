// src/components/admin/AreasManagementSectionImproved.tsx
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
  borderRadius
} from '@/lib/styleUtils';
import type { Area } from '@/types';

interface AreasManagementSectionProps {
  areas: Area[];
  onCreate: (data: { nombre: string; descripcion: string }) => Promise<void>;
  onEdit: (areaId: number, data: { nombre: string; descripcion: string }) => Promise<void>;
  onDelete: (areaId: number) => Promise<void>;
}

export const AreasManagementSectionImproved: React.FC<AreasManagementSectionProps> = ({
  areas,
  onCreate,
  onEdit,
  onDelete,
}) => {
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ nombre: '', descripcion: '' });
  const [editForm, setEditForm] = useState({ nombre: '', descripcion: '' });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    overflow: 'auto',
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

  // =============== FUNCIONES DE ÁREA ===============

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreate(createForm);
      toast.success('¡Área creada exitosamente!', {
        description: `${createForm.nombre} ha sido agregada al sistema.`
      });
      setCreateForm({ nombre: '', descripcion: '' });
      setShowCreateForm(false);
    } catch (error) {
      toast.error('Error al crear área', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.'
      });
    }
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setEditForm({
      nombre: area.nombre_area,
      descripcion: area.descripcion || ''
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArea) return;
    try {
      await onEdit(editingArea.id, editForm);
      toast.success('¡Área actualizada!', {
        description: `Los cambios en ${editForm.nombre} se guardaron correctamente.`
      });
      setEditingArea(null);
      setEditForm({ nombre: '', descripcion: '' });
    } catch (error) {
      toast.error('Error al actualizar área', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.'
      });
    }
  };

  const handleDelete = async (areaId: number) => {
    const area = areas.find(a => a.id === areaId);
    if (!confirm(`¿Estás seguro de que quieres eliminar "${area?.nombre_area}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await onDelete(areaId);
      toast.success('Área eliminada', {
        description: 'El área ha sido eliminada del sistema.'
      });
    } catch (error) {
      toast.error('Error al eliminar área', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.'
      });
    }
  };

  // =============== RENDER ===============

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Gestión de Áreas</h2>
      
      {/* Botón crear área */}
      <div style={{ marginBottom: spacing.lg }}>
        <button
          onClick={() => setShowCreateForm(true)}
          style={primaryButtonStyle}
        >
          + Crear Área
        </button>
      </div>

      {/* Tabla de áreas */}
      <div style={tableContainerStyle}>
        {isMobile && areas.length > 0 && (
          <div style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#fffbeb',
            borderBottom: '1px solid #fef3c7',
            fontSize: '12px',
            color: '#92400e',
            textAlign: 'center',
            marginBottom: '0.5rem'
          }}>
            👈 Desliza para ver más columnas
          </div>
        )}
        <table style={tableStyle}>
          <thead style={tableHeaderStyle}>
            <tr>
              <th style={tableHeaderCellStyle}>Nombre del Área</th>
              <th style={tableHeaderCellStyle}>Descripción</th>
              <th style={tableHeaderCellStyle}>Fecha Creación</th>
              <th style={tableHeaderCellStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {areas.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ ...tableCellStyle, textAlign: 'center', padding: spacing.xl }}>
                  <div style={stylePresets.text.muted}>No hay áreas creadas</div>
                </td>
              </tr>
            ) : (
              areas.map((area) => (
                <tr key={area.id} style={tableRowStyle}>
                  <td style={tableCellStyle}>
                    <div style={{ fontWeight: '600', color: colors.gray[900] }}>
                      {area.nombre_area}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ ...stylePresets.text.muted, fontSize: '0.75rem' }}>
                      {area.descripcion || 'Sin descripción'}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ ...stylePresets.text.small, color: colors.gray[500] }}>
                      {new Date().toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                      })}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={buttonGroupStyle}>
                      <button
                        onClick={() => handleEdit(area)}
                        style={editButtonStyle}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(area.id)}
                        style={deleteButtonStyle}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para crear área */}
      {showCreateForm && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={stylePresets.text.heading3}>Crear Nueva Área</h3>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Nombre del área"
                value={createForm.nombre}
                onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                required
                style={{ ...inputStyle, marginBottom: spacing.md }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={createForm.descripcion}
                onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
                style={{ 
                  ...inputStyle, 
                  marginBottom: spacing.lg, 
                  minHeight: '80px',
                  resize: 'vertical' as const 
                }}
              />
              <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={secondaryButtonStyle}
                >
                  Cancelar
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar área */}
      {editingArea && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={stylePresets.text.heading3}>Editar Área</h3>
            <form onSubmit={handleSaveEdit}>
              <input
                type="text"
                placeholder="Nombre del área"
                value={editForm.nombre}
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                required
                style={{ ...inputStyle, marginBottom: spacing.md }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={editForm.descripcion}
                onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                style={{ 
                  ...inputStyle, 
                  marginBottom: spacing.lg, 
                  minHeight: '80px',
                  resize: 'vertical' as const 
                }}
              />
              <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingArea(null)}
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
    </div>
  );
};