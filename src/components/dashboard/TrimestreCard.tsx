// src/components/dashboard/TrimestreCard.tsx
'use client';

import React, { useState } from 'react';
import { styles, combineStyles } from '@/styles/components';
import type { Trimestre } from '@/types';

interface TrimestreCardProps {
  trimestre: Trimestre;
  onSubmitMeta: (trimestreId: number, meta: string) => Promise<void>;
  onSubmitArchivo: (trimestreId: number, archivo: File) => Promise<void>;
}

export const TrimestreCard: React.FC<TrimestreCardProps> = ({
  trimestre,
  onSubmitMeta,
  onSubmitArchivo,
}) => {
  const [metaTrimestral, setMetaTrimestral] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitMeta = async () => {
    if (!metaTrimestral.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitMeta(trimestre.id, metaTrimestral);
      setMetaTrimestral('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitArchivo = async () => {
    if (!archivo) return;
    setSubmitting(true);
    try {
      await onSubmitArchivo(trimestre.id, archivo);
      setArchivo(null);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = () => {
    if (!trimestre.informe) return '#6b7280';
    switch (trimestre.informe.estado) {
      case 'aceptado': return '#059669';
      case 'rechazado': return '#dc2626';
      case 'pendiente': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    if (!trimestre.informe) return 'Sin informe';
    switch (trimestre.informe.estado) {
      case 'aceptado': return 'Aceptado';
      case 'rechazado': return 'Rechazado';
      case 'pendiente': return 'Pendiente';
      default: return 'Sin estado';
    }
  };

  const cardStyle = combineStyles(
    styles.card,
    { padding: '1.5rem' },
    !trimestre.disponible ? { opacity: 0.6 } : {}
  );

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827',
          margin: 0
        }}>
          Trimestre {trimestre.trimestre} - {trimestre.año}
        </h3>
        <span style={combineStyles(
          styles.badge.base,
          trimestre.informe?.estado === 'aceptado' ? styles.badge.success :
          trimestre.informe?.estado === 'rechazado' ? styles.badge.danger :
          trimestre.informe?.estado === 'pendiente' ? styles.badge.warning :
          styles.badge.info
        )}>
          {getStatusText()}
        </span>
      </div>

      {/* Fechas */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem'
      }}>
        <p style={{
          color: '#374151',
          fontSize: '0.875rem',
          margin: 0
        }}>
          📅 {new Date(trimestre.fecha_inicio).toLocaleDateString()} - 
          {new Date(trimestre.fecha_fin).toLocaleDateString()}
        </p>
      </div>

      {/* Estado disponibilidad */}
      {!trimestre.disponible && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          ⚠️ {trimestre.razon}
        </div>
      )}

      {/* Formulario Meta */}
      {trimestre.disponible && !trimestre.informe?.meta_trimestral && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Meta Trimestral:
          </label>
          <textarea
            style={{
              ...styles.input,
              minHeight: '100px',
              resize: 'vertical'
            }}
            value={metaTrimestral}
            onChange={(e) => setMetaTrimestral(e.target.value)}
            placeholder="Describe tu meta para este trimestre..."
          />
          <button
            style={combineStyles(
              styles.button.base,
              styles.button.primary,
              { marginTop: '0.5rem', width: '100%' },
              (submitting || !metaTrimestral.trim()) ? { opacity: 0.5 } : {}
            )}
            onClick={handleSubmitMeta}
            disabled={submitting || !metaTrimestral.trim()}
          >
            {submitting ? 'Guardando...' : 'Guardar Meta'}
          </button>
        </div>
      )}

      {/* Meta existente */}
      {trimestre.informe?.meta_trimestral && (
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#1e40af',
            margin: '0 0 0.5rem 0'
          }}>
            Tu Meta:
          </h4>
          <p style={{
            color: '#374151',
            fontSize: '0.875rem',
            margin: 0,
            lineHeight: '1.4'
          }}>
            {trimestre.informe.meta_trimestral}
          </p>
        </div>
      )}

      {/* Formulario Archivo */}
      {trimestre.disponible && trimestre.informe?.meta_trimestral && !trimestre.informe?.archivo && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Subir Informe:
          </label>
          <input
            type="file"
            style={styles.input}
            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            accept=".pdf,.doc,.docx,.txt"
          />
          <button
            style={combineStyles(
              styles.button.base,
              styles.button.success,
              { marginTop: '0.5rem', width: '100%' },
              (submitting || !archivo) ? { opacity: 0.5 } : {}
            )}
            onClick={handleSubmitArchivo}
            disabled={submitting || !archivo}
          >
            {submitting ? 'Subiendo...' : 'Subir Informe'}
          </button>
        </div>
      )}

      {/* Archivo subido */}
      {trimestre.informe?.archivo && (
        <div style={{
          backgroundColor: '#dcfce7',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <p style={{
            color: '#166534',
            fontSize: '0.875rem',
            margin: 0
          }}>
            ✓ Archivo subido: {trimestre.informe.archivo}
          </p>
        </div>
      )}

      {/* Comentario admin */}
      {trimestre.informe?.comentario_admin && (
        <div style={{
          backgroundColor: trimestre.informe.estado === 'rechazado' ? '#fee2e2' : '#f0f9ff',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          border: `1px solid ${trimestre.informe.estado === 'rechazado' ? '#fca5a5' : '#93c5fd'}`
        }}>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: trimestre.informe.estado === 'rechazado' ? '#991b1b' : '#1e40af',
            margin: '0 0 0.5rem 0'
          }}>
            Comentario del Administrador:
          </h4>
          <p style={{
            color: '#374151',
            fontSize: '0.875rem',
            margin: 0,
            lineHeight: '1.4'
          }}>
            {trimestre.informe.comentario_admin}
          </p>
        </div>
      )}

      {/* Calificación */}
      {trimestre.informe?.calificacion && (
        <div style={{
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: getStatusColor()
          }}>
            Calificación: {trimestre.informe.calificacion}/10
          </span>
        </div>
      )}
    </div>
  );
};