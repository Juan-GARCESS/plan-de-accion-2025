// src/components/user/PlanAccionUserTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
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

interface PlanAccionUserTableProps {
  areaId: number;
  areaName: string;
}

export const PlanAccionUserTable: React.FC<PlanAccionUserTableProps> = ({ areaId, areaName }) => {
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

  const handleEdit = async (id: number, field: 'accion' | 'presupuesto' | 'meta' | 'indicador', value: string) => {
    // Solo permitir editar acción y presupuesto
    if (field !== 'accion' && field !== 'presupuesto') {
      return;
    }

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
        description: `${field === 'accion' ? 'Acción' : 'Presupuesto'} actualizado correctamente.`,
      });
    } catch (error) {
      toast.error('Error al guardar', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.',
      });
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

      toast.success('Trimestre actualizado');
    } catch (error) {
      toast.error('Error al actualizar trimestre', {
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
          Plan de Acción - {areaName}
        </h2>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Aquí puedes ver lo que el administrador definió y editar solo tus columnas de Acción y Presupuesto.
        </p>
      </div>

      {/* Tabla Moderna */}
      <PlanAccionModernTable
        data={planAccion}
        onEdit={handleEdit}
        onCheckboxChange={handleCheckboxChange}
        editable={true}
      />
    </div>
  );
};
