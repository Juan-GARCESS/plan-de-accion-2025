'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { PlanAccionTable } from '@/components/admin/PlanAccionTable';
import { createCardStyle, colors } from '@/lib/styleUtils';
import type { Area } from '@/types';

export default function AreaPlanAccionPage() {
  const params = useParams();
  const router = useRouter();
  const areaId = parseInt(params.id as string);
  const [areaInfo, setAreaInfo] = useState<{ id: number; nombre_area: string } | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verificar si es admin, obtener info del área y todas las áreas
    Promise.all([
      fetch('/api/me'),
      fetch(`/api/admin/areas/${areaId}`),
      fetch('/api/admin/areas')
    ]).then(async ([meRes, areaRes, areasRes]) => {
      if (meRes.ok) {
        const userData = await meRes.json();
        setIsAdmin(userData.rol === 'admin');
      }
      
      if (areaRes.ok) {
        const areaData = await areaRes.json();
        setAreaInfo(areaData.area);
      }

      if (areasRes.ok) {
        const areasData = await areasRes.json();
        // Mapear los datos para asegurar que tengan descripción
        const mappedAreas = (areasData.areas || []).map((area: { id: number; nombre_area: string; descripcion?: string }) => ({
          ...area,
          descripcion: area.descripcion || ''
        }));
        setAreas(mappedAreas);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, [areaId]);

  const handleAreaSelect = (newAreaId: number) => {
    router.push(`/admin/areas/${newAreaId}/plan-accion`);
  };

  const handleDashboardSelect = () => {
    router.push('/admin');
  };

  if (loading) {
    return (
      <AdminDashboardLayout 
        areas={areas}
        onAreaSelect={handleAreaSelect}
        selectedAreaId={areaId}
        onDashboardSelect={handleDashboardSelect}
      >
        <div style={createCardStyle('padded')}>
          <p style={{ textAlign: 'center', color: colors.gray[500] }}>
            Cargando...
          </p>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!areaInfo) {
    return (
      <AdminDashboardLayout 
        areas={areas}
        onAreaSelect={handleAreaSelect}
        selectedAreaId={areaId}
        onDashboardSelect={handleDashboardSelect}
      >
        <div style={createCardStyle('padded')}>
          <p style={{ textAlign: 'center', color: colors.danger }}>
            Área no encontrada
          </p>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout 
      areas={areas} 
      onAreaSelect={handleAreaSelect}
      selectedAreaId={areaId}
      onDashboardSelect={handleDashboardSelect}
    >
      <PlanAccionTable 
        areaId={areaId} 
        areaName={areaInfo.nombre_area}
        isAdmin={isAdmin}
      />
    </AdminDashboardLayout>
  );
}