// src/components/admin/EvidenciasReview.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Eye, Save, Download } from 'lucide-react';

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
  estado: string;
  calificacion: number | null;
  comentario_admin: string | null;
}

interface CalificacionTrimestre {
  calificacion_general: number | null;
  comentario_general: string | null;
  calcular_automatico: boolean;
}

interface EvidenciasReviewProps {
  areaId?: number;
  trimestre?: number;
}

export const EvidenciasReviewNew: React.FC<EvidenciasReviewProps> = ({ areaId, trimestre }) => {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState<number | null>(null);
  
  // Estado para cada meta
  const [calificaciones, setCalificaciones] = useState<Record<number, number>>({});
  const [estados, setEstados] = useState<Record<number, 'aprobado' | 'rechazado'>>({});
  const [comentarios, setComentarios] = useState<Record<number, string>>({});
  
  // Estado para calificación del trimestre
  const [calificacionTrimestre, setCalificacionTrimestre] = useState<CalificacionTrimestre>({
    calificacion_general: null,
    comentario_general: null,
    calcular_automatico: true
  });

  const [guardandoTrimestre, setGuardandoTrimestre] = useState(false);
  
  // Estados para navegación y filtros
  const [vistaActual, setVistaActual] = useState<'metas' | 'trimestre'>('metas');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'aprobado' | 'rechazado'>('todos');

  useEffect(() => {
    if (areaId && trimestre) {
      fetchEvidencias();
    }
  }, [areaId, trimestre]);

  const fetchEvidencias = async () => {
    if (!areaId || !trimestre) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/evidencias?areaId=${areaId}&trimestre=${trimestre}`);
      const data = await res.json();
      
      if (data.sin_envio) {
        setEvidencias([]);
        return;
      }

      if (res.ok && data.evidencias) {
        setEvidencias(data.evidencias);
        
        // Inicializar estados
        const cals: Record<number, number> = {};
        const ests: Record<number, 'aprobado' | 'rechazado'> = {};
        const coms: Record<number, string> = {};
        
        data.evidencias.forEach((ev: Evidencia) => {
          cals[ev.id] = ev.calificacion || 50;
          ests[ev.id] = (ev.estado as 'aprobado' | 'rechazado') || 'aprobado';
          coms[ev.id] = ev.comentario_admin || '';
        });
        
        setCalificaciones(cals);
        setEstados(ests);
        setComentarios(coms);

        // Cargar calificación del trimestre si existe
        if (data.calificacion_trimestre) {
          setCalificacionTrimestre({
            calificacion_general: data.calificacion_trimestre.calificacion_general || null,
            comentario_general: data.calificacion_trimestre.comentario_general || null,
            calcular_automatico: data.calificacion_trimestre.calcular_automatico ?? true
          });
        }
      }
    } catch (error) {
      toast.error('Error al cargar evidencias');
    } finally {
      setLoading(false);
    }
  };

  const calcularPromedioAutomatico = () => {
    if (evidencias.length === 0) return 0;
    const suma = evidencias.reduce((acc, ev) => acc + (calificaciones[ev.id] || 0), 0);
    return Math.round(suma / evidencias.length);
  };

  const handleGuardarMeta = async (evidenciaId: number) => {
    setGuardando(evidenciaId);
    
    try {
      const res = await fetch('/api/admin/calificar-evidencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidencia_id: evidenciaId,
          estado: estados[evidenciaId],
          calificacion: calificaciones[evidenciaId],
          comentario_admin: comentarios[evidenciaId]
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Meta calificada correctamente');
        await fetchEvidencias();
      } else {
        toast.error(data.error || 'Error al calificar');
      }
    } catch (error) {
      toast.error('Error al guardar calificación');
    } finally {
      setGuardando(null);
    }
  };

  const handleGuardarCalificacionTrimestre = async () => {
    if (!areaId || !trimestre) return;

    setGuardandoTrimestre(true);

    const calificacionFinal = calificacionTrimestre.calcular_automatico 
      ? calcularPromedioAutomatico() 
      : calificacionTrimestre.calificacion_general;

    try {
      const res = await fetch('/api/admin/calificar-trimestre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area_id: areaId,
          trimestre: trimestre,
          usuario_id: evidencias[0]?.usuario_id,
          calificacion_general: calificacionFinal,
          comentario_general: calificacionTrimestre.comentario_general,
          calcular_automatico: calificacionTrimestre.calcular_automatico
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Calificacion del trimestre guardada');
        await fetchEvidencias();
      } else {
        toast.error(data.error || 'Error al guardar');
      }
    } catch (error) {
      toast.error('Error al guardar calificacion del trimestre');
    } finally {
      setGuardandoTrimestre(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
        Cargando evidencias...
      </div>
    );
  }

  if (evidencias.length === 0) {
    return (
      <div style={{ 
        padding: '60px 20px', 
        textAlign: 'center',
        background: '#F9FAFB',
        borderRadius: '8px',
        border: '1px dashed #D1D5DB'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <h3 style={{ margin: 0, marginBottom: '8px', color: '#111827', fontSize: '18px', fontWeight: '600' }}>
          Aun no se ha enviado ninguna evidencia
        </h3>
        <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
          El usuario todavia no ha realizado el envio del Trimestre {trimestre}.
          Una vez que envie todas las metas, apareceran aqui para calificar.
        </p>
      </div>
    );
  }

  const promedioAutomatico = calcularPromedioAutomatico();
  const calificacionMostrar = calificacionTrimestre.calcular_automatico 
    ? promedioAutomatico 
    : (calificacionTrimestre.calificacion_general || 0);

  // Filtrar evidencias según el estado seleccionado
  const evidenciasFiltradas = evidencias.filter(ev => {
    if (filtroEstado === 'todos') return true;
    return estados[ev.id] === filtroEstado;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header con botón de calificación del trimestre */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: '4px', fontSize: '24px', fontWeight: '700', color: '#111827' }}>
            Calificar Evidencias - Trimestre {trimestre}
          </h2>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
            {evidencias[0]?.usuario_nombre} - {evidencias[0]?.area_nombre}
          </p>
        </div>
        <button
          onClick={() => setVistaActual(vistaActual === 'metas' ? 'trimestre' : 'metas')}
          style={{
            padding: '10px 20px',
            background: vistaActual === 'trimestre' ? '#10B981' : '#3B82F6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {vistaActual === 'metas' ? 'Calificar Trimestre' : 'Ver Metas'}
        </button>
      </div>

      {vistaActual === 'metas' ? (
        <>
          {/* Filtros de estado */}
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
            <button
              onClick={() => setFiltroEstado('todos')}
              style={{
                padding: '6px 16px',
                background: filtroEstado === 'todos' ? '#3B82F6' : 'transparent',
                color: filtroEstado === 'todos' ? '#fff' : '#6B7280',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Todos ({evidencias.length})
            </button>
            <button
              onClick={() => setFiltroEstado('aprobado')}
              style={{
                padding: '6px 16px',
                background: filtroEstado === 'aprobado' ? '#10B981' : 'transparent',
                color: filtroEstado === 'aprobado' ? '#fff' : '#6B7280',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Aprobados ({evidencias.filter(ev => estados[ev.id] === 'aprobado').length})
            </button>
            <button
              onClick={() => setFiltroEstado('rechazado')}
              style={{
                padding: '6px 16px',
                background: filtroEstado === 'rechazado' ? '#EF4444' : 'transparent',
                color: filtroEstado === 'rechazado' ? '#fff' : '#6B7280',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Rechazados ({evidencias.filter(ev => estados[ev.id] === 'rechazado').length})
            </button>
          </div>

          {/* Tarjetas de Metas - Grid de 3 columnas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
            {evidenciasFiltradas.map((evidencia) => (
          <div 
            key={evidencia.id}
            style={{
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              padding: '12px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            {/* Header ultra compacto */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '3px' }}>
                <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#111827', flex: 1, lineHeight: '1.3' }}>
                  {evidencia.meta}
                </h3>
                <a
                  href={evidencia.archivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 6px',
                    background: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    borderRadius: '3px',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '10px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Eye style={{ width: '11px', height: '11px' }} />
                </a>
              </div>
              <p style={{ margin: 0, fontSize: '10px', color: '#9CA3AF', lineHeight: '1.2' }}>
                {evidencia.indicador.length > 60 ? evidencia.indicador.substring(0, 60) + '...' : evidencia.indicador}
              </p>
            </div>

            {/* Descripción ultra compacta */}
            {evidencia.descripcion && (
              <div style={{ 
                marginBottom: '6px', 
                padding: '6px', 
                background: '#F9FAFB', 
                borderRadius: '3px',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{ fontSize: '9px', fontWeight: '600', color: '#6B7280', marginBottom: '1px' }}>
                  DESC:
                </div>
                <div style={{ fontSize: '10px', color: '#374151', lineHeight: '1.3' }}>
                  {evidencia.descripcion.length > 60 ? evidencia.descripcion.substring(0, 60) + '...' : evidencia.descripcion}
                </div>
              </div>
            )}

            {/* Estado: Aprobado/Rechazado ultra compacto */}
            <div style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setEstados(prev => ({ ...prev, [evidencia.id]: 'aprobado' }))}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    border: estados[evidencia.id] === 'aprobado' ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                    borderRadius: '3px',
                    background: estados[evidencia.id] === 'aprobado' ? '#DCFCE7' : '#fff',
                    color: estados[evidencia.id] === 'aprobado' ? '#065F46' : '#6B7280',
                    fontSize: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px'
                  }}
                >
                  <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                  Aprobado
                </button>
                <button
                  onClick={() => setEstados(prev => ({ ...prev, [evidencia.id]: 'rechazado' }))}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    border: estados[evidencia.id] === 'rechazado' ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: '3px',
                    background: estados[evidencia.id] === 'rechazado' ? '#FEE2E2' : '#fff',
                    color: estados[evidencia.id] === 'rechazado' ? '#991B1B' : '#6B7280',
                    fontSize: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px'
                  }}
                >
                  <XCircle style={{ width: '18px', height: '18px' }} />
                  Rechazado
                </button>
              </div>
            </div>

            {/* Calificación ultra compacta */}
            <div style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <label style={{ fontSize: '9px', fontWeight: '600', color: '#374151' }}>
                  CALIF:
                </label>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: calificaciones[evidencia.id] >= 70 ? '#10B981' : calificaciones[evidencia.id] >= 50 ? '#F59E0B' : '#EF4444'
                }}>
                  {calificaciones[evidencia.id]}%
                </span>
              </div>
              
              {/* Barra de progreso visual ultra compacta */}
              <div style={{ 
                width: '100%', 
                height: '4px', 
                background: '#E5E7EB', 
                borderRadius: '2px',
                marginBottom: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${calificaciones[evidencia.id]}%`, 
                  height: '100%', 
                  background: calificaciones[evidencia.id] >= 70 ? '#10B981' : calificaciones[evidencia.id] >= 50 ? '#F59E0B' : '#EF4444',
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {/* Slider ultra compacto */}
              <input
                type="range"
                min="0"
                max="100"
                value={calificaciones[evidencia.id] || 0}
                onChange={(e) => setCalificaciones(prev => ({ ...prev, [evidencia.id]: parseInt(e.target.value) }))}
                style={{
                  width: '100%',
                  height: '3px',
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Observaciones ultra compactas */}
            <div style={{ marginBottom: '6px' }}>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', color: '#374151', marginBottom: '3px' }}>
                OBS:
              </label>
              <textarea
                value={comentarios[evidencia.id] || ''}
                onChange={(e) => setComentarios(prev => ({ ...prev, [evidencia.id]: e.target.value }))}
                placeholder="Observaciones..."
                style={{
                  width: '100%',
                  minHeight: '40px',
                  padding: '6px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Botón Guardar ultra compacto */}
            <button
              onClick={() => handleGuardarMeta(evidencia.id)}
              disabled={guardando === evidencia.id}
              style={{
                width: '100%',
                padding: '6px',
                background: guardando === evidencia.id ? '#9CA3AF' : '#3B82F6',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: '600',
                cursor: guardando === evidencia.id ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (guardando !== evidencia.id) {
                  e.currentTarget.style.background = '#2563EB';
                }
              }}
              onMouseOut={(e) => {
                if (guardando !== evidencia.id) {
                  e.currentTarget.style.background = '#3B82F6';
                }
              }}
            >
              <Save style={{ width: '12px', height: '12px' }} />
              {guardando === evidencia.id ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
            ))}
          </div>
        </>
      ) : (
        /* Vista de Calificación del Trimestre */
        <div style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: 0, marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: '#1E40AF' }}>
            CALIFICACION GENERAL DEL TRIMESTRE {trimestre}
          </h3>

        {/* Checkbox: Calcular automático */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            cursor: 'pointer',
            padding: '16px',
            background: '#fff',
            border: '1px solid #BFDBFE',
            borderRadius: '8px'
          }}>
            <input
              type="checkbox"
              checked={calificacionTrimestre.calcular_automatico}
              onChange={(e) => setCalificacionTrimestre(prev => ({ 
                ...prev, 
                calcular_automatico: e.target.checked 
              }))}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E40AF' }}>
                Calcular automaticamente (promedio de metas)
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                La calificacion sera el promedio de todas las metas del trimestre
              </div>
            </div>
          </label>
        </div>

        {/* Calificación */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#1E40AF' }}>
              CALIFICACION {calificacionTrimestre.calcular_automatico ? '(AUTOMATICA)' : '(MANUAL)'}:
            </label>
            <span style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: calificacionMostrar >= 70 ? '#10B981' : calificacionMostrar >= 50 ? '#F59E0B' : '#EF4444'
            }}>
              {calificacionMostrar}%
            </span>
          </div>

          {/* Barra de progreso */}
          <div style={{ 
            width: '100%', 
            height: '12px', 
            background: '#E5E7EB', 
            borderRadius: '6px',
            marginBottom: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${calificacionMostrar}%`, 
              height: '100%', 
              background: calificacionMostrar >= 70 ? '#10B981' : calificacionMostrar >= 50 ? '#F59E0B' : '#EF4444',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Slider manual (solo si no es automático) */}
          {!calificacionTrimestre.calcular_automatico && (
            <input
              type="range"
              min="0"
              max="100"
              value={calificacionTrimestre.calificacion_general || 0}
              onChange={(e) => setCalificacionTrimestre(prev => ({ 
                ...prev, 
                calificacion_general: parseInt(e.target.value) 
              }))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          )}
        </div>

        {/* Comentario general */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1E40AF', marginBottom: '8px' }}>
            COMENTARIO GENERAL DEL TRIMESTRE:
          </label>
          <textarea
            value={calificacionTrimestre.comentario_general || ''}
            onChange={(e) => setCalificacionTrimestre(prev => ({ 
              ...prev, 
              comentario_general: e.target.value 
            }))}
            placeholder="Comentario general sobre el desempeno en este trimestre..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid #BFDBFE',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Botón Guardar Trimestre */}
        <button
          onClick={handleGuardarCalificacionTrimestre}
          disabled={guardandoTrimestre}
          style={{
            width: '100%',
            padding: '16px',
            background: guardandoTrimestre ? '#9CA3AF' : '#10B981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: guardandoTrimestre ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!guardandoTrimestre) {
              e.currentTarget.style.background = '#059669';
            }
          }}
          onMouseOut={(e) => {
            if (!guardandoTrimestre) {
              e.currentTarget.style.background = '#10B981';
            }
          }}
        >
          <Save style={{ width: '20px', height: '20px' }} />
          {guardandoTrimestre ? 'Guardando...' : 'Guardar Calificacion del Trimestre'}
        </button>
        </div>
      )}
    </div>
  );
};
