// src/components/user/UserNavbar.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserNavbarProps {
  userName?: string;
  areaName?: string;
  onBackHome?: () => void; // if provided, shows back button
}

export const UserNavbar: React.FC<UserNavbarProps> = ({ userName, areaName, onBackHome }) => {
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
      const response = await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      if (response.ok) router.push('/');
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav style={{ 
      backgroundColor: '#ffffff', 
      borderBottom: '1px solid #e5e7eb', 
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: isMobile ? '12px 16px' : '12px 24px',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          {onBackHome && (
            <button
              onClick={onBackHome}
              style={{ 
                background: 'transparent', 
                border: '1px solid #d1d5db', 
                borderRadius: 8, 
                padding: isMobile ? '6px 10px' : '8px 12px', 
                cursor: 'pointer',
                fontSize: isMobile ? '13px' : '14px',
                whiteSpace: 'nowrap'
              }}
              title="Volver al inicio"
            >
              {isMobile ? '←' : '← Inicio'}
            </button>
          )}
          <span style={{ 
            fontWeight: 800, 
            fontSize: isMobile ? '16px' : '20px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {isMobile ? 'Plan' : `Plan de acción${areaName ? ` - ${areaName}` : ''}`}
          </span>
        </div>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setMenuOpen(v => !v)} style={{ width: 40, height: 40, borderRadius: '9999px', background: '#fff', border: '1px solid #d1d5db', cursor: 'pointer' }} title={userName || 'Usuario'}>
            <span style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>{(userName?.[0] || 'U').toUpperCase()}</span>
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: 52, width: 'min(240px, 90vw)', background: '#fff', borderRadius: 14, boxShadow: '0 12px 24px rgba(0,0,0,0.12)', zIndex: 1001 }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #eef2f7', background: '#f8fafc', fontWeight: 700 }}>{userName || 'Usuario'}</div>
              <div style={{ padding: 8 }}>
                <button onClick={() => router.push('/dashboard/perfil')} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 600, marginBottom: 4 }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#f3f4f6'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='#fff'}>
                  Ver mi perfil
                </button>
                <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 600 }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#f3f4f6'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='#fff'}>
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
