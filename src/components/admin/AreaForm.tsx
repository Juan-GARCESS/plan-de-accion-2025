// src/components/admin/AreaForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { Area } from '@/types';
import { FileText, ClipboardList, X, Loader2, Check, Plus } from 'lucide-react';

interface AreaFormProps {
  area?: Area | null;
  onSubmit: (data: { nombre: string; descripcion: string }) => Promise<void>;
  onCancel: () => void;
}

export const AreaForm: React.FC<AreaFormProps> = ({
  area,
  onSubmit,
  onCancel,
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (area) {
      setNombre(area.nombre_area);
      setDescripcion(area.descripcion || '');
    } else {
      setNombre('');
      setDescripcion('');
    }
  }, [area]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({ nombre: nombre.trim(), descripcion: descripcion.trim() });
      if (!area) {
        setNombre('');
        setDescripcion('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} />
            Nombre del Área *
          </label>
          <input
            type="text"
            style={inputStyle}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Recursos Humanos, Marketing, IT..."
            required
            onFocus={(e) => {
              e.target.style.borderColor = '#111827';
              e.target.style.backgroundColor = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.backgroundColor = '#fafafa';
            }}
          />
        </div>

        <div>
          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClipboardList size={16} />
            Descripción
          </label>
          <input
            type="text"
            style={inputStyle}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Breve descripción del área..."
            onFocus={(e) => {
              e.target.style.borderColor = '#111827';
              e.target.style.backgroundColor = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.backgroundColor = '#fafafa';
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'flex-end'
      }}>
        {area && (
          <button
            type="button"
            style={{
              ...buttonSecondaryStyle,
              backgroundColor: submitting ? '#9ca3af' : '#6b7280'
            }}
            onClick={onCancel}
            disabled={submitting}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.backgroundColor = '#4b5563';
            }}
            onMouseLeave={(e) => {
              if (!submitting) e.currentTarget.style.backgroundColor = '#6b7280';
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <X size={16} />
            Cancelar
          </button>
        )}
        
        <button
          type="submit"
          style={{
            ...buttonPrimaryStyle,
            backgroundColor: submitting || !nombre.trim() ? '#9ca3af' : '#22c55e',
            cursor: submitting || !nombre.trim() ? 'not-allowed' : 'pointer'
          }}
          disabled={submitting || !nombre.trim()}
          onMouseEnter={(e) => {
            if (!submitting && nombre.trim()) e.currentTarget.style.backgroundColor = '#16a34a';
          }}
          onMouseLeave={(e) => {
            if (!submitting && nombre.trim()) e.currentTarget.style.backgroundColor = '#22c55e';
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {submitting ? <><Loader2 size={16} /> Guardando...</> : area ? <><Check size={16} /> Actualizar</> : <><Plus size={16} /> Crear Área</>}
        </button>
      </div>
    </form>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '0.5rem'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: '#fafafa',
  transition: 'border-color 0.2s, background-color 0.2s',
  outline: 'none'
};

const buttonPrimaryStyle: React.CSSProperties = {
  padding: '10px 20px',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const buttonSecondaryStyle: React.CSSProperties = {
  padding: '10px 20px',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};