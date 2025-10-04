// src/components/admin/AdminDashboardLayout.tsx
'use client';

import React, { useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Navbar */}
      <AdminNavbar userName={userName} />
      
      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? '300px' : '60px',
          transition: 'width 0.3s ease',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
        }}>
          <AdminSidebar
            areas={areas}
            onAreaSelect={onAreaSelect}
            selectedAreaId={selectedAreaId}
            onDashboardSelect={onDashboardSelect}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '2rem'
        }}>
          {children || (
            <AdminMainContent areas={areas} />
          )}
        </div>
      </div>
    </div>
  );
};