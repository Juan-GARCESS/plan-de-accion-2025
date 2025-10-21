// src/components/admin/TrimestreSelections.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface SeleccionTrimestre {
  usuario_id: number;
  usuario_nombre: string;
  usuario_email: string;
  trimestre: number;
  año: number;
  participando: boolean;
  fecha_seleccion: Date;
  fecha_actualizacion: Date;
}

interface Estadistica {
  trimestre: number;
  total_selecciones: number;
  participando: number;
  no_participando: number;
}

interface SeleccionesData {
  selecciones_por_area: { [key: string]: SeleccionTrimestre[] };
  estadisticas: Estadistica[];
  año_actual: number;
}

export const TrimestreSelections: React.FC = () => {
  const [data, setData] = useState<SeleccionesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarSelecciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/selecciones-trimestres');
      if (!response.ok) {
        throw new Error('Error al cargar selecciones de trimestres');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSelecciones();
  }, []);

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#64748b' }}>Cargando selecciones de trimestres...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#dc2626' }}>Error: {error}</p>
        <button
          onClick={cargarSelecciones}
          style={{
            marginTop: '1rem',
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#64748b' }}>No hay datos de selecciones</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '3rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0
          }}>
            Selecciones de Trimestres {data.año_actual}
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '4px 0 0 0'
          }}>
            Revisa las selecciones de participación por área y trimestre
          </p>
        </div>
        <button
          onClick={cargarSelecciones}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {/* Estadísticas Generales */}
      {data.estadisticas.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#1e293b'
          }}>
            Resumen de Participación por Trimestre
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {data.estadisticas.map((stat) => (
              <div
                key={stat.trimestre}
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}
              >
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  Trimestre {stat.trimestre}
                </h4>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  <p style={{ margin: '4px 0' }}>
                    <span style={{ color: '#22c55e', fontWeight: '600' }}>
                      {stat.participando}
                    </span> participando
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <span style={{ color: '#ef4444', fontWeight: '600' }}>
                      {stat.no_participando}
                    </span> no participando
                  </p>
                  <p style={{ margin: '4px 0', fontWeight: '600' }}>
                    Total: {stat.total_selecciones}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selecciones por Área */}
      {Object.keys(data.selecciones_por_area).length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#64748b',
            marginBottom: '0.5rem'
          }}>
            No hay selecciones registradas
          </h3>
          <p style={{ color: '#94a3b8' }}>
            Los usuarios aún no han seleccionado sus trimestres de participación
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(data.selecciones_por_area).map(([areaNombre, selecciones]) => (
            <div
              key={areaNombre}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              {/* Header del Área */}
              <div style={{
                backgroundColor: '#f1f5f9',
                padding: '1rem',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: 0
                }}>
                  {areaNombre} ({selecciones.length} selecciones)
                </h3>
              </div>

              {/* Tabla de Selecciones */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#475569',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        Usuario
                      </th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#475569',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        T1
                      </th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#475569',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        T2
                      </th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#475569',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        T3
                      </th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#475569',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        T4
                      </th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#475569',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        Última actualización
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Agrupar selecciones por usuario */}
                    {Object.values(
                      selecciones.reduce((usuarios: { [key: number]: SeleccionTrimestre[] }, seleccion) => {
                        if (!usuarios[seleccion.usuario_id]) {
                          usuarios[seleccion.usuario_id] = [];
                        }
                        usuarios[seleccion.usuario_id].push(seleccion);
                        return usuarios;
                      }, {})
                    ).map((seleccionesUsuario) => {
                      const usuario = seleccionesUsuario[0];
                      const seleccionesPorTrimestre = seleccionesUsuario.reduce((acc, sel) => {
                        acc[sel.trimestre] = sel;
                        return acc;
                      }, {} as { [key: number]: SeleccionTrimestre });

                      const ultimaActualizacion = Math.max(
                        ...seleccionesUsuario.map(s => new Date(s.fecha_actualizacion).getTime())
                      );

                      return (
                        <tr key={usuario.usuario_id} style={{
                          borderBottom: '1px solid #f1f5f9'
                        }}>
                          <td style={{
                            padding: '12px',
                            fontSize: '14px',
                            color: '#334155'
                          }}>
                            <div>
                              <p style={{
                                fontWeight: '500',
                                margin: 0,
                                marginBottom: '2px'
                              }}>
                                {usuario.usuario_nombre}
                              </p>
                              <p style={{
                                fontSize: '12px',
                                color: '#64748b',
                                margin: 0
                              }}>
                                {usuario.usuario_email}
                              </p>
                            </div>
                          </td>
                          {[1, 2, 3, 4].map((trimestre) => {
                            const seleccion = seleccionesPorTrimestre[trimestre];
                            return (
                              <td key={trimestre} style={{
                                padding: '12px',
                                textAlign: 'center'
                              }}>
                                {seleccion ? (
                                  <span style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: seleccion.participando ? '#dcfce7' : '#fef2f2',
                                    color: seleccion.participando ? '#15803d' : '#dc2626'
                                  }}>
                                    {seleccion.participando ? 'SÍ' : 'NO'}
                                  </span>
                                ) : (
                                  <span style={{
                                    fontSize: '12px',
                                    color: '#94a3b8'
                                  }}>
                                    -
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td style={{
                            padding: '12px',
                            fontSize: '12px',
                            color: '#64748b'
                          }}>
                            {new Date(ultimaActualizacion).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};