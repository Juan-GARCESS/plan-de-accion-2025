// src/components/admin/AdminDashboardLayout.tsx
'use client';

import React from 'react';
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
  children?: React.ReactNode;
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  areas,
  onAreaSelect,
  selectedAreaId,
  onDashboardSelect,
  userName,
  children
}) => {
  const sidebarWidth = 280;
  const userPhotoUrl = userName
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=f3f4f6&color=111827&size=128&bold=true`
    : undefined;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar fixed to the top */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: `${sidebarWidth}px`,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        overflowY: 'auto'
      }}>
        <AdminSidebar
          areas={areas}
          onAreaSelect={onAreaSelect}
          selectedAreaId={selectedAreaId}
          onDashboardSelect={onDashboardSelect}
          userName={userName}
        />
      </aside>

      {/* Main region offset to the right of sidebar */}
      <div style={{ marginLeft: `${sidebarWidth}px` }}>
        {/* Navbar that starts after the sidebar */}
  <AdminNavbar userName={userName} userPhotoUrl={userPhotoUrl} />

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