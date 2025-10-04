// src/components/dashboard/TrimestreSelectionCard.tsx

import { useState } from 'react';
import { TrimestreDisponible } from '@/types';
import { getEstadoLabel, getEstadoColor } from '@/hooks/useTrimestreSelection';

interface TrimestreSelectionCardProps {
  trimestre: TrimestreDisponible;
  onSeleccionar: (trimestre: number, año: number) => Promise<boolean>;
}

export function TrimestreSelectionCard({
  trimestre,
  onSeleccionar
}: TrimestreSelectionCardProps) {
  const [seleccionando, setSeleccionando] = useState(false);

  const handleSeleccionar = async () => {
    if (seleccionando || !trimestre.disponible) return;

    setSeleccionando(true);
    try {
      await onSeleccionar(trimestre.trimestre, trimestre.año);
    } finally {
      setSeleccionando(false);
    }
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      position: 'relative'
    }}>
      {/* Header del Trimestre */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 4px 0'
          }}>
            T{trimestre.trimestre} {trimestre.año}
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: '14px',
            margin: 0
          }}>
            {formatearFecha(trimestre.fecha_inicio)} - {formatearFecha(trimestre.fecha_fin)}
          </p>
        </div>

        {/* Estado Badge */}
        {trimestre.seleccionado && trimestre.selection && (
          <div style={{
            backgroundColor: getEstadoColor(trimestre.selection.estado),
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {getEstadoLabel(trimestre.selection.estado)}
          </div>
        )}
      </div>

      {/* Contenido según estado */}
      {!trimestre.seleccionado && trimestre.disponible && (
        <>
          <p style={{
            color: '#475569',
            fontSize: '14px',
            marginBottom: '16px',
            lineHeight: '1.5'
          }}>
            Este trimestre está disponible para selección. Una vez seleccionado,
            un administrador te asignará una meta específica.
          </p>

          <button
            onClick={handleSeleccionar}
            disabled={seleccionando}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: seleccionando ? '#94a3b8' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: seleccionando ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            {seleccionando ? 'Seleccionando...' : 'Seleccionar Trimestre'}
          </button>
        </>
      )}

      {!trimestre.seleccionado && !trimestre.disponible && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#64748b'
        }}>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Trimestre no disponible para selección
          </p>
        </div>
      )}

      {trimestre.seleccionado && trimestre.selection && (
        <div>
          {/* Información de la selección */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '12px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              margin: '0 0 4px 0'
            }}>
              Seleccionado el: {formatearFecha(trimestre.selection.selected_at)}
            </p>
            <p style={{
              fontSize: '14px',
              color: '#374151',
              margin: 0,
              fontWeight: '500'
            }}>
              {getEstadoLabel(trimestre.selection.estado)}
            </p>
          </div>

          {/* Meta asignada */}
          {trimestre.selection.meta_asignada && (
            <div style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 8px 0'
              }}>
                Meta Asignada:
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#4b5563',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {trimestre.selection.meta_asignada}
              </p>
            </div>
          )}

          {/* Acciones según estado */}
          {(trimestre.selection.estado === 'meta_asignada' ||
            trimestre.selection.estado === 'upload_habilitado') && (
              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Subir Informe
              </button>
            )}

          {trimestre.selection.estado === 'pendiente_meta' && (
            <div style={{
              textAlign: 'center',
              padding: '12px',
              backgroundColor: '#fef3c7',
              borderRadius: '6px',
              color: '#92400e'
            }}>
              <p style={{ fontSize: '14px', margin: 0 }}>
                Esperando que un administrador asigne tu meta
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}