"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks/useResponsive";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  area_solicitada: string;
  area_id: number | null;
  estado: string | null;
  rol: string;
}

interface Area {
  id: number;
  nombre_area: string;
  descripcion: string;
}

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<{ [key: number]: number }>({});
  const [nuevaArea, setNuevaArea] = useState("");
  const [descArea, setDescArea] = useState("");
  const [editAreaId, setEditAreaId] = useState<number | null>(null);
  const [editAreaName, setEditAreaName] = useState("");
  const [editAreaDesc, setEditAreaDesc] = useState("");
  
  // Estados para edición de usuarios
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserPassword, setEditUserPassword] = useState("");
  const [editUserAreaId, setEditUserAreaId] = useState<number | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});
  const [tempPasswords, setTempPasswords] = useState<{ [key: number]: string }>({});
  const [generatingPassword, setGeneratingPassword] = useState<{ [key: number]: boolean }>({});

  const router = useRouter();
  const { user, loading: authLoading, logout: authLogout, preventBackNavigation } = useAuth();
  const { isMobile, getGridCols, getPadding, getFontSize } = useResponsive();

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
      // Si el usuario es admin válido, prevenir navegación hacia atrás
      const cleanup = preventBackNavigation();
      return cleanup;
    }
  }, [user, authLoading, router, preventBackNavigation]);

  // Traer usuarios (optimizado)
  const fetchUsuarios = async () => {
    try {
      const res = await fetch("/api/admin/usuarios", {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      setUsuarios(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Traer áreas (optimizado)
  const fetchAreas = async () => {
    try {
      const res = await fetch("/api/admin/areas", {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      setAreas(data.areas || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchAreas();
  }, []);

  // Cerrar sesión
  const logout = () => {
    authLogout();
  };

  // Aprobar usuario
  const aprobarUsuario = async (id: number) => {
    const areaId = selectedAreas[id];
    if (!areaId) {
      alert("Selecciona un área antes de aprobar");
      return;
    }
    try {
      const res = await fetch("/api/admin/usuarios/aprobar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, area_id: areaId })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Error al aprobar usuario");
        return;
      }
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert("Error en la conexión al servidor");
    }
  };

  // Rechazar usuario
  const rechazarUsuario = async (id: number) => {
    try {
      const res = await fetch("/api/admin/usuarios/rechazar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Error al rechazar usuario");
        return;
      }
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert("Error en la conexión al servidor");
    }
  };

  // Crear nueva área
  const crearArea = async () => {
    if (!nuevaArea) return;
    try {
      const res = await fetch("/api/admin/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_area: nuevaArea, descripcion: descArea })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al crear área");
        return;
      }
      setNuevaArea("");
      setDescArea("");
      fetchAreas();
    } catch (err) {
      console.error(err);
      alert("Error en la conexión al servidor");
    }
  };

  // Editar área
  const editarArea = async () => {
    if (!editAreaId || !editAreaName) return;
    try {
      const res = await fetch("/api/admin/areas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ areaId: editAreaId, nombre_area: editAreaName, descripcion: editAreaDesc })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al editar área");
        return;
      }
      setEditAreaId(null);
      setEditAreaName("");
      setEditAreaDesc("");
      fetchAreas();
    } catch (err) {
      console.error(err);
      alert("Error en la conexión al servidor");
    }
  };

  // Eliminar área
  const eliminarArea = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta área?")) return;
    try {
      const res = await fetch("/api/admin/areas/eliminar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al eliminar área");
        return;
      }
      alert("Área eliminada correctamente");
      fetchAreas();
    } catch (err) {
      console.error(err);
      alert("Error en la conexión al servidor");
    }
  };

  // Iniciar edición de usuario
  const iniciarEdicionUsuario = (usuario: Usuario) => {
    setEditUserId(usuario.id);
    setEditUserName(usuario.nombre);
    setEditUserEmail(usuario.email);
    setEditUserPassword("");
    setEditUserAreaId(usuario.area_id);
  };

  // Cancelar edición de usuario
  const cancelarEdicionUsuario = () => {
    setEditUserId(null);
    setEditUserName("");
    setEditUserEmail("");
    setEditUserPassword("");
    setEditUserAreaId(null);
  };

  // Guardar edición de usuario
  const guardarEdicionUsuario = async () => {
    if (!editUserId || !editUserName || !editUserEmail) {
      alert("Nombre y email son requeridos");
      return;
    }
    try {
      const res = await fetch("/api/admin/usuarios/editar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: editUserId, 
          nombre: editUserName, 
          email: editUserEmail,
          password: editUserPassword,
          area_id: editUserAreaId
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al editar usuario");
        return;
      }
      cancelarEdicionUsuario();
      fetchUsuarios();
      alert("Usuario actualizado correctamente");
    } catch (err) {
      console.error(err);
      alert("Error en la conexión al servidor");
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${nombre}"?`)) return;
    try {
      const res = await fetch("/api/admin/usuarios/eliminar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al eliminar usuario");
        return;
      }
      alert("Usuario eliminado correctamente");
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert("Error en la conexión al servidor");
    }
  };

  // Generar contraseña temporal visible
  const generarPasswordTemporal = async (userId: number, userName: string) => {
    const newPassword = `${userName.toLowerCase().replace(/\s+/g, '')}123!`;
    
    setGeneratingPassword(prev => ({ ...prev, [userId]: true }));
    
    try {
      const res = await fetch("/api/admin/usuarios/editar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: userId, 
          password: newPassword,
          // Mantenemos los otros datos igual
          nombre: usuarios.find(u => u.id === userId)?.nombre,
          email: usuarios.find(u => u.id === userId)?.email,
          area_id: usuarios.find(u => u.id === userId)?.area_id
        })
      });
      
      if (res.ok) {
        setTempPasswords(prev => ({ ...prev, [userId]: newPassword }));
        setShowPasswords(prev => ({ ...prev, [userId]: true }));
        alert(`Nueva contraseña generada: ${newPassword}`);
      } else {
        alert("Error al generar nueva contraseña");
      }
    } catch (error) {
      console.error(error);
      alert("Error al generar nueva contraseña");
    }
    
    setGeneratingPassword(prev => ({ ...prev, [userId]: false }));
  };

  // Corregir usuarios sin área
  const corregirUsuariosSinArea = async () => {
    try {
      const res = await fetch("/api/admin/usuarios/corregir-areas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message);
        fetchUsuarios(); // Recargar usuarios
      } else {
        alert(data.message || "Error al corregir usuarios");
      }
    } catch (error) {
      console.error(error);
      alert("Error en la conexión al servidor");
    }
  };

  // Mostrar/ocultar contraseña
  const togglePassword = (id: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        padding: getPadding('1rem', '1.5rem', '2rem')
      }}
    >
      <div 
        style={{
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: isMobile ? '8px' : '12px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid #e5e7eb',
          padding: getPadding('1rem', '1.5rem', '2rem')
        }}
      >
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <button
              onClick={() => router.push('/admin/dashboard')}
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
              <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem'}}>
                Panel de Gestión
              </h1>
              <p style={{color: '#6b7280', fontSize: '1rem'}}>
                Gestiona usuarios y áreas del sistema
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              color: 'white',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              cursor: 'pointer'
            }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* Usuarios Pendientes */}
        <section style={{marginBottom: '3rem'}}>
          <div style={{marginBottom: '1.5rem'}}>
            <h2 style={{fontSize: '1.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
              Usuarios Pendientes
            </h2>
            <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
              Revisa y aprueba las solicitudes de nuevos usuarios
            </p>
          </div>
          {usuarios.filter(u => u.estado === 'pendiente' || u.estado === null).length === 0 && (
            <div style={{backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', border: '1px solid #e5e7eb'}}>
              <p style={{color: '#9ca3af', fontSize: '1rem'}}>No hay usuarios pendientes</p>
            </div>
          )}
          <div style={{display: 'grid', gridTemplateColumns: getGridCols(1, 2, 3), gap: '1rem'}}>
            {usuarios.filter(user => user.estado === 'pendiente' || user.estado === null).map((user) => (
              <div 
                key={user.id} 
                style={{
                  backgroundColor: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.75rem'}}>
                    <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem'}}>
                      <span style={{color: 'white', fontWeight: '600', fontSize: '1rem'}}>
                        {user.nombre[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p style={{fontWeight: '600', color: '#111827', fontSize: '1rem', margin: 0}}>{user.nombre}</p>
                      <p style={{color: '#6b7280', fontSize: '0.875rem', margin: 0}}>{user.email}</p>
                    </div>
                  </div>
                  <div style={{backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                    <p style={{color: '#374151', fontSize: '0.875rem', margin: 0, fontWeight: '500'}}>
                      Área solicitada: <span style={{color: '#2563eb'}}>{user.area_solicitada || "N/A"}</span>
                    </p>
                  </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  <select
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      backgroundColor: '#f9fafb',
                      fontSize: '0.875rem',
                      color: '#374151',
                      outline: 'none'
                    }}
                    value={selectedAreas[user.id] || ""}
                    onChange={(e) =>
                      setSelectedAreas(prev => ({ ...prev, [user.id]: Number(e.target.value) }))
                    }
                  >
                    <option value="">Seleccionar área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>{area.nombre_area}</option>
                    ))}
                  </select>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button
                      onClick={() => aprobarUsuario(user.id)}
                      disabled={!selectedAreas[user.id]}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'white',
                        backgroundColor: !selectedAreas[user.id] ? '#9ca3af' : '#16a34a',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: !selectedAreas[user.id] ? 'not-allowed' : 'pointer',
                        opacity: !selectedAreas[user.id] ? 0.5 : 1
                      }}
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => rechazarUsuario(user.id)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'white',
                        backgroundColor: '#dc2626',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Usuarios Activos */}
        <section style={{marginBottom: '3rem'}}>
          <div style={{marginBottom: '1.5rem'}}>
            <h2 style={{fontSize: '1.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
              Usuarios Activos
            </h2>
            <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
              Gestiona todos los usuarios del sistema
            </p>
          </div>

          {/* Alerta de usuarios sin área */}
          {usuarios.filter(u => u.estado === 'activo' && !u.area_id).length > 0 && (
            <div style={{
              backgroundColor: '#fef3c7', 
              border: '1px solid #f59e0b', 
              borderRadius: '0.75rem', 
              padding: '1rem', 
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{color: '#92400e', fontWeight: '600', margin: 0}}>
                  ⚠️ {usuarios.filter(u => u.estado === 'activo' && !u.area_id).length} usuario(s) activo(s) sin área asignada
                </p>
                <p style={{color: '#92400e', fontSize: '0.875rem', margin: 0}}>
                  Esto puede causar problemas al subir informes.
                </p>
              </div>
              <button
                onClick={corregirUsuariosSinArea}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#f59e0b',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Corregir Automáticamente
              </button>
            </div>
          )}
          
          {/* Lista de usuarios activos */}
          <div style={{backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e5e7eb', overflow: 'hidden'}}>
            {usuarios
              .filter(u => u.estado === 'activo')
              .sort((a, b) => {
                // Admins primero, luego usuarios normales
                if (a.rol === 'admin' && b.rol !== 'admin') return -1;
                if (a.rol !== 'admin' && b.rol === 'admin') return 1;
                return 0;
              })
              .map((user) => (
              <div key={user.id} style={{borderBottom: '1px solid #e5e7eb', padding: '1.5rem'}}>
                {editUserId === user.id ? (
                  // Modo edición
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={editUserEmail}
                        onChange={(e) => setEditUserEmail(e.target.value)}
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                      <input
                        type="password"
                        placeholder="Nueva contraseña (opcional)"
                        value={editUserPassword}
                        onChange={(e) => setEditUserPassword(e.target.value)}
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                      <select
                        value={editUserAreaId || ""}
                        onChange={(e) => setEditUserAreaId(Number(e.target.value) || null)}
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      >
                        <option value="">Sin área asignada</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>{area.nombre_area}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                      <button
                        onClick={guardarEdicionUsuario}
                        style={{
                          padding: '0.75rem 1.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: 'white',
                          backgroundColor: '#16a34a',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelarEdicionUsuario}
                        style={{
                          padding: '0.75rem 1.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#374151',
                          backgroundColor: '#f9fafb',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Modo vista
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flex: 1}}>
                      <div style={{width: '50px', height: '50px', borderRadius: '50%', backgroundColor: user.rol === 'admin' ? '#dc2626' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <span style={{color: 'white', fontWeight: '600', fontSize: '1.25rem'}}>
                          {user.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div style={{flex: 1}}>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem'}}>
                          <div>
                            <p style={{fontWeight: '600', color: '#111827', fontSize: '1rem', margin: 0}}>{user.nombre}</p>
                            <p style={{color: '#6b7280', fontSize: '0.875rem', margin: 0}}>{user.email}</p>
                          </div>
                          <div>
                            <p style={{color: '#374151', fontSize: '0.875rem', margin: 0}}>
                              <strong>Rol:</strong> <span style={{color: user.rol === 'admin' ? '#dc2626' : '#2563eb'}}>{user.rol}</span>
                            </p>
                            <p style={{color: '#374151', fontSize: '0.875rem', margin: 0}}>
                              <strong>Área:</strong> {areas.find(a => a.id === user.area_id)?.nombre_area || 'Sin asignar'}
                            </p>
                          </div>
                          <div>
                            <p style={{color: '#374151', fontSize: '0.875rem', margin: 0}}>
                              <strong>Contraseña:</strong> 
                              {user.rol === 'admin' ? (
                                <span style={{marginLeft: '0.5rem', color: '#9ca3af', fontStyle: 'italic'}}>
                                  Protegida
                                </span>
                              ) : (
                                <>
                                  <span style={{fontFamily: 'monospace', fontSize: '0.75rem', marginLeft: '0.5rem'}}>
                                    {showPasswords[user.id] 
                                      ? (tempPasswords[user.id] || 'Hash: ' + user.password.substring(0, 20) + '...') 
                                      : '••••••••••••'
                                    }
                                  </span>
                                  <button
                                    onClick={() => togglePassword(user.id)}
                                    style={{
                                      marginLeft: '0.5rem',
                                      padding: '0.25rem 0.5rem',
                                      fontSize: '0.75rem',
                                      color: '#2563eb',
                                      backgroundColor: 'transparent',
                                      border: '1px solid #2563eb',
                                      borderRadius: '0.25rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {showPasswords[user.id] ? 'Ocultar' : 'Ver Hash'}
                                  </button>
                                  <button
                                    onClick={() => generarPasswordTemporal(user.id, user.nombre)}
                                    disabled={generatingPassword[user.id]}
                                    style={{
                                      marginLeft: '0.5rem',
                                      padding: '0.25rem 0.5rem',
                                      fontSize: '0.75rem',
                                      color: 'white',
                                      backgroundColor: generatingPassword[user.id] ? '#9ca3af' : '#16a34a',
                                      border: 'none',
                                      borderRadius: '0.25rem',
                                      cursor: generatingPassword[user.id] ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    {generatingPassword[user.id] ? 'Generando...' : 'Nueva Contraseña'}
                                  </button>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                      {user.rol !== 'admin' ? (
                        <>
                          <button
                            onClick={() => iniciarEdicionUsuario(user)}
                            style={{
                              padding: '0.75rem',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: '#2563eb',
                              backgroundColor: '#eff6ff',
                              border: '1px solid #2563eb',
                              borderRadius: '0.5rem',
                              cursor: 'pointer'
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarUsuario(user.id, user.nombre)}
                            style={{
                              padding: '0.75rem',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: 'white',
                              backgroundColor: '#dc2626',
                              border: 'none',
                              borderRadius: '0.5rem',
                              cursor: 'pointer'
                            }}
                          >
                            Eliminar
                          </button>
                        </>
                      ) : (
                        <div style={{
                          padding: '0.75rem 1.5rem',
                          fontSize: '0.875rem',
                          color: '#9ca3af',
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontStyle: 'italic'
                        }}>
                          Cuenta Protegida
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Áreas */}
        <section>
          <div style={{marginBottom: '1.5rem'}}>
            <h2 style={{fontSize: '1.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
              {editAreaId ? "Editar Área" : "Gestión de Áreas"}
            </h2>
            <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
              {editAreaId ? "Modifica la información del área seleccionada" : "Crea y administra las áreas de la empresa"}
            </p>
          </div>

          {/* Formulario de área */}
          <div 
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              border: '1px solid #e5e7eb',
              marginBottom: '2rem'
            }}
          >
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <input
                  type="text"
                  placeholder="Nombre del área"
                  value={editAreaId ? editAreaName : nuevaArea}
                  onChange={(e) => editAreaId ? setEditAreaName(e.target.value) : setNuevaArea(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                <input
                  type="text"
                  placeholder="Descripción del área"
                  value={editAreaId ? editAreaDesc : descArea}
                  onChange={(e) => editAreaId ? setEditAreaDesc(e.target.value) : setDescArea(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </div>
              <div style={{display: 'flex', gap: '0.75rem', justifyContent: 'flex-end'}}>
                <button
                  onClick={editAreaId ? editarArea : crearArea}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  {editAreaId ? "Guardar Cambios" : "Crear Área"}
                </button>
                {editAreaId && (
                  <button
                    onClick={() => { setEditAreaId(null); setEditAreaName(""); setEditAreaDesc(""); }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#374151',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lista de áreas existentes */}
          <div style={{marginBottom: '1rem'}}>
            <h3 style={{fontSize: '1.5rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
              Áreas Existentes
            </h3>
            <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
              Administra las áreas disponibles en el sistema
            </p>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: getGridCols(1, 2, 3), gap: '1rem'}}>
            {areas.map((area) => (
              <div 
                key={area.id} 
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{flex: 1}}>
                  <p style={{fontWeight: '600', color: '#111827', fontSize: '1rem', margin: '0 0 0.25rem 0'}}>
                    {area.nombre_area}
                  </p>
                  <p style={{color: '#6b7280', fontSize: '0.875rem', margin: 0}}>
                    {area.descripcion || 'Sin descripción'}
                  </p>
                </div>
                <div style={{display: 'flex', gap: '0.5rem', marginLeft: '1rem'}}>
                  <button
                    onClick={() => { setEditAreaId(area.id); setEditAreaName(area.nombre_area); setEditAreaDesc(area.descripcion || ""); }}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'white',
                      backgroundColor: '#f59e0b',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarArea(area.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'white',
                      backgroundColor: '#dc2626',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
