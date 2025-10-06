// src/components/user/UserDashboardLayout.tsx
'use client';

import React from 'react';
import { UserNavbar } from './UserNavbar';

interface UserDashboardLayoutProps {
  userName?: string;
  onBackHome?: () => void;
  children?: React.ReactNode;
}

export const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({ userName, onBackHome, children }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <UserNavbar userName={userName} onBackHome={onBackHome} />
      <main style={{ padding: '2rem', backgroundColor: '#f3f4f6', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
