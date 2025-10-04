// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SessionTimer } from '@/components/SessionTimer';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, preventBackNavigation, logout } = useAuth();
  const [areaNombre, setAreaNombre] = useState('Sin área asignada');

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

  // Cargar información del área del usuario
  useEffect(() => {
    const cargarInfoUsuario = async () => {
      if (user) {
        try {
          const meResponse = await fetch('/api/me');
          if (meResponse.ok) {
            const meData = await meResponse.json();
            const areaNombre = meData.area || 'Sin área asignada';
            setAreaNombre(areaNombre);
            document.title = `Plan de Acción - ${areaNombre}`;
          }
        } catch (error) {
          console.error('Error cargando información del usuario:', error);
        }
      }
    };

    if (user && user.rol !== 'admin') {
      cargarInfoUsuario();
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '0'
    }}>
      {/* Timer de sesión */}
      <SessionTimer 
        isAuthenticated={!!user} 
        onTimeout={logout}
        timeoutMinutes={5}
      />
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#000000',
            margin: '0 0 4px 0'
          }}>
            Bienvenido al Plan de acción de {areaNombre}
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#666666',
            margin: 0,
            fontWeight: '400'
          }}>
            ({user.nombre})
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#000000',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            
          </div>
          
          <button
            onClick={logout}
            style={{
              background: 'rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#000000',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div style={{
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          marginBottom: '60px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '2px solid #000000',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#000000',
              textAlign: 'center',
              marginBottom: '24px',
              borderBottom: '2px solid #000000',
              paddingBottom: '12px'
            }}>
              Misión
            </h2>
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#333333',
              textAlign: 'justify',
              margin: 0
            }}>
              Somos una Institución multi-campus de propiedad social, educamos personas con las competencias para responder a las dinámicas del mundo, contribuimos a la construcción y difusión del conocimiento, apoyamos el desarrollo competitivo del país a través de sus organizaciones y buscamos el mejoramiento de la calidad de vida de las comunidades, influidos por la economía solidaria que nos dio origen.
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '2px solid #000000',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#000000',
              textAlign: 'center',
              marginBottom: '24px',
              borderBottom: '2px solid #000000',
              paddingBottom: '12px'
            }}>
              Visión
            </h2>
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#333333',
              textAlign: 'justify',
              margin: 0
            }}>
              Para 2025, la Universidad Cooperativa de Colombia será una institución sostenible que aprende continuamente para transformarse de acuerdo con las exigencias del contexto, reflejándose en: Una educación y un aprendizaje a lo largo de la vida soportado en nuestro modelo educativo con una oferta educativa pertinente, en diferentes modalidades. Una gestión inclusiva que integre entornos individuales, físicos y digitales con nuevos desarrollos tecnológicos. Una cultura innovadora que responda a las demandas del contexto, a la generación de conocimiento colectivo y experiencias compartidas.
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => {
              console.log('Navegar a Plan de Acción');
            }}
            style={{
              background: '#000000',
              color: 'white',
              border: '2px solid #000000',
              borderRadius: '16px',
              padding: '20px 60px',
              fontSize: '1.25rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Plan de Acción
          </button>
        </div>
      </div>
    </div>
  );
}
