// src/app/dashboard/plan-accion/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout';
import { PlanAccionUserTable } from '@/components/user/PlanAccionUserTable';

export default function UserPlanAccionPage() {
  const router = useRouter();
  const { user, loading: authLoading, preventBackNavigation } = useAuth();
  const [areaId, setAreaId] = useState<number | null>(null);
  const [areaName, setAreaName] = useState<string>('');

  // Guardas y setup
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

  // Cargar datos del area
  useEffect(() => {
    if (user?.area_id) {
      setAreaId(user.area_id);
      // Obtener nombre del area
      fetch(`/api/admin/areas`)
        .then(res => res.json())
        .then(areas => {
          const area = areas.find((a: { id: number; nombre_area: string }) => a.id === user.area_id);
          if (area) setAreaName(area.nombre_area);
        })
        .catch(err => console.error('Error al cargar area:', err));
    }
  }, [user]);

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif'
      }}>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px', fontWeight: '400' }}>
          Cargando...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <UserDashboardLayout 
      userName={user.nombre} 
      areaName={undefined}
      onBackHome={() => router.push('/dashboard')}
    >
      <div style={{ padding: '24px' }}>
        {areaId && areaName ? (
          <PlanAccionUserTable areaId={areaId} areaName={areaName} />
        ) : (
          <div style={{ 
            padding: 60, 
            textAlign: 'center', 
            backgroundColor: '#f9fafb',
            borderRadius: 12,
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ color: '#6b7280', margin: 0 }}>
              No tienes un area asignada.
            </p>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}
