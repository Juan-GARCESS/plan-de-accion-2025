// src/app/dashboard/plan-accion/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PlanAccionUserTable } from '@/components/user/PlanAccionUserTable';
import { createCardStyle, colors, spacing } from '@/lib/styleUtils';
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout';

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

  // Cargar datos del área
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const me = await res.json();
          const id = me?.usuario?.area_id ?? null;
          setAreaId(id);
          setAreaName(me?.area || 'Mi área');
          document.title = `Plan de Acción - ${me?.area || ''}`;
        }
      } catch (e) {
        console.error('Error cargando /api/me:', e);
      }
    };
    if (user && user.rol !== 'admin') {
      fetchMe();
    }
  }, [user]);

  if (authLoading || areaId === null) {
    return (
      <UserDashboardLayout userName={user?.nombre} areaName={areaName} onBackHome={() => router.push('/dashboard')}>
        <div style={createCardStyle('padded')}>
          <p style={{ textAlign: 'center', color: colors.gray[500] }}>
            Cargando plan de acción...
          </p>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout userName={user?.nombre} areaName={areaName} onBackHome={() => router.push('/dashboard')}>
      <div style={{ padding: spacing.lg, borderBottom: `1px solid ${colors.gray[300]}` }}>
        <h2 style={{ margin: 0, color: colors.gray[800], fontSize: '24px', fontWeight: 'bold' }}>
          Plan de Acción - {areaName}
        </h2>
        <p style={{ margin: '0.5rem 0 0 0', color: colors.gray[600] }}>
          Aquí puedes ver lo que el administrador definió y editar solo tus columnas de Acción y Presupuesto.
        </p>
      </div>
      <div style={{ padding: spacing.lg }}>
        <PlanAccionUserTable areaId={areaId} areaName={areaName} />
      </div>
    </UserDashboardLayout>
  );
}
