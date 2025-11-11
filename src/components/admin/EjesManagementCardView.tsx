// Componente con diseño de tarjetas para gestionar Ejes y Sub-ejes
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Eye, Edit2, Trash2, Plus, X, Layers, FolderTree } from 'lucide-react';
import { 
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

export function EjesManagementCardView() {
  const [ejes, setEjes] = useState<Eje[]>([]);
  const [subEjes, setSubEjes] = useState<SubEje[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [asignaciones, setAsignaciones] = useState<AreaEje[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ejes' | 'asignaciones'>('ejes');

  // Modal de sub-ejes
  const [modalSubEje, setModalSubEje] = useState<{
    isOpen: boolean;
    eje: Eje | null;
    subEjes: SubEje[];
  }>({
    isOpen: false,
    eje: null,
    subEjes: []
  });

  // Modal de ejes asignados a un área
  const [modalEjesArea, setModalEjesArea] = useState<{
    isOpen: boolean;
    area: Area | null;
    asignaciones: AreaEje[];
  }>({
    isOpen: false,
    area: null,
    asignaciones: []
  });

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

  // Estados para confirm dialogs
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
        toast.success('Eje creado exitosamente');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creando eje:', error);
      toast.error('Error al crear el eje');
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
        cargarEjes();
        cargarTodosLosSubEjes();
        toast.success('Eje actualizado exitosamente');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error actualizando eje:', error);
      toast.error('Error al actualizar el eje');
    }
  };

  const eliminarEje = async (ejeId: number, nombreEje: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Eje',
      message: `¿Eliminar el eje "${nombreEje}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const response = await fetch('/api/admin/ejes', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ejeId })
          });

          if (response.ok) {
            cargarEjes();
            cargarTodosLosSubEjes();
            toast.success('Eje eliminado exitosamente');
          } else {
            const error = await response.json();
            toast.error(`Error: ${error.error}`);
          }
        } catch (error) {
          console.error('Error eliminando eje:', error);
          toast.error('Error al eliminar el eje');
        }
      }
    });
  };

  // =============== FUNCIONES CRUD SUB-EJES ===============

  const crearSubEje = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.success('Sub-eje creado exitosamente');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creando sub-eje:', error);
      toast.error('Error al crear el sub-eje');
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
        cargarEjes();
        cargarTodosLosSubEjes();
        toast.success('Sub-eje actualizado exitosamente');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error actualizando sub-eje:', error);
      toast.error('Error al actualizar el sub-eje');
    }
  };

  const eliminarSubEje = async (subEjeId: number, nombreSubEje: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Sub-eje',
      message: `¿Eliminar el sub-eje "${nombreSubEje}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const response = await fetch('/api/admin/sub-ejes', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: subEjeId })
          });

          if (response.ok) {
            cargarEjes();
            cargarTodosLosSubEjes();
            setModalSubEje({ isOpen: false, eje: null, subEjes: [] });
            toast.success('Sub-eje eliminado exitosamente');
          } else {
            const error = await response.json();
            toast.error(`Error: ${error.error}`);
          }
        } catch (error) {
          console.error('Error eliminando sub-eje:', error);
          toast.error('Error al eliminar el sub-eje');
        }
      }
    });
  };

  // =============== FUNCIONES DE ASIGNACIONES ===============

  const asignarEjeArea = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.success('Eje asignado al área exitosamente');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error asignando eje:', error);
      toast.error('Error al asignar el eje');
    }
  };

  const eliminarAsignacion = async (asignacionId: number, nombreArea: string, nombreEje: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Asignación',
      message: `¿Eliminar la asignación del eje "${nombreEje}" del área "${nombreArea}"?`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const response = await fetch('/api/admin/area-ejes', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: asignacionId })
          });

          if (response.ok) {
            cargarAsignaciones();
            toast.success('Asignación eliminada exitosamente');
          } else {
            const error = await response.json();
            toast.error(`Error: ${error.error}`);
          }
        } catch (error) {
          console.error('Error eliminando asignación:', error);
          toast.error('Error al eliminar la asignación');
        }
      }
    });
  };

  // Abrir modal de sub-ejes
  const verSubEjes = (eje: Eje) => {
    const subEjesDelEje = subEjes.filter(se => se.eje_id === eje.id);
    setModalSubEje({
      isOpen: true,
      eje: eje,
      subEjes: subEjesDelEje
    });
  };

  // =============== ESTILOS ===============

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.md,
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s'
  };

  const primaryButtonStyle = {
    padding: '10px 20px',
    backgroundColor: colors.gray[900],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
  };

  const secondaryButtonStyle = {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: colors.gray[700],
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
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
    zIndex: 1000,
    padding: '20px'
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: '24px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto'
  };

  // =============== RENDER ===============

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: colors.gray[900],
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Layers size={32} color={colors.gray[700]} />
          Gestión de Ejes y Sub-ejes
        </h2>
        <p style={{
          fontSize: '0.9rem',
          color: colors.gray[600],
          margin: 0
        }}>
          Administra los ejes estratégicos y sus sub-ejes correspondientes
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        borderBottom: `2px solid ${colors.gray[200]}`
      }}>
        <button
          onClick={() => setActiveTab('ejes')}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: 'transparent',
            color: activeTab === 'ejes' ? colors.gray[900] : colors.gray[500],
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            borderBottom: activeTab === 'ejes' ? `3px solid ${colors.gray[900]}` : 'none',
            marginBottom: '-2px',
            transition: 'all 0.2s'
          }}
        >
          Gestionar Ejes y Sub-ejes
        </button>
        <button
          onClick={() => setActiveTab('asignaciones')}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: 'transparent',
            color: activeTab === 'asignaciones' ? colors.gray[900] : colors.gray[500],
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            borderBottom: activeTab === 'asignaciones' ? `3px solid ${colors.gray[900]}` : 'none',
            marginBottom: '-2px',
            transition: 'all 0.2s'
          }}
        >
          Asignar Ejes a Áreas
        </button>
      </div>

      {/* Contenido según tab activa */}
      {activeTab === 'ejes' ? (
        <>
          {/* Botones de acción */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setShowEjeForm(true)}
              style={{
                ...primaryButtonStyle,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[800]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.gray[900]}
            >
              <Plus size={18} />
              Crear Eje
            </button>
            <button
              onClick={() => setShowSubEjeForm(true)}
              style={{
                ...secondaryButtonStyle,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <Plus size={18} />
              Crear Sub-eje
            </button>
          </div>

          {/* Grid de tarjetas de ejes */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ color: colors.gray[600] }}>Cargando...</p>
            </div>
          ) : ejes.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              border: `1px solid ${colors.gray[200]}`,
              borderRadius: '12px',
              padding: '60px',
              textAlign: 'center'
            }}>
              <FolderTree size={48} color={colors.gray[400]} style={{ margin: '0 auto 16px' }} />
              <p style={{ color: colors.gray[600], margin: 0 }}>
                No hay ejes creados. Haz clic en &quot;Crear Eje&quot; para comenzar.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {ejes.map((eje) => (
                <div
                  key={eje.id}
                  style={{
                    backgroundColor: 'white',
                    border: `1px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s',
                    cursor: 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Header de la tarjeta */}
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: colors.gray[900],
                      marginBottom: '8px',
                      lineHeight: '1.3'
                    }}>
                      {eje.nombre_eje}
                    </h3>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: colors.gray[100],
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: colors.gray[700],
                      fontWeight: '600'
                    }}>
                      <FolderTree size={14} />
                      {eje.total_sub_ejes} Sub-eje{eje.total_sub_ejes !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div style={{ flex: 1, marginBottom: '16px' }}>
                    <p style={{
                      fontSize: '0.875rem',
                      color: colors.gray[600],
                      lineHeight: '1.5',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {eje.descripcion || 'Sin descripción'}
                    </p>
                  </div>

                  {/* Fecha */}
                  <div style={{
                    fontSize: '0.75rem',
                    color: colors.gray[500],
                    marginBottom: '16px'
                  }}>
                    Creado: {new Date(eje.fecha_creacion).toLocaleDateString('es-ES')}
                  </div>

                  {/* Botones de acción */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    paddingTop: '16px',
                    borderTop: `1px solid ${colors.gray[200]}`
                  }}>
                    <button
                      onClick={() => verSubEjes(eje)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        backgroundColor: colors.gray[900],
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[800]}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.gray[900]}
                    >
                      <Eye size={16} />
                      Ver Sub-ejes
                    </button>
                    <button
                      onClick={() => editarEje(eje)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'white',
                        color: colors.gray[700],
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="Editar eje"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => eliminarEje(eje.id, eje.nombre_eje)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'white',
                        color: '#ef4444',
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="Eliminar eje"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                        e.currentTarget.style.borderColor = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = colors.gray[300];
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Tab de asignaciones */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => setShowAsignacionForm(true)}
              style={{
                ...primaryButtonStyle,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[800]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.gray[900]}
            >
              <Plus size={18} />
              Asignar Eje a Área
            </button>
          </div>

          {/* Grid de tarjetas por área */}
          {areas.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              border: `1px solid ${colors.gray[200]}`,
              borderRadius: '12px',
              padding: '60px',
              textAlign: 'center'
            }}>
              <FolderTree size={48} color={colors.gray[400]} style={{ margin: '0 auto 16px' }} />
              <p style={{ color: colors.gray[600], margin: 0 }}>
                No hay áreas disponibles.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {areas.map((area) => {
                const ejesAsignados = asignaciones.filter(asig => asig.area_id === area.id);
                return (
                  <div
                    key={area.id}
                    style={{
                      backgroundColor: 'white',
                      border: `1px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s',
                      cursor: 'default',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Header de la tarjeta */}
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: colors.gray[900],
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}>
                        {area.nombre_area}
                      </h3>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: ejesAsignados.length > 0 ? colors.gray[900] : colors.gray[100],
                        color: ejesAsignados.length > 0 ? 'white' : colors.gray[600],
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        <Layers size={14} />
                        {ejesAsignados.length} Eje{ejesAsignados.length !== 1 ? 's' : ''} Asignado{ejesAsignados.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Espaciador */}
                    <div style={{ flex: 1 }} />

                    {/* Botón de ver ejes */}
                    <div style={{
                      paddingTop: '16px',
                      borderTop: `1px solid ${colors.gray[200]}`
                    }}>
                      <button
                        onClick={() => {
                          setModalEjesArea({
                            isOpen: true,
                            area: area,
                            asignaciones: ejesAsignados
                          });
                        }}
                        disabled={ejesAsignados.length === 0}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '10px',
                          backgroundColor: ejesAsignados.length > 0 ? colors.gray[900] : colors.gray[200],
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          cursor: ejesAsignados.length > 0 ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s',
                          opacity: ejesAsignados.length > 0 ? 1 : 0.6
                        }}
                        onMouseEnter={(e) => {
                          if (ejesAsignados.length > 0) {
                            e.currentTarget.style.backgroundColor = colors.gray[800];
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (ejesAsignados.length > 0) {
                            e.currentTarget.style.backgroundColor = colors.gray[900];
                          }
                        }}
                      >
                        <Eye size={16} />
                        Ver Ejes Asignados
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal de Ejes Asignados a un Área */}
      {modalEjesArea.isOpen && modalEjesArea.area && (
        <div style={modalOverlayStyle} onClick={() => setModalEjesArea({ isOpen: false, area: null, asignaciones: [] })}>
          <div style={{
            ...modalContentStyle,
            maxWidth: '500px'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: colors.gray[900],
                  marginBottom: '8px'
                }}>
                  Ejes de {modalEjesArea.area.nombre_area}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: colors.gray[600],
                  margin: 0
                }}>
                  {modalEjesArea.asignaciones.length} eje{modalEjesArea.asignaciones.length !== 1 ? 's' : ''} asignado{modalEjesArea.asignaciones.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setModalEjesArea({ isOpen: false, area: null, asignaciones: [] })}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.gray[500]
                }}
              >
                <X size={24} />
              </button>
            </div>

            {modalEjesArea.asignaciones.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: colors.gray[50],
                borderRadius: '8px'
              }}>
                <p style={{ color: colors.gray[600], margin: 0 }}>
                  No hay ejes asignados a esta área
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {modalEjesArea.asignaciones.map((asig) => (
                  <div
                    key={asig.id}
                    style={{
                      backgroundColor: 'white',
                      border: `1px solid ${colors.gray[200]}`,
                      borderRadius: '8px',
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: colors.gray[900],
                        margin: 0
                      }}>
                        {asig.nombre_eje}
                      </h4>
                    </div>
                    <button
                      onClick={() => eliminarAsignacion(asig.id, asig.nombre_area, asig.nombre_eje)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'white',
                        color: '#ef4444',
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Eliminar asignación"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                        e.currentTarget.style.borderColor = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = colors.gray[300];
                      }}
                    >
                      <Trash2 size={12} />
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Sub-ejes */}
      {modalSubEje.isOpen && modalSubEje.eje && (
        <div style={modalOverlayStyle} onClick={() => setModalSubEje({ isOpen: false, eje: null, subEjes: [] })}>
          <div style={{
            ...modalContentStyle,
            maxWidth: '700px'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: colors.gray[900],
                  marginBottom: '8px'
                }}>
                  Sub-ejes de {modalSubEje.eje.nombre_eje}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: colors.gray[600],
                  margin: 0
                }}>
                  {modalSubEje.subEjes.length} sub-eje{modalSubEje.subEjes.length !== 1 ? 's' : ''} encontrado{modalSubEje.subEjes.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setModalSubEje({ isOpen: false, eje: null, subEjes: [] })}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.gray[500]
                }}
              >
                <X size={24} />
              </button>
            </div>

            {modalSubEje.subEjes.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: colors.gray[50],
                borderRadius: '8px'
              }}>
                <p style={{ color: colors.gray[600], margin: 0 }}>
                  Este eje no tiene sub-ejes asignados
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {modalSubEje.subEjes.map((subEje) => (
                  <div
                    key={subEje.id}
                    style={{
                      backgroundColor: colors.gray[50],
                      border: `1px solid ${colors.gray[200]}`,
                      borderRadius: '8px',
                      padding: '16px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: colors.gray[900],
                        margin: 0
                      }}>
                        {subEje.nombre_sub_eje}
                      </h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => editarSubEje(subEje)}
                          style={{
                            padding: '6px',
                            backgroundColor: 'white',
                            color: colors.gray[700],
                            border: `1px solid ${colors.gray[300]}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          title="Editar"
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[100]}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => eliminarSubEje(subEje.id, subEje.nombre_sub_eje)}
                          style={{
                            padding: '6px',
                            backgroundColor: 'white',
                            color: '#ef4444',
                            border: `1px solid ${colors.gray[300]}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          title="Eliminar"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                            e.currentTarget.style.borderColor = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.borderColor = colors.gray[300];
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p style={{
                      fontSize: '0.875rem',
                      color: colors.gray[600],
                      lineHeight: '1.5',
                      margin: 0
                    }}>
                      {subEje.descripcion || 'Sin descripción'}
                    </p>
                    <div style={{
                      fontSize: '0.75rem',
                      color: colors.gray[500],
                      marginTop: '8px'
                    }}>
                      Creado: {new Date(subEje.fecha_creacion).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para crear Eje */}
      {showEjeForm && (
        <div style={modalOverlayStyle} onClick={() => setShowEjeForm(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: colors.gray[900],
              marginBottom: '20px'
            }}>
              Crear Nuevo Eje
            </h3>
            <form onSubmit={crearEje}>
              <input
                type="text"
                placeholder="Nombre del eje"
                value={ejeForm.nombre_eje}
                onChange={(e) => setEjeForm({ ...ejeForm, nombre_eje: e.target.value })}
                required
                style={{ ...inputStyle, marginBottom: '16px' }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={ejeForm.descripcion}
                onChange={(e) => setEjeForm({ ...ejeForm, descripcion: e.target.value })}
                style={{ 
                  ...inputStyle, 
                  marginBottom: '24px', 
                  minHeight: '100px',
                  resize: 'vertical' as const,
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowEjeForm(false)}
                  style={secondaryButtonStyle}
                >
                  Cancelar
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  Crear Eje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar Eje */}
      {showEditEjeForm && (
        <div style={modalOverlayStyle} onClick={() => setShowEditEjeForm(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: colors.gray[900],
              marginBottom: '20px'
            }}>
              Editar Eje
            </h3>
            <form onSubmit={actualizarEje}>
              <input
                type="text"
                placeholder="Nombre del eje"
                value={editEjeForm.nombre_eje}
                onChange={(e) => setEditEjeForm({ ...editEjeForm, nombre_eje: e.target.value })}
                required
                style={{ ...inputStyle, marginBottom: '16px' }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={editEjeForm.descripcion}
                onChange={(e) => setEditEjeForm({ ...editEjeForm, descripcion: e.target.value })}
                style={{ 
                  ...inputStyle, 
                  marginBottom: '24px', 
                  minHeight: '100px',
                  resize: 'vertical' as const,
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
        <div style={modalOverlayStyle} onClick={() => setShowSubEjeForm(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: colors.gray[900],
              marginBottom: '20px'
            }}>
              Crear Nuevo Sub-eje
            </h3>
            <form onSubmit={crearSubEje}>
              <SearchableSelect
                options={ejes.map(eje => ({
                  value: eje.id,
                  label: eje.nombre_eje
                }))}
                value={subEjeForm.eje_id}
                onChange={(ejeId) => setSubEjeForm({ ...subEjeForm, eje_id: ejeId })}
                placeholder="Selecciona un eje"
                style={{ marginBottom: '16px' }}
              />
              <input
                type="text"
                placeholder="Nombre del sub-eje"
                value={subEjeForm.nombre_sub_eje}
                onChange={(e) => setSubEjeForm({ ...subEjeForm, nombre_sub_eje: e.target.value })}
                required
                style={{ ...inputStyle, marginBottom: '16px' }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={subEjeForm.descripcion}
                onChange={(e) => setSubEjeForm({ ...subEjeForm, descripcion: e.target.value })}
                style={{ 
                  ...inputStyle, 
                  marginBottom: '24px', 
                  minHeight: '100px',
                  resize: 'vertical' as const,
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowSubEjeForm(false)}
                  style={secondaryButtonStyle}
                >
                  Cancelar
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  Crear Sub-eje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar Sub-eje */}
      {showEditSubEjeForm && (
        <div style={modalOverlayStyle} onClick={() => setShowEditSubEjeForm(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: colors.gray[900],
              marginBottom: '20px'
            }}>
              Editar Sub-eje
            </h3>
            <form onSubmit={actualizarSubEje}>
              <SearchableSelect
                options={ejes.map(eje => ({
                  value: eje.id,
                  label: eje.nombre_eje
                }))}
                value={editSubEjeForm.eje_id}
                onChange={(ejeId) => setEditSubEjeForm({ ...editSubEjeForm, eje_id: ejeId })}
                placeholder="Selecciona un eje"
                style={{ marginBottom: '16px' }}
              />
              <input
                type="text"
                placeholder="Nombre del sub-eje"
                value={editSubEjeForm.nombre_sub_eje}
                onChange={(e) => setEditSubEjeForm({ ...editSubEjeForm, nombre_sub_eje: e.target.value })}
                required
                style={{ ...inputStyle, marginBottom: '16px' }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={editSubEjeForm.descripcion}
                onChange={(e) => setEditSubEjeForm({ ...editSubEjeForm, descripcion: e.target.value })}
                style={{ 
                  ...inputStyle, 
                  marginBottom: '24px', 
                  minHeight: '100px',
                  resize: 'vertical' as const,
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
        <div style={modalOverlayStyle} onClick={() => setShowAsignacionForm(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: colors.gray[900],
              marginBottom: '20px'
            }}>
              Asignar Eje a Área
            </h3>
            <form onSubmit={asignarEjeArea}>
              <SearchableSelect
                options={areas.map(area => ({
                  value: area.id,
                  label: area.nombre_area
                }))}
                value={asignacionForm.area_id}
                onChange={(areaId) => setAsignacionForm({ ...asignacionForm, area_id: areaId })}
                placeholder="Selecciona un área"
                style={{ marginBottom: '16px' }}
              />
              <SearchableSelect
                options={ejes.map(eje => ({
                  value: eje.id,
                  label: eje.nombre_eje
                }))}
                value={asignacionForm.eje_id}
                onChange={(ejeId) => setAsignacionForm({ ...asignacionForm, eje_id: ejeId })}
                placeholder="Selecciona un eje"
                style={{ marginBottom: '24px' }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        type={confirmDialog.type}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
}
