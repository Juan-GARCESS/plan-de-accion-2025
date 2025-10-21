// src/components/admin/AdminDashboardLayout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '.';
import { AdminMainContent } from '.';
import { AdminNavbar } from '.';
import type { Area } from '@/types';

interface AdminDashboardLayoutProps {
  areas: Area[];
  onAreaSelect?: (areaId: number) => void;
  selectedAreaId?: number | null;
  onDashboardSelect?: () => void;
  userName?: string;
  onGestionSelect?: () => void;
  isGestionSelected?: boolean;
  onAreasManagementSelect?: () => void;
  isAreasManagementSelected?: boolean;
  onEjesManagementSelect?: () => void;
  isEjesManagementSelected?: boolean;
  onPlanAccionGeneralSelect?: () => void;
  isPlanAccionGeneralSelected?: boolean;
  children?: React.ReactNode;
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  areas,
  onAreaSelect,
  selectedAreaId,
  onDashboardSelect,
  userName,
  onGestionSelect,
  isGestionSelected,
  onAreasManagementSelect,
  isAreasManagementSelected,
  onEjesManagementSelect,
  isEjesManagementSelected,
  onPlanAccionGeneralSelect,
  isPlanAccionGeneralSelected,
  children
}) => {
  const sidebarWidth = 280;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const userPhotoUrl = userName
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=f3f4f6&color=111827&size=128&bold=true`
    : undefined;

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        setSidebarOpen(!mobile); // Auto-cerrar en móvil, auto-abrir en desktop
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para cerrar sidebar (útil en móvil)
  const handleCloseSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Wrapper para las funciones de selección que cierra el sidebar en móvil
  const handleAreaSelectWithClose = (areaId: number) => {
    onAreaSelect?.(areaId);
    handleCloseSidebar();
  };

  const handleDashboardSelectWithClose = () => {
    onDashboardSelect?.();
    handleCloseSidebar();
  };

  const handleGestionSelectWithClose = () => {
    onGestionSelect?.();
    handleCloseSidebar();
  };

  const handleAreasManagementSelectWithClose = () => {
    onAreasManagementSelect?.();
    handleCloseSidebar();
  };

  const handleEjesManagementSelectWithClose = () => {
    onEjesManagementSelect?.();
    handleCloseSidebar();
  };

  const handlePlanAccionGeneralSelectWithClose = () => {
    onPlanAccionGeneralSelect?.();
    handleCloseSidebar();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Overlay para móvil cuando el sidebar está abierto */}
      {isMobile && sidebarOpen && (
        <div
          onClick={handleCloseSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Sidebar fixed to the top */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: sidebarOpen ? 0 : '-100%',
        bottom: 0,
        width: isMobile ? '280px' : `${sidebarWidth}px`,
        maxWidth: isMobile ? '85vw' : 'none',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        overflowY: 'auto',
        transition: 'left 0.3s ease',
        zIndex: 1000
      }}>
        <AdminSidebar
          areas={areas}
          onAreaSelect={handleAreaSelectWithClose}
          selectedAreaId={selectedAreaId}
          onDashboardSelect={handleDashboardSelectWithClose}
          userName={userName}
          onGestionSelect={handleGestionSelectWithClose}
          isGestionSelected={isGestionSelected}
          onAreasManagementSelect={handleAreasManagementSelectWithClose}
          isAreasManagementSelected={isAreasManagementSelected}
          onEjesManagementSelect={handleEjesManagementSelectWithClose}
          isEjesManagementSelected={isEjesManagementSelected}
          onPlanAccionGeneralSelect={handlePlanAccionGeneralSelectWithClose}
          isPlanAccionGeneralSelected={isPlanAccionGeneralSelected}
          onClose={isMobile ? handleCloseSidebar : undefined}
        />
      </aside>

      {/* Main region offset to the right of sidebar */}
      <div style={{ 
        marginLeft: isMobile ? '0' : (sidebarOpen ? `${sidebarWidth}px` : '0px'), 
        transition: 'margin-left 0.3s ease' 
      }}>
        {/* Navbar that starts after the sidebar */}
        <AdminNavbar 
          userName={userName} 
          userPhotoUrl={userPhotoUrl} 
          showMenuButton={!sidebarOpen || isMobile} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Content Area */}
        <main style={{ 
          padding: isMobile ? '1rem' : '2rem', 
          backgroundColor: '#f3f4f6', 
          minHeight: 'calc(100vh - 56px)' 
        }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb', 
            padding: isMobile ? '0.75rem' : '1rem'
          }}>
            {children || (
              <AdminMainContent areas={areas} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};