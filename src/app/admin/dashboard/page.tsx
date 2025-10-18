'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { AdminDashboardLayout, GestionAllSections, AreasManagementSectionImproved, EjesManagementSectionImproved } from '@/components/admin';
import { PlanAccionAdminTable } from '@/components/admin/PlanAccionAdminTable';
import { EvidenciasReview } from '@/components/admin/EvidenciasReview';
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
  const [showAreasManagement, setShowAreasManagement] = useState(false);
  const [showEjesManagement, setShowEjesManagement] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [calificarTrimestre, setCalificarTrimestre] = useState<number | null>(null);

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
    setShowAreasManagement(false);
    setShowEjesManagement(false);
    setCalificarTrimestre(null);
    const area = areas.find(a => a.id === areaId);
    setSelectedAreaId(areaId);
    setSelectedArea(area || null);
  };

  const handleDashboardSelect = () => {
    setShowGestion(false);
    setShowAreasManagement(false);
    setShowEjesManagement(false);
    setCalificarTrimestre(null);
    setSelectedAreaId(null);
    setSelectedArea(null);
  };

  const handleGestionSelect = () => {
    setShowGestion(true);
    setShowAreasManagement(false);
    setShowEjesManagement(false);
    setCalificarTrimestre(null);
    setSelectedAreaId(null);
    setSelectedArea(null);
  };

  const handleAreasManagementSelect = () => {
    setShowGestion(false);
    setShowAreasManagement(true);
    setShowEjesManagement(false);
    setCalificarTrimestre(null);
    setSelectedAreaId(null);
    setSelectedArea(null);
  };

  const handleEjesManagementSelect = () => {
    setShowGestion(false);
    setShowAreasManagement(false);
    setShowEjesManagement(true);
    setCalificarTrimestre(null);
    setSelectedAreaId(null);
    setSelectedArea(null);
  };

  const handleCalificarTrimestre = (trimestre: number) => {
    setCalificarTrimestre(trimestre);
  };

  const handleVolverArea = () => {
    setCalificarTrimestre(null);
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
      onAreasManagementSelect={handleAreasManagementSelect}
      onEjesManagementSelect={handleEjesManagementSelect}
      userName={user.nombre}
      isGestionSelected={showGestion}
      isAreasManagementSelected={showAreasManagement}
      isEjesManagementSelected={showEjesManagement}
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
      ) : showAreasManagement ? (
        <AreasManagementSectionImproved
          areas={areas}
          onCreate={createArea}
          onEdit={editArea}
          onDelete={deleteArea}
        />
      ) : showEjesManagement ? (
        <EjesManagementSectionImproved />
      ) : selectedArea ? (
        calificarTrimestre !== null ? (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={handleVolverArea}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                ← Volver
              </button>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                  📋 Calificar Evidencias - Trimestre {calificarTrimestre}
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  Área: {selectedArea.nombre_area}
                </p>
              </div>
            </div>

            <EvidenciasReview areaId={selectedArea.id} trimestre={calificarTrimestre} />
          </div>
        ) : (
          <div>
            <PlanAccionAdminTable
              areaId={selectedArea.id}
              areaName={selectedArea.nombre_area}
              onCalificarTrimestre={handleCalificarTrimestre}
            />
          </div>
        )
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