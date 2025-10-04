// src/components/admin/AdminNavbar.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface AdminNavbarProps {
  userName?: string;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ userName }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const navigateToManagement = () => {
    router.push('/admin');
  };

  const navigateToDashboard = () => {
    router.push('/admin/dashboard');
  };

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        {/* Logo/Title */}
        <div style={logoSectionStyle}>
          <h1 style={titleStyle}>Panel Administrativo</h1>
          <span style={subtitleStyle}>Sistema de Gestión</span>
        </div>

        {/* Navigation Links */}
        <div style={navLinksStyle}>
          <button 
            onClick={navigateToDashboard}
            style={navButtonStyle}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={navigateToManagement}
            style={navButtonStyle}
          >
            ⚙️ Gestionar
          </button>
        </div>

        {/* User Section */}
        <div style={userSectionStyle}>
          <span style={userNameStyle}>
            👤 {userName || 'Admin'}
          </span>
          <button 
            onClick={handleLogout}
            style={logoutButtonStyle}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

// Estilos
const navbarStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderBottom: '2px solid #e9ecef',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  position: 'sticky',
  top: 0,
  zIndex: 1000
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 24px',
  maxWidth: '100%'
};

const logoSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '20px',
  fontWeight: '700',
  color: '#343a40'
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6c757d',
  marginTop: '2px'
};

const navLinksStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px'
};

const navButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#495057',
  transition: 'all 0.2s ease'
};

const userSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const userNameStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#495057',
  fontWeight: '500'
};

const logoutButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'background-color 0.2s ease'
};