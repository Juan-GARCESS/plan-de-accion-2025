// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SessionTimer } from '@/components/SessionTimer';
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, preventBackNavigation, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  // area display is now in content cards; no separate header

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Proteger la ruta - solo usuarios normales con área asignada
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/');
        return;
      }
      if (user.rol === 'admin') {
        router.replace('/admin/dashboard');
        return;
      }
      if (user.estado !== 'activo') {
        document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        router.replace('/?error=pending');
        return;
      }
      if (!user.area_id) {
        document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        router.replace('/?error=no-area');
        return;
      }
      const cleanup = preventBackNavigation();
      return cleanup;
    }
  }, [user, authLoading, router, preventBackNavigation]);

  // Opcional: setear título si se desea, usando /api/me

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <p style={{ 
          color: '#9ca3af', 
          margin: 0, 
          fontSize: '14px',
          fontWeight: '400'
        }}>
          Cargando
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <UserDashboardLayout userName={user.nombre} areaName={undefined}>
      {/* Timer de sesión */}
      <SessionTimer isAuthenticated={!!user} onTimeout={logout} timeoutMinutes={5} />

      <div style={{ padding: isMobile ? '16px' : '24px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
          gap: isMobile ? '16px' : '24px', 
          marginBottom: isMobile ? '16px' : '24px' 
        }}>
          <div style={{ 
            background: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: 12, 
            padding: isMobile ? '16px' : 24 
          }}>
            <h2 style={{ 
              marginTop: 0, 
              borderBottom: '1px solid #e5e7eb', 
              paddingBottom: 12,
              fontSize: isMobile ? '1.25rem' : '1.5rem'
            }}>
              Misión
            </h2>
            <p style={{ 
              margin: 0, 
              color: '#374151', 
              lineHeight: 1.6,
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Somos una Institución multi-campus de propiedad social, educamos personas con las competencias para responder a las dinámicas del mundo, contribuimos a la construcción y difusión del conocimiento, apoyamos el desarrollo competitivo del país a través de sus organizaciones y buscamos el mejoramiento de la calidad de vida de las comunidades, influidos por la economía solidaria que nos dio origen.
            </p>
          </div>
          <div style={{ 
            background: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: 12, 
            padding: isMobile ? '16px' : 24 
          }}>
            <h2 style={{ 
              marginTop: 0, 
              borderBottom: '1px solid #e5e7eb', 
              paddingBottom: 12,
              fontSize: isMobile ? '1.25rem' : '1.5rem'
            }}>
              Visión
            </h2>
            <p style={{ 
              margin: 0, 
              color: '#374151', 
              lineHeight: 1.6,
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Para 2025, la Universidad Cooperativa de Colombia será una institución sostenible que aprende continuamente para transformarse de acuerdo con las exigencias del contexto, reflejándose en: Una educación y un aprendizaje a lo largo de la vida soportado en nuestro modelo educativo con una oferta educativa pertinente, en diferentes modalidades. Una gestión inclusiva que integre entornos individuales, físicos y digitales con nuevos desarrollos tecnológicos. Una cultura innovadora que responda a las demandas del contexto, a la generación de conocimiento colectivo y experiencias compartidas.
            </p>
          </div>
        </div>

        {/* Botón Plan de Acción - Primero */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: isMobile ? '20px' : '32px'
        }}>
          <button 
            onClick={() => router.push('/dashboard/plan-accion')} 
            style={{ 
              background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 12, 
              padding: isMobile ? '16px 32px' : '18px 40px', 
              fontWeight: 700, 
              cursor: 'pointer',
              fontSize: isMobile ? '1rem' : '1.125rem',
              boxShadow: '0 4px 12px rgba(17, 24, 39, 0.3)',
              transition: 'all 0.3s ease',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(17, 24, 39, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(17, 24, 39, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📋</span>
            Plan de Acción
          </button>
        </div>

        {/* Sección de Trimestres - Después */}
        <div style={{ 
          background: '#fff', 
          border: '1px solid #e5e7eb', 
          borderRadius: 12, 
          padding: isMobile ? '16px' : 24
        }}>
          <h2 style={{ 
            marginTop: 0, 
            marginBottom: 16,
            fontSize: isMobile ? '1.1rem' : '1.5rem',
            fontWeight: '600',
            color: '#111827'
          }}>
            📊 Plan de Acción por Trimestre
          </h2>
          <p style={{ 
            margin: 0, 
            marginBottom: 20,
            color: '#6b7280', 
            fontSize: isMobile ? '0.8125rem' : '0.875rem'
          }}>
            Selecciona un trimestre para gestionar tus metas, evidencias y seguimiento:
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', 
            gap: isMobile ? '10px' : '12px'
          }}>
            {[1, 2, 3, 4].map(trimestre => (
              <button
                key={trimestre}
                onClick={() => router.push(`/dashboard/trimestre/${trimestre}`)}
                style={{
                  background: '#ffffff',
                  color: '#111827',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: isMobile ? '12px' : '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                }}
              >
                <span style={{ fontSize: '1.5rem', marginBottom: '2px' }}>📈</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  Trimestre {trimestre}
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#6b7280' }}>
                  {trimestre === 1 ? 'Ene - Mar' : 
                   trimestre === 2 ? 'Abr - Jun' :
                   trimestre === 3 ? 'Jul - Sep' : 
                   'Oct - Dic'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}
