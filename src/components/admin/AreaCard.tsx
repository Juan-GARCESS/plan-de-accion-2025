// src/components/admin/AreaCard.tsx
'use client';

import React, { useState } from 'react';
import type { Area } from '@/types';

interface AreaCardProps {
  area: Area;
  onEdit: (area: Area) => void;
  onDelete: (areaId: number) => Promise<void>;
}

export const AreaCard: React.FC<AreaCardProps> = ({
  area,
  onEdit,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de eliminar el área "${area.nombre_area}"?`)) {
      setLoading(true);
      try {
        await onDelete(area.id);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <tr style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #f1f5f9'
    }}>
      <td style={tableCellStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {area.nombre_area}
          <span style={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            Activa
          </span>
        </div>
      </td>
      <td style={tableCellStyle}>
        {area.descripcion || 'Sin descripción'}
      </td>
      <td style={tableCellStyle}>
        👥 {area.usuarios_count || 0} usuarios
      </td>
      <td style={tableCellStyle}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onEdit(area)}
            disabled={loading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ✏️ Editar
          </button>
          
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            🗑️ Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
  color: '#374151',
  verticalAlign: 'middle'
};