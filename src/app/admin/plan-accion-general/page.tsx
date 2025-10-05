'use client';
import { useState, useEffect } from 'react';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { createCardStyle, createButtonStyle, colors, spacing } from '@/lib/styleUtils';
import type { Area } from '@/types';

export default function PlanAccionGeneralPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch('/api/admin/areas');
        if (response.ok) {
          const data = await response.json();
          const mappedAreas = (data.areas || []).map((area: { id: number; nombre_area: string; descripcion?: string }) => ({
            ...area,
            descripcion: area.descripcion || ''
          }));
          setAreas(mappedAreas);
        }
      } catch (error) {
        console.error('Error cargando áreas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  const cardStyle = {
    ...createCardStyle('padded'),
    marginBottom: spacing.md,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `1px solid ${colors.gray[200]}`,
  };

  const buttonStyle = {
    ...createButtonStyle('primary'),
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: '14px',
    marginTop: spacing.sm,
  };

  const handleAreaClick = (areaId: number) => {
    window.open(`/admin/areas/${areaId}/plan-accion`, '_blank');
  };

  if (loading) {
    return (
      <AdminDashboardLayout areas={areas}>
        <div style={createCardStyle('padded')}>
          <p style={{ textAlign: 'center', color: colors.gray[500] }}>
            Cargando áreas...
          </p>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout areas={areas}>
      <div style={createCardStyle('base')}>
        <div style={{ padding: spacing.lg, borderBottom: `1px solid ${colors.gray[300]}` }}>
          <h1 style={{ margin: 0, color: colors.gray[800], fontSize: '24px' }}>
            Plan de Acción General
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: colors.gray[500] }}>
            Selecciona un área para ver y editar su plan de acción
          </p>
        </div>
        
        <div style={{ padding: spacing.lg }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: spacing.md 
          }}>
            {areas.map((area) => (
              <div 
                key={area.id} 
                style={cardStyle}
                onClick={() => handleAreaClick(area.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              >
                <h3 style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: colors.gray[800],
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {area.nombre_area}
                </h3>
                
                {area.descripcion && (
                  <p style={{ 
                    margin: '0 0 1rem 0', 
                    color: colors.gray[600],
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    {area.descripcion}
                  </p>
                )}
                
                <button 
                  style={buttonStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAreaClick(area.id);
                  }}
                >
                  Ver Plan de Acción
                </button>
              </div>
            ))}
          </div>
          
          {areas.length === 0 && (
            <div style={{ textAlign: 'center', padding: spacing.xl }}>
              <p style={{ color: colors.gray[500], fontSize: '16px' }}>
                No hay áreas disponibles
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}