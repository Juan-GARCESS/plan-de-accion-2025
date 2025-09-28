// src/app/dashboard/page.tsx
"use client"; // Necesario para useEffect y fetch
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks/useResponsive";
import Navbar from "@/app/components/navbar";

interface Trimestre {
  id: number;
  trimestre: number;
  año: number;
  fecha_inicio: string;
  fecha_fin: string;
  abierto: boolean;
  habilitado_manualmente: boolean;
  dias_habilitados: number | null;
  fecha_habilitacion_manual: string | null;
  informe: {
    id: number;
    meta_trimestral: string;
    archivo: string | null;
    estado: string;
    comentario_admin: string | null;
    calificacion: number | null;
    fecha_meta_creada: string | null;
    fecha_archivo_subido: string | null;
  } | null;
  disponible: boolean;
  razon: string;
  usuario_id: number;
  area_id: number;
}

export default function DashboardPage() {
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [selectedTrimestre, setSelectedTrimestre] = useState<number | null>(null);
  const [metaTrimestral, setMetaTrimestral] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const router = useRouter();
  const { user, loading: authLoading, preventBackNavigation } = useAuth();
  const { getPadding, getGridCols } = useResponsive();

  // Proteger la ruta - solo usuarios normales
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/');
        return;
      }
      if (user.rol === 'admin') {
        router.replace('/admin');
        return;
      }
      // Si el usuario es válido, prevenir navegación hacia atrás
      const cleanup = preventBackNavigation();
      return cleanup;
    }
  }, [user, authLoading, router, preventBackNavigation]);

  // Cargar datos de trimestres
  useEffect(() => {
    const fetchTrimestres = async () => {
      try {
        const res = await fetch("/api/usuario/trimestres");
        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/");
            return;
          }
          throw new Error("Error al cargar trimestres");
        }
        const data = await res.json();
        setTrimestres(data.trimestres);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    
    // Solo cargar datos si es usuario normal (no admin)
    if (user && user.rol === 'usuario') {
      fetchTrimestres();
    }
  }, [router, user]);

  // Guardar meta trimestral
  const guardarMeta = async (trimestre: number, año: number) => {
    if (!metaTrimestral.trim()) {
      alert("Debe describir la meta trimestral");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/usuario/metas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trimestre,
          año,
          meta_trimestral: metaTrimestral
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      alert("Meta trimestral guardada correctamente");
      setMetaTrimestral("");
      setSelectedTrimestre(null);
      
      // Recargar datos
      const reloadRes = await fetch("/api/usuario/trimestres");
      if (reloadRes.ok) {
        const reloadData = await reloadRes.json();
        setTrimestres(reloadData.trimestres);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al guardar meta");
    } finally {
      setSubmitting(false);
    }
  };

  // Subir archivo de informe
  const subirArchivo = async (trimestre: number, año: number) => {
    if (!archivo) {
      alert("Debe seleccionar un archivo");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("trimestre", trimestre.toString());
      formData.append("año", año.toString());

      const res = await fetch("/api/usuario/informes", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      alert("Archivo subido correctamente");
      setArchivo(null);
      
      // Recargar datos
      const reloadRes = await fetch("/api/usuario/trimestres");
      if (reloadRes.ok) {
        const reloadData = await reloadRes.json();
        setTrimestres(reloadData.trimestres);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al subir archivo");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
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

  // Si es admin, no mostrar nada (se redirigirá en useEffect)
  if (user.rol === 'admin') {
    return null;
  }

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
        {/* Grid de trimestres */}
        <div style={{display: 'grid', gridTemplateColumns: getGridCols(1, 2, 3), gap: '1.5rem'}}>
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

              {/* Estado del informe */}
              {trimestre.informe ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  {/* Meta trimestral */}
                  <div>
                    <h4 style={{fontSize: '1rem', fontWeight: '500', color: '#374151', margin: '0 0 0.5rem 0'}}>
                      📋 Meta Trimestral
                    </h4>
                    <div 
                      style={{
                        backgroundColor: '#f9fafb',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <p style={{color: '#374151', fontSize: '0.875rem', margin: 0, lineHeight: '1.4'}}>
                        {trimestre.informe.meta_trimestral}
                      </p>
                      {trimestre.informe.fecha_meta_creada && (
                        <p style={{color: '#9ca3af', fontSize: '0.75rem', margin: '0.5rem 0 0 0'}}>
                          Creada: {new Date(trimestre.informe.fecha_meta_creada).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Estado del archivo */}
                  <div>
                    <h4 style={{fontSize: '1rem', fontWeight: '500', color: '#374151', margin: '0 0 0.5rem 0'}}>
                      � Informe Final
                    </h4>
                    {trimestre.informe.archivo ? (
                      <div 
                        style={{
                          backgroundColor: '#f0f9ff',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #bae6fd'
                        }}
                      >
                        <p style={{color: '#0c4a6e', fontSize: '0.875rem', margin: 0}}>
                          ✅ Archivo subido
                        </p>
                        {trimestre.informe.fecha_archivo_subido && (
                          <p style={{color: '#0369a1', fontSize: '0.75rem', margin: '0.25rem 0 0 0'}}>
                            Subido: {new Date(trimestre.informe.fecha_archivo_subido).toLocaleDateString()}
                          </p>
                        )}
                        
                        {/* Estado de calificación */}
                        {trimestre.informe.estado === 'aceptado' && (
                          <div style={{marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#dcfce7', borderRadius: '0.25rem'}}>
                            <p style={{color: '#166534', fontSize: '0.875rem', fontWeight: '500', margin: 0}}>
                              ✅ Aceptado - Calificación: {trimestre.informe.calificacion}%
                            </p>
                          </div>
                        )}
                        
                        {trimestre.informe.estado === 'rechazado' && (
                          <div style={{marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fef2f2', borderRadius: '0.25rem'}}>
                            <p style={{color: '#dc2626', fontSize: '0.875rem', fontWeight: '500', margin: 0}}>
                              ❌ Rechazado
                            </p>
                            {trimestre.informe.comentario_admin && (
                              <p style={{color: '#dc2626', fontSize: '0.75rem', margin: '0.25rem 0 0 0'}}>
                                {trimestre.informe.comentario_admin}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {trimestre.informe.estado === 'pendiente' && (
                          <div style={{marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: '0.25rem'}}>
                            <p style={{color: '#92400e', fontSize: '0.875rem', fontWeight: '500', margin: 0}}>
                              ⏳ Pendiente de calificación
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Subir archivo
                      trimestre.disponible && trimestre.informe.estado === 'planificando' && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem'
                            }}
                          />
                          <button
                            onClick={() => subirArchivo(trimestre.trimestre, trimestre.año)}
                            disabled={!archivo || submitting}
                            style={{
                              padding: '0.75rem',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: 'white',
                              backgroundColor: (!archivo || submitting) ? '#9ca3af' : '#2563eb',
                              border: 'none',
                              borderRadius: '0.5rem',
                              cursor: (!archivo || submitting) ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {submitting ? 'Subiendo...' : 'Subir Informe'}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                // Crear meta trimestral
                trimestre.disponible && (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                    <h4 style={{fontSize: '1rem', fontWeight: '500', color: '#374151', margin: 0}}>
                      📝 Describir Meta Trimestral
                    </h4>
                    {selectedTrimestre === trimestre.id ? (
                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                        <textarea
                          value={metaTrimestral}
                          onChange={(e) => setMetaTrimestral(e.target.value)}
                          placeholder="Describe lo que planeas lograr en este trimestre..."
                          rows={4}
                          style={{
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            resize: 'vertical',
                            outline: 'none'
                          }}
                        />
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button
                            onClick={() => guardarMeta(trimestre.trimestre, trimestre.año)}
                            disabled={!metaTrimestral.trim() || submitting}
                            style={{
                              flex: 1,
                              padding: '0.75rem',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: 'white',
                              backgroundColor: (!metaTrimestral.trim() || submitting) ? '#9ca3af' : '#16a34a',
                              border: 'none',
                              borderRadius: '0.5rem',
                              cursor: (!metaTrimestral.trim() || submitting) ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {submitting ? 'Guardando...' : 'Guardar Meta'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTrimestre(null);
                              setMetaTrimestral("");
                            }}
                            style={{
                              padding: '0.75rem 1rem',
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
                      <button
                        onClick={() => setSelectedTrimestre(trimestre.id)}
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
                        Crear Meta Trimestral
                      </button>
                    )}
                  </div>
                )
              )}

              {/* Mensaje si no está disponible */}
              {!trimestre.disponible && !trimestre.informe && (
                <div 
                  style={{
                    backgroundColor: '#fef3c7',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #f59e0b',
                    textAlign: 'center'
                  }}
                >
                  <p style={{color: '#92400e', fontSize: '0.875rem', margin: 0}}>
                    Este trimestre no está disponible para crear informes
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
