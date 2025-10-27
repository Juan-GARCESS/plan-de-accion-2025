// src/components/admin/EvidenciasReview.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { colors, spacing } from '@/lib/styleUtils';

interface Evidencia {
  id: number;
  meta_id: number;
  usuario_nombre: string;
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

interface EvidenciasReviewProps {
  areaId?: number;
  trimestre?: number;
}

export const EvidenciasReview: React.FC<EvidenciasReviewProps> = ({ areaId, trimestre }) => {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvidencia, setSelectedEvidencia] = useState<Evidencia | null>(null);
  const [editingEvidencia, setEditingEvidencia] = useState<Evidencia | null>(null);
  const [deletingEvidencia, setDeletingEvidencia] = useState<Evidencia | null>(null);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'todas' | 'pendientes' | 'aprobadas' | 'rechazadas'>('pendientes');

  useEffect(() => {
    fetchEvidencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId, trimestre]);

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
      setEvidencias(data.evidencias || []);
    } catch (error) {
      console.error('Error al cargar evidencias:', error);
      // NO mostrar toast de error - simplemente no hay evidencias aún
    } finally {
      setLoading(false);
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

      toast.success(aprobar ? '✓ Evidencia aprobada' : '✗ Evidencia rechazada', {
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

  const handleEliminar = async () => {
    if (!deletingEvidencia) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/evidencias/${deletingEvidencia.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Error al eliminar');

      toast.success('🗑️ Evidencia eliminada', {
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
      {/* Filtros */}
      <div style={{
        display: 'flex',
        gap: spacing.sm,
        marginBottom: spacing.lg
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

      {/* Lista de evidencias */}
      {evidenciasFiltradas.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: 'center',
          backgroundColor: colors.gray[50],
          borderRadius: 12
        }}>
          <span style={{ fontSize: '3rem', marginBottom: 16, display: 'block' }}>📋</span>
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
                    fontWeight: '600'
                  }}>
                    {evidencia.estado === 'aprobado' ? '✓' : '✗'} {evidencia.calificacion}%
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

              <div style={{ marginBottom: spacing.sm, fontSize: '0.75rem', color: colors.gray[600] }}>
                📎 {evidencia.archivo_nombre}
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
                    fontWeight: '600'
                  }}
                >
                  👁️ Ver
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
                      fontWeight: '600'
                    }}
                  >
                    📝 Calificar
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
                      fontWeight: '600'
                    }}
                  >
                    ✏️ Editar
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
                    fontWeight: '600'
                  }}
                  title="Eliminar evidencia"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
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
                value={calificacion}
                onChange={(e) => setCalificacion(parseInt(e.target.value))}
                style={{ width: '100%', marginBottom: spacing.xs }}
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
                value={calificacion}
                onChange={(e) => setCalificacion(parseInt(e.target.value))}
                style={{ width: '100%', marginBottom: spacing.xs }}
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
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? '⏳ Eliminando...' : '🗑️ Eliminar'}
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
    </div>
  );
};
