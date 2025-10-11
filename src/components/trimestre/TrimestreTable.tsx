// src/components/trimestre/TrimestreTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { colors, spacing } from '@/lib/styleUtils';
import { EvidenciaUploader } from '@/components/evidencias/EvidenciaUploader';

interface Meta {
  id: number;
  meta: string;
  indicador: string;
  accion: string | null;
  presupuesto: string | null;
  evidencia_url: string | null;
  calificacion: number | null;
  eje_nombre: string;
  subeje_nombre: string;
}

interface TrimestreTableProps {
  trimestreId: number;
  userId: number;
  areaId: number;
}

export const TrimestreTable: React.FC<TrimestreTableProps> = ({
  trimestreId,
  areaId
}) => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [trimestreHabilitado, setTrimestreHabilitado] = useState(false);
  const [editingCell, setEditingCell] = useState<{ metaId: number; field: 'accion' | 'presupuesto' } | null>(null);
  const [tempValue, setTempValue] = useState('');

  // Cargar metas del trimestre
  useEffect(() => {
    const fetchMetas = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/usuario/trimestre-metas?trimestre=${trimestreId}&area_id=${areaId}`);
        if (!res.ok) throw new Error('Error al cargar metas');
        const data = await res.json();
        setMetas(data.metas || []);
      } catch (error) {
        console.error('Error al cargar metas:', error);
        // No mostrar toast de error si no hay metas aún
      } finally {
        setLoading(false);
      }
    };

    fetchMetas();
  }, [trimestreId, areaId]);

  // Verificar si el trimestre está habilitado en plan_accion
  useEffect(() => {
    const checkTrimestreHabilitado = async () => {
      try {
        const res = await fetch(`/api/admin/areas/${areaId}/plan-accion`);
        if (!res.ok) throw new Error('Error al verificar trimestre');
        const data = await res.json();
        
        console.log('📊 Datos del plan de acción:', data.data);
        
        // Verificar si AL MENOS UNA fila tiene el trimestre marcado
        const trimestreKey = `t${trimestreId}` as 't1' | 't2' | 't3' | 't4';
        console.log(`🔍 Buscando columna: ${trimestreKey}`);
        
        const algunoMarcado = data.data?.some((row: any) => {
          console.log(`Fila ID ${row.id}: ${trimestreKey} = ${row[trimestreKey]}`);
          return row[trimestreKey] === true;
        });
        
        console.log(`✅ Resultado: trimestre habilitado = ${algunoMarcado}`);
        setTrimestreHabilitado(algunoMarcado || false);
      } catch (error) {
        console.error('Error al verificar trimestre:', error);
        setTrimestreHabilitado(false);
      }
    };

    checkTrimestreHabilitado();
  }, [trimestreId, areaId]);

  const handleDoubleClick = (metaId: number, field: 'accion' | 'presupuesto', currentValue: string | null) => {
    setEditingCell({ metaId, field });
    setTempValue(currentValue || '');
  };

  const handleSave = async () => {
    if (!editingCell) return;

    const { metaId, field } = editingCell;

    try {
      const res = await fetch('/api/usuario/trimestre-metas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_id: metaId,
          [field]: tempValue
        })
      });

      if (!res.ok) throw new Error('Error al actualizar');

      // Actualizar localmente
      setMetas(prev => prev.map(m => 
        m.id === metaId 
          ? { ...m, [field]: tempValue }
          : m
      ));

      toast.success('Actualizado', {
        description: `${field === 'accion' ? 'Acción' : 'Presupuesto'} guardado correctamente.`
      });
    } catch (error) {
      toast.error('Error al guardar', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.'
      });
    } finally {
      setEditingCell(null);
      setTempValue('');
    }
  };

  const handleCancel = () => {
    setEditingCell(null);
    setTempValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (loading) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 40,
        textAlign: 'center'
      }}>
        <p style={{ color: '#9ca3af', margin: 0 }}>Cargando metas...</p>
      </div>
    );
  }

  // Si el trimestre no está habilitado
  if (!trimestreHabilitado) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 40,
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '3rem', marginBottom: 16, display: 'block' }}>🔒</span>
        <h3 style={{ margin: '0 0 8px 0', color: colors.gray[800] }}>
          Trimestre no habilitado
        </h3>
        <p style={{ margin: '0 0 16px 0', color: colors.gray[600], fontSize: '0.875rem' }}>
          Debes marcar el checkbox de este trimestre (T{trimestreId}) en tu Plan de Acción para poder enviar evidencias.
        </p>
        <button
          onClick={() => window.location.href = '/dashboard/plan-accion'}
          style={{
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Ir a Plan de Acción
        </button>
      </div>
    );
  }

  if (metas.length === 0) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 40,
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '3rem', marginBottom: 16, display: 'block' }}>📋</span>
        <h3 style={{ margin: 0, marginBottom: 8, color: colors.gray[800] }}>
          No hay metas definidas
        </h3>
        <p style={{ margin: 0, color: colors.gray[600], fontSize: '0.875rem' }}>
          El administrador aún no ha creado metas para este trimestre.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: spacing.lg,
        borderBottom: `1px solid ${colors.gray[200]}`,
        backgroundColor: colors.gray[50]
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: colors.gray[900] }}>
          Metas del Trimestre {trimestreId}
        </h2>
        <p style={{ margin: 0, marginTop: 4, fontSize: '0.875rem', color: colors.gray[600] }}>
          Haz doble clic en las celdas de <strong>Acción</strong> y <strong>Presupuesto</strong> para editarlas.
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem'
        }}>
          <thead>
            <tr style={{ backgroundColor: colors.gray[100] }}>
              <th style={headerCellStyle}>Eje</th>
              <th style={headerCellStyle}>Sub-Eje</th>
              <th style={headerCellStyle}>Meta</th>
              <th style={headerCellStyle}>Indicador</th>
              <th style={{ ...headerCellStyle, backgroundColor: '#dbeafe' }}>Acción</th>
              <th style={{ ...headerCellStyle, backgroundColor: '#dbeafe' }}>Presupuesto</th>
              <th style={headerCellStyle}>Evidencia</th>
              <th style={headerCellStyle}>Calificación</th>
            </tr>
          </thead>
          <tbody>
            {metas.map(meta => (
              <tr key={meta.id} style={{ borderBottom: `1px solid ${colors.gray[200]}` }}>
                <td style={cellStyle}>{meta.eje_nombre}</td>
                <td style={cellStyle}>{meta.subeje_nombre}</td>
                <td style={cellStyle}>{meta.meta}</td>
                <td style={cellStyle}>{meta.indicador}</td>
                
                {/* ACCIÓN - Editable */}
                <td
                  style={{
                    ...cellStyle,
                    backgroundColor: editingCell?.metaId === meta.id && editingCell?.field === 'accion' 
                      ? '#fef3c7' 
                      : '#eff6ff',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onDoubleClick={() => handleDoubleClick(meta.id, 'accion', meta.accion)}
                  title="Doble clic para editar"
                >
                  {editingCell?.metaId === meta.id && editingCell?.field === 'accion' ? (
                    <div>
                      <textarea
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: 8,
                          border: `2px solid ${colors.primary}`,
                          borderRadius: 4,
                          fontSize: '0.875rem',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          minHeight: 60
                        }}
                      />
                      <div style={{ fontSize: '0.7rem', color: colors.gray[600], marginTop: 4 }}>
                        Enter para guardar • Esc para cancelar
                      </div>
                    </div>
                  ) : (
                    <div style={{ minHeight: 40 }}>
                      {meta.accion || <span style={{ color: colors.gray[400] }}>Doble clic para agregar</span>}
                    </div>
                  )}
                </td>

                {/* PRESUPUESTO - Editable */}
                <td
                  style={{
                    ...cellStyle,
                    backgroundColor: editingCell?.metaId === meta.id && editingCell?.field === 'presupuesto' 
                      ? '#fef3c7' 
                      : '#eff6ff',
                    cursor: 'pointer'
                  }}
                  onDoubleClick={() => handleDoubleClick(meta.id, 'presupuesto', meta.presupuesto)}
                  title="Doble clic para editar"
                >
                  {editingCell?.metaId === meta.id && editingCell?.field === 'presupuesto' ? (
                    <div>
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        autoFocus
                        placeholder="Ej: $5,000,000"
                        style={{
                          width: '100%',
                          padding: 8,
                          border: `2px solid ${colors.primary}`,
                          borderRadius: 4,
                          fontSize: '0.875rem',
                          fontFamily: 'inherit'
                        }}
                      />
                      <div style={{ fontSize: '0.7rem', color: colors.gray[600], marginTop: 4 }}>
                        Enter para guardar • Esc para cancelar
                      </div>
                    </div>
                  ) : (
                    <div>
                      {meta.presupuesto || <span style={{ color: colors.gray[400] }}>Doble clic para agregar</span>}
                    </div>
                  )}
                </td>

                <td style={cellStyle}>
                  <EvidenciaUploader
                    metaId={meta.id}
                    existingUrl={meta.evidencia_url}
                    onUploadSuccess={(url) => {
                      setMetas(prev => prev.map(m =>
                        m.id === meta.id ? { ...m, evidencia_url: url } : m
                      ));
                    }}
                  />
                </td>

                <td style={cellStyle}>
                  {meta.calificacion !== null ? (
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: meta.calificacion >= 70 ? '#d1fae5' : '#fecaca',
                      color: meta.calificacion >= 70 ? '#065f46' : '#991b1b',
                      borderRadius: 12,
                      fontWeight: '600',
                      fontSize: '0.75rem'
                    }}>
                      {meta.calificacion}%
                    </span>
                  ) : (
                    <span style={{ color: colors.gray[400] }}>Pendiente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const headerCellStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: '600',
  color: colors.gray[800],
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: `2px solid ${colors.gray[300]}`
};

const cellStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: colors.gray[700],
  verticalAlign: 'top',
  lineHeight: '1.5'
};
