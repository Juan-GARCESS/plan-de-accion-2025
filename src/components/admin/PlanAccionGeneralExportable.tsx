// src/components/admin/PlanAccionGeneralExportable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Filter, FileText, CheckCircle2, XCircle, Download, CheckSquare, Square } from 'lucide-react';

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
  t1: boolean;
  t2: boolean;
  t3: boolean;
  t4: boolean;
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
  observaciones_admin?: string | null;
}

interface CalificacionTrimestre {
  area_id: number;
  trimestre: number;
  calificacion_general: number;
  nombre_area: string;
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

interface PromediosGenerales {
  trimestre1: number;
  trimestre2: number;
  trimestre3: number;
  trimestre4: number;
  promedioGeneral: number;
}

interface PlanAccionGeneralExportableProps {
  isAdmin?: boolean;
  userAreaId?: number;
}

export default function PlanAccionGeneralExportable({ isAdmin = false, userAreaId }: PlanAccionGeneralExportableProps) {
  const [evidencias, setEvidencias] = useState<EvidenciaAprobada[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [promedios, setPromedios] = useState<PromediosGenerales | null>(null);
  const [calificacionesTrimestres, setCalificacionesTrimestres] = useState<CalificacionTrimestre[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroArea, setFiltroArea] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');
  const [busquedaTemp, setBusquedaTemp] = useState(''); // Para el input temporal
  const [paginaActual, setPaginaActual] = useState(1);
  const [observacionesEditando, setObservacionesEditando] = useState<Record<number, string>>({});
  const metasPorPagina = 10;

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

  useEffect(() => {
    if (isAdmin) {
      fetchAreas();
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchEvidencias();
    setPaginaActual(1); // Reset a página 1 cuando cambian los filtros
  }, [filtroArea, busqueda, userAreaId]);

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
      
      if (!isAdmin && userAreaId) {
        params.append('areaId', userAreaId.toString());
      } else if (isAdmin && filtroArea) {
        params.append('areaId', filtroArea);
      }
      
      if (busqueda) params.append('busqueda', busqueda);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al cargar plan de accion general');
      const data = await res.json();
      
      // Inicializar observaciones vacías
      const evidenciasConObservaciones = (data.evidencias || []).map((ev: EvidenciaAprobada) => ({
        ...ev,
        observaciones_admin: ev.observaciones_admin || ''
      }));
      
      setEvidencias(evidenciasConObservaciones);
      setStats(data.stats || null);
      setCalificacionesTrimestres(data.calificacionesTrimestres || []);
      
      // Calcular promedios por trimestre usando calificaciones de trimestre
      calcularPromedios(data.calificacionesTrimestres || []);
    } catch (error) {
      console.error('Error al cargar plan de accion general:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const calcularPromedios = (calificaciones: CalificacionTrimestre[]) => {
    const promediosPorTrimestre: Record<number, number[]> = {
      1: [],
      2: [],
      3: [],
      4: []
    };

    // Agrupar calificaciones GENERALES de trimestre por trimestre
    calificaciones.forEach(cal => {
      if (cal.calificacion_general && cal.trimestre >= 1 && cal.trimestre <= 4) {
        promediosPorTrimestre[cal.trimestre]?.push(cal.calificacion_general);
      }
    });

    // Calcular promedio de cada trimestre (promedio de todas las áreas)
    const t1 = promediosPorTrimestre[1].length > 0
      ? Math.round(promediosPorTrimestre[1].reduce((a, b) => a + b, 0) / promediosPorTrimestre[1].length)
      : 0;
    
    const t2 = promediosPorTrimestre[2].length > 0
      ? Math.round(promediosPorTrimestre[2].reduce((a, b) => a + b, 0) / promediosPorTrimestre[2].length)
      : 0;
    
    const t3 = promediosPorTrimestre[3].length > 0
      ? Math.round(promediosPorTrimestre[3].reduce((a, b) => a + b, 0) / promediosPorTrimestre[3].length)
      : 0;
    
    const t4 = promediosPorTrimestre[4].length > 0
      ? Math.round(promediosPorTrimestre[4].reduce((a, b) => a + b, 0) / promediosPorTrimestre[4].length)
      : 0;

    // Calcular promedio general (promedio de los 4 trimestres)
    const trimestresConDatos = [t1, t2, t3, t4].filter(t => t > 0);
    const promedioGeneral = trimestresConDatos.length > 0
      ? Math.round(trimestresConDatos.reduce((a, b) => a + b, 0) / trimestresConDatos.length)
      : 0;

    setPromedios({
      trimestre1: t1,
      trimestre2: t2,
      trimestre3: t3,
      trimestre4: t4,
      promedioGeneral
    });
  };

  const handleObservacionChange = (evidenciaId: number, valor: string) => {
    setObservacionesEditando({
      ...observacionesEditando,
      [evidenciaId]: valor
    });
  };

  const guardarObservacion = async (evidenciaId: number) => {
    try {
      const observacion = observacionesEditando[evidenciaId] || '';
      
      const res = await fetch('/api/admin/plan-accion-general/observaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenciaId, observacion })
      });

      if (!res.ok) throw new Error('Error al guardar observación');
      
      // Actualizar localmente
      setEvidencias(evidencias.map(ev => 
        ev.id === evidenciaId ? { ...ev, observaciones_admin: observacion } : ev
      ));
      
      toast.success('Observación guardada correctamente');
    } catch (error) {
      console.error('Error al guardar observación:', error);
      toast.error('Error al guardar observación');
    }
  };

  const exportToExcel = () => {
    // Crear contenido CSV con formato mejorado
    let csv = '\ufeff'; // BOM para UTF-8
    
    // Título principal
    csv += '"PLAN DE ACCIÓN GENERAL 2025"\n';
    csv += `"Fecha de exportación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}"\n`;
    csv += `"Total de evidencias: ${evidencias.length}"\n`;
    csv += '\n';
    
    // ========== TABLA 1: EVIDENCIAS APROBADAS ==========
    csv += '"EVIDENCIAS APROBADAS"\n';
    csv += '\n';
    
    // Headers de la tabla principal
    const headers = [
      'Área',
      'Eje',
      'Sub-Eje',
      'Meta',
      'Indicador',
      'Acción',
      'Presupuesto',
      'Usuario',
      'Observaciones (Admin)',
      'T1',
      'T2',
      'T3',
      'T4',
      'Calificación Meta (%)'
    ];
    csv += headers.join(',') + '\n';

    // Datos de evidencias
    evidencias.forEach(ev => {
      const observaciones = observacionesEditando[ev.id] !== undefined 
        ? observacionesEditando[ev.id] 
        : (ev.observaciones_admin || '');
      
      const row = [
        `"${(ev.nombre_area || '-').replace(/"/g, '""')}"`,
        `"${(ev.eje || '-').replace(/"/g, '""')}"`,
        `"${(ev.sub_eje || '-').replace(/"/g, '""')}"`,
        `"${(ev.meta || '-').replace(/"/g, '""')}"`,
        `"${(ev.indicador || '-').replace(/"/g, '""')}"`,
        `"${(ev.accion || '-').replace(/"/g, '""')}"`,
        `"$${ev.presupuesto ? parseFloat(ev.presupuesto).toLocaleString('es-CO') : '0'}"`,
        `"${ev.usuario_nombre.replace(/"/g, '""')}"`,
        `"${observaciones.replace(/"/g, '""')}"`,
        ev.t1 ? 'X' : '',
        ev.t2 ? 'X' : '',
        ev.t3 ? 'X' : '',
        ev.t4 ? 'X' : '',
        ev.calificacion
      ];
      csv += row.join(',') + '\n';
    });

    // Espacio entre tablas
    csv += '\n\n\n';

    // ========== TABLA 2: PROMEDIOS GENERALES ==========
    if (promedios) {
      csv += '"PROMEDIOS GENERALES DE CALIFICACIONES"\n';
      csv += '\n';
      
      // Headers de promedios
      csv += '"Trimestre 1 (%)","Trimestre 2 (%)","Trimestre 3 (%)","Trimestre 4 (%)","PROMEDIO GENERAL (%)"\n';
      
      // Datos de promedios
      csv += `${promedios.trimestre1},${promedios.trimestre2},${promedios.trimestre3},${promedios.trimestre4},"${promedios.promedioGeneral}"\n`;
      
      // Información adicional
      csv += '\n';
      csv += '"Nota: El Promedio General se calcula como el promedio de las calificaciones generales de cada trimestre."\n';
      csv += '"Las calificaciones de trimestre provienen de la evaluación general que el administrador hace por trimestre, no del promedio de metas individuales."\n';
    }

    // Agregar estadísticas adicionales
    if (stats) {
      csv += '\n\n';
      csv += '"ESTADÍSTICAS ADICIONALES"\n';
      csv += '\n';
      csv += '"Descripción","Valor"\n';
      csv += `"Total de Evidencias Aprobadas","${stats.total}"\n`;
      csv += `"Promedio de Calificación de Metas","${stats.promedioCalificacion}%"\n`;
      
      // Evidencias por trimestre
      csv += '\n';
      csv += '"DISTRIBUCIÓN POR TRIMESTRE"\n';
      csv += '"Trimestre","Cantidad de Evidencias"\n';
      for (let t = 1; t <= 4; t++) {
        csv += `"Trimestre ${t}","${stats.porTrimestre[t] || 0}"\n`;
      }
      
      // Evidencias por área
      if (Object.keys(stats.porArea).length > 0) {
        csv += '\n';
        csv += '"DISTRIBUCIÓN POR ÁREA"\n';
        csv += '"Área","Cantidad de Evidencias"\n';
        Object.entries(stats.porArea).forEach(([area, cantidad]) => {
          csv += `"${area.replace(/"/g, '""')}","${cantidad}"\n`;
        });
      }
    }

    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fecha = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Plan-de-Accion-General-${fecha}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Exportación Exitosa', {
      description: `Archivo "Plan-de-Accion-General-${fecha}.csv" descargado correctamente.`
    });
  };

