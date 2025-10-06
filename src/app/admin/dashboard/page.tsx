'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { AdminDashboardLayout, GestionAllSections } from '@/components/admin';
import { PlanAccionTable } from '@/components/admin/PlanAccionTable';
import { useAuth } from '@/hooks/useAuth';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import type { Area } from '@/types';

function DashboardPageContent() {
  const { user, loading, preventBackNavigation } = useAuth();
  const {
    usuarios,
    areas,
    loading: gestionLoading,
    approveUser,
    rejectUser,
    editUser,
    deleteUser,
    generatePassword,
    createArea,
    editArea,
    deleteArea
  } = useAdminManagement();
  const [showGestion, setShowGestion] = useState(false);
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
    // ya cargamos areas/usuarios con el hook useAdminManagement
  }, [user]);

  const handleAreaSelect = (areaId: number) => {
    setShowGestion(false);
    const area = areas.find(a => a.id === areaId);
    setSelectedAreaId(areaId);
    setSelectedArea(area || null);
  };

  const handleDashboardSelect = () => {
    setShowGestion(false);
    setSelectedAreaId(null);
    setSelectedArea(null);
  };

  const handleGestionSelect = () => {
    setShowGestion(true);
    setSelectedAreaId(null);
    setSelectedArea(null);
  };

  if (loading || gestionLoading) {
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
      onGestionSelect={handleGestionSelect}
      userName={user.nombre}
      isGestionSelected={showGestion}
    >
      {showGestion ? (
        <GestionAllSections
          usuarios={usuarios}
          areas={areas}
          onApprove={approveUser}
          onReject={rejectUser}
          onEdit={editUser}
          onDelete={deleteUser}
          onGeneratePassword={generatePassword}
          onCreateArea={createArea}
          onEditArea={editArea}
          onDeleteArea={deleteArea}
        />
      ) : selectedArea ? (
        <PlanAccionTable
          areaId={selectedArea.id}
          areaName={selectedArea.nombre_area}
          isAdmin={user.rol === 'admin'}
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