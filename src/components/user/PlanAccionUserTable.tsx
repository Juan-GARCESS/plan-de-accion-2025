// src/components/user/PlanAccionUserTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface PlanAccionRow {
  id: number;
  eje_nombre: string;
  sub_eje_nombre: string;
  meta: string | null;
  indicador: string | null;
  accion: string | null;
  presupuesto: string | null;
  t1?: boolean | null;
  t2?: boolean | null;
  t3?: boolean | null;
  t4?: boolean | null;
}

interface PlanAccionUserTableProps {
  areaId: number;
  areaName: string;
}

export const PlanAccionUserTable: React.FC<PlanAccionUserTableProps> = ({ areaId, areaName }) => {
  const [planAccion, setPlanAccion] = useState<PlanAccionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ id: number; field: 'accion' | 'presupuesto' } | null>(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    const fetchPlanAccion = async () => {
      try {
        const res = await fetch(`/api/admin/areas/${areaId}/plan-accion`);
        if (!res.ok) throw new Error('Error al cargar plan de acción');
        const data = await res.json();
        setPlanAccion(data.data || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar el plan de acción', {
          closeButton: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlanAccion();
  }, [areaId]);

  const handleDoubleClick = (id: number, field: 'accion' | 'presupuesto', currentValue: string | null) => {
    setEditingCell({ id, field });
    setTempValue(currentValue || '');
  };

  const handleSave = async () => {
    if (!editingCell) return;

    const { id, field } = editingCell;

    try {
      const res = await fetch('/api/admin/areas/plan-accion/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          [field]: tempValue
        })
      });

      if (!res.ok) throw new Error('Error al actualizar');

      // Actualizar localmente
      setPlanAccion(prev => prev.map(row => 
        row.id === id 
          ? { ...row, [field]: tempValue }
          : row
      ));

      toast.success('Actualizado', {
        description: `${field === 'accion' ? 'Acción' : 'Presupuesto'} actualizado correctamente.`,
        closeButton: true
      });
    } catch (error) {
      toast.error('Error al guardar', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.',
        closeButton: true
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
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleCheckboxChange = async (id: number, trimestre: 't1' | 't2' | 't3' | 't4', currentValue: boolean) => {
    try {
      const res = await fetch('/api/admin/areas/plan-accion/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          [trimestre]: !currentValue
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar trimestre');
      }

      // Actualizar localmente
      setPlanAccion(prev => prev.map(row => 
        row.id === id 
          ? { ...row, [trimestre]: !currentValue }
          : row
      ));

      toast.success('Trimestre actualizado', {
        closeButton: true
      });
    } catch (error) {
      toast.error('Error al actualizar trimestre', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.',
        closeButton: true
      });
    }
  };

  if (loading) {
    return <p style={{ color: '#9ca3af', fontSize: '14px' }}>Cargando...</p>;
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Header */}
      <div style={{
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          Área de ({areaName})
        </h2>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Planeación Estratégica.
        </p>
      </div>

      {/* Tabla de Plan de Acción */}
      <div style={{
        overflowX: 'auto',
        marginBottom: '2rem',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#8b9dc3' }}>
              <th style={headerCellStyle}>Eje</th>
              <th style={headerCellStyle}>Sub-Eje</th>
              <th style={headerCellStyle}>Meta</th>
              <th style={headerCellStyle}>Indicador</th>
              <th style={headerCellStyle}>Acción</th>
              <th style={headerCellStyle}>Presupuesto</th>
              <th style={headerCellStyle}>T1</th>
              <th style={headerCellStyle}>T2</th>
              <th style={headerCellStyle}>T3</th>
              <th style={headerCellStyle}>T4</th>
            </tr>
          </thead>
          <tbody>
            {planAccion.map((row, idx) => (
              <tr key={row.id} style={{
                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
              }}>
                <td style={bodyCellStyle}>{row.eje_nombre}</td>
                <td style={bodyCellStyle}>{row.sub_eje_nombre}</td>
                
                {/* Meta - No editable */}
                <td style={bodyCellStyle}>{row.meta || '-'}</td>

                {/* Indicador - No editable */}
                <td style={bodyCellStyle}>{row.indicador || '-'}</td>

                {/* Acción - Editable */}
                <td 
                  style={{ 
                    ...bodyCellStyle, 
                    cursor: editingCell?.id === row.id && editingCell?.field === 'accion' ? 'text' : 'pointer',
                    backgroundColor: editingCell?.id === row.id && editingCell?.field === 'accion' ? '#dbeafe' : undefined
                  }}
                  onDoubleClick={() => handleDoubleClick(row.id, 'accion', row.accion)}
                  title="Doble clic para editar"
                >
                  {editingCell?.id === row.id && editingCell?.field === 'accion' ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSave}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '4px',
                        border: '2px solid #3b82f6',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                    />
                  ) : (
                    row.accion || '-'
                  )}
                </td>
                
                {/* Presupuesto - Editable */}
                <td 
                  style={{ 
                    ...bodyCellStyle, 
                    cursor: editingCell?.id === row.id && editingCell?.field === 'presupuesto' ? 'text' : 'pointer',
                    backgroundColor: editingCell?.id === row.id && editingCell?.field === 'presupuesto' ? '#dbeafe' : undefined
                  }}
                  onDoubleClick={() => handleDoubleClick(row.id, 'presupuesto', row.presupuesto)}
                  title="Doble clic para editar"
                >
                  {editingCell?.id === row.id && editingCell?.field === 'presupuesto' ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSave}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '4px',
                        border: '2px solid #3b82f6',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                    />
                  ) : (
                    row.presupuesto || '-'
                  )}
                </td>

                {/* T1 - Checkbox */}
                <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={row.t1 || false}
                    onChange={() => handleCheckboxChange(row.id, 't1', row.t1 || false)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                </td>

                {/* T2 - Checkbox */}
                <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={row.t2 || false}
                    onChange={() => handleCheckboxChange(row.id, 't2', row.t2 || false)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                </td>

                {/* T3 - Checkbox */}
                <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={row.t3 || false}
                    onChange={() => handleCheckboxChange(row.id, 't3', row.t3 || false)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                </td>

                {/* T4 - Checkbox */}
                <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={row.t4 || false}
                    onChange={() => handleCheckboxChange(row.id, 't4', row.t4 || false)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
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
  padding: '12px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  whiteSpace: 'nowrap'
};

const bodyCellStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #e5e7eb',
  color: '#374151'
};
