"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [areaSolicitada, setAreaSolicitada] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { user, loading: authLoading, redirectBasedOnRole } = useAuth();

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (!authLoading && user) {
      redirectBasedOnRole(user);
    }
  }, [user, authLoading, redirectBasedOnRole]);

  // Si está verificando, no mostrar nada para evitar parpadeo
  if (authLoading) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validación frontend
    if (!email || !password || !nombre || !areaSolicitada) {
      setError("Todos los campos son requeridos");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          nombre,
          area_solicitada: areaSolicitada,
          rol: "usuario"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error en el registro");
        return;
      }

      setSuccess("Registro exitoso. Redirigiendo al login...");
      setTimeout(() => router.push("/"), 1000);

    } catch (err) {
      setError("Error en la conexión al servidor");
      console.error(err);
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
        padding: '16px'
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid #e5e7eb'
        }}
      >
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
          <h1 style={{fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem'}}>
            Crear cuenta nueva
          </h1>
          <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
            Completa la información para registrarte
          </p>
        </div>

        {/* Alertas de error y éxito */}
            {error && (
              <div style={{backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem'}}>
                {error}
              </div>
            )}
            {success && (
              <div style={{backgroundColor: '#f0f9ff', border: '1px solid #7dd3fc', color: '#0c4a6e', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem'}}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              {/* Campo Nombre */}
              <div>
                <label htmlFor="nombre" style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  style={{width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '1rem', outline: 'none'}}
                  placeholder="Tu nombre completo"
                />
              </div>

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
                <label htmlFor="password" style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '1rem', outline: 'none'}}
                />
              </div>

              {/* Campo Área Solicitada */}
              <div>
                <label htmlFor="areaSolicitada" style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>
                  Área solicitada
                </label>
                <input
                  id="areaSolicitada"
                  type="text"
                  value={areaSolicitada}
                  onChange={(e) => setAreaSolicitada(e.target.value)}
                  required
                  style={{width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '1rem', outline: 'none'}}
                  placeholder="Finanzas, Marketing, etc."
                />
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Registrarse
              </button>
            </form>

            {/* Separador */}
            <div style={{position: 'relative', margin: '2rem 0'}}>
              <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#d1d5db'}} />
              <div style={{position: 'relative', textAlign: 'center', fontSize: '0.875rem'}}>
                <span style={{padding: '0 0.5rem', backgroundColor: 'white', color: '#6b7280'}}>¿Ya tienes cuenta?</span>
              </div>
            </div>

            {/* Botón de login */}
            <Link href="/" style={{display: 'block'}}>
              <button
                type="button"
                style={{
                  width: '100%',
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
                Iniciar sesión
              </button>
            </Link>

        {/* Footer */}
        <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
          <p style={{fontSize: '0.75rem', color: '#9ca3af'}}>
            Al registrarte, aceptas nuestros{" "}
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
