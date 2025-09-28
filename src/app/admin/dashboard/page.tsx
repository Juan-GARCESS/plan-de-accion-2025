'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/navbar';

interface Area {
  id: number;
  nombre_area: string;
  descripcion: string;
  activa: boolean;
  usuarios_count: number;
}

interface TrimestreEstadistica {
  trimestre: number;
  año: number;
  fecha_inicio: string;
  fecha_fin: string;
  total_usuarios: number;
  metas_creadas: number;
  informes_subidos: number;
  informes_pendientes: number;
  informes_aceptados: number;
  informes_rechazados: number;
}

export default function AdminDashboard() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [estadisticas, setEstadisticas] = useState<TrimestreEstadistica[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { getPadding, getGridCols } = useResponsive();

  // Proteger la ruta - solo admins
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/');
        return;
      }
      if (user.rol !== 'admin') {
        router.replace('/dashboard');
        return;
      }
    }
  }, [user, authLoading, router]);

  // Cargar datos
  useEffect(() => {
    if (user && user.rol === 'admin') {
      fetchAreas();
      fetchEstadisticas();
    }
  }, [user]);

  const fetchAreas = async () => {
    try {
      const res = await fetch('/api/admin/areas');
      if (res.ok) {
        const data = await res.json();
        setAreas(data.areas || []);
      }
    } catch (error) {
      console.error('Error al cargar áreas:', error);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      // Este endpoint lo crearemos después
      const res = await fetch('/api/admin/estadisticas-trimestres');
      if (res.ok) {
        const data = await res.json();
        setEstadisticas(data.estadisticas || []);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaClick = (areaId: number) => {
    router.push(`/admin/areas/${areaId}/trimestres`);
  };



  if (authLoading || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{color: '#6b7280', fontSize: '1.125rem'}}>Cargando...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <div 
        style={{
          minHeight: 'calc(100vh - 80px)',
          backgroundColor: '#f3f4f6',
          padding: getPadding('1rem', '1.5rem', '2rem')
        }}
      >

      {/* Contenido principal */}
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {/* Estadísticas generales */}
        <div style={{marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: '0 0 1rem 0'}}>
            📊 Resumen General
          </h2>
          <div style={{display: 'grid', gridTemplateColumns: getGridCols(1, 2, 4), gap: '1rem'}}>
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{fontSize: '1rem', fontWeight: '500', color: '#6b7280', margin: '0 0 0.5rem 0'}}>
                Áreas Activas
              </h3>
              <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#059669', margin: 0}}>
                {areas.filter(a => a.activa).length}
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{fontSize: '1rem', fontWeight: '500', color: '#6b7280', margin: '0 0 0.5rem 0'}}>
                Total Usuarios
              </h3>
              <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', margin: 0}}>
                {areas.reduce((sum, area) => sum + area.usuarios_count, 0)}
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{fontSize: '1rem', fontWeight: '500', color: '#6b7280', margin: '0 0 0.5rem 0'}}>
                Informes Pendientes
              </h3>
              <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', margin: 0}}>
                {estadisticas.reduce((sum, est) => sum + est.informes_pendientes, 0)}
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{fontSize: '1rem', fontWeight: '500', color: '#6b7280', margin: '0 0 0.5rem 0'}}>
                Informes Aceptados
              </h3>
              <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#059669', margin: 0}}>
                {estadisticas.reduce((sum, est) => sum + est.informes_aceptados, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Áreas */}
        <div>
          <h2 style={{fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: '0 0 1rem 0'}}>
            🏢 Áreas de Trabajo
          </h2>
          <div style={{display: 'grid', gridTemplateColumns: getGridCols(1, 2, 3), gap: '1.5rem'}}>
            {areas.map((area) => (
              <div 
                key={area.id}
                onClick={() => handleAreaClick(area.id)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  border: '1px solid #e5e7eb',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px -3px rgb(0 0 0 / 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0}}>
                    {area.nombre_area}
                  </h3>
                  <div 
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: area.activa ? '#dcfce7' : '#fef3c7',
                      color: area.activa ? '#166534' : '#92400e'
                    }}
                  >
                    {area.activa ? 'Activa' : 'Inactiva'}
                  </div>
                </div>
                
                <p style={{color: '#6b7280', fontSize: '0.875rem', margin: 0, lineHeight: '1.4'}}>
                  {area.descripcion}
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <span style={{color: '#6b7280', fontSize: '0.875rem'}}>
                    👥 {area.usuarios_count} usuarios
                  </span>
                  <span style={{color: '#2563eb', fontSize: '0.875rem', fontWeight: '500'}}>
                    Ver trimestres →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}