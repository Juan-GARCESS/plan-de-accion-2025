// src/components/admin/EvidenciasReview.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { colors, spacing } from '@/lib/styleUtils';
import { Star, TrendingUp, Trash2, Loader2, ClipboardList, Check, X, Paperclip, Eye, FileText, Edit2 } from 'lucide-react';

interface Evidencia {
  id: number;
  meta_id: number;
  usuario_id: number;
  usuario_nombre: string;
  area_id: number;
  area_nombre: string;
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
  calificacion: number | null;
  estado: string;
  comentario_admin: string | null;
  fecha_envio: string;
  fecha_revision: string | null;
}

interface CalificacionTrimestre {
  id: number;
  usuario_id: number;
  area_id: number;
  trimestre: number;
  calificacion_general: number;
  comentario_general: string | null;
  calificado_por: number;
  fecha_calificacion: string;
}

interface EvidenciasReviewProps {
  areaId?: number;
  trimestre?: number;
}

export const EvidenciasReview: React.FC<EvidenciasReviewProps> = ({ areaId, trimestre }) => {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [calificacionTrimestre, setCalificacionTrimestre] = useState<CalificacionTrimestre | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvidencia, setSelectedEvidencia] = useState<Evidencia | null>(null);
  const [editingEvidencia, setEditingEvidencia] = useState<Evidencia | null>(null);
  const [deletingEvidencia, setDeletingEvidencia] = useState<Evidencia | null>(null);
  const [showCalificacionTrimestreModal, setShowCalificacionTrimestreModal] = useState(false);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [calificacionGeneralTrimestre, setCalificacionGeneralTrimestre] = useState(0);
  const [comentarioGeneralTrimestre, setComentarioGeneralTrimestre] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'todas' | 'pendientes' | 'aprobadas' | 'rechazadas'>('pendientes');

  useEffect(() => {
    fetchEvidencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId, trimestre]);

  useEffect(() => {
    if (evidencias.length > 0) {
      fetchCalificacionTrimestre();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evidencias]);

  const fetchEvidencias = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/evidencias';
      const params = new URLSearchParams();
      if (areaId) params.append('areaId', areaId.toString());
      if (trimestre) params.append('trimestre', trimestre.toString());
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al cargar evidencias');
      const data = await res.json();
      
      // Verificar si no hay envío
      if (data.sin_envio) {
        setEvidencias([]);
      } else {
        setEvidencias(data.evidencias || []);
      }
    } catch (error) {
      console.error('Error al cargar evidencias:', error);
      setEvidencias([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalificacionTrimestre = async () => {
    if (!evidencias.length || !trimestre) return;
    
    // Obtener el usuario_id de la primera evidencia (todas son del mismo usuario en un trimestre)
    const usuario_id = evidencias[0]?.usuario_id;
    if (!usuario_id) return;
    
    try {
      const res = await fetch(`/api/admin/calificaciones-trimestre?usuario_id=${usuario_id}&trimestre=${trimestre}`);
      if (!res.ok) return;
      const data = await res.json();
      setCalificacionTrimestre(data.data);
      if (data.data) {
        setCalificacionGeneralTrimestre(data.data.calificacion_general);
        setComentarioGeneralTrimestre(data.data.comentario_general || '');
      }
    } catch (error) {
      console.error('Error al cargar calificación del trimestre:', error);
    }
  };

  const handleCalificar = async (aprobar: boolean) => {
    if (!selectedEvidencia) return;

    if (calificacion < 0 || calificacion > 100) {
      toast.warning('Calificación inválida', {
        description: 'La calificación debe estar entre 0 y 100.'
      });
      return;
    }

    setSubmitting(true);

    try {
      // 1. Calificar evidencia (aprobar/rechazar)
      const res = await fetch('/api/admin/calificar-evidencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidencia_id: selectedEvidencia.id,
          calificacion: calificacion,
          comentario: comentario || null,
          estado: aprobar ? 'aprobado' : 'rechazado'
        })
      });

      if (!res.ok) throw new Error('Error al calificar');

      // 2. Guardar calificación trimestral de la meta (informativa)
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userId='))
        ?.split('=')[1];
      
      await fetch('/api/admin/calificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_id: selectedEvidencia.meta_id,
          trimestre: selectedEvidencia.trimestre,
          calificacion: calificacion,
          comentario: comentario || null,
          admin_id: parseInt(userCookie || '0')
        })
      });

      toast.success(aprobar ? 'Evidencia aprobada' : 'Evidencia rechazada', {
        description: `Se ha notificado al usuario por email.`,
        duration: 4000
      });

      // Actualizar localmente
      setEvidencias(prev => prev.map(e =>
        e.id === selectedEvidencia.id
          ? {
              ...e,
              calificacion: calificacion,
              comentario_admin: comentario || null,
              estado: aprobar ? 'aprobado' : 'rechazado'
            }
          : e
      ));

      // Cerrar modal
      setSelectedEvidencia(null);
      setCalificacion(0);
      setComentario('');
    } catch (error) {
      toast.error('Error al calificar', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditarCalificacion = async () => {
    if (!editingEvidencia) return;

    if (calificacion < 0 || calificacion > 100) {
      toast.warning('Calificación inválida', {
        description: 'La calificación debe estar entre 0 y 100.'
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/evidencias/${editingEvidencia.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calificacion,
          comentario_admin: comentario || null
        })
      });

      if (!res.ok) throw new Error('Error al actualizar');

      toast.success('✓ Calificación actualizada', {
        description: 'Los cambios se han guardado correctamente.',
        duration: 3000
      });

      // Actualizar localmente
      setEvidencias(prev => prev.map(e =>
        e.id === editingEvidencia.id
          ? {
              ...e,
              calificacion,
              comentario_admin: comentario || null
            }
          : e
      ));

      // Cerrar modal
      setEditingEvidencia(null);
      setCalificacion(0);
      setComentario('');
    } catch (error) {
      toast.error('Error al actualizar', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuardarCalificacionTrimestre = async () => {
    if (!evidencias.length || !trimestre || !areaId) return;

    if (calificacionGeneralTrimestre < 0 || calificacionGeneralTrimestre > 100) {
      toast.warning('Calificación inválida', {
        description: 'La calificación debe estar entre 0 y 100.'
      });
      return;
    }

    setSubmitting(true);

    try {
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userId='))
        ?.split('=')[1];

      const usuario_id = evidencias[0].usuario_id;
      const method = calificacionTrimestre ? 'PATCH' : 'POST';

      const res = await fetch('/api/admin/calificaciones-trimestre', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id,
          area_id: areaId,
          trimestre,
          calificacion_general: calificacionGeneralTrimestre,
          comentario_general: comentarioGeneralTrimestre || null,
          admin_id: parseInt(userCookie || '0')
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al guardar');
      }

      toast.success('Calificación General del Trimestre guardada', {
        description: 'Esta calificación se usará para calcular el promedio anual.',
        duration: 3000
      });

      // Recargar calificación del trimestre
      fetchCalificacionTrimestre();

      // Cerrar modal
      setShowCalificacionTrimestreModal(false);
    } catch (error) {
      toast.error('Error al guardar calificación del trimestre', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async () => {
    if (!deletingEvidencia) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/evidencias/${deletingEvidencia.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Error al eliminar');

      toast.success('Evidencia eliminada', {
        description: 'La evidencia ha sido eliminada permanentemente.',
        duration: 3000
      });

      // Eliminar localmente
      setEvidencias(prev => prev.filter(e => e.id !== deletingEvidencia.id));

      // Cerrar modal
      setDeletingEvidencia(null);
    } catch (error) {
      toast.error('Error al eliminar', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerEvidencia = async (evidencia: Evidencia) => {
    try {
      // Si archivo_url es una URL completa de S3, abrirla directamente
      if (evidencia.archivo_url.startsWith('http')) {
        window.open(evidencia.archivo_url, '_blank');
      } else {
        // Fallback para evidencias antiguas
        const res = await fetch(`/api/admin/ver-evidencia?id=${evidencia.id}`);
        if (!res.ok) throw new Error('Error al cargar evidencia');
        
        const data = await res.json();
        window.open(data.archivo, '_blank');
      }
    } catch {
      toast.error('Error al ver evidencia', {
        description: 'No se pudo cargar el archivo.'
      });
    }
  };

  const evidenciasFiltradas = evidencias.filter(e => {
    if (filter === 'pendientes') return e.estado === 'pendiente' || !e.estado;
    if (filter === 'aprobadas') return e.estado === 'aprobado';
    if (filter === 'rechazadas') return e.estado === 'rechazado';
    return true;
  });

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: colors.gray[600] }}>Cargando evidencias...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mensaje cuando NO hay envío de evidencias */}
      {evidencias.length === 0 && areaId && trimestre && (
        <div style={{
          background: '#F3F4F6',
          border: '2px dashed #9CA3AF',
          borderRadius: '12px',
          padding: spacing.xl,
          textAlign: 'center',
          marginBottom: spacing.xl
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing.md
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#E5E7EB',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px'
            }}>
              📭
            </div>
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: spacing.xs
              }}>
                Aún no se ha enviado ninguna evidencia
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                marginBottom: 0
              }}>
                El usuario todavía no ha realizado el envío del Trimestre {trimestre}.
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                marginTop: spacing.xs,
                marginBottom: 0
              }}>
                Una vez que envíe todas las metas, aparecerán aquí para calificar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botones de filtro - solo mostrar si HAY evidencias */}
      {evidencias.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.lg
        }}>
          <div style={{
            display: 'flex',
            gap: spacing.sm
          }}>
            {(['todas', 'pendientes', 'aprobadas', 'rechazadas'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: filter === f ? colors.primary : colors.gray[200],
                  color: filter === f ? 'white' : colors.gray[700],
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}
              >
                {f} ({evidencias.filter(e => {
                  if (f === 'pendientes') return e.estado === 'pendiente' || !e.estado;
                  if (f === 'aprobadas') return e.estado === 'aprobado';
                  if (f === 'rechazadas') return e.estado === 'rechazado';
                  return true;
                }).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sección eliminada - ahora se usa calificación por trimestre */}
      {false && (
        <div style={{
          marginBottom: spacing.xl,
          padding: spacing.lg,
          backgroundColor: 'white',
          border: `2px solid ${colors.gray[200]}`,
          borderRadius: 12
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            marginBottom: spacing.md
          }}>
            <TrendingUp size={24} color={colors.primary} />
            <h3 style={{ 
              margin: 0, 
              color: colors.gray[900],
              fontSize: '1.25rem',
              fontWeight: '700'
            }}>
              Calificación General por Meta
            </h3>
          </div>
          <div style={{
            backgroundColor: '#e0f2fe',
            border: '1px solid #0284c7',
            borderRadius: 8,
            padding: spacing.md,
            marginBottom: spacing.lg
          }}>
            <p style={{
              margin: 0,
              color: '#0c4a6e',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              💡 Instrucciones:
            </p>
            <p style={{
              margin: 0,
              marginTop: spacing.xs,
              color: '#075985',
              fontSize: '0.875rem',
              lineHeight: 1.5
            }}>
              Aquí calificas <strong>cada meta completa</strong> con una nota de 0 a 100. Esta calificación representa el desempeño general de toda la meta durante el año. <strong>El promedio del área se calcula con estas calificaciones.</strong>
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: spacing.md
          }}>
            {[].map((meta: { meta_id: number; calificacion_total_general: number | null; meta: string; comentario_general: string }) => (
              <div
                key={meta.meta_id}
                style={{
                  padding: spacing.md,
                  backgroundColor: 'white',
                  borderRadius: 12,
                  border: `2px solid ${meta.calificacion_total_general !== null ? colors.primary : colors.gray[300]}`,
                  boxShadow: meta.calificacion_total_general !== null ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                <h4 style={{
                  margin: 0,
                  marginBottom: spacing.md,
                  color: colors.gray[900],
                  fontSize: '1rem',
                  fontWeight: '700',
                  lineHeight: 1.4,
                  minHeight: '3rem'
                }}>
                  {meta.meta}
                </h4>

                <div style={{
                  backgroundColor: meta.calificacion_total_general !== null ? '#dcfce7' : colors.gray[100],
                  padding: spacing.md,
                  borderRadius: 8,
                  marginBottom: spacing.sm,
                  textAlign: 'center'
                }}>
                  {meta.calificacion_total_general !== null ? (
                    <>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#166534',
                        fontWeight: '600',
                        marginBottom: 4
                      }}>
                        CALIFICACIÓN GENERAL
                      </div>
                      <div style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: '#166534'
                      }}>
                        {meta.calificacion_total_general}
                      </div>
                    </>
                  ) : (
                    <div style={{
                      fontSize: '0.875rem',
                      color: colors.gray[600],
                      fontStyle: 'italic',
                      padding: spacing.md
                    }}>
                      Sin calificar aún
                    </div>
                  )}
                </div>

                {meta.comentario_general && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: colors.gray[600],
                    marginBottom: spacing.sm,
                    fontStyle: 'italic',
                    padding: spacing.xs,
                    backgroundColor: colors.gray[50],
                    borderRadius: 4
                  }}>
                    &quot;{meta.comentario_general}&quot;
                  </div>
                )}

                <button
                  onClick={() => {
                    // Código viejo - no se usa
                  }}
                  style={{
                    width: '100%',
                    padding: `${spacing.sm} ${spacing.md}`,
                    backgroundColor: meta.calificacion_total_general !== null ? colors.gray[700] : colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  {meta.calificacion_total_general !== null ? 'Editar Calificación' : 'Calificar Meta'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de evidencias */}
      {evidenciasFiltradas.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: 'center',
          backgroundColor: colors.gray[50],
          borderRadius: 12
        }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center', color: colors.gray[400] }}>
            <ClipboardList size={48} />
          </div>
          <h3 style={{ margin: 0, color: colors.gray[800] }}>No hay evidencias</h3>
          <p style={{ margin: 0, marginTop: 8, color: colors.gray[600], fontSize: '0.875rem' }}>
            {filter === 'pendientes' 
              ? 'Todas las evidencias han sido calificadas.' 
              : 'No hay evidencias disponibles.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: spacing.md
        }}>
          {evidenciasFiltradas.map(evidencia => (
            <div
              key={evidencia.id}
              style={{
                backgroundColor: 'white',
                border: `1px solid ${colors.gray[200]}`,
                borderRadius: 12,
                padding: spacing.md,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: spacing.sm
              }}>
                <div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: colors.gray[900],
                    marginBottom: 4
                  }}>
                    {evidencia.usuario_nombre}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: colors.gray[600]
                  }}>
                    {evidencia.area_nombre} • T{evidencia.trimestre}
                  </div>
                </div>
                
                {evidencia.estado && evidencia.estado !== 'pendiente' && (
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: evidencia.estado === 'aprobado' 
                      ? '#d1fae5' 
                      : '#fecaca',
                    color: evidencia.estado === 'aprobado' 
                      ? '#065f46' 
                      : '#991b1b',
                    borderRadius: 12,
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {evidencia.estado === 'aprobado' ? <Check size={14} /> : <X size={14} />}
                    {evidencia.calificacion}%
                  </span>
                )}
              </div>

              <div style={{
                backgroundColor: colors.gray[50],
                padding: spacing.sm,
                borderRadius: 8,
                marginBottom: spacing.sm,
                fontSize: '0.875rem'
              }}>
                <div style={{ fontWeight: '600', color: colors.gray[800], marginBottom: 4 }}>
                  Meta:
                </div>
                <div style={{ color: colors.gray[700] }}>
                  {evidencia.meta}
                </div>
              </div>

              <div style={{ marginBottom: spacing.sm, fontSize: '0.75rem', color: colors.gray[600], display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Paperclip size={14} />
                {evidencia.archivo_nombre}
              </div>

              <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleVerEvidencia(evidencia)}
                  style={{
                    flex: 1,
                    minWidth: '80px',
                    padding: `${spacing.sm} ${spacing.md}`,
                    backgroundColor: colors.gray[700],
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center'
                  }}
                >
                  <Eye size={14} />
                  Ver
                </button>
                
                {(evidencia.estado === 'pendiente' || !evidencia.estado) && (
                  <button
                    onClick={() => {
                      setSelectedEvidencia(evidencia);
                      setCalificacion(evidencia.calificacion || 75);
                      setComentario(evidencia.comentario_admin || '');
                    }}
                    style={{
                      flex: 1,
                      minWidth: '100px',
                      padding: `${spacing.sm} ${spacing.md}`,
                      backgroundColor: colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'center'
                    }}
                  >
                    <FileText size={14} />
                    Calificar
                  </button>
                )}

                {/* Botón Editar - Solo si ya está calificada */}
                {evidencia.estado && evidencia.estado !== 'pendiente' && (
                  <button
                    onClick={() => {
                      setEditingEvidencia(evidencia);
                      setCalificacion(evidencia.calificacion || 0);
                      setComentario(evidencia.comentario_admin || '');
                    }}
                    style={{
                      flex: 1,
                      minWidth: '80px',
                      padding: `${spacing.sm} ${spacing.md}`,
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'center'
                    }}
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                )}

                {/* Botón Eliminar - Siempre visible */}
                <button
                  onClick={() => setDeletingEvidencia(evidencia)}
                  style={{
                    padding: `${spacing.sm} ${spacing.md}`,
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Eliminar evidencia"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calificación General del Trimestre */}
      {evidencias.length > 0 && trimestre && (
        <div style={{
          marginTop: spacing.xl,
          padding: spacing.lg,
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: 12
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            marginBottom: spacing.md
          }}>
            <Star size={24} color="#f59e0b" fill="#f59e0b" />
            <h3 style={{ margin: 0, color: colors.gray[900], fontSize: '1.25rem', fontWeight: '700' }}>
              Calificación General del Trimestre {trimestre}
            </h3>
          </div>

          <p style={{
            margin: 0,
            marginBottom: spacing.md,
            color: colors.gray[700],
            fontSize: '0.875rem'
          }}>
            Después de revisar todas las metas de <strong>{evidencias[0]?.usuario_nombre}</strong>, asigna una calificación general para este trimestre:
          </p>

          {calificacionTrimestre && (
            <div style={{
              backgroundColor: 'white',
              padding: spacing.md,
              borderRadius: 8,
              marginBottom: spacing.md,
              border: `2px solid ${colors.primary}`
            }}>
              <div style={{ fontSize: '0.875rem', color: colors.gray[600], marginBottom: spacing.xs }}>
                Calificación actual:
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.primary }}>
                {calificacionTrimestre.calificacion_general}
              </div>
              {calificacionTrimestre.comentario_general && (
                <div style={{
                  marginTop: spacing.sm,
                  fontSize: '0.875rem',
                  fontStyle: 'italic',
                  color: colors.gray[600]
                }}>
                  &quot;{calificacionTrimestre.comentario_general}&quot;
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              if (calificacionTrimestre) {
                setCalificacionGeneralTrimestre(calificacionTrimestre.calificacion_general);
                setComentarioGeneralTrimestre(calificacionTrimestre.comentario_general || '');
              }
              setShowCalificacionTrimestreModal(true);
            }}
            style={{
              width: '100%',
              padding: `${spacing.md} ${spacing.lg}`,
              backgroundColor: calificacionTrimestre ? colors.gray[700] : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            {calificacionTrimestre ? 'Editar Calificación General' : 'Calificar Trimestre'}
          </button>
        </div>
      )}

      {/* Modal de calificación */}
      {selectedEvidencia && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: spacing.md
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: spacing.lg,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: 0, marginBottom: spacing.md, fontSize: '1.5rem', color: colors.gray[900] }}>
              Calificar Evidencia
            </h2>

            <div style={{ marginBottom: spacing.md }}>
              <strong>{selectedEvidencia.usuario_nombre}</strong> - {selectedEvidencia.area_nombre}
              <div style={{ fontSize: '0.875rem', color: colors.gray[600], marginTop: 4 }}>
                {selectedEvidencia.meta}
              </div>
            </div>

            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: spacing.xs,
                fontSize: '0.875rem'
              }}>
                Calificación (0-100%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={calificacion}
                onChange={(e) => setCalificacion(parseInt(e.target.value))}
                onInput={(e) => setCalificacion(parseInt((e.target as HTMLInputElement).value))}
                style={{ 
                  width: '100%', 
                  marginBottom: spacing.xs,
                  cursor: 'pointer'
                }}
              />
              <div style={{
                textAlign: 'center',
                fontSize: '2rem',
                fontWeight: '700',
                color: calificacion >= 70 ? colors.success : colors.danger
              }}>
                {calificacion}%
              </div>
            </div>

            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: spacing.xs,
                fontSize: '0.875rem'
              }}>
                Comentario (opcional)
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Agrega un comentario para el usuario..."
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  minHeight: 80
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: spacing.sm }}>
              <button
                onClick={() => handleCalificar(true)}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: colors.success,
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? '⏳' : '✓'} Aprobar
              </button>

              <button
                onClick={() => handleCalificar(false)}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: colors.danger,
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? '⏳' : '✗'} Rechazar
              </button>

              <button
                onClick={() => {
                  setSelectedEvidencia(null);
                  setCalificacion(0);
                  setComentario('');
                }}
                disabled={submitting}
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: colors.gray[200],
                  color: colors.gray[700],
                  border: 'none',
                  borderRadius: 8,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de calificación */}
      {editingEvidencia && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: spacing.md
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: spacing.lg,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: 0, marginBottom: spacing.md, fontSize: '1.5rem', color: colors.gray[900] }}>
              Editar Calificación
            </h2>

            <div style={{ marginBottom: spacing.md }}>
              <strong>{editingEvidencia.usuario_nombre}</strong> - {editingEvidencia.area_nombre}
              <div style={{ fontSize: '0.875rem', color: colors.gray[600], marginTop: 4 }}>
                {editingEvidencia.meta}
              </div>
            </div>

            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: spacing.xs,
                fontSize: '0.875rem'
              }}>
                Calificación (0-100%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={calificacion}
                onChange={(e) => setCalificacion(parseInt(e.target.value))}
                onInput={(e) => setCalificacion(parseInt((e.target as HTMLInputElement).value))}
                style={{ 
                  width: '100%', 
                  marginBottom: spacing.xs,
                  cursor: 'pointer'
                }}
              />
              <div style={{
                textAlign: 'center',
                fontSize: '2rem',
                fontWeight: '700',
                color: calificacion >= 70 ? colors.success : colors.danger
              }}>
                {calificacion}%
              </div>
            </div>

            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: spacing.xs,
                fontSize: '0.875rem'
              }}>
                Comentario (opcional)
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Agrega un comentario para el usuario..."
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  minHeight: 80
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: spacing.sm }}>
              <button
                onClick={handleEditarCalificacion}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? '⏳ Guardando...' : '✓ Guardar Cambios'}
              </button>

              <button
                onClick={() => {
                  setEditingEvidencia(null);
                  setCalificacion(0);
                  setComentario('');
                }}
                disabled={submitting}
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: colors.gray[200],
                  color: colors.gray[700],
                  border: 'none',
                  borderRadius: 8,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deletingEvidencia && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: spacing.md
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: spacing.lg,
            maxWidth: 450,
            width: '100%'
          }}>
            <h2 style={{ 
              margin: 0, 
              marginBottom: spacing.md, 
              fontSize: '1.5rem', 
              color: colors.gray[900],
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm
            }}>
              <span style={{ fontSize: '2rem' }}>⚠️</span>
              Eliminar Evidencia
            </h2>

            <div style={{ marginBottom: spacing.lg }}>
              <p style={{ margin: 0, marginBottom: spacing.sm, color: colors.gray[700] }}>
                ¿Estás seguro de que deseas eliminar esta evidencia?
              </p>
              <div style={{
                backgroundColor: colors.gray[50],
                padding: spacing.sm,
                borderRadius: 8,
                fontSize: '0.875rem'
              }}>
                <strong>{deletingEvidencia.usuario_nombre}</strong> - {deletingEvidencia.area_nombre}
                <div style={{ marginTop: 4, color: colors.gray[600] }}>
                  📎 {deletingEvidencia.archivo_nombre}
                </div>
              </div>
              <p style={{ 
                margin: 0, 
                marginTop: spacing.sm, 
                color: '#dc2626',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                ⚠️ Esta acción no se puede deshacer.
              </p>
            </div>

            <div style={{ display: 'flex', gap: spacing.sm }}>
              <button
                onClick={handleEliminar}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  opacity: submitting ? 0.6 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Eliminando...</>
                ) : (
                  <><Trash2 size={16} /> Eliminar</>
                )}
              </button>

              <button
                onClick={() => setDeletingEvidencia(null)}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: colors.gray[200],
                  color: colors.gray[700],
                  border: 'none',
                  borderRadius: 8,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Calificación General del Trimestre */}
      {showCalificacionTrimestreModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: spacing.md
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: spacing.lg,
            maxWidth: 500,
            width: '100%'
          }}>
            <h2 style={{ 
              margin: 0, 
              marginBottom: spacing.md, 
              fontSize: '1.5rem', 
              color: colors.gray[900],
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm
            }}>
              <Star size={24} color="#f59e0b" fill="#f59e0b" />
              Calificación General - Trimestre {trimestre}
            </h2>

            <div style={{ marginBottom: spacing.lg }}>
              <p style={{ 
                margin: 0, 
                marginBottom: spacing.md, 
                color: colors.gray[700],
                fontSize: '0.875rem'
              }}>
                Esta calificación representa el desempeño general de <strong>{evidencias[0]?.usuario_nombre}</strong> en este trimestre.
              </p>

              <div style={{ marginBottom: spacing.md }}>
                <label style={{
                  display: 'block',
                  marginBottom: spacing.xs,
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.gray[700]
                }}>
                  Calificación (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={calificacionGeneralTrimestre || ''}
                  onChange={(e) => setCalificacionGeneralTrimestre(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    border: `1px solid ${colors.gray[300]}`,
                    borderRadius: 8,
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                  placeholder="Ingrese calificación"
                />
              </div>

              <div style={{ marginBottom: spacing.md }}>
                <label style={{
                  display: 'block',
                  marginBottom: spacing.xs,
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.gray[700]
                }}>
                  Comentario (opcional)
                </label>
                <textarea
                  value={comentarioGeneralTrimestre}
                  onChange={(e) => setComentarioGeneralTrimestre(e.target.value)}
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    border: `1px solid ${colors.gray[300]}`,
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    minHeight: 80,
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Observaciones generales del trimestre..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: spacing.sm }}>
              <button
                onClick={handleGuardarCalificacionTrimestre}
                disabled={submitting || calificacionGeneralTrimestre === 0}
                style={{
                  flex: 1,
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: submitting || calificacionGeneralTrimestre === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  opacity: submitting || calificacionGeneralTrimestre === 0 ? 0.6 : 1
                }}
              >
                {submitting ? 'Guardando...' : 'Guardar Calificación'}
              </button>

              <button
                onClick={() => {
                  setShowCalificacionTrimestreModal(false);
                  setCalificacionGeneralTrimestre(0);
                  setComentarioGeneralTrimestre('');
                }}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: colors.gray[200],
                  color: colors.gray[700],
                  border: 'none',
                  borderRadius: 8,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
