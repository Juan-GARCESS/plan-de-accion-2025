'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/app/components/navbar';

interface Area {
  id: number;
  nombre_area: string;
  descripcion: string;
}



interface Informe {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  usuario_email: string;
  meta_trimestral: string | null;
  archivo: string | null;
  estado: 'planificando' | 'pendiente' | 'aceptado' | 'rechazado';
  calificacion: number | null;
  comentario_admin: string | null;
  fecha_meta_creada: string | null;
  fecha_archivo_subido: string | null;
}

interface Trimestre {
  id: number;
  trimestre: number;
  año: number;
  fecha_inicio: string;
  fecha_fin: string;
  disponible: boolean;
  razon: string;
  informes: Informe[];
}

export default function AreaTrimestres() {
  const [area, setArea] = useState<Area | null>(null);
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const params = useParams();
  const areaId = params.id as string;
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

  const fetchAreaData = useCallback(async () => {
    try {
      // Cargar información del área
      const areaRes = await fetch(`/api/admin/areas/${areaId}`);
      if (areaRes.ok) {
        const areaData = await areaRes.json();
        setArea(areaData.area);
      }

      // Cargar trimestres con informes del área
      const trimestresRes = await fetch(`/api/admin/areas/${areaId}/trimestres`);
      if (trimestresRes.ok) {
        const trimestresData = await trimestresRes.json();
        setTrimestres(trimestresData.trimestres);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  }, [areaId]);

  // Cargar datos
  useEffect(() => {
    if (user && user.rol === 'admin' && areaId) {
      fetchAreaData();
    }
  }, [user, areaId, fetchAreaData]);

  const handleBackClick = () => {
    router.push('/admin/dashboard');
  };



  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aceptado':
        return { bg: '#dcfce7', color: '#166534' };
      case 'rechazado':
        return { bg: '#fef2f2', color: '#dc2626' };
      case 'pendiente':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'planificando':
        return { bg: '#eff6ff', color: '#2563eb' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'aceptado':
        return '✅ Aceptado';
      case 'rechazado':
        return '❌ Rechazado';
      case 'pendiente':
        return '⏳ Pendiente';
      case 'planificando':
        return '📝 Planificando';
      default:
        return '⚪ Sin estado';
    }
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

  if (!user || !area) return null;

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
      {/* Header simplificado */}
      <div 
        style={{
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          padding: getPadding('1rem', '1.5rem', '2rem'),
          marginBottom: '2rem',
          borderRadius: '8px'
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button
            onClick={handleBackClick}
            style={{
              padding: '0.5rem',
              fontSize: '1.25rem',
              color: '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', margin: 0}}>
              {area.nombre_area}
            </h1>
            <p style={{color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0'}}>
              Trimestres e informes del área
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {/* Grid de trimestres */}
        <div style={{display: 'grid', gridTemplateColumns: getGridCols(1, 1, 2), gap: '2rem'}}>
          {trimestres.map((trimestre) => (
            <div 
              key={trimestre.id} 
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {/* Header del trimestre */}
              <div style={{borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem'}}>
                <h3 style={{fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: 0}}>
                  Q{trimestre.trimestre} {trimestre.año}
                </h3>
                <p style={{color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0'}}>
                  {new Date(trimestre.fecha_inicio).toLocaleDateString()} - {new Date(trimestre.fecha_fin).toLocaleDateString()}
                </p>
                <div 
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: trimestre.disponible ? '#dcfce7' : '#fef3c7',
                    color: trimestre.disponible ? '#166534' : '#92400e',
                    display: 'inline-block'
                  }}
                >
                  {trimestre.disponible ? 'Disponible' : 'No disponible'}
                </div>
                <p style={{color: '#6b7280', fontSize: '0.75rem', margin: '0.25rem 0 0 0'}}>
                  {trimestre.razon}
                </p>
              </div>

              {/* Informes de usuarios */}
              <div>
                <h4 style={{fontSize: '1rem', fontWeight: '500', color: '#374151', margin: '0 0 1rem 0'}}>
                  📊 Informes de Usuarios ({trimestre.informes.length})
                </h4>
                
                {trimestre.informes.length > 0 ? (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                    {trimestre.informes.map((informe) => {
                      const estadoStyle = getEstadoColor(informe.estado);
                      return (
                        <div 
                          key={informe.id}
                          style={{
                            backgroundColor: '#f9fafb',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb'
                          }}
                        >
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                            <div>
                              <h5 style={{fontSize: '0.875rem', fontWeight: '500', color: '#374151', margin: 0}}>
                                {informe.usuario_nombre}
                              </h5>
                              <p style={{fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0'}}>
                                {informe.usuario_email}
                              </p>
                            </div>
                            <div 
                              style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                backgroundColor: estadoStyle.bg,
                                color: estadoStyle.color
                              }}
                            >
                              {getEstadoTexto(informe.estado)}
                            </div>
                          </div>
                          
                          {informe.meta_trimestral && (
                            <div style={{marginBottom: '0.5rem'}}>
                              <p style={{fontSize: '0.75rem', fontWeight: '500', color: '#374151', margin: '0 0 0.25rem 0'}}>
                                📋 Meta:
                              </p>
                              <p style={{fontSize: '0.75rem', color: '#6b7280', margin: 0, lineHeight: '1.4'}}>
                                {informe.meta_trimestral}
                              </p>
                            </div>
                          )}
                          
                          {informe.archivo && (
                            <div style={{marginBottom: '0.5rem'}}>
                              <p style={{fontSize: '0.75rem', color: '#059669', margin: 0}}>
                                📁 Archivo subido: {informe.archivo}
                              </p>
                              {informe.fecha_archivo_subido && (
                                <p style={{fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0'}}>
                                  Fecha: {new Date(informe.fecha_archivo_subido).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {informe.estado === 'aceptado' && informe.calificacion && (
                            <div style={{
                              backgroundColor: '#dcfce7',
                              padding: '0.5rem',
                              borderRadius: '0.25rem',
                              marginTop: '0.5rem'
                            }}>
                              <p style={{fontSize: '0.75rem', color: '#166534', margin: 0, fontWeight: '500'}}>
                                ⭐ Calificación: {informe.calificacion}%
                              </p>
                            </div>
                          )}
                          
                          {informe.estado === 'rechazado' && informe.comentario_admin && (
                            <div style={{
                              backgroundColor: '#fef2f2',
                              padding: '0.5rem',
                              borderRadius: '0.25rem',
                              marginTop: '0.5rem'
                            }}>
                              <p style={{fontSize: '0.75rem', color: '#dc2626', margin: 0}}>
                                💬 {informe.comentario_admin}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '2rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <p style={{color: '#6b7280', fontSize: '0.875rem', margin: 0}}>
                      No hay informes para este trimestre
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}