  const formatPresupuesto = (presupuesto: string | null) => {
    if (!presupuesto) return '-';
    const num = parseFloat(presupuesto);
    if (isNaN(num)) return presupuesto;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(num);
  };

  // Cálculo de paginación
  const totalPaginas = Math.ceil(evidencias.length / metasPorPagina);
  const indiceInicio = (paginaActual - 1) * metasPorPagina;
  const indiceFin = indiceInicio + metasPorPagina;
  const evidenciasPaginadas = evidencias.slice(indiceInicio, indiceFin);

  const cambiarPagina = (numeroPagina: number) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <p style={{ color: colors.gray[600], margin: 0 }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: 24, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
            fontWeight: '700',
            color: colors.gray[900],
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <FileText size={28} color={colors.primary} />
            Plan de Acción (2025)
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: colors.gray[600],
            margin: 0
          }}>
            Visualiza todas las evidencias aprobadas del sistema
          </p>
        </div>

        {/* Botón de exportar */}
        <button
          onClick={exportToExcel}
          disabled={evidencias.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            backgroundColor: evidencias.length > 0 ? colors.success : colors.gray[300],
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: evidencias.length > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            if (evidencias.length > 0) {
              e.currentTarget.style.backgroundColor = '#059669';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (evidencias.length > 0) {
              e.currentTarget.style.backgroundColor = colors.success;
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <Download size={18} />
          <span style={{ display: 'inline-block' }}>Exportar a Excel</span>
        </button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 24
        }}>
          <div style={{
            backgroundColor: 'white',
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: 12,
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              fontWeight: '700',
              color: colors.primary,
              marginBottom: 4
            }}>
              {stats.total}
            </div>
            <div style={{
              fontSize: '0.8125rem',
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
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              fontWeight: '700',
              color: colors.success,
              marginBottom: 4
            }}>
              {stats.promedioCalificacion}%
            </div>
            <div style={{
              fontSize: '0.8125rem',
              color: colors.gray[600],
              fontWeight: '500'
            }}>
              Calificación Promedio
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{
        backgroundColor: 'white',
        border: `1px solid ${colors.gray[200]}`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12
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
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={busquedaTemp}
              onChange={(e) => setBusquedaTemp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setBusqueda(busquedaTemp);
                }
              }}
              placeholder="Buscar meta, usuario..."
              style={{
                padding: '10px 36px 10px 12px',
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: 8,
                fontSize: '0.9375rem',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            {busqueda && (
              <button
                onClick={() => {
                  setBusqueda('');
                  setBusquedaTemp('');
                }}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.gray[400],
                  fontSize: '1.25rem',
                  padding: 0,
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          {isAdmin && (
            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              style={{
                padding: '10px 12px',
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: 8,
                fontSize: '0.9375rem',
                outline: 'none',
                backgroundColor: 'white',
                width: '100%',
                boxSizing: 'border-box',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px'
              }}
            >
              <option value="">Todas las áreas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id.toString()}>
                  {area.nombre_area}
                </option>
              ))}
            </select>
          )}
        </div>
        {busqueda && (
          <div style={{
            marginTop: 8,
            fontSize: '0.75rem',
            color: colors.gray[600]
          }}>
            Buscando: <strong>{busqueda}</strong>
          </div>
        )}
      </div>

      {/* Tabla principal */}
      {evidencias.length === 0 ? (
        <div style={{
          padding: 80,
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: 12,
          border: `1px solid ${colors.gray[200]}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: 80,
            height: 80,
            margin: '0 auto 24px',
            backgroundColor: colors.gray[100],
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={40} color={colors.gray[400]} />
          </div>
          <h3 style={{ 
            margin: 0, 
            marginBottom: 8,
            color: colors.gray[900], 
            fontSize: '1.25rem',
            fontWeight: '600'
          }}>
            No hay evidencias aprobadas
          </h3>
          <p style={{
            margin: 0,
            color: colors.gray[600],
            fontSize: '0.875rem',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.5'
          }}>
            Las evidencias que sean aprobadas por el administrador aparecerán aquí en el Plan de Acción General.
          </p>
        </div>
      ) : (
        <>
          <div style={{
            backgroundColor: 'white',
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 16,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.75rem',
                minWidth: '1200px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem' }}>Área</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem' }}>Eje</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem' }}>Sub-Eje</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem', minWidth: '180px' }}>Meta</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem', minWidth: '150px' }}>Indicador</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem', minWidth: '150px' }}>Acción</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem' }}>Presupuesto</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem' }}>Usuario</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem', minWidth: '150px' }}>Evidencia (Observaciones)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem' }}>T1</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem' }}>T2</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem' }}>T3</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem' }}>T4</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: colors.gray[700], borderBottom: `1px solid ${colors.gray[200]}`, fontSize: '0.75rem' }}>Cal.</th>
                  </tr>
                </thead>
                <tbody>
                  {evidenciasPaginadas.map((ev, idx) => (
                    <tr
                      key={ev.id}
                      style={{
                        backgroundColor: idx % 2 === 0 ? 'white' : colors.gray[50]
                      }}
                    >
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, color: colors.gray[800], fontSize: '0.75rem' }}>{ev.nombre_area}</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, color: colors.gray[800], fontSize: '0.75rem' }}>{ev.eje || '-'}</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, color: colors.gray[600], fontSize: '0.75rem' }}>{ev.sub_eje || '-'}</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, color: colors.gray[800], fontSize: '0.75rem', lineHeight: '1.4' }}>{ev.meta}</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, color: colors.gray[700], fontSize: '0.75rem', lineHeight: '1.4' }}>{ev.indicador || '-'}</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, color: colors.gray[700], fontSize: '0.75rem', lineHeight: '1.4' }}>{ev.accion || '-'}</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, color: colors.gray[800], fontWeight: '500', textAlign: 'right', fontSize: '0.75rem' }}>{formatPresupuesto(ev.presupuesto)}</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, color: colors.gray[800], fontSize: '0.75rem' }}>{ev.usuario_nombre}</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, verticalAlign: 'top' }}>
                        <textarea
                          value={observacionesEditando[ev.id] !== undefined ? observacionesEditando[ev.id] : (ev.observaciones_admin || '')}
                          onChange={(e) => handleObservacionChange(ev.id, e.target.value)}
                          onBlur={() => guardarObservacion(ev.id)}
                          placeholder="Escribir observaciones..."
                          style={{
                            width: '100%',
                            minHeight: '40px',
                            padding: '6px 8px',
                            fontSize: '0.75rem',
                            border: `1px solid ${colors.gray[300]}`,
                            borderRadius: 4,
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            lineHeight: '1.4',
                            backgroundColor: 'white'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = colors.primary;
                            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                          }}
                          onBlurCapture={(e) => {
                            e.target.style.borderColor = colors.gray[300];
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, textAlign: 'center' }}>
                        {ev.t1 ? <CheckSquare size={16} color={colors.primary} /> : <Square size={16} color={colors.gray[300]} />}
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, textAlign: 'center' }}>
                        {ev.t2 ? <CheckSquare size={16} color={colors.primary} /> : <Square size={16} color={colors.gray[300]} />}
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, textAlign: 'center' }}>
                        {ev.t3 ? <CheckSquare size={16} color={colors.primary} /> : <Square size={16} color={colors.gray[300]} />}
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, borderRight: `1px solid ${colors.gray[200]}`, textAlign: 'center' }}>
                        {ev.t4 ? <CheckSquare size={16} color={colors.primary} /> : <Square size={16} color={colors.gray[300]} />}
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.gray[200]}`, textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor: ev.calificacion >= 80 ? '#d1fae5' : ev.calificacion >= 60 ? '#fef3c7' : '#fed7aa',
                          color: ev.calificacion >= 80 ? '#065f46' : ev.calificacion >= 60 ? '#92400e' : '#9a3412',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {ev.calificacion}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              marginTop: 16,
              marginBottom: 16,
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: 6,
                  backgroundColor: paginaActual === 1 ? colors.gray[100] : 'white',
                  color: paginaActual === 1 ? colors.gray[400] : colors.gray[700],
                  cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Anterior
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                <button
                  key={numero}
                  onClick={() => cambiarPagina(numero)}
                  style={{
                    padding: '8px 12px',
                    minWidth: '40px',
                    border: `1px solid ${paginaActual === numero ? colors.primary : colors.gray[300]}`,
                    borderRadius: 6,
                    backgroundColor: paginaActual === numero ? colors.primary : 'white',
                    color: paginaActual === numero ? 'white' : colors.gray[700],
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: paginaActual === numero ? '600' : '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (paginaActual !== numero) {
                      e.currentTarget.style.backgroundColor = colors.gray[50];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaActual !== numero) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {numero}
                </button>
              ))}

              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: 6,
                  backgroundColor: paginaActual === totalPaginas ? colors.gray[100] : 'white',
                  color: paginaActual === totalPaginas ? colors.gray[400] : colors.gray[700],
                  cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Siguiente
              </button>
            </div>
          )}

          {/* Tabla de Promedios Generales */}
          {promedios && (
            <div style={{
              backgroundColor: 'white',
              border: `1px solid ${colors.gray[200]}`,
              borderRadius: 12,
              overflow: 'hidden',
              padding: 16,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: colors.gray[900],
                marginBottom: 16,
                marginTop: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Promedios Generales
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB' }}>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        color: colors.gray[700], 
                        borderBottom: `1px solid ${colors.gray[200]}`, 
                        borderRight: `1px solid ${colors.gray[200]}`,
                        fontSize: '0.8125rem'
                      }}>
                        Trimestre 1
                      </th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        color: colors.gray[700], 
                        borderBottom: `1px solid ${colors.gray[200]}`, 
                        borderRight: `1px solid ${colors.gray[200]}`,
                        fontSize: '0.8125rem'
                      }}>
                        Trimestre 2
                      </th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        color: colors.gray[700], 
                        borderBottom: `1px solid ${colors.gray[200]}`, 
                        borderRight: `1px solid ${colors.gray[200]}`,
                        fontSize: '0.8125rem'
                      }}>
                        Trimestre 3
                      </th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        color: colors.gray[700], 
                        borderBottom: `1px solid ${colors.gray[200]}`, 
                        borderRight: `1px solid ${colors.gray[200]}`,
                        fontSize: '0.8125rem'
                      }}>
                        Trimestre 4
                      </th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        color: colors.gray[900], 
                        borderBottom: `1px solid ${colors.gray[200]}`,
                        fontSize: '0.8125rem',
                        backgroundColor: colors.gray[100]
                      }}>
                        Promedio General
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '16px', textAlign: 'center', borderRight: `1px solid ${colors.gray[200]}` }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          borderRadius: 8,
                          backgroundColor: promedios.trimestre1 >= 80 ? '#d1fae5' : promedios.trimestre1 >= 60 ? '#fef3c7' : '#fed7aa'
                        }}>
                          <CheckCircle2 
                            size={18} 
                            color={promedios.trimestre1 >= 80 ? '#065f46' : promedios.trimestre1 >= 60 ? '#92400e' : '#9a3412'} 
                          />
                          <span style={{ 
                            fontSize: 'clamp(1rem, 3vw, 1.25rem)', 
                            fontWeight: '700', 
                            color: promedios.trimestre1 >= 80 ? '#065f46' : promedios.trimestre1 >= 60 ? '#92400e' : '#9a3412'
                          }}>
                            {promedios.trimestre1}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', borderRight: `1px solid ${colors.gray[200]}` }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          borderRadius: 8,
                          backgroundColor: promedios.trimestre2 >= 80 ? '#d1fae5' : promedios.trimestre2 >= 60 ? '#fef3c7' : '#fed7aa'
                        }}>
                          <CheckCircle2 
                            size={18} 
                            color={promedios.trimestre2 >= 80 ? '#065f46' : promedios.trimestre2 >= 60 ? '#92400e' : '#9a3412'} 
                          />
                          <span style={{ 
                            fontSize: 'clamp(1rem, 3vw, 1.25rem)', 
                            fontWeight: '700', 
                            color: promedios.trimestre2 >= 80 ? '#065f46' : promedios.trimestre2 >= 60 ? '#92400e' : '#9a3412'
                          }}>
                            {promedios.trimestre2}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', borderRight: `1px solid ${colors.gray[200]}` }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          borderRadius: 8,
                          backgroundColor: promedios.trimestre3 >= 80 ? '#d1fae5' : promedios.trimestre3 >= 60 ? '#fef3c7' : '#fed7aa'
                        }}>
                          <CheckCircle2 
                            size={18} 
                            color={promedios.trimestre3 >= 80 ? '#065f46' : promedios.trimestre3 >= 60 ? '#92400e' : '#9a3412'} 
                          />
                          <span style={{ 
                            fontSize: 'clamp(1rem, 3vw, 1.25rem)', 
                            fontWeight: '700', 
                            color: promedios.trimestre3 >= 80 ? '#065f46' : promedios.trimestre3 >= 60 ? '#92400e' : '#9a3412'
                          }}>
                            {promedios.trimestre3}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', borderRight: `1px solid ${colors.gray[200]}` }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          borderRadius: 8,
                          backgroundColor: promedios.trimestre4 >= 80 ? '#d1fae5' : promedios.trimestre4 >= 60 ? '#fef3c7' : '#fed7aa'
                        }}>
                          <CheckCircle2 
                            size={18} 
                            color={promedios.trimestre4 >= 80 ? '#065f46' : promedios.trimestre4 >= 60 ? '#92400e' : '#9a3412'} 
                          />
                          <span style={{ 
                            fontSize: 'clamp(1rem, 3vw, 1.25rem)', 
                            fontWeight: '700', 
                            color: promedios.trimestre4 >= 80 ? '#065f46' : promedios.trimestre4 >= 60 ? '#92400e' : '#9a3412'
                          }}>
                            {promedios.trimestre4}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', backgroundColor: colors.gray[50] }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 20px',
                          borderRadius: 8,
                          backgroundColor: 'white',
                          border: `2px solid ${colors.primary}`,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          <CheckCircle2 
                            size={20} 
                            color={promedios.promedioGeneral >= 80 ? colors.success : promedios.promedioGeneral >= 60 ? colors.warning : colors.danger} 
                          />
                          <span style={{ 
                            fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', 
                            fontWeight: '700', 
                            color: promedios.promedioGeneral >= 80 ? colors.success : promedios.promedioGeneral >= 60 ? colors.warning : colors.danger
                          }}>
                            {promedios.promedioGeneral}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Estilos CSS para responsividad */}
      <style jsx>{`
        @media (max-width: 768px) {
          button span {
            display: none !important;
          }
          
          h1 {
            font-size: 1.5rem !important;
          }
          
          .pagination-button {
            padding: 6px 10px !important;
            font-size: 0.75rem !important;
          }
        }
        
        @media (max-width: 640px) {
          table {
            font-size: 0.6875rem !important;
          }
          
          th, td {
            padding: 8px 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
