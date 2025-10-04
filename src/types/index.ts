// src/types/index.ts

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  area_solicitada: string;
  area_id: number | null;
  estado: string | null;
  rol: string;
}

export interface Area {
  id: number;
  nombre_area: string;
  descripcion: string;
  activa?: boolean;
  usuarios_count?: number;
}

export interface Trimestre {
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

export interface TrimestreEstadistica {
  trimestre: number;
  año: number;
  fecha_inicio: string;
  fecha_fin: string;
  total_usuarios: number;
  metas_creadas: number;
  informes_subidos: number;
  informes_pendientes: number;
  informes_aceptados: number;
  informes_rechazados: number;
}

export interface Informe {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  usuario_email: string;
  trimestre: number;
  año: number;
  meta_trimestral: string;
  archivo: string | null;
  estado: string;
  comentario_admin: string | null;
  calificacion: number | null;
  fecha_meta_creada: string;
  fecha_archivo_subido: string | null;
}

// ✨ NUEVOS TIPOS PARA EL FLUJO ACTUALIZADO
export interface TrimestreSelection {
  id: number;
  usuario_id: number;
  trimestre: number;
  año: number;
  selected_at: string;
  meta_asignada: string | null;
  meta_asignada_por: number | null;
  meta_asignada_at: string | null;
  estado: 'pendiente_meta' | 'meta_asignada' | 'upload_habilitado' | 'informe_subido' | 'completado';
  created_at: string;
  updated_at: string;
}

export interface AdminNotificacion {
  id: number;
  tipo: 'nueva_seleccion' | 'informe_subido' | 'general';
  usuario_id: number;
  usuario_nombre?: string;
  area_nombre?: string;
  selection_id: number | null;
  titulo: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
}

export interface InformePorArea {
  id: number;
  area_id: number;
  area_nombre: string;
  trimestre: number;
  año: number;
  titulo: string;
  resumen_ejecutivo: string | null;
  total_usuarios: number;
  informes_completados: number;
  promedio_cumplimiento: number | null;
  archivo_generado: string | null;
  generado_por: number;
  created_at: string;
  updated_at: string;
}

export interface TrimestreDisponible {
  trimestre: number;
  año: number;
  fecha_inicio: string;
  fecha_fin: string;
  disponible: boolean;
  seleccionado: boolean;
  selection?: TrimestreSelection;
}