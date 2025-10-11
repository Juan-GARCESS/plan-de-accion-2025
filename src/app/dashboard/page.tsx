// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SessionTimer } from '@/components/SessionTimer';
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, preventBackNavigation, logout } = useAuth();
  // area display is now in content cards; no separate header

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

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h2 style={{ marginTop: 0, borderBottom: '1px solid #e5e7eb', paddingBottom: 12 }}>Misión</h2>
            <p style={{ margin: 0, color: '#374151', lineHeight: 1.6 }}>
              Somos una Institución multi-campus de propiedad social, educamos personas con las competencias para responder a las dinámicas del mundo, contribuimos a la construcción y difusión del conocimiento, apoyamos el desarrollo competitivo del país a través de sus organizaciones y buscamos el mejoramiento de la calidad de vida de las comunidades, influidos por la economía solidaria que nos dio origen.
            </p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h2 style={{ marginTop: 0, borderBottom: '1px solid #e5e7eb', paddingBottom: 12 }}>Visión</h2>
            <p style={{ margin: 0, color: '#374151', lineHeight: 1.6 }}>
              Para 2025, la Universidad Cooperativa de Colombia será una institución sostenible que aprende continuamente para transformarse de acuerdo con las exigencias del contexto, reflejándose en: Una educación y un aprendizaje a lo largo de la vida soportado en nuestro modelo educativo con una oferta educativa pertinente, en diferentes modalidades. Una gestión inclusiva que integre entornos individuales, físicos y digitales con nuevos desarrollos tecnológicos. Una cultura innovadora que responda a las demandas del contexto, a la generación de conocimiento colectivo y experiencias compartidas.
            </p>
          </div>
        </div>

        {/* Sección de Trimestres */}
        <div style={{ 
          background: '#fff', 
          border: '1px solid #e5e7eb', 
          borderRadius: 12, 
          padding: 24,
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            marginTop: 0, 
            marginBottom: 16,
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#111827'
          }}>
            📊 Plan de Acción por Trimestre
          </h2>
          <p style={{ 
            margin: 0, 
            marginBottom: 20,
            color: '#6b7280', 
            fontSize: '0.875rem' 
          }}>
            Selecciona un trimestre para gestionar tus metas, evidencias y seguimiento:
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            {[1, 2, 3, 4].map(trimestre => (
              <button
                key={trimestre}
                onClick={() => router.push(`/dashboard/trimestre/${trimestre}`)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 12px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.2)';
                }}
              >
                <span style={{ fontSize: '2rem', marginBottom: '4px' }}>📈</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                  Trimestre {trimestre}
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  {trimestre === 1 ? 'Ene - Mar' : 
                   trimestre === 2 ? 'Abr - Jun' :
                   trimestre === 3 ? 'Jul - Sep' : 
                   'Oct - Dic'}
                </span>
              </button>
            ))}
          </div>

          <div style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: '#f3f4f6',
            borderRadius: 8,
            fontSize: '0.75rem',
            color: '#4b5563'
          }}>
            💡 <strong>Tip:</strong> En cada trimestre podrás definir tus acciones, presupuesto y subir evidencias de cumplimiento.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => router.push('/dashboard/plan-accion')} style={{ background: '#111827', color: '#fff', border: '1px solid #111827', borderRadius: 12, padding: '14px 28px', fontWeight: 700, cursor: 'pointer' }}>
            Plan de Acción
          </button>
        </div>
      </div>
    </UserDashboardLayout>
  );
}
