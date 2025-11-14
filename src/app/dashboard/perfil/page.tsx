// src/app/dashboard/perfil/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Save, Building2 } from 'lucide-react';

export default function PerfilUserPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setEmail(user.email || '');
      fetchAreaName();
    }
  }, [user]);

  const fetchAreaName = async () => {
    if (!user?.area_id) return;
    
    try {
      const response = await fetch(`/api/areas/${user.area_id}`);
      if (response.ok) {
        const data = await response.json();
        setArea(data.nombre_area || '');
      }
    } catch (error) {
      console.error('Error al obtener área:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    console.log('Guardando perfil...');
    console.log('Nombre:', nombre);

    setSaving(true);

    try {
      const response = await fetch('/api/usuario/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
        }),
      });

      console.log('Save response status:', response.status);
      const responseData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      console.log('Save response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al actualizar perfil');
      }

      toast.success('Perfil actualizado correctamente');
      
      // Recargar la página para actualizar la sesión
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        backgroundColor: '#f9fafb'
      }}>
        <div>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e5e7eb',
            borderTopColor: '#111827',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280', margin: 0 }}>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '32px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#111827';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          <ArrowLeft size={16} />
          Volver al Dashboard
        </button>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <User size={32} />
          Mi Perfil
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          margin: 0
        }}>
          Gestiona tu información personal
        </p>
      </div>

      {/* Tarjeta de perfil */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '32px'
      }}>
        {/* Información del perfil */}
        <div style={{
          display: 'grid',
          gap: '24px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#111827';
                e.target.style.boxShadow = '0 0 0 3px rgba(17, 24, 39, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              disabled
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor: '#f9fafb',
                color: '#6b7280',
                cursor: 'not-allowed',
                boxSizing: 'border-box'
              }}
            />
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginTop: '4px',
              marginBottom: 0
            }}>
              El correo no se puede modificar
            </p>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Área asignada
            </label>
            <div style={{
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: '#f9fafb',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Building2 size={16} />
              {area || 'Sin área asignada'}
            </div>
          </div>
        </div>

        {/* Botón guardar */}
        <div style={{
          marginTop: '32px',
          paddingTop: '32px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            style={{
              padding: '12px 32px',
              backgroundColor: saving ? '#9ca3af' : '#111827',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              minWidth: '200px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = '#000000';
            }}
            onMouseLeave={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = '#111827';
            }}
          >
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
