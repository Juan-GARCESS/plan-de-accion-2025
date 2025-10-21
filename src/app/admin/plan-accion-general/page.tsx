// src/app/admin/plan-accion-general/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { colors, spacing } from '@/lib/styleUtils';

interface EvidenciaAprobada {
  id: number;
  meta_id: number;
  usuario_id: number;
  usuario_nombre: string;
  usuario_email: string;
  area_id: number;
  nombre_area: string;
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

interface Stats {
  total: number;
  promedioCalificacion: number;
  porArea: Record<string, number>;
  porTrimestre: Record<number, number>;
}

export default function PlanAccionGeneralPage() {
  const [evidencias, setEvidencias] = useState<EvidenciaAprobada[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroArea, setFiltroArea] = useState<string>('');
  const [filtroTrimestre, setFiltroTrimestre] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchEvidencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroArea, filtroTrimestre, busqueda]);

  const fetchEvidencias = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/plan-accion-general';
      const params = new URLSearchParams();
      if (filtroArea) params.append('areaId', filtroArea);
      if (filtroTrimestre) params.append('trimestre', filtroTrimestre);
      if (busqueda) params.append('busqueda', busqueda);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al cargar plan de acción general');
      const data = await res.json();
      setEvidencias(data.evidencias || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error al cargar plan de acción general:', error);
      toast.error('Error al cargar datos', {
        description: 'No se pudo cargar el plan de acción general.'
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

  // Obtener áreas únicas para filtro
  const areasUnicas = Array.from(new Set(evidencias.map(e => e.nombre_area)));

  if (loading) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        backgroundColor: colors.gray[50],
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
          <p style={{ color: colors.gray[600], margin: 0 }}>Cargando plan de acción general...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: spacing.xl }}>
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: colors.gray[900],
          marginBottom: spacing.xs,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm
        }}>
          📊 Plan de Acción General
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: colors.gray[600],
          margin: 0
        }}>
          Visualiza todas las evidencias aprobadas del sistema
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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: spacing.md
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
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
              placeholder="Buscar por meta, usuario..."
              style={{
                width: '100%',
                padding: spacing.sm,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: 8,
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
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
                padding: spacing.sm,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: 8,
                fontSize: '0.875rem'
              }}
            >
              <option value="">Todas las áreas</option>
              {areasUnicas.map((area, i) => (
                <option key={i} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
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
                padding: spacing.sm,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: 8,
                fontSize: '0.875rem'
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
          borderRadius: 12
        }}>
          <span style={{ fontSize: '4rem', marginBottom: 16, display: 'block' }}>📭</span>
          <h3 style={{ margin: 0, color: colors.gray[800] }}>No hay evidencias aprobadas</h3>
          <p style={{ margin: 0, marginTop: 8, color: colors.gray[600], fontSize: '0.875rem' }}>
            Las evidencias aprobadas aparecerán aquí.
          </p>
        </div>
      ) : (
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
              fontSize: '0.875rem'
            }}>
              <thead>
                <tr style={{ backgroundColor: colors.gray[50] }}>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: '600',
                    color: colors.gray[700],
                    borderBottom: `1px solid ${colors.gray[200]}`
                  }}>
                    Área
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: '600',
                    color: colors.gray[700],
                    borderBottom: `1px solid ${colors.gray[200]}`
                  }}>
                    Usuario
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: '600',
                    color: colors.gray[700],
                    borderBottom: `1px solid ${colors.gray[200]}`
                  }}>
                    Meta
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'center',
                    fontWeight: '600',
                    color: colors.gray[700],
                    borderBottom: `1px solid ${colors.gray[200]}`
                  }}>
                    Trimestre
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: '600',
                    color: colors.gray[700],
                    borderBottom: `1px solid ${colors.gray[200]}`
                  }}>
                    Descripción
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'center',
                    fontWeight: '600',
                    color: colors.gray[700],
                    borderBottom: `1px solid ${colors.gray[200]}`
                  }}>
                    Calificación
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'center',
                    fontWeight: '600',
                    color: colors.gray[700],
                    borderBottom: `1px solid ${colors.gray[200]}`
                  }}>
                    Archivo
                  </th>
                </tr>
              </thead>
              <tbody>
                {evidencias.map((evidencia) => {
                  const colorCalif = getColorCalificacion(evidencia.calificacion);
                  return (
                    <tr
                      key={evidencia.id}
                      style={{
                        borderBottom: `1px solid ${colors.gray[100]}`
                      }}
                    >
                      <td style={{ padding: spacing.md }}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: colors.gray[900]
                        }}>
                          {evidencia.nombre_area}
                        </div>
                      </td>
                      <td style={{ padding: spacing.md }}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: colors.gray[900]
                        }}>
                          {evidencia.usuario_nombre}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: colors.gray[600]
                        }}>
                          {evidencia.usuario_email}
                        </div>
                      </td>
                      <td style={{ padding: spacing.md, maxWidth: '300px' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: colors.gray[800],
                          fontWeight: '500'
                        }}>
                          {evidencia.meta}
                        </div>
                        {evidencia.indicador && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: colors.gray[600],
                            marginTop: 4
                          }}>
                            {evidencia.indicador}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: spacing.md, textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          backgroundColor: colors.gray[100],
                          color: colors.gray[700],
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          T{evidencia.trimestre}
                        </span>
                      </td>
                      <td style={{ padding: spacing.md, maxWidth: '250px' }}>
                        <div style={{
                          fontSize: '0.75rem',
                          color: colors.gray[700],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {evidencia.descripcion || '-'}
                        </div>
                      </td>
                      <td style={{ padding: spacing.md, textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          backgroundColor: colorCalif.bg,
                          color: colorCalif.color,
                          borderRadius: 8,
                          fontSize: '0.875rem',
                          fontWeight: '700'
                        }}>
                          {evidencia.calificacion}%
                        </span>
                      </td>
                      <td style={{ padding: spacing.md, textAlign: 'center' }}>
                        <button
                          onClick={() => handleVerArchivo(evidencia)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}
                        >
                          👁️ Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}