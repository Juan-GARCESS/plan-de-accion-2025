"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks/useResponsive";
import { Building2, LayoutDashboard, Hand, Settings, LogOut } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isMobile } = useResponsive();

  const handleGestionClick = () => {
    router.push("/admin");
  };

  const handleDashboardClick = () => {
    if (user?.rol === 'admin') {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  if (!user) return null;

  return (
    <nav style={{
      backgroundColor: 'white',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '1rem' : '0'
      }}>
        <button
          onClick={handleDashboardClick}
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {user.rol === 'admin' ? (
            <><Building2 size={24} /> Panel Administrativo</>
          ) : (
            <><LayoutDashboard size={24} /> Mi Dashboard</>
          )}
        </button>

        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <span style={{
            color: '#111827',
            fontSize: '0.875rem',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem'
          }}>
            <Hand size={16} /> {user.nombre}
          </span>
          
          {user.rol === 'admin' && (
            <button
              onClick={handleGestionClick}
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#1f2937',
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Settings size={16} /> Gestión
            </button>
          )}
          
          <button
            onClick={logout}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'white',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
