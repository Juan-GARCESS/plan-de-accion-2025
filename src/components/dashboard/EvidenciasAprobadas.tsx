// src/components/dashboard/EvidenciasAprobadas.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Filter, Search, Download } from 'lucide-react';

interface Evidencia {
  id: number;
  meta: string;
  indicador: string;
  accion: string | null;
  presupuesto: string | null;
  eje: string | null;
  sub_eje: string | null;
  trimestre: number;
  descripcion: string | null;
  archivo_url: string;
  archivo_nombre: string;
  calificacion: number;
  fecha_revision: string;
  revisado_por_nombre: string | null;
}

interface EvidenciasAprobadasProps {
  areaId?: number;
}

export default function EvidenciasAprobadas({ areaId }: EvidenciasAprobadasProps) {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [areaNombre, setAreaNombre] = useState<string>('Mi Área');
  const [loading, setLoading] = useState(true);
  const [filtroMeta, setFiltroMeta] = useState('');
  const [filtroTrimestre, setFiltroTrimestre] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!areaId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Obtener evidencias - usar endpoint público para usuarios
        const url = `/api/usuario/evidencias-aprobadas?areaId=${areaId}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          // Si falla, intentar con el endpoint admin (por si es admin viendo)
          const adminUrl = `/api/admin/plan-accion-general?areaId=${areaId}`;
          const adminRes = await fetch(adminUrl);
          if (!adminRes.ok) throw new Error('Error al cargar evidencias');
          const adminData = await adminRes.json();
          setEvidencias(adminData.evidencias || []);
          
          // Obtener nombre del área
          const areasRes = await fetch('/api/admin/areas');
          if (areasRes.ok) {
            const areas = await areasRes.json();
            const area = areas.find((a: { id: number; nombre_area: string }) => a.id === areaId);
            if (area) setAreaNombre(area.nombre_area);
          }
        } else {
          const data = await res.json();
          setEvidencias(data.evidencias || []);
          setAreaNombre(data.areaNombre || 'Mi Área');
        }
      } catch (error) {
        console.error('Error:', error);
        // No mostrar error, solo dejar vacío
        setEvidencias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [areaId]);

  // Filtrado
  const evidenciasFiltradas = evidencias.filter(ev => {
    const matchBusqueda = busqueda === '' || 
      ev.meta.toLowerCase().includes(busqueda.toLowerCase()) ||
      (ev.indicador && ev.indicador.toLowerCase().includes(busqueda.toLowerCase()));
    
    const matchMeta = filtroMeta === '' || ev.meta === filtroMeta;
    const matchTrimestre = filtroTrimestre === '' || ev.trimestre.toString() === filtroTrimestre;

    return matchBusqueda && matchMeta && matchTrimestre;
  });

  // Metas únicas para el filtro
  const metasUnicas = Array.from(new Set(evidencias.map(e => e.meta))).sort();

  const handleVerArchivo = (url: string) => {
    window.open(url, '_blank');
  };

  const getColorCalificacion = (cal: number) => {
    if (cal >= 80) return { bg: '#d1fae5', color: '#065f46' };
    if (cal >= 60) return { bg: '#fef3c7', color: '#92400e' };
    return { bg: '#fed7aa', color: '#9a3412' };
  };

  const formatPresupuesto = (presupuesto: string | null) => {
    if (!presupuesto) return '-';
    const num = parseFloat(presupuesto);
    if (isNaN(num)) return presupuesto;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(num);
  };

  if (loading) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 40,
        textAlign: 'center',
        marginBottom: 24
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '4px solid #e5e7eb',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>Cargando evidencias...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!areaId) {
    return null;
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <FileText size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
            Plan de Acción - {areaNombre}
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
          Evidencias aprobadas por el administrador
        </p>
      </div>

      {evidencias.length === 0 ? (
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 60,
          textAlign: 'center'
        }}>
          <FileText size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: 0, marginBottom: 8, color: '#374151', fontSize: '1.125rem' }}>
            Aún no hay evidencias aprobadas
          </h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
            Las evidencias aprobadas por el administrador aparecerán aquí.
          </p>
        </div>
      ) : (
        <>
          {/* Filtros */}
          <div style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Filter size={18} color="#6b7280" />
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#374151' }}>Filtros</h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 16
            }}>
              {/* Búsqueda */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Buscar
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#9ca3af" style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }} />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Meta, indicador..."
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              {/* Filtro por Meta */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Filtrar por Meta
                </label>
                <select
                  value={filtroMeta}
                  onChange={(e) => setFiltroMeta(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    cursor: 'pointer',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="">Todas las metas</option>
                  {metasUnicas.map((meta, i) => (
                    <option key={i} value={meta}>{meta}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Trimestre */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 8
                }}>
                  Filtrar por Trimestre
                </label>
                <select
                  value={filtroTrimestre}
                  onChange={(e) => setFiltroTrimestre(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    cursor: 'pointer',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="">Todos los trimestres</option>
                  <option value="1">Trimestre 1</option>
                  <option value="2">Trimestre 2</option>
                  <option value="3">Trimestre 3</option>
                  <option value="4">Trimestre 4</option>
                </select>
              </div>
            </div>

            {/* Contador de resultados */}
            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid #e5e7eb',
              fontSize: 13,
              color: '#6b7280'
            }}>
              Mostrando <strong>{evidenciasFiltradas.length}</strong> de <strong>{evidencias.length}</strong> evidencias
            </div>
          </div>

          {/* Tabla */}
          <div style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13
              }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      fontSize: 13
                    }}>Eje / Sub-eje</th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      fontSize: 13,
                      minWidth: 200
                    }}>Meta</th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      fontSize: 13,
                      minWidth: 180
                    }}>Acción</th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'right',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      fontSize: 13
                    }}>Presupuesto</th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      fontSize: 13
                    }}>T</th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      fontSize: 13,
                      minWidth: 180
                    }}>Descripción</th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      fontSize: 13
                    }}>Calif.</th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      fontSize: 13
                    }}>Archivo</th>
                  </tr>
                </thead>
                <tbody>
                  {evidenciasFiltradas.map((ev, idx) => {
                    const calColors = getColorCalificacion(ev.calificacion);
                    return (
                      <tr
                        key={ev.id}
                        style={{
                          background: idx % 2 === 0 ? '#fff' : '#f9fafb',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f9fafb'}
                      >
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid #e5e7eb',
                          color: '#1f2937',
                          fontSize: 13,
                          lineHeight: 1.4
                        }}>
                          <div style={{ fontWeight: 500, marginBottom: 2 }}>
                            {ev.eje || '-'}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: 12 }}>
                            {ev.sub_eje || '-'}
                          </div>
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid #e5e7eb',
                          color: '#1f2937',
                          fontSize: 13,
                          lineHeight: 1.4
                        }}>
                          <div style={{ fontWeight: 500, marginBottom: 2 }}>
                            {ev.meta}
                          </div>
                          {ev.indicador && (
                            <div style={{ color: '#6b7280', fontSize: 12 }}>
                              {ev.indicador}
                            </div>
                          )}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid #e5e7eb',
                          color: '#4b5563',
                          fontSize: 13,
                          lineHeight: 1.4
                        }}>
                          {ev.accion || '-'}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid #e5e7eb',
                          color: '#1f2937',
                          fontWeight: 500,
                          textAlign: 'right',
                          fontSize: 13
                        }}>
                          {formatPresupuesto(ev.presupuesto)}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#6366f1',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {ev.trimestre}
                          </span>
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid #e5e7eb',
                          color: '#4b5563',
                          fontSize: 13,
                          lineHeight: 1.4,
                          maxWidth: 200
                        }}>
                          {ev.descripcion || '-'}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: calColors.bg,
                            color: calColors.color,
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {ev.calificacion}%
                          </span>
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'center'
                        }}>
                          <button
                            onClick={() => handleVerArchivo(ev.archivo_url)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '6px 12px',
                              background: '#6366f1',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#4f46e5';
                              e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#6366f1';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <Download size={14} />
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
