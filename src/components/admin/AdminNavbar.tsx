// src/components/admin/AdminNavbar.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface AdminNavbarProps {
  userName?: string;
  userPhotoUrl?: string;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ userName, userPhotoUrl, showMenuButton, onMenuClick }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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


  const navigateToDashboard = () => {
    router.push('/admin/dashboard');
    setMenuOpen(false);
  };

  const navigateToProfile = () => {
    router.push('/dashboard');
    setMenuOpen(false);
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav style={navbarStyle}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '12px 16px' : '12px 24px',
        maxWidth: '100%'
      }}>
        {/* Menú + Título (izquierda) */}
        <div style={{ ...logoSectionStyle, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          {showMenuButton ? (
            <button
              onClick={onMenuClick}
              aria-label="Abrir menú"
              style={menuButtonStyle}
              onMouseEnter={(e)=>{ e.currentTarget.style.backgroundColor='#f3f4f6'; }}
              onMouseLeave={(e)=>{ e.currentTarget.style.backgroundColor='#ffffff'; }}
            >
              <Bars3Icon style={{ width: 20, height: 20, color: '#111827' }} />
            </button>
          ) : null}
          <button
            onClick={navigateToDashboard}
            style={titleButtonStyle}
            title="Ir al inicio (Misión y Visión)"
          >
            <span style={{
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: '800',
              color: '#111111'
            }}>
              {isMobile ? 'Plan' : `Plan de acción (${new Date().getFullYear()})`}
            </span>
          </button>
        </div>

        {/* Usuario (derecha) */}
        <div style={userSectionStyle} ref={menuRef}>
          {!isMobile && userName && <span style={userNameTopStyle}>{userName}</span>}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={userIconButtonStyle}
            onMouseEnter={(e)=>{ e.currentTarget.style.backgroundColor='#f3f4f6'; }}
            onMouseLeave={(e)=>{ e.currentTarget.style.backgroundColor='#ffffff'; }}
            title={userName || 'Usuario'}
          >
            {userPhotoUrl ? (
              <Image src={userPhotoUrl} alt={userName || 'Usuario'} width={40} height={40} style={avatarImgStyle as React.CSSProperties} />
            ) : (
              <span style={{ fontSize: '14px', color: '#111827', fontWeight: 600 }}>
                {(userName?.[0] || 'U').toUpperCase()}
              </span>
            )}
          </button>

          {menuOpen && (
            <div role="menu" style={dropdownStyle}>
              <div style={dropdownHeaderStyle}>
                {userPhotoUrl ? (
                  <Image src={userPhotoUrl} alt={userName || 'Usuario'} width={28} height={28} style={{ borderRadius: '9999px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: '9999px', backgroundColor: '#f3f4f6', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {(userName?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>{userName || 'Usuario'}</span>
                </div>
              </div>
              <div style={dropdownItemsContainerStyle}>
                <button role="menuitem" style={dropdownItemStyle} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#f3f4f6'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='#ffffff'} onClick={navigateToProfile}>
                  Mi perfil
                </button>
                <button role="menuitem" style={dropdownItemStyle} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#f3f4f6'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='#ffffff'} onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Estilos
const navbarStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
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
  fontWeight: '800',
  color: '#111111'
};

// (subtitle removed intentionally)

// (no intermediate nav links)

const userIconButtonStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '9999px',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease'
};

const menuButtonStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease'
};

const userSectionStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

// (username text removed in favor of icon-only menu)

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: '52px',
  width: 'min(240px, 90vw)',
  backgroundColor: '#ffffff',
  border: 'none',
  borderRadius: '14px',
  overflow: 'hidden',
  boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
  zIndex: 1001
};

const dropdownItemStyle: React.CSSProperties = {
  width: '100%',
  textAlign: 'left',
  padding: '10px 12px',
  backgroundColor: '#ffffff',
  color: '#111827',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  transition: 'background-color 0.15s ease, color 0.15s ease'
};

const titleButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  textAlign: 'left'
};

const userNameTopStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#111827',
  fontWeight: 600
};

const avatarImgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '9999px'
};

// (caret removed, avatar acts as trigger)

const dropdownHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 14px',
  borderBottom: '1px solid #eef2f7',
  backgroundColor: '#f8fafc'
};

const dropdownItemsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  padding: '8px',
  backgroundColor: '#ffffff'
};