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
  onEvidenciasSelect?: () => void;
  isEvidenciasSelected?: boolean;
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
  onEvidenciasSelect,
  isEvidenciasSelected,
  children
}) => {
  const sidebarWidth = 280;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userPhotoUrl = userName
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=f3f4f6&color=111827&size=128&bold=true`
    : undefined;

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setSidebarOpen(window.innerWidth >= 1024);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar fixed to the top */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: sidebarOpen ? `${sidebarWidth}px` : '0px',
        backgroundColor: '#ffffff',
        borderRight: sidebarOpen ? '1px solid #e5e7eb' : 'none',
        overflowY: 'auto',
        transition: 'width 0.25s ease, border-color 0.25s ease'
      }}>
        <AdminSidebar
          areas={areas}
          onAreaSelect={onAreaSelect}
          selectedAreaId={selectedAreaId}
          onDashboardSelect={onDashboardSelect}
          userName={userName}
          onGestionSelect={onGestionSelect}
          isGestionSelected={isGestionSelected}
          onEvidenciasSelect={onEvidenciasSelect}
          isEvidenciasSelected={isEvidenciasSelected}
        />
      </aside>

      {/* Main region offset to the right of sidebar */}
      <div style={{ marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0px', transition: 'margin-left 0.25s ease' }}>
        {/* Navbar that starts after the sidebar */}
        <AdminNavbar userName={userName} userPhotoUrl={userPhotoUrl} showMenuButton={!sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />

        {/* Content Area */}
        <main style={{ padding: '2rem', backgroundColor: '#f3f4f6', minHeight: 'calc(100vh - 56px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1rem' }}>
            {children || (
              <AdminMainContent areas={areas} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};