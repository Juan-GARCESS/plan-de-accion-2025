// Componente para gestionar Ejes y Sub-ejes
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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

export function EjesManagementSection() {
  const [ejes, setEjes] = useState<Eje[]>([]);
  const [subEjes, setSubEjes] = useState<SubEje[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ejes' | 'asignaciones'>('ejes');
  const [isMobile, setIsMobile] = useState(false);

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

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarEjes();
    cargarTodosLosSubEjes(); // Cargar todos los sub-ejes de una vez
    cargarAreas();
  }, []);

  const cargarTodosLosSubEjes = async () => {
    try {
      // Cargar todos los sub-ejes de una vez
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
        toast.success('¡Eje creado!', {
          description: `${ejeForm.nombre_eje} ha sido agregado exitosamente.`
        });
      } else {
        const error = await response.json();
        toast.error('Error al crear eje', {
          description: error.error || 'Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error creando eje:', error);
      toast.error('Error al crear eje', {
        description: 'No se pudo completar la operación.'
      });
    }
  };

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
        toast.success('¡Sub-eje creado!', {
          description: `${subEjeForm.nombre_sub_eje} ha sido agregado exitosamente.`
        });
      } else {
        const error = await response.json();
        toast.error('Error al crear sub-eje', {
          description: error.error || 'Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error creando sub-eje:', error);
      toast.error('Error al crear sub-eje', {
        description: 'No se pudo completar la operación.'
      });
    }
  };

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
        toast.success('¡Eje asignado!', {
          description: 'El eje ha sido asignado al área correctamente.'
        });
      } else {
        const error = await response.json();
        toast.error('Error al asignar eje', {
          description: error.error || 'Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error asignando eje:', error);
      toast.error('Error al asignar eje', {
        description: 'No se pudo completar la operación.'
      });
    }
  };

  // Funciones para editar ejes
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
        toast.success('¡Eje actualizado!', {
          description: 'Los cambios se guardaron correctamente.'
        });
      } else {
        const error = await response.json();
        toast.error('Error al actualizar eje', {
          description: error.error || 'Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error actualizando eje:', error);
      toast.error('Error al actualizar eje', {
        description: 'No se pudo completar la operación.'
      });
    }
  };

  const eliminarEje = async (ejeId: number) => {
    const eje = ejes.find(e => e.id === ejeId);
    if (!confirm(`¿Eliminar "${eje?.nombre_eje}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ejes?id=${ejeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        cargarEjes();
        cargarTodosLosSubEjes();
        toast.success('Eje eliminado', {
          description: 'El eje ha sido eliminado del sistema.'
        });
      } else {
        const error = await response.json();
        toast.error('Error al eliminar eje', {
          description: error.error || 'Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error eliminando eje:', error);
      toast.error('Error al eliminar eje', {
        description: 'No se pudo completar la operación.'
      });
    }
  };

  // Funciones para editar sub-ejes
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
        toast.success('¡Sub-eje actualizado!', {
          description: 'Los cambios se guardaron correctamente.'
        });
      } else {
        const error = await response.json();
        toast.error('Error al actualizar sub-eje', {
          description: error.error || 'Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error actualizando sub-eje:', error);
      toast.error('Error al actualizar sub-eje', {
        description: 'No se pudo completar la operación.'
      });
    }
  };

  const eliminarSubEje = async (subEjeId: number) => {
    const subEje = subEjes.find(s => s.id === subEjeId);
    if (!confirm(`¿Eliminar "${subEje?.nombre_sub_eje}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/sub-ejes?id=${subEjeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        cargarEjes();
        cargarTodosLosSubEjes();
        toast.success('Sub-eje eliminado', {
          description: 'El sub-eje ha sido eliminado del sistema.'
        });
      } else {
        const error = await response.json();
        toast.error('Error al eliminar sub-eje', {
          description: error.error || 'Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error eliminando sub-eje:', error);
      toast.error('Error al eliminar sub-eje', {
        description: 'No se pudo completar la operación.'
      });
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '32px',
      marginBottom: isMobile ? '16px' : '32px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{
        fontSize: isMobile ? '1.25rem' : '1.5rem',
        fontWeight: '700',
        color: '#000000',
        marginBottom: isMobile ? '16px' : '24px',
        textAlign: 'center'
      }}>
        Gestión de Ejes y Sub-ejes
      </h2>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '8px',
        marginBottom: isMobile ? '16px' : '24px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        paddingBottom: '16px'
      }}>
        <button
          onClick={() => setActiveTab('ejes')}
          style={{
            padding: isMobile ? '10px 12px' : '8px 16px',
            minHeight: isMobile ? '44px' : 'auto',
            background: activeTab === 'ejes' ? '#000000' : 'transparent',
            color: activeTab === 'ejes' ? 'white' : '#000000',
            border: '1px solid #000000',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '500'
          }}
        >
          Gestionar Ejes y Sub-ejes
        </button>
        <button
          onClick={() => setActiveTab('asignaciones')}
          style={{
            padding: isMobile ? '10px 12px' : '8px 16px',
            minHeight: isMobile ? '44px' : 'auto',
            background: activeTab === 'asignaciones' ? '#000000' : 'transparent',
            color: activeTab === 'asignaciones' ? 'white' : '#000000',
            border: '1px solid #000000',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '500'
          }}
        >
          Asignar Ejes a Áreas
        </button>
      </div>

      {activeTab === 'ejes' && (
        <div>
          {/* Botones de crear */}
          <div style={{ 
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '12px', 
            marginBottom: isMobile ? '16px' : '20px'
          }}>
            <button
              onClick={() => setShowEjeForm(true)}
              style={{
                padding: isMobile ? '12px 16px' : '8px 16px',
                minHeight: isMobile ? '44px' : 'auto',
                background: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '500'
              }}
            >
              + Crear Eje
            </button>
            <button
              onClick={() => setShowSubEjeForm(true)}
              style={{
                padding: isMobile ? '12px 16px' : '8px 16px',
                minHeight: isMobile ? '44px' : 'auto',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '500'
              }}
            >
              + Crear Sub-eje
            </button>
          </div>

          {/* Tabla unificada */}
          <div style={{
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
            maxHeight: isMobile ? '500px' : '600px',
            overflowY: 'auto',
            overflowX: isMobile ? 'auto' : 'hidden'
          }}>
            {isMobile && (
              <div style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#fffbeb',
                borderBottom: '1px solid #fef3c7',
                fontSize: '12px',
                color: '#92400e',
                textAlign: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 20
              }}>
                👈 Desliza para ver más columnas
              </div>
            )}
            <table style={{
              width: '100%',
              minWidth: isMobile ? '900px' : 'auto',
              borderCollapse: 'collapse',
              fontSize: isMobile ? '12px' : '13px'
            }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{
                  background: 'rgba(0, 0, 0, 0.05)',
                  borderBottom: '2px solid rgba(0, 0, 0, 0.1)'
                }}>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#000000',
                    width: '30%'
                  }}>
                    Eje
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#000000',
                    width: '30%'
                  }}>
                    Sub-eje
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#000000',
                    width: '25%'
                  }}>
                    Descripción
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#000000',
                    width: '15%'
                  }}>
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#666'
                    }}>
                      Cargando...
                    </td>
                  </tr>
                ) : ejes.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#666'
                    }}>
                      No hay ejes creados
                    </td>
                  </tr>
                ) : (
                  ejes.map((eje) => {
                    const ejeSubEjes = subEjes.filter(se => se.eje_id === eje.id);
                    
                    if (ejeSubEjes.length > 0) {
                      return ejeSubEjes.map((subEje, index) => (
                        <tr key={`${eje.id}-${subEje.id}`} style={{
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          background: 'white'
                        }}>
                          <td style={{
                            padding: '12px 16px',
                            verticalAlign: 'top',
                            borderRight: '1px solid rgba(0, 0, 0, 0.05)'
                          }}>
                            {index === 0 && (
                              <div>
                                <div style={{
                                  fontWeight: '600',
                                  color: '#000000',
                                  fontSize: '14px',
                                  marginBottom: '4px'
                                }}>
                                  {eje.nombre_eje}
                                </div>
                                <div style={{
                                  fontSize: '11px',
                                  color: '#999'
                                }}>
                                  {ejeSubEjes.length} sub-eje{ejeSubEjes.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            )}
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            borderRight: '1px solid rgba(0, 0, 0, 0.05)'
                          }}>
                            <div style={{
                              fontWeight: '500',
                              color: '#000000',
                              fontSize: '13px'
                            }}>
                              {subEje.nombre_sub_eje}
                            </div>
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            borderRight: '1px solid rgba(0, 0, 0, 0.05)',
                            fontSize: '12px',
                            color: '#666'
                          }}>
                            {subEje.descripcion || 'Sin descripción'}
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            fontSize: '11px',
                            color: '#999'
                          }}>
                            {new Date(subEje.fecha_creacion).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit'
                            })}
                          </td>
                        </tr>
                      ));
                    } else {
                      return (
                        <tr key={eje.id} style={{
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          background: 'white'
                        }}>
                          <td style={{
                            padding: '12px 16px',
                            borderRight: '1px solid rgba(0, 0, 0, 0.05)'
                          }}>
                            <div style={{
                              fontWeight: '600',
                              color: '#000000',
                              fontSize: '14px',
                              marginBottom: '4px'
                            }}>
                              {eje.nombre_eje}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#999'
                            }}>
                              Sin sub-ejes
                            </div>
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            borderRight: '1px solid rgba(0, 0, 0, 0.05)',
                            color: '#999',
                            fontStyle: 'italic'
                          }}>
                            -
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            borderRight: '1px solid rgba(0, 0, 0, 0.05)',
                            fontSize: '12px',
                            color: '#666'
                          }}>
                            {eje.descripcion || 'Sin descripción'}
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            fontSize: '11px',
                            color: '#999'
                          }}>
                            {new Date(eje.fecha_creacion).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit'
                            })}
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

      {activeTab === 'asignaciones' && (
        <div>
          <button
            onClick={() => setShowAsignacionForm(true)}
            style={{
              padding: isMobile ? '12px 20px' : '10px 20px',
              minHeight: isMobile ? '44px' : 'auto',
              background: '#000000',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '500',
              marginBottom: isMobile ? '16px' : '24px'
            }}
          >
            + Asignar Eje a Área
          </button>
          
          <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            Funcionalidad de asignaciones en desarrollo...
          </div>
        </div>
      )}

      {/* Modal para crear Eje */}
      {showEjeForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Crear Nuevo Eje</h3>
            <form onSubmit={crearEje}>
              <input
                type="text"
                placeholder="Nombre del eje"
                value={ejeForm.nombre_eje}
                onChange={(e) => setEjeForm({ ...ejeForm, nombre_eje: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={ejeForm.descripcion}
                onChange={(e) => setEjeForm({ ...ejeForm, descripcion: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  minHeight: '80px'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowEjeForm(false)}
                  style={{
                    padding: '8px 16px',
                    background: '#ccc',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear Sub-eje */}
      {showSubEjeForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Crear Nuevo Sub-eje</h3>
            <form onSubmit={crearSubEje}>
              <select
                value={subEjeForm.eje_id}
                onChange={(e) => setSubEjeForm({ ...subEjeForm, eje_id: parseInt(e.target.value) })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              >
                <option value={0}>Selecciona un eje</option>
                {ejes.map((eje) => (
                  <option key={eje.id} value={eje.id}>
                    {eje.nombre_eje}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Nombre del sub-eje"
                value={subEjeForm.nombre_sub_eje}
                onChange={(e) => setSubEjeForm({ ...subEjeForm, nombre_sub_eje: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={subEjeForm.descripcion}
                onChange={(e) => setSubEjeForm({ ...subEjeForm, descripcion: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  minHeight: '80px'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowSubEjeForm(false)}
                  style={{
                    padding: '8px 16px',
                    background: '#ccc',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para asignar Eje a Área */}
      {showAsignacionForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Asignar Eje a Área</h3>
            <form onSubmit={asignarEjeArea}>
              <select
                value={asignacionForm.area_id}
                onChange={(e) => setAsignacionForm({ ...asignacionForm, area_id: parseInt(e.target.value) })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              >
                <option value={0}>Selecciona un área</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre_area}
                  </option>
                ))}
              </select>
              <select
                value={asignacionForm.eje_id}
                onChange={(e) => setAsignacionForm({ ...asignacionForm, eje_id: parseInt(e.target.value) })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              >
                <option value={0}>Selecciona un eje</option>
                {ejes.map((eje) => (
                  <option key={eje.id} value={eje.id}>
                    {eje.nombre_eje}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAsignacionForm(false)}
                  style={{
                    padding: '8px 16px',
                    background: '#ccc',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar eje */}
      {showEditEjeForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Editar Eje</h3>
            <form onSubmit={actualizarEje}>
              <input
                type="text"
                placeholder="Nombre del eje"
                value={editEjeForm.nombre_eje}
                onChange={(e) => setEditEjeForm({ ...editEjeForm, nombre_eje: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={editEjeForm.descripcion}
                onChange={(e) => setEditEjeForm({ ...editEjeForm, descripcion: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowEditEjeForm(false)}
                  style={{
                    padding: '8px 16px',
                    background: '#ccc',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar sub-eje */}
      {showEditSubEjeForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Editar Sub-eje</h3>
            <form onSubmit={actualizarSubEje}>
              <select
                value={editSubEjeForm.eje_id}
                onChange={(e) => setEditSubEjeForm({ ...editSubEjeForm, eje_id: parseInt(e.target.value) })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              >
                <option value={0}>Selecciona un eje</option>
                {ejes.map((eje) => (
                  <option key={eje.id} value={eje.id}>
                    {eje.nombre_eje}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Nombre del sub-eje"
                value={editSubEjeForm.nombre_sub_eje}
                onChange={(e) => setEditSubEjeForm({ ...editSubEjeForm, nombre_sub_eje: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={editSubEjeForm.descripcion}
                onChange={(e) => setEditSubEjeForm({ ...editSubEjeForm, descripcion: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowEditSubEjeForm(false)}
                  style={{
                    padding: '8px 16px',
                    background: '#ccc',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}