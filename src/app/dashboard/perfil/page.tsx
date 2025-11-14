// src/app/dashboard/perfil/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PerfilUserPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setEmail(user.email || '');
      setFotoUrl((user as any).foto_url || '');
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe pesar menos de 5MB');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      setFotoUrl(data.url);
      toast.success('Foto actualizada correctamente');
    } catch (error) {
      console.error('Error al subir foto:', error);
      toast.error('Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setFotoUrl('');
    toast.success('Foto de perfil eliminada');
  };

  const handleSaveProfile = async () => {
    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/usuario/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          foto_url: fotoUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar perfil');
      }

      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      toast.error('Error al actualizar el perfil');
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
          ← Volver al Dashboard
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
          👤 Mi Perfil
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
        {/* Foto de perfil */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '32px',
          paddingBottom: '32px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            position: 'relative',
            marginBottom: '16px'
          }}>
            {fotoUrl ? (
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6'
              }}>
                <Image
                  src={fotoUrl}
                  alt="Foto de perfil"
                  width={120}
                  height={120}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ) : (
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: '#f3f4f6',
                border: '4px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: '#111827',
                fontWeight: '700'
              }}>
                {nombre ? nombre[0].toUpperCase() : 'U'}
              </div>
            )}
          </div>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <label style={{
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1,
              transition: 'all 0.2s'
            }}>
              {uploading ? 'Subiendo...' : (fotoUrl ? '📷 Cambiar foto' : '📷 Subir foto')}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            
            {fotoUrl && (
              <button
                onClick={handleRemovePhoto}
                disabled={uploading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!uploading) {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                    e.currentTarget.style.borderColor = '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#fecaca';
                }}
              >
                🗑️ Quitar foto
              </button>
            )}
          </div>
        </div>

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
              color: '#6b7280'
            }}>
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
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = '#000000';
            }}
            onMouseLeave={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = '#111827';
            }}
          >
            {saving ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
