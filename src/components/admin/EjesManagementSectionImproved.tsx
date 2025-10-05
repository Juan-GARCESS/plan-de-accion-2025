// Componente mejorado para gestionar Ejes y Sub-ejes
'use client';

import { useState, useEffect } from 'react';
import { 
  createCardStyle, 
  createButtonStyle, 
  createInputStyle,
  stylePresets, 
  colors, 
  spacing,
  borderRadius
} from '@/lib/styleUtils';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface Eje {
  id: number;
  nombre_eje: string;
  descripcion: string;
  fecha_creacion: string;
  total_sub_ejes: number;
}

interface SubEje {
  id: number;
  nombre_sub_eje: string;
  descripcion: string;
  fecha_creacion: string;
  nombre_eje: string;
  eje_id: number;
}

interface Area {
  id: number;
  nombre_area: string;
}

interface AreaEje {
  id: number;
  area_id: number;
  eje_id: number;
  nombre_area: string;
  nombre_eje: string;
  eje_descripcion: string;
  fecha_asignacion: string;
}

export function EjesManagementSectionImproved() {
  const [ejes, setEjes] = useState<Eje[]>([]);
  const [subEjes, setSubEjes] = useState<SubEje[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [asignaciones, setAsignaciones] = useState<AreaEje[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ejes' | 'asignaciones'>('ejes');

  // Estados para formularios
  const [showEjeForm, setShowEjeForm] = useState(false);
  const [showSubEjeForm, setShowSubEjeForm] = useState(false);
  const [showAsignacionForm, setShowAsignacionForm] = useState(false);
  const [showEditEjeForm, setShowEditEjeForm] = useState(false);
  const [showEditSubEjeForm, setShowEditSubEjeForm] = useState(false);
  
  const [ejeForm, setEjeForm] = useState({ nombre_eje: '', descripcion: '' });
  const [subEjeForm, setSubEjeForm] = useState({ eje_id: 0, nombre_sub_eje: '', descripcion: '' });
  const [asignacionForm, setAsignacionForm] = useState({ area_id: 0, eje_id: 0 });
  const [editEjeForm, setEditEjeForm] = useState({ id: 0, nombre_eje: '', descripcion: '' });
  const [editSubEjeForm, setEditSubEjeForm] = useState({ id: 0, eje_id: 0, nombre_sub_eje: '', descripcion: '' });

  // Cargar datos iniciales
  useEffect(() => {
    cargarEjes();
    cargarTodosLosSubEjes();
    cargarAreas();
    if (activeTab === 'asignaciones') {
      cargarAsignaciones();
    }
  }, [activeTab]);

  // =============== FUNCIONES DE CARGA DE DATOS ===============

  const cargarTodosLosSubEjes = async () => {
    try {
      const response = await fetch('/api/admin/sub-ejes/todos');
      if (response.ok) {
        const data = await response.json();
        setSubEjes(data);
      }
    } catch (error) {
      console.error('Error cargando todos los sub-ejes:', error);
    }
  };

  const cargarEjes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ejes');
      if (response.ok) {
        const data = await response.json();
        setEjes(data);
      }
    } catch (error) {
      console.error('Error cargando ejes:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarAreas = async () => {
    try {
      const response = await fetch('/api/admin/areas');
      if (response.ok) {
        const data = await response.json();
        setAreas(data);
      }
    } catch (error) {
      console.error('Error cargando áreas:', error);
    }
  };

  const cargarAsignaciones = async () => {
    try {
      const response = await fetch('/api/admin/area-ejes');
      if (response.ok) {
        const data = await response.json();
        setAsignaciones(data);
      }
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
    }
  };

  // =============== FUNCIONES CRUD EJES ===============

  const crearEje = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/ejes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ejeForm)
      });

      if (response.ok) {
        setEjeForm({ nombre_eje: '', descripcion: '' });
        setShowEjeForm(false);
        cargarEjes();
        cargarTodosLosSubEjes();
        alert('Eje creado exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creando eje:', error);
      alert('Error al crear el eje');
    }
  };

  const editarEje = (eje: Eje) => {
    setEditEjeForm({
      id: eje.id,
      nombre_eje: eje.nombre_eje,
      descripcion: eje.descripcion || ''
    });
    setShowEditEjeForm(true);
  };

  const actualizarEje = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/ejes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEjeForm)
      });

      if (response.ok) {
        setShowEditEjeForm(false);
        setEditEjeForm({ id: 0, nombre_eje: '', descripcion: '' });
        cargarEjes();
        cargarTodosLosSubEjes();
        alert('Eje actualizado exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error actualizando eje:', error);
      alert('Error al actualizar el eje');
    }
  };

  const eliminarEje = async (ejeId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este eje? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ejes?id=${ejeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        cargarEjes();
        cargarTodosLosSubEjes();
        alert('Eje eliminado exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error eliminando eje:', error);
      alert('Error al eliminar el eje');
    }
  };

  // =============== FUNCIONES CRUD SUB-EJES ===============

  const crearSubEje = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subEjeForm.eje_id || subEjeForm.eje_id === 0) {
      alert('Por favor selecciona un eje');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/sub-ejes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subEjeForm)
      });
      
      if (response.ok) {
        setSubEjeForm({ eje_id: 0, nombre_sub_eje: '', descripcion: '' });
        setShowSubEjeForm(false);
        cargarEjes();
        cargarTodosLosSubEjes();
        alert('Sub-eje creado exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creando sub-eje:', error);
      alert('Error al crear el sub-eje');
    }
  };

  const editarSubEje = (subEje: SubEje) => {
    setEditSubEjeForm({
      id: subEje.id,
      eje_id: subEje.eje_id,
      nombre_sub_eje: subEje.nombre_sub_eje,
      descripcion: subEje.descripcion || ''
    });
    setShowEditSubEjeForm(true);
  };

  const actualizarSubEje = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/sub-ejes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSubEjeForm)
      });

      if (response.ok) {
        setShowEditSubEjeForm(false);
        setEditSubEjeForm({ id: 0, eje_id: 0, nombre_sub_eje: '', descripcion: '' });
        cargarEjes();
        cargarTodosLosSubEjes();
        alert('Sub-eje actualizado exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error actualizando sub-eje:', error);
      alert('Error al actualizar el sub-eje');
    }
  };

  const eliminarSubEje = async (subEjeId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este sub-eje? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/sub-ejes?id=${subEjeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        cargarEjes();
        cargarTodosLosSubEjes();
        alert('Sub-eje eliminado exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error eliminando sub-eje:', error);
      alert('Error al eliminar el sub-eje');
    }
  };

  // =============== FUNCIONES DE ASIGNACIÓN ===============

  const asignarEjeArea = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asignacionForm.area_id || asignacionForm.area_id === 0) {
      alert('Por favor selecciona un área');
      return;
    }
    
    if (!asignacionForm.eje_id || asignacionForm.eje_id === 0) {
      alert('Por favor selecciona un eje');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/area-ejes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asignacionForm)
      });

      if (response.ok) {
        setAsignacionForm({ area_id: 0, eje_id: 0 });
        setShowAsignacionForm(false);
        cargarAsignaciones();
        alert('Eje asignado exitosamente al área');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error asignando eje:', error);
      alert('Error al asignar el eje');
    }
  };

  const desasignarEjeArea = async (areaId: number, ejeId: number) => {
    if (!confirm('¿Estás seguro de que quieres desasignar este eje del área?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/area-ejes?area_id=${areaId}&eje_id=${ejeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        cargarAsignaciones();
        alert('Eje desasignado exitosamente del área');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error desasignando eje:', error);
      alert('Error al desasignar el eje');
    }
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
  
  const tabButtonStyle = (isActive: boolean) => ({
    ...createButtonStyle(isActive ? 'primary' : 'secondary', 'base'),
    marginRight: spacing.sm,
    fontSize: '0.875rem',
    padding: `${spacing.sm} ${spacing.lg}`,
    backgroundColor: isActive ? colors.gray[800] : colors.gray[200],
    color: isActive ? 'white' : colors.gray[700],
    border: 'none',
    borderRadius: borderRadius.md,
  });

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
    minWidth: '600px',
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

  const buttonGroupStyle = {
    display: 'flex',
    gap: spacing.xs,
    alignItems: 'center',
    marginTop: spacing.xs,
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
    '&:hover': {
      backgroundColor: colors.gray[800],
    }
  };

  const deleteButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: colors.gray[500],
    color: 'white',
    '&:hover': {
      backgroundColor: colors.gray[600],
    }
  };

  // =============== RENDER ===============

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Gestión de Ejes y Sub-ejes</h2>
      
      {/* Tabs */}
      <div style={{ marginBottom: spacing.lg }}>
        <button
          onClick={() => setActiveTab('ejes')}
          style={tabButtonStyle(activeTab === 'ejes')}
        >
          Gestionar Ejes y Sub-ejes
        </button>
        <button
          onClick={() => setActiveTab('asignaciones')}
          style={tabButtonStyle(activeTab === 'asignaciones')}
        >
          Asignar Ejes a Áreas
        </button>
      </div>

      {/* Tab Content: Gestión de Ejes */}
      {activeTab === 'ejes' && (
        <div>
          {/* Botones de crear */}
          <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.lg }}>
            <button
              onClick={() => setShowEjeForm(true)}
              style={primaryButtonStyle}
            >
              + Crear Eje
            </button>
            <button
              onClick={() => setShowSubEjeForm(true)}
              style={primaryButtonStyle}
            >
              + Crear Sub-eje
            </button>
          </div>

          {/* Tabla mejorada */}
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={tableHeaderCellStyle}>Eje</th>
                  <th style={tableHeaderCellStyle}>Sub-eje</th>
                  <th style={tableHeaderCellStyle}>Descripción</th>
                  <th style={tableHeaderCellStyle}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ ...tableCellStyle, textAlign: 'center', padding: spacing.xl }}>
                      <div style={stylePresets.text.muted}>Cargando...</div>
                    </td>
                  </tr>
                ) : ejes.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...tableCellStyle, textAlign: 'center', padding: spacing.xl }}>
                      <div style={stylePresets.text.muted}>No hay ejes creados</div>
                    </td>
                  </tr>
                ) : (
                  ejes.map((eje) => {
                    const ejeSubEjes = subEjes.filter(se => se.eje_id === eje.id);
                    
                    if (ejeSubEjes.length > 0) {
                      return ejeSubEjes.map((subEje, index) => (
                        <tr key={`${eje.id}-${subEje.id}`} style={tableRowStyle}>
                          <td style={tableCellStyle}>
                            {index === 0 && (
                              <div>
                                <div style={{ fontWeight: '600', marginBottom: '2px', color: colors.gray[900] }}>
                                  {eje.nombre_eje}
                                </div>
                                <div style={{ ...stylePresets.text.small, color: colors.gray[500] }}>
                                  {ejeSubEjes.length} sub-eje{ejeSubEjes.length !== 1 ? 's' : ''}
                                </div>
                                {index === 0 && (
                                  <div style={buttonGroupStyle}>
                                    <button
                                      onClick={() => editarEje(eje)}
                                      style={editButtonStyle}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => eliminarEje(eje.id)}
                                      style={deleteButtonStyle}
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ fontWeight: '500', marginBottom: '2px', color: colors.gray[800] }}>
                              {subEje.nombre_sub_eje}
                            </div>
                            <div style={buttonGroupStyle}>
                              <button
                                onClick={() => editarSubEje(subEje)}
                                style={editButtonStyle}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarSubEje(subEje.id)}
                                style={deleteButtonStyle}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ ...stylePresets.text.muted, fontSize: '0.75rem' }}>
                              {subEje.descripcion || 'Sin descripción'}
                            </div>
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ ...stylePresets.text.small, color: colors.gray[500] }}>
                              {new Date(subEje.fecha_creacion).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit'
                              })}
                            </div>
                          </td>
                        </tr>
                      ));
                    } else {
                      return (
                        <tr key={eje.id} style={tableRowStyle}>
                          <td style={tableCellStyle}>
                            <div>
                              <div style={{ fontWeight: '600', marginBottom: '2px', color: colors.gray[900] }}>
                                {eje.nombre_eje}
                              </div>
                              <div style={{ ...stylePresets.text.small, color: colors.gray[500] }}>Sin sub-ejes</div>
                              <div style={buttonGroupStyle}>
                                <button
                                  onClick={() => editarEje(eje)}
                                  style={editButtonStyle}
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => eliminarEje(eje.id)}
                                  style={deleteButtonStyle}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </td>
                          <td style={{ ...tableCellStyle, color: colors.gray[400] }}>
                            Sin sub-ejes
                          </td>
                          <td style={{ ...tableCellStyle, color: colors.gray[400] }}>
                            -
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ ...stylePresets.text.small, color: colors.gray[500] }}>
                              {new Date(eje.fecha_creacion).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit'
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Asignaciones */}
      {activeTab === 'asignaciones' && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: spacing.lg 
          }}>
            <h3 style={{
              ...stylePresets.text.heading3,
              margin: 0,
              color: colors.gray[800]
            }}>
              Ejes Asignados a Áreas
            </h3>
            <button
              onClick={() => setShowAsignacionForm(true)}
              style={primaryButtonStyle}
            >
              + Asignar Eje a Área
            </button>
          </div>

          {/* Tabla de asignaciones */}
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={tableHeaderCellStyle}>Área</th>
                  <th style={tableHeaderCellStyle}>Eje</th>
                  <th style={tableHeaderCellStyle}>Descripción del Eje</th>
                  <th style={tableHeaderCellStyle}>Fecha Asignación</th>
                </tr>
              </thead>
              <tbody>
                {asignaciones.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ ...tableCellStyle, textAlign: 'center', padding: spacing.xl }}>
                      <div style={stylePresets.text.muted}>No hay ejes asignados a áreas</div>
                    </td>
                  </tr>
                ) : (
                  asignaciones.map((asignacion) => (
                    <tr key={`${asignacion.area_id}-${asignacion.eje_id}`} style={tableRowStyle}>
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: '600', color: colors.gray[900] }}>{asignacion.nombre_area}</div>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: '500', color: colors.gray[800] }}>{asignacion.nombre_eje}</div>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ ...stylePresets.text.muted, fontSize: '0.75rem' }}>
                          {asignacion.eje_descripcion || 'Sin descripción'}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ ...stylePresets.text.small, color: colors.gray[500] }}>
                          {new Date(asignacion.fecha_asignacion).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                          })}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        <button
                          onClick={() => desasignarEjeArea(asignacion.area_id, asignacion.eje_id)}
                          style={deleteButtonStyle}
                        >
                          Desasignar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALES */}
      
      {/* Modal para crear Eje */}
      {showEjeForm && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={stylePresets.text.heading3}>Crear Nuevo Eje</h3>
            <form onSubmit={crearEje}>
              <input
                type="text"
                placeholder="Nombre del eje"
                value={ejeForm.nombre_eje}
                onChange={(e) => setEjeForm({ ...ejeForm, nombre_eje: e.target.value })}
                required
                style={{ ...inputStyle, marginBottom: spacing.md }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={ejeForm.descripcion}
                onChange={(e) => setEjeForm({ ...ejeForm, descripcion: e.target.value })}
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
                  onClick={() => setShowEjeForm(false)}
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

      {/* Modal para editar Eje */}
      {showEditEjeForm && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={stylePresets.text.heading3}>Editar Eje</h3>
            <form onSubmit={actualizarEje}>
              <input
                type="text"
                placeholder="Nombre del eje"
                value={editEjeForm.nombre_eje}
                onChange={(e) => setEditEjeForm({ ...editEjeForm, nombre_eje: e.target.value })}
                required
                style={{ ...inputStyle, marginBottom: spacing.md }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={editEjeForm.descripcion}
                onChange={(e) => setEditEjeForm({ ...editEjeForm, descripcion: e.target.value })}
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
                  onClick={() => setShowEditEjeForm(false)}
                  style={secondaryButtonStyle}
                >
                  Cancelar
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear Sub-eje */}
      {showSubEjeForm && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={stylePresets.text.heading3}>Crear Nuevo Sub-eje</h3>
            <form onSubmit={crearSubEje}>
              <SearchableSelect
                options={ejes.map(eje => ({
                  value: eje.id,
                  label: eje.nombre_eje
                }))}
                value={subEjeForm.eje_id}
                onChange={(ejeId) => setSubEjeForm({ ...subEjeForm, eje_id: ejeId })}
                placeholder="Selecciona un eje"
                style={{ marginBottom: spacing.md }}
              />
              <input
                type="text"
                placeholder="Nombre del sub-eje"
                value={subEjeForm.nombre_sub_eje}
                onChange={(e) => setSubEjeForm({ ...subEjeForm, nombre_sub_eje: e.target.value })}
                required
                style={{ ...inputStyle, marginBottom: spacing.md }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={subEjeForm.descripcion}
                onChange={(e) => setSubEjeForm({ ...subEjeForm, descripcion: e.target.value })}
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
                  onClick={() => setShowSubEjeForm(false)}
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

      {/* Modal para editar Sub-eje */}
      {showEditSubEjeForm && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={stylePresets.text.heading3}>Editar Sub-eje</h3>
            <form onSubmit={actualizarSubEje}>
              <SearchableSelect
                options={ejes.map(eje => ({
                  value: eje.id,
                  label: eje.nombre_eje
                }))}
                value={editSubEjeForm.eje_id}
                onChange={(ejeId) => setEditSubEjeForm({ ...editSubEjeForm, eje_id: ejeId })}
                placeholder="Selecciona un eje"
                style={{ marginBottom: spacing.md }}
              />
              <input
                type="text"
                placeholder="Nombre del sub-eje"
                value={editSubEjeForm.nombre_sub_eje}
                onChange={(e) => setEditSubEjeForm({ ...editSubEjeForm, nombre_sub_eje: e.target.value })}
                required
                style={{ ...inputStyle, marginBottom: spacing.md }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={editSubEjeForm.descripcion}
                onChange={(e) => setEditSubEjeForm({ ...editSubEjeForm, descripcion: e.target.value })}
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
                  onClick={() => setShowEditSubEjeForm(false)}
                  style={secondaryButtonStyle}
                >
                  Cancelar
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para asignar Eje a Área */}
      {showAsignacionForm && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={stylePresets.text.heading3}>Asignar Eje a Área</h3>
            <form onSubmit={asignarEjeArea}>
              <SearchableSelect
                options={areas.map(area => ({
                  value: area.id,
                  label: area.nombre_area
                }))}
                value={asignacionForm.area_id}
                onChange={(areaId) => setAsignacionForm({ ...asignacionForm, area_id: areaId })}
                placeholder="Selecciona un área"
                style={{ marginBottom: spacing.md }}
              />
              <SearchableSelect
                options={ejes.map(eje => ({
                  value: eje.id,
                  label: eje.nombre_eje
                }))}
                value={asignacionForm.eje_id}
                onChange={(ejeId) => setAsignacionForm({ ...asignacionForm, eje_id: ejeId })}
                placeholder="Selecciona un eje"
                style={{ marginBottom: spacing.lg }}
              />
              <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAsignacionForm(false)}
                  style={secondaryButtonStyle}
                >
                  Cancelar
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}