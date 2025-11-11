'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboardLayout } from '@/components/admin';
import { EvidenciasReviewNew } from '@/components/admin/EvidenciasReviewNew';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Area } from '@/types';

export default function CalificarTrimestrePage({
  params
}: {
  params: Promise<{ id: string; trimestre: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaName, setAreaName] = useState<string>('');

  const areaId = parseInt(resolvedParams.id);
  const trimestre = parseInt(resolvedParams.trimestre);

  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) {
      router.push('/');
      return;
    }

    const fetchAreas = async () => {
      try {
        const res = await fetch('/api/admin/areas');
        if (!res.ok) throw new Error('Error al cargar áreas');
        const data = await res.json();
        setAreas(data.areas || []);
        const area = data.areas?.find((a: Area) => a.id === areaId);
        setAreaName(area?.nombre_area || '');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar las áreas');
      }
    };

    if (user?.rol === 'admin') {
      fetchAreas();
    }
  }, [user, loading, router, areaId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: '#9ca3af' }}>Cargando...</p>
      </div>
    );
  }

  if (!user || user.rol !== 'admin') {
    return null;
  }

  if (trimestre < 1 || trimestre > 4 || isNaN(trimestre)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#ef4444' }}>Trimestre inválido</p>
        <button
          onClick={() => router.back()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#1e293b',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <AdminDashboardLayout
      areas={areas}
      userName={user.nombre}
    >
      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            ← Volver
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
              Calificar Evidencias - Trimestre {trimestre}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Área: {areaName}
            </p>
          </div>
        </div>

        <EvidenciasReviewNew areaId={areaId} trimestre={trimestre} />
      </div>
    </AdminDashboardLayout>
  );
}
