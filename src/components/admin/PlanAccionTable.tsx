'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createCardStyle, colors, spacing } from '@/lib/styleUtils';

interface PlanAccionItem {
  id: number;
  area_id: number;
  eje_id: number;
  sub_eje_id: number;
  eje_nombre: string;
  sub_eje_nombre: string;
  meta: string | null;
  indicador: string | null;
  accion: string | null;
  presupuesto: number | null;
}

interface PlanAccionTableProps {
  areaId: number;
  areaName: string;
  isAdmin: boolean;
}

export const PlanAccionTable: React.FC<PlanAccionTableProps> = ({
  areaId,
  areaName,
  isAdmin,
}) => {
  const [data, setData] = useState<PlanAccionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Cargar datos del plan de acción
  useEffect(() => {
    const fetchPlanAccion = async () => {
      try {
        const response = await fetch(`/api/admin/areas/${areaId}/plan-accion`);
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
        }
      } catch (error) {
        console.error('Error cargando plan de acción:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanAccion();
  }, [areaId]);

  // Iniciar edición de celda
  const startEditing = (item: PlanAccionItem, field: string) => {
    // Determinar permisos de edición
    let canEdit = false;
    
    if (field === 'meta' || field === 'indicador') {
      canEdit = isAdmin; // Solo admin puede editar meta e indicador
    } else if (field === 'accion' || field === 'presupuesto') {
      canEdit = !isAdmin; // Solo usuarios normales pueden editar acción y presupuesto
    }
    
    if (!canEdit) return;
    
    setEditingCell({ id: item.id, field });
    const currentValue = item[field as keyof PlanAccionItem];
    setEditValue(currentValue?.toString() || '');
    
    // Focus en el siguiente render
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 0);
  };

  // Guardar cambios automáticamente
  const saveEdit = async () => {
    if (!editingCell) return;

    try {
      const response = await fetch(`/api/admin/areas/${areaId}/plan-accion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCell.id,
          field: editingCell.field,
          value: editingCell.field === 'presupuesto' ? parseFloat(editValue) || null : editValue || null
        }),
      });

      if (response.ok) {
        // Actualizar datos localmente
        setData(prev => prev.map(item => 
          item.id === editingCell.id 
            ? { ...item, [editingCell.field]: editingCell.field === 'presupuesto' ? parseFloat(editValue) || null : editValue || null }
            : item
        ));
      } else {
        console.error('Error guardando cambios');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    setEditingCell(null);
    setEditValue('');
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Manejar teclas
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Renderizar celda editable
  const renderEditableCell = (item: PlanAccionItem, field: string, value: string | number | null) => {
    const isEditing = editingCell?.id === item.id && editingCell?.field === field;
    
    // Determinar quién puede editar cada campo
    let canEdit = false;
    let emptyMessage = '';
    
    if (field === 'meta' || field === 'indicador') {
      canEdit = isAdmin;
      emptyMessage = 'Doble clic para editar';
    } else if (field === 'accion') {
      canEdit = !isAdmin; // Solo usuarios normales pueden editar acción
      emptyMessage = isAdmin 
        ? 'El usuario de esta área aún no ha ingresado información' 
        : 'Doble clic para editar';
    } else if (field === 'presupuesto') {
      canEdit = !isAdmin; // Solo usuarios normales pueden editar presupuesto
      emptyMessage = isAdmin 
        ? 'El usuario de esta área aún no ha ingresado información' 
        : 'Doble clic para editar';
    }
    
    if (isEditing) {
      const isTextArea = field === 'meta' || field === 'indicador' || field === 'accion';
      
      if (isTextArea) {
        return (
          <textarea
            ref={editInputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyPress}
            style={{
              width: '100%',
              minHeight: '60px',
              border: `2px solid ${colors.primary}`,
              borderRadius: '4px',
              padding: '8px',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
        );
      } else {
        return (
          <input
            ref={editInputRef as React.RefObject<HTMLInputElement>}
            type={field === 'presupuesto' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyPress}
            style={{
              width: '100%',
              border: `2px solid ${colors.primary}`,
              borderRadius: '4px',
              padding: '8px',
              fontSize: '14px',
            }}
          />
        );
      }
    }

    const displayValue = value ? 
      (field === 'presupuesto' ? `$${Number(value).toLocaleString()}` : value) : 
      emptyMessage;

    return (
      <div
        onDoubleClick={() => canEdit && startEditing(item, field)}
        style={{
          minHeight: '40px',
          padding: '8px',
          cursor: canEdit ? 'pointer' : 'default',
          backgroundColor: !value && canEdit ? colors.gray[100] : 'transparent',
          color: !value ? colors.gray[500] : colors.gray[800],
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          fontSize: '14px',
          lineHeight: '1.4',
          fontStyle: !value ? 'italic' : 'normal',
        }}
        title={canEdit ? "Doble clic para editar" : undefined}
      >
        {displayValue}
      </div>
    );
  };

  const tableStyle = {
    ...createCardStyle('base'),
    overflow: 'auto',
  };

  const headerStyle = {
    backgroundColor: colors.secondary,
    color: 'white',
    padding: '12px 8px',
    textAlign: 'center' as const,
    fontWeight: 'bold',
    fontSize: '14px',
    borderRight: `1px solid ${colors.gray[300]}`,
  };

  const cellStyle = {
    padding: '0',
    borderRight: `1px solid ${colors.gray[300]}`,
    borderBottom: `1px solid ${colors.gray[300]}`,
    verticalAlign: 'top' as const,
  };

  if (loading) {
    return (
      <div style={createCardStyle('padded')}>
        <p style={{ textAlign: 'center', color: colors.gray[500] }}>
          Cargando plan de acción...
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={createCardStyle('padded')}>
        <h3 style={{ margin: '0 0 1rem 0', color: colors.gray[800] }}>
          Plan de Acción - {areaName}
        </h3>
        <p style={{ textAlign: 'center', color: colors.gray[500] }}>
          No hay ejes asignados a esta área aún.
        </p>
      </div>
    );
  }

  return (
    <div style={createCardStyle('base')}>
      <div style={{ padding: spacing.lg, borderBottom: `1px solid ${colors.gray[300]}` }}>
        <h2 style={{ margin: 0, color: colors.gray[800], fontSize: '24px', fontWeight: 'bold' }}>
          Área de ({areaName})
        </h2>
        <h3 style={{ margin: '0.5rem 0 0 0', color: colors.gray[700], fontSize: '18px', fontWeight: 'normal' }}>
          Planeación Estratégica.
        </h3>
      </div>
      
      <div style={tableStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...headerStyle, width: '15%' }}>Eje</th>
              <th style={{ ...headerStyle, width: '15%' }}>Sub-Eje</th>
              <th style={{ ...headerStyle, width: '25%' }}>Meta</th>
              <th style={{ ...headerStyle, width: '20%' }}>Indicador</th>
              <th style={{ ...headerStyle, width: '20%' }}>Acción</th>
              <th style={{ ...headerStyle, width: '15%' }}>Presupuesto</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td style={cellStyle}>
                  <div style={{ padding: '12px 8px', fontSize: '14px', fontWeight: '500' }}>
                    {item.eje_nombre}
                  </div>
                </td>
                <td style={cellStyle}>
                  <div style={{ padding: '12px 8px', fontSize: '14px' }}>
                    {item.sub_eje_nombre}
                  </div>
                </td>
                <td style={cellStyle}>
                  {renderEditableCell(item, 'meta', item.meta)}
                </td>
                <td style={cellStyle}>
                  {renderEditableCell(item, 'indicador', item.indicador)}
                </td>
                <td style={cellStyle}>
                  {renderEditableCell(item, 'accion', item.accion)}
                </td>
                <td style={cellStyle}>
                  {renderEditableCell(item, 'presupuesto', item.presupuesto)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};