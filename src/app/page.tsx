// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks/useResponsive";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, redirectBasedOnRole } = useAuth();
  const { isMobile, getPadding, getFontSize } = useResponsive();

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (!authLoading && user) {
      redirectBasedOnRole(user);
    }
  }, [user, authLoading, redirectBasedOnRole]);

  // Si está verificando y ya hay usuario, no mostrar nada para evitar parpadeo
  if (authLoading) {
    return null; // No mostrar nada mientras verifica
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error en el login");
        setLoading(false);
        return;
      }

      // Limpiar historial completamente y redirigir
      const rol = data.user.rol;
      
      // Limpiar todo el historial anterior
      window.history.replaceState(null, '', '/');
      
      if (rol === "admin") {
        // Ir al dashboard del admin reemplazando completamente el historial
        window.location.replace('/admin/dashboard');
      } else {
        // Ir a dashboard de usuario reemplazando completamente el historial
        window.location.replace('/dashboard');
      }
    } catch (err) {
      setError("Error en la conexión al servidor");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: getPadding('1rem', '1.5rem', '2rem')
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          padding: getPadding('1.5rem', '2rem', '2.5rem'),
          width: '100%',
          maxWidth: isMobile ? '100%' : '400px',
          border: '1px solid #e5e7eb'
        }}
      >
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
          <h1 style={{fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem'}}>
            Bienvenido de vuelta
          </h1>
          <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
            Ingresa tus credenciales para acceder
          </p>
        </div>

        {/* Alerta de error */}
          {error && (
            <div style={{backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            {/* Campo Email */}
            <div>
              <label htmlFor="email" style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '1rem', outline: 'none'}}
                placeholder="tu@email.com"
              />
            </div>
            
            {/* Campo Contraseña */}
            <div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                <label htmlFor="password" style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151'}}>
                  Contraseña
                </label>
                <a href="#" style={{fontSize: '0.875rem', fontWeight: '500', color: '#2563eb', textDecoration: 'none', transition: 'color 0.2s'}}
                   onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#1d4ed8'}
                   onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#2563eb'}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '1rem', outline: 'none'}}
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                color: 'white',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? (
                <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <svg style={{animation: 'spin 1s linear infinite', height: '1rem', width: '1rem', color: 'white'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{opacity: 0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{opacity: 0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {/* Separador */}
          <div style={{position: 'relative', margin: '2rem 0'}}>
            <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#d1d5db'}} />
            <div style={{position: 'relative', textAlign: 'center', fontSize: '0.875rem'}}>
              <span style={{padding: '0 0.5rem', backgroundColor: 'white', color: '#6b7280'}}>¿No tienes cuenta?</span>
            </div>
          </div>

          {/* Botón de registro */}
          <Link href="/register" style={{display: 'block'}}>
            <button
              type="button"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Crear cuenta nueva
            </button>
          </Link>

        {/* Footer */}
        <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
          <p style={{fontSize: '0.75rem', color: '#9ca3af'}}>
            Al iniciar sesión, aceptas nuestros{" "}
            <a href="#" style={{color: '#2563eb', textDecoration: 'none'}}>
              Términos de Servicio
            </a>{" "}
            y{" "}
            <a href="#" style={{color: '#2563eb', textDecoration: 'none'}}>
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}