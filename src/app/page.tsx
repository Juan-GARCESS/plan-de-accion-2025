'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const searchParams = useSearchParams()

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

  // Establecer título de la página de login
  useEffect(() => {
    document.title = 'Plan de Acción';
  }, [])

  // Nota: NO prevenir navegación hacia atrás en login - solo después del login exitoso

  // Manejar errores de parámetros URL
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const timeoutParam = searchParams.get('timeout')
    
    if (timeoutParam === 'true') {
      setErrors({ general: 'Tu sesión ha expirado por inactividad (5 minutos). Por favor, inicia sesión nuevamente.' })
    } else if (errorParam === 'pending') {
      setErrors({ general: 'Tu cuenta está pendiente de aprobación por parte del administrador.' })
    } else if (errorParam === 'no-area') {
      setErrors({ general: 'Tu cuenta aún no tiene un área asignada. Contacta al administrador.' })
    }
  }, [searchParams])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Por favor ingresa un email válido'
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
          credentials: 'include',
        })

        const data = await res.json()

        if (!res.ok) {
          setErrors({ general: data.message || 'Error en el login' })
          setLoading(false)
          return
        }

        // Limpiar historial completamente y redirigir
        const rol = data.user.rol
        
        // Limpiar todo el historial anterior
        window.history.replaceState(null, '', '/')
        
        if (rol === 'admin') {
          // Ir al dashboard del admin reemplazando completamente el historial
          window.location.replace('/admin/dashboard')
        } else {
          // Ir a dashboard de usuario reemplazando completamente el historial
          window.location.replace('/dashboard')
        }
      } catch (err) {
        setErrors({ general: 'Error en la conexión al servidor' })
        console.error(err)
        setLoading(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
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
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '24px',
        padding: window.innerWidth < 768 ? '24px 20px' : '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        transform: 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: window.innerWidth < 768 ? '20px' : '28px'
        }}>
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
            Bienvenido
          </h2>
          <p style={{
            color: '#666666',
            fontSize: window.innerWidth < 768 ? '0.875rem' : '0.95rem',
            fontWeight: '400',
            margin: 0
          }}>
            Inicio de sesión 
          </p>
        </div>

        {/* Alerta de error */}
        {errors.general && (
          <div style={{
            backgroundColor: '#fef1f1', 
            border: '1px solid #f87171', 
            color: '#dc2626', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div style={{
            marginBottom: '20px'
          }}>
            <input
              type="email"
              name="email"
              placeholder="Correo Electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.02)',
                border: `1px solid ${errors.email ? '#ef4444' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '12px',
                color: '#000000',
                fontSize: '16px',
                fontWeight: '400',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
            {errors.email && (
              <span style={{
                display: 'block',
                color: '#ef4444',
                fontSize: '12px',
                fontWeight: '500',
                marginTop: '4px',
                marginLeft: '4px'
              }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div style={{
            marginBottom: '20px',
            position: 'relative'
          }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '16px 48px 16px 16px',
                background: 'rgba(0, 0, 0, 0.02)',
                border: `1px solid ${errors.password ? '#ef4444' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '12px',
                color: '#000000',
                fontSize: '16px',
                fontWeight: '400',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              aria-label="Toggle password visibility"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: 'rgba(0, 0, 0, 0.5)',
                fontSize: '16px'
              }}
            >
              {showPassword ? '👁️‍🗨️' : '👁️'}
            </button>
            {errors.password && (
              <span style={{
                display: 'block',
                color: '#ef4444',
                fontSize: '12px',
                fontWeight: '500',
                marginTop: '4px',
                marginLeft: '4px'
              }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Form Options */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                style={{ display: 'none' }} 
              />
              <span style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                flexShrink: 0,
                background: formData.remember ? '#000000' : 'rgba(0, 0, 0, 0.02)',
                borderColor: formData.remember ? '#000000' : 'rgba(0, 0, 0, 0.2)',
                transform: formData.remember ? 'scale(1.1)' : 'scale(1)',
                backdropFilter: 'blur(10px)'
              }}>
                {formData.remember && (
                  <span style={{
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </span>
                )}
              </span>
              <span style={{
                color: 'rgba(0, 0, 0, 0.8)',
                fontSize: '14px',
                cursor: 'pointer',
                userSelect: 'none'
              }}>
                Recordarme
              </span>
            </label>
            <a href="#" style={{
              color: '#666666',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#000000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#666666'
            }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'rgba(0, 0, 0, 0.7)' : 'linear-gradient(135deg, #000000 0%, #333333 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 24px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              marginBottom: '20px',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#1e293b'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#334155'
              }
            }}
          >
            {loading ? (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block'
                }}></span>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Social Login - Solo Google */}
        <div style={{
          marginBottom: '20px'
        }}>
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
          
          <button style={{
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
          }}>
            <span style={{
              width: '20px',
              height: '20px',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3e%3cpath fill='%23ea4335' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3e%3cpath fill='%2334a853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3e%3cpath fill='%23fbbc05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3e%3cpath fill='%23ea4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3e%3c/svg%3e")`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}></span>
            Continuar con Google (Próximamente)
          </button>
        </div>

        {/* Signup Link */}
        <div style={{
          textAlign: 'center'
        }}>
          <p style={{
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: '14px',
            margin: 0
          }}>
            ¿No tienes una cuenta?{' '}
            <Link href="/register" style={{
              color: '#000000',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}