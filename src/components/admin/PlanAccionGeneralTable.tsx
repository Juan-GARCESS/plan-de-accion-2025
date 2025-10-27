// src/components/admin/PlanAccionGeneralTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Filter, FileText, CheckCircle2, XCircle } from 'lucide-react';

interface EvidenciaAprobada {
  id: number;
  meta_id: number;
  usuario_id: number;
  usuario_nombre: string;
  usuario_email: string;
  area_id: number;
  nombre_area: string;
  eje: string | null;
  sub_eje: string | null;
  trimestre: number;
  anio: number;
  meta: string;
  indicador: string;
  accion: string | null;
  presupuesto: string | null;
  descripcion: string | null;
  archivo_url: string;
  archivo_nombre: string;
  archivo_tipo: string;
  archivo_tamano: number;
  calificacion: number;
  estado: string;
  comentario_admin: string | null;
  fecha_envio: string;
  fecha_revision: string;
  revisado_por_nombre: string | null;
}

interface Area {
  id: number;
  nombre_area: string;
}

interface Stats {
  total: number;
  promedioCalificacion: number;
  porArea: Record<string, number>;
  porTrimestre: Record<number, number>;
}

interface PlanAccionGeneralTableProps {
  isAdmin?: boolean;
  userAreaId?: number;
}

export default function PlanAccionGeneralTable({ isAdmin = false, userAreaId }: PlanAccionGeneralTableProps) {
  const [evidencias, setEvidencias] = useState<EvidenciaAprobada[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroArea, setFiltroArea] = useState<string>('');
  const [filtroTrimestre, setFiltroTrimestre] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  // Colores y espaciado inline
  const colors = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  };

  const spacing = {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px',
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAreas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    fetchEvidencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroArea, filtroTrimestre, busqueda, userAreaId]);

  const fetchAreas = async () => {
    try {
      const res = await fetch('/api/admin/areas');
      if (!res.ok) throw new Error('Error al cargar areas');
      const data = await res.json();
      setAreas(data || []);
    } catch (error) {
      console.error('Error al cargar areas:', error);
    }
  };

  const fetchEvidencias = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/plan-accion-general';
      const params = new URLSearchParams();
      
      // Si no es admin, filtrar automaticamente por su area
      if (!isAdmin && userAreaId) {
        params.append('areaId', userAreaId.toString());
      } else if (isAdmin && filtroArea) {
        params.append('areaId', filtroArea);
      }
      
      if (filtroTrimestre) params.append('trimestre', filtroTrimestre);
      if (busqueda) params.append('busqueda', busqueda);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al cargar plan de accion general');
      const data = await res.json();
      setEvidencias(data.evidencias || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error al cargar plan de accion general:', error);
      toast.error('Error al cargar datos', {
        description: 'No se pudo cargar el plan de accion general.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerArchivo = (evidencia: EvidenciaAprobada) => {
    window.open(evidencia.archivo_url, '_blank');
  };

  const getColorCalificacion = (calificacion: number) => {
    if (calificacion >= 80) return { bg: '#d1fae5', color: '#065f46' }; // Verde
    if (calificacion >= 60) return { bg: '#fef3c7', color: '#92400e' }; // Amarillo
    return { bg: '#fed7aa', color: '#9a3412' }; // Naranja
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
        padding: 40,
        textAlign: 'center',
        backgroundColor: colors.gray[50],
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12
      }}>
        <div>
          <div style={{
            width: 40,
            height: 40,
            border: `4px solid ${colors.gray[300]}`,
            borderTopColor: colors.primary,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: colors.gray[600], margin: 0 }}>Cargando plan de accion...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: colors.gray[900],
          marginBottom: spacing.xs,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm
        }}>
          <FileText size={28} color={colors.primary} />
          {isAdmin ? 'Plan de Acción General' : 'Plan de Acción - Mi Área'}
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: colors.gray[600],
          margin: 0
        }}>
          {isAdmin 
            ? 'Visualiza todas las evidencias aprobadas del sistema'
            : 'Evidencias aprobadas de tu área'}
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing.md,
          marginBottom: spacing.xl
        }}>
          <div style={{
            backgroundColor: 'white',
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: 12,
            padding: spacing.lg,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: colors.primary,
              marginBottom: spacing.xs
            }}>
              {stats.total}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: colors.gray[600],
              fontWeight: '500'
            }}>
              Evidencias Aprobadas
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: 12,
            padding: spacing.lg,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: colors.success,
              marginBottom: spacing.xs
            }}>
              {stats.promedioCalificacion}%
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: colors.gray[600],
              fontWeight: '500'
            }}>
              Calificación Promedio
            </div>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div style={{
        backgroundColor: 'white',
        border: `1px solid ${colors.gray[200]}`,
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.lg
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md
        }}>
          <Filter size={18} color={colors.gray[600]} />
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: colors.gray[700],
            margin: 0
          }}>
            Filtros
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isAdmin ? 'repeat(auto-fit, minmax(250px, 1fr))' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: spacing.md
        }}>
          {/* Búsqueda */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: colors.gray[700],
              marginBottom: spacing.xs
            }}>
              Buscar
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Meta, usuario, indicador..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: 8,
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.gray[300]}
            />
          </div>

          {/* Filtro de Área (solo admin) */}
          {isAdmin && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: colors.gray[700],
                marginBottom: spacing.xs
              }}>
                Filtrar por Área
              </label>
              <select
                value={filtroArea}
                onChange={(e) => setFiltroArea(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Todas las áreas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id.toString()}>
                    {area.nombre_area}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro de Trimestre */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: colors.gray[700],
              marginBottom: spacing.xs
            }}>
              Filtrar por Trimestre
            </label>
            <select
              value={filtroTrimestre}
              onChange={(e) => setFiltroTrimestre(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: 8,
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: 'white',
                cursor: 'pointer'
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
      </div>

      {/* Tabla de evidencias */}
      {evidencias.length === 0 ? (
        <div style={{
          padding: 60,
          textAlign: 'center',
          backgroundColor: colors.gray[50],
          borderRadius: 12,
          border: `1px solid ${colors.gray[200]}`
        }}>
          <XCircle size={48} color={colors.gray[400]} style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: 0, color: colors.gray[800], fontSize: '1.125rem' }}>
            No hay evidencias aprobadas
          </h3>
          <p style={{ margin: 0, marginTop: 8, color: colors.gray[600], fontSize: '0.875rem' }}>
            Las evidencias aprobadas apareceran aqui.
          </p>
        </div>
      ) : (
        <>
          <div style={{
            backgroundColor: 'white',
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8125rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: colors.gray[50] }}>
                    {isAdmin && (
                      <th style={{
                        padding: '12px 14px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: colors.gray[700],
                        borderBottom: `2px solid ${colors.gray[200]}`,
                        fontSize: '0.8125rem'
                      }}>
                        Área
                      </th>
                    )}
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: colors.gray[700],
                      borderBottom: `2px solid ${colors.gray[200]}`,
                      fontSize: '0.8125rem'
                    }}>
                      Eje / Sub-eje
                    </th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: colors.gray[700],
                      borderBottom: `2px solid ${colors.gray[200]}`,
                      fontSize: '0.8125rem'
                    }}>
                      Usuario
                    </th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: colors.gray[700],
                      borderBottom: `2px solid ${colors.gray[200]}`,
                      fontSize: '0.8125rem',
                      minWidth: '200px'
                    }}>
                      Meta
                    </th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: colors.gray[700],
                      borderBottom: `2px solid ${colors.gray[200]}`,
                      fontSize: '0.8125rem',
                      minWidth: '200px'
                    }}>
                      Acción
                    </th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: colors.gray[700],
                      borderBottom: `2px solid ${colors.gray[200]}`,
                      fontSize: '0.8125rem'
                    }}>
                      Presupuesto
                    </th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: colors.gray[700],
                      borderBottom: `2px solid ${colors.gray[200]}`,
                      fontSize: '0.8125rem'
                    }}>
                      T
                    </th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: colors.gray[700],
                      borderBottom: `2px solid ${colors.gray[200]}`,
                      fontSize: '0.8125rem',
                      minWidth: '180px'
                    }}>
                      Descripcion
                    </th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: colors.gray[700],
                      borderBottom: `2px solid ${colors.gray[200]}`,
                      fontSize: '0.8125rem'
                    }}>
                      Cal.
                    </th>
                    <th style={{
                      padding: '12px 14px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: colors.gray[700],
                      borderBottom: `2px solid ${colors.gray[200]}`,
                      fontSize: '0.8125rem'
                    }}>
                      Archivo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {evidencias.map((ev, idx) => {
                    const calColors = getColorCalificacion(ev.calificacion);
                    return (
                      <tr
                        key={ev.id}
                        style={{
                          backgroundColor: idx % 2 === 0 ? 'white' : colors.gray[50],
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[100]}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'white' : colors.gray[50]}
                      >
                        {isAdmin && (
                          <td style={{
                            padding: '12px 14px',
                            borderBottom: `1px solid ${colors.gray[200]}`,
                            color: colors.gray[900],
                            fontWeight: '500'
                          }}>
                            {ev.nombre_area}
                          </td>
                        )}
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: `1px solid ${colors.gray[200]}`,
                          color: colors.gray[800],
                          fontSize: '0.8125rem',
                          lineHeight: '1.4'
                        }}>
                          <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                            {ev.eje || '-'}
                          </div>
                          <div style={{ color: colors.gray[600], fontSize: '0.75rem' }}>
                            {ev.sub_eje || '-'}
                          </div>
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: `1px solid ${colors.gray[200]}`,
                          color: colors.gray[800],
                          fontSize: '0.8125rem'
                        }}>
                          <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                            {ev.usuario_nombre}
                          </div>
                          <div style={{ color: colors.gray[600], fontSize: '0.75rem' }}>
                            {ev.usuario_email}
                          </div>
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: `1px solid ${colors.gray[200]}`,
                          color: colors.gray[800],
                          fontSize: '0.8125rem',
                          lineHeight: '1.4'
                        }}>
                          {ev.meta}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: `1px solid ${colors.gray[200]}`,
                          color: colors.gray[700],
                          fontSize: '0.8125rem',
                          lineHeight: '1.4'
                        }}>
                          {ev.accion || '-'}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: `1px solid ${colors.gray[200]}`,
                          color: colors.gray[800],
                          fontWeight: '500',
                          textAlign: 'right',
                          fontSize: '0.8125rem'
                        }}>
                          {formatPresupuesto(ev.presupuesto)}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: `1px solid ${colors.gray[200]}`,
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: colors.primary,
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {ev.trimestre}
                          </span>
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: `1px solid ${colors.gray[200]}`,
                          color: colors.gray[700],
                          fontSize: '0.8125rem',
                          lineHeight: '1.4',
                          maxWidth: '200px'
                        }}>
                          {ev.descripcion || '-'}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: `1px solid ${colors.gray[200]}`,
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: 6,
                            backgroundColor: calColors.bg,
                            color: calColors.color,
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            <CheckCircle2 size={12} />
                            {ev.calificacion}%
                          </span>
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          borderBottom: `1px solid ${colors.gray[200]}`,
                          textAlign: 'center'
                        }}>
                          <button
                            onClick={() => handleVerArchivo(ev)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: colors.primary,
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#5558e3';
                              e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = colors.primary;
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <FileText size={14} />
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

          {/* Footer con estadisticas */}
          <div style={{
            marginTop: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.gray[50],
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8125rem',
            color: colors.gray[700]
          }}>
            <div>
              Mostrando <strong>{evidencias.length}</strong> evidencias aprobadas
            </div>
            {stats && (
              <div style={{ display: 'flex', gap: spacing.lg }}>
                <div>
                  Promedio: <strong style={{ color: colors.success }}>{stats.promedioCalificacion}%</strong>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
