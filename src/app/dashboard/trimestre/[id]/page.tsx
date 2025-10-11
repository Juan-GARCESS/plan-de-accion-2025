// src/app/dashboard/trimestre/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout';
import TrimestreTable from '@/components/trimestre/TrimestreTableNew';
import { toast } from 'sonner';

export default function TrimstrePage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const trimestreId = params?.id ? parseInt(params.id as string) : 0;

  // Validar trimestre
  useEffect(() => {
    if (!authLoading && user) {
      if (trimestreId < 1 || trimestreId > 4) {
        toast.error('Trimestre inválido');
        router.replace('/dashboard');
        return;
      }
      setLoading(false);
    }
  }, [trimestreId, authLoading, user, router]);

  // Proteger la ruta
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
      if (user.estado !== 'activo' || !user.area_id) {
        router.replace('/dashboard');
        return;
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: '#9ca3af' }}>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const trimestreNombre = `Trimestre ${trimestreId}`;
  const trimestrePeriodo = 
    trimestreId === 1 ? 'Enero - Marzo' :
    trimestreId === 2 ? 'Abril - Junio' :
    trimestreId === 3 ? 'Julio - Septiembre' :
    'Octubre - Diciembre';

  return (
    <UserDashboardLayout 
      userName={user.nombre} 
      areaName={undefined}
      onBackHome={() => router.push('/dashboard')}
    >
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          color: '#fff'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📊 {trimestreNombre}
          </h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
            {trimestrePeriodo} • Gestiona tus metas, acciones y evidencias
          </p>
        </div>

        {/* Tabla de Metas */}
        <TrimestreTable 
          trimestreId={trimestreId}
          areaId={user.area_id || 0}
        />
      </div>
    </UserDashboardLayout>
  );
}
