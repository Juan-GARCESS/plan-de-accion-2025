'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PlanAccionModernTable } from '@/components/shared/PlanAccionModernTable';

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

interface PlanAccionAdminTableProps {
  areaId: number;
  areaName: string;
  onCalificarTrimestre?: (trimestre: number) => void;
}

export const PlanAccionAdminTable: React.FC<PlanAccionAdminTableProps> = ({ areaId, areaName, onCalificarTrimestre }) => {
  const router = useRouter();
  const [planAccion, setPlanAccion] = useState<PlanAccionRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleCalificar = (trimestre: number) => {
    if (onCalificarTrimestre) {
      onCalificarTrimestre(trimestre);
    } else {
      router.push(`/admin/areas/${areaId}/trimestres/${trimestre}`);
    }
  };

  const handleEdit = async (id: number, field: 'meta' | 'indicador' | 'accion' | 'presupuesto', value: string) => {
    try {
      const res = await fetch('/api/admin/areas/plan-accion/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          [field]: value
        })
      });

      if (!res.ok) throw new Error('Error al actualizar');

      // Actualizar localmente
      setPlanAccion(prev => prev.map(row => 
        row.id === id 
          ? { ...row, [field]: value }
          : row
      ));

      toast.success('Actualizado', {
        description: `Campo actualizado correctamente.`,
      });
    } catch (error) {
      toast.error('Error al guardar', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.',
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
          Área de {areaName}
        </h2>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Planeación Estratégica. Rellene su respectiva información y marque los trimestres en los que desea que se le haga seguimiento a su meta
        </p>
      </div>

      {/* Tabla Moderna */}
      <PlanAccionModernTable
        data={planAccion}
        onEdit={handleEdit}
        editable={false}
        adminMode={true}
      />

      {/* Sección Calificar */}
      <div style={{
        marginTop: '2rem',
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          margin: 0,
          marginBottom: '1.5rem',
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#111827',
          textAlign: 'center'
        }}>
          Calificar Evidencias por Trimestre
        </h3>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {[1, 2, 3, 4].map((trimestre) => (
            <button
              key={trimestre}
              onClick={() => handleCalificar(trimestre)}
              style={{
                padding: '12px 32px',
                border: '2px solid #1F2937',
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: '#1F2937',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '140px',
                boxShadow: '0 2px 4px rgba(31, 41, 55, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1F2937';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(31, 41, 55, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.color = '#1F2937';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(31, 41, 55, 0.1)';
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
