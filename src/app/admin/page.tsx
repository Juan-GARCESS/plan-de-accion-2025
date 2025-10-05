// src/app/admin/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import { PageLayout } from '@/components/layout/PageLayout';
// Versión renovada con paleta blanco/negro/gris y UX mejorada
import { UsersSectionImproved } from '@/components/admin/UsersSectionImproved';
import { AreasManagementSectionImproved } from '@/components/admin/AreasManagementSectionImproved';
import { EjesManagementSectionImproved } from '@/components/admin/EjesManagementSectionImproved';
import { SessionTimer } from '@/components/SessionTimer';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, preventBackNavigation } = useAuth();
  const {
    usuarios,
    areas,
    loading,
    error,
    approveUser,
    rejectUser,
    editUser,
    deleteUser,
    generatePassword,
    createArea,
    editArea,
    deleteArea
  } = useAdminManagement();

  // Prevenir navegación hacia atrás
  useEffect(() => {
    if (user && user.rol === 'admin') {
      const cleanup = preventBackNavigation();
      return cleanup;
    }
  }, [user, preventBackNavigation]);

  // Cambiar título de la página para admin
  useEffect(() => {
    if (user && user.rol === 'admin') {
      document.title = 'Plan de Acción - Panel de Gestión';
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
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

  if (!user) return null;

  if (error) {
    return (
      <PageLayout>
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '0.5rem',
          textAlign: 'center'
        }}>
          Error: {error}
        </div>
      </PageLayout>
    );
  }

  return (
    <div>
      {/* Timer de sesión */}
      <SessionTimer 
        isAuthenticated={!!user} 
        onTimeout={logout}
        timeoutMinutes={5}
      />
      
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={() => router.push('/admin/dashboard')}
              style={{
                padding: '0.5rem',
                fontSize: '1.25rem',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              ← Volver
            </button>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>
                Panel de Gestión
              </h1>
              <p style={{ color: '#6b7280' }}>
                Gestiona usuarios y áreas del sistema
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              color: 'white',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <PageLayout showNavbar={false}>
        {/* Orden restaurado: Usuarios -> Áreas -> Ejes y Sub-ejes */}
        <UsersSectionImproved
          usuarios={usuarios}
          areas={areas}
          onApprove={approveUser}
          onReject={rejectUser}
          onEdit={editUser}
          onDelete={deleteUser}
          onGeneratePassword={generatePassword}
        />

        <hr style={{
          border: 'none',
          height: '1px',
          backgroundColor: '#e5e7eb',
          margin: '3rem 0'
        }} />

        <AreasManagementSectionImproved
          areas={areas}
          onCreate={createArea}
          onEdit={editArea}
          onDelete={deleteArea}
        />

        <hr style={{
          border: 'none',
          height: '1px',
          backgroundColor: '#e5e7eb',
          margin: '3rem 0'
        }} />

        <EjesManagementSectionImproved />
        {/* Sección TrimestreSelections removida según la versión renovada */}
      </PageLayout>
    </div>
  );
}
