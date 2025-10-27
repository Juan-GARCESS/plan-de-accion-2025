'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    areaSolicitada: '',
    terms: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  // Función para iniciar sesión con Office 365
  const handleOffice365Login = () => {
    const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || 'YOUR_CLIENT_ID'
    const redirectUri = encodeURIComponent(window.location.origin + '/api/auth/microsoft/callback')
    const tenantId = 'common'
    
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
      `client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${redirectUri}` +
      `&response_mode=query` +
      `&scope=openid%20profile%20email%20User.Read` +
      `&state=${Math.random().toString(36).substring(7)}`
    
    window.location.href = authUrl
  }

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (res.ok) {
          const userData = await res.json()
          if (userData.user) {
            // Usuario ya autenticado, redirigir según su rol
            if (userData.user.rol === 'admin') {
              window.location.replace('/admin/dashboard')
            } else {
              window.location.replace('/dashboard')
            }
            return
          }
        }
      } catch {
        console.log('Usuario no autenticado')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuthStatus()
  }, [])

  // Establecer título de la página de registro
  useEffect(() => {
    document.title = 'Plan de Acción - Registro';
  }, [])

  // Solo prevenir navegación hacia atrás durante el proceso de notificación de éxito
  useEffect(() => {
    if (notification.show && notification.type === 'success') {
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
      };
      
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [notification.show, notification.type]);

  // Mostrar loading mientras se verifica la autenticación
  if (isCheckingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '20vh'
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
      </div>
    )
  }

  const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setNotification({
      show: true,
      type,
      title,
      message
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.email.trim()) newErrors.email = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Por favor ingresa un email válido'
    if (!formData.password) newErrors.password = 'La contraseña es requerida'
    else if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    if (!formData.areaSolicitada.trim()) newErrors.areaSolicitada = 'El área es requerida'
    if (!formData.terms) newErrors.terms = 'Debes aceptar los términos y condiciones'
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            nombre: formData.nombre,
            area_solicitada: formData.areaSolicitada,
            rol: 'usuario'
          }),
        })

        const data = await res.json()
        setLoading(false)

        if (!res.ok) {
          showNotification('error', 'Error de Registro', data.message || 'Error al crear la cuenta')
          return
        }

        showNotification('success', '¡Cuenta Creada!', 'Tu cuenta ha sido creada exitosamente y está pendiente de aprobación. Te notificaremos cuando sea aprobada.')
        setFormData({ nombre: '', email: '', password: '', areaSolicitada: '', terms: false })
        
        // Prevenir navegación hacia atrás durante el proceso de redireccionamiento
        window.history.replaceState(null, '', '/register')
        
        setTimeout(() => {
          hideNotification()
          window.location.replace('/')
        }, 4000)
      } catch (err) {
        setLoading(false)
        showNotification('error', 'Error de Conexión', 'No se pudo conectar con el servidor. Intenta nuevamente.')
        console.error(err)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '20px 10px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'auto'
    }}>
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            border: `2px solid ${notification.type === 'success' ? '#22c55e' : notification.type === 'error' ? '#ef4444' : '#111827'}`,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: notification.type === 'success' ? '#22c55e' : notification.type === 'error' ? '#ef4444' : '#111827',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white'
            }}>
              {notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : 'ℹ'}
            </div>
            <h3 style={{
              color: '#000000',
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: '0 0 10px 0'
            }}>
              {notification.title}
            </h3>
            <p style={{
              color: '#666666',
              fontSize: '1rem',
              lineHeight: '1.5',
              margin: '0 0 20px 0'
            }}>
              {notification.message}
            </p>
            <button
              onClick={hideNotification}
              style={{
                background: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '24px',
        padding: window.innerWidth < 768 ? '24px 20px' : '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: window.innerWidth < 768 ? '20px' : '28px' }}>
          <h2 style={{
            color: '#000000',
            fontSize: window.innerWidth < 768 ? '1.5rem' : '1.75rem',
            fontWeight: '700',
            margin: '0 0 6px 0',
            background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Crear Cuenta
          </h2>
          <p style={{
            color: '#666666',
            fontSize: window.innerWidth < 768 ? '0.875rem' : '0.95rem',
            fontWeight: '400',
            margin: 0
          }}>
            Únete y comienza tu aventura
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre y apellido"
              style={{
                width: '100%',
                padding: '16px',
                border: `1px solid ${errors.nombre ? '#ef4444' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'inherit',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
            />
            {errors.nombre && (
              <p style={{
                color: '#ef4444',
                fontSize: '12px',
                margin: '5px 0 0 0'
              }}>
                {errors.nombre}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo Electrónico"
              style={{
                width: '100%',
                padding: '16px',
                border: `1px solid ${errors.email ? '#ef4444' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'inherit',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
            />
            {errors.email && (
              <p style={{
                color: '#ef4444',
                fontSize: '12px',
                margin: '5px 0 0 0'
              }}>
                {errors.email}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              style={{
                width: '100%',
                padding: '16px 50px 16px 16px',
                border: `1px solid ${errors.password ? '#ef4444' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'inherit',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666666'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p style={{
                color: '#ef4444',
                fontSize: '12px',
                margin: '5px 0 0 0'
              }}>
                {errors.password}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              name="areaSolicitada"
              value={formData.areaSolicitada}
              onChange={handleChange}
              placeholder="Area que solicita"
              style={{
                width: '100%',
                padding: '16px',
                border: `1px solid ${errors.areaSolicitada ? '#ef4444' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'inherit',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
            />
            {errors.areaSolicitada && (
              <p style={{
                color: '#ef4444',
                fontSize: '12px',
                margin: '5px 0 0 0'
              }}>
                {errors.areaSolicitada}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                style={{
                  width: '18px',
                  height: '18px',
                  marginTop: '2px',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                color: 'rgba(0, 0, 0, 0.8)',
                lineHeight: '1.4'
              }}>
                Acepto los{' '}
                <a href="#" style={{
                  color: '#000000',
                  textDecoration: 'none',
                  fontWeight: '500',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.2)'
                }}>
                  Términos de Servicio
                </a>{' '}
                y la{' '}
                <a href="#" style={{
                  color: '#000000',
                  textDecoration: 'none',
                  fontWeight: '500',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.2)'
                }}>
                  Política de Privacidad
                </a>
              </span>
            </label>
            {errors.terms && (
              <p style={{
                color: '#ef4444',
                fontSize: '12px',
                margin: '5px 0 0 0'
              }}>
                {errors.terms}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#666666' : '#000000',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              fontFamily: 'inherit',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Office 365 Login - Temporalmente deshabilitado hasta obtener credenciales de TI */}
        {process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID && process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID !== 'YOUR_CLIENT_ID' ? (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '20px 0',
              color: 'rgba(0, 0, 0, 0.4)',
              fontSize: '14px'
            }}>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'rgba(0, 0, 0, 0.1)'
              }}></div>
              <span style={{
                padding: '0 16px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}>
                O continúa con
              </span>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'rgba(0, 0, 0, 0.1)'
              }}></div>
            </div>
            
            <button 
              onClick={handleOffice365Login}
              type="button"
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.02)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#333333',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span style={{
                width: '20px',
                height: '20px',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 23 23'%3e%3cpath fill='%23f35325' d='M1 1h10v10H1z'/%3e%3cpath fill='%2381bc06' d='M12 1h10v10H12z'/%3e%3cpath fill='%2305a6f0' d='M1 12h10v10H1z'/%3e%3cpath fill='%23ffba08' d='M12 12h10v10H12z'/%3e%3c/svg%3e")`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}></span>
              Registrarse con Office 365
            </button>
          </div>
        ) : (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '12px', 
              color: '#1e40af',
              lineHeight: '1.5',
              fontWeight: '500'
            }}>
              <strong>Próximamente:</strong> Podrás registrarte con tu cuenta institucional de Office 365
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '14px', margin: 0 }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/" style={{
              color: '#000000',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Ingresa
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
