// src/components/user/UserNavbar.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UserNavbarProps {
  userName?: string;
  onBackHome?: () => void;
}

export const UserNavbar: React.FC<UserNavbarProps> = ({ userName, onBackHome }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
    <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onBackHome}
            style={{ background: 'transparent', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}
            title="Volver al inicio"
          >
            ← Inicio
          </button>
          <span style={{ fontWeight: 800, fontSize: 20, marginLeft: 8 }}>Plan de acción</span>
        </div>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setMenuOpen(v => !v)} style={{ width: 40, height: 40, borderRadius: '9999px', background: '#fff', border: '1px solid #d1d5db', cursor: 'pointer' }} title={userName || 'Usuario'}>
            <span style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>{(userName?.[0] || 'U').toUpperCase()}</span>
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: 52, width: 240, background: '#fff', borderRadius: 14, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #eef2f7', background: '#f8fafc', fontWeight: 700 }}>{userName || 'Usuario'}</div>
              <div style={{ padding: 8 }}>
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
