'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Meta {
  id: number;
  eje: string;
  sub_eje: string;
  meta: string;
  indicador: string;
  accion: string;
  presupuesto: string;
  trimestres: number[]; // Array de trimestres seleccionados (1, 2, 3, 4)
}

interface PlanAccionAdminTableProps {
  areaId: number;
  areaName: string;
}

export const PlanAccionAdminTable: React.FC<PlanAccionAdminTableProps> = ({ areaId, areaName }) => {
  const router = useRouter();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetas = async () => {
      try {
        const res = await fetch(`/api/admin/areas/${areaId}/trimestres`);
        if (!res.ok) throw new Error('Error al cargar metas');
        const data = await res.json();
        setMetas(data.metas || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar las metas');
      } finally {
        setLoading(false);
      }
    };

    fetchMetas();
  }, [areaId]);

  const handleCalificar = (trimestre: number) => {
    router.push(`/admin/areas/${areaId}/trimestres/${trimestre}`);
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
          Planeación Estratégica. Rellene su respectiva información y marque los trimestres en los que desea que se le haga seguimiento a su meta
        </p>
      </div>

      {/* Tabla de Metas */}
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
              <th style={{ ...headerCellStyle, width: '60px' }}>T1</th>
              <th style={{ ...headerCellStyle, width: '60px' }}>T2</th>
              <th style={{ ...headerCellStyle, width: '60px' }}>T3</th>
              <th style={{ ...headerCellStyle, width: '60px' }}>T4</th>
            </tr>
          </thead>
          <tbody>
            {metas.map((meta, idx) => (
              <tr key={meta.id} style={{
                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
              }}>
                <td style={bodyCellStyle}>{meta.eje}</td>
                <td style={bodyCellStyle}>{meta.sub_eje}</td>
                <td style={bodyCellStyle}>{meta.meta}</td>
                <td style={bodyCellStyle}>{meta.indicador}</td>
                <td style={bodyCellStyle}>{meta.accion}</td>
                <td style={bodyCellStyle}>{meta.presupuesto}</td>
                <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={meta.trimestres.includes(1)}
                    readOnly
                    style={{ cursor: 'not-allowed', accentColor: '#10b981' }}
                  />
                </td>
                <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={meta.trimestres.includes(2)}
                    readOnly
                    style={{ cursor: 'not-allowed', accentColor: '#10b981' }}
                  />
                </td>
                <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={meta.trimestres.includes(3)}
                    readOnly
                    style={{ cursor: 'not-allowed', accentColor: '#10b981' }}
                  />
                </td>
                <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={meta.trimestres.includes(4)}
                    readOnly
                    style={{ cursor: 'not-allowed', accentColor: '#10b981' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección Calificar */}
      <div style={{
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '2px solid #e5e7eb'
      }}>
        <h3 style={{
          margin: 0,
          marginBottom: '1rem',
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827'
        }}>
          Calificar
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          maxWidth: '800px'
        }}>
          {[1, 2, 3, 4].map((trimestre) => (
            <button
              key={trimestre}
              onClick={() => handleCalificar(trimestre)}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              Trimestre {trimestre}
            </button>
          ))}
        </div>
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
