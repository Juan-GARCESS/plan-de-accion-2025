'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { AdminDashboardLayout, AreaUsersView } from '@/components/admin';
import { useAuth } from '@/hooks/useAuth';
import type { Area } from '@/types';

function DashboardPageContent() {
  const { user, loading, preventBackNavigation } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  // Prevenir navegación hacia atrás - AQUÍ es el dashboard principal del admin
  useEffect(() => {
    if (user && user.rol === 'admin') {
      const cleanup = preventBackNavigation();
      return cleanup;
    }
  }, [user, preventBackNavigation]);

  // Cambiar título de la página para admin
  useEffect(() => {
    if (user && user.rol === 'admin') {
      document.title = 'Plan de Acción - Adm';
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAreas();
    }
  }, [user]);

  const fetchAreas = async () => {
    try {
      const response = await fetch('/api/admin/areas');
      if (response.ok) {
        const data = await response.json();
        setAreas(data); // Ahora la API devuelve el array directamente
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const handleAreaSelect = (areaId: number) => {
    const area = areas.find(a => a.id === areaId);
    setSelectedAreaId(areaId);
    setSelectedArea(area || null);
  };

  const handleDashboardSelect = () => {
    setSelectedAreaId(null);
    setSelectedArea(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p style={{ 
          color: '#9ca3af', 
          margin: 0, 
          fontSize: '14px',
          fontWeight: '400'
        }}>
          Cargando
        </p>
      </div>
    );
  }

  if (!user || user.rol !== 'admin') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h2>Acceso Denegado</h2>
        <p>Solo los administradores pueden acceder a esta pagina</p>
      </div>
    );
  }

  return (
    <AdminDashboardLayout
      areas={areas}
      selectedAreaId={selectedAreaId}
      onAreaSelect={handleAreaSelect}
      onDashboardSelect={handleDashboardSelect}
      userName={user.nombre}
    >
      {selectedArea ? (
        <AreaUsersView
          areaId={selectedArea.id}
          areaName={selectedArea.nombre_area}
        />
      ) : null}
    </AdminDashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p style={{ 
          color: '#9ca3af', 
          margin: 0, 
          fontSize: '14px',
          fontWeight: '400'
        }}>
          Cargando
        </p>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}