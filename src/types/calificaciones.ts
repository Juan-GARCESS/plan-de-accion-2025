// Tipos para el sistema de calificaciones por meta

export interface CalificacionMeta {
  id: number;
  meta_id: number;
  area_id: number;
  anio: number;

  // Calificaciones trimestrales (informativas)
  cal_trimestre_1: number | null;
  cal_trimestre_2: number | null;
  cal_trimestre_3: number | null;
  cal_trimestre_4: number | null;

  // Calificación Total General (LA IMPORTANTE)
  calificacion_total_general: number | null;

  // Comentarios
  comentario_t1: string | null;
  comentario_t2: string | null;
  comentario_t3: string | null;
  comentario_t4: string | null;
  comentario_general: string | null;

  // Fechas
  fecha_calificacion_t1: Date | null;
  fecha_calificacion_t2: Date | null;
  fecha_calificacion_t3: Date | null;
  fecha_calificacion_t4: Date | null;
  fecha_calificacion_general: Date | null;

  // Admins que calificaron
  calificado_por_t1: number | null;
  calificado_por_t2: number | null;
  calificado_por_t3: number | null;
  calificado_por_t4: number | null;
  calificado_por_general: number | null;

  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface CalificacionTrimestreInput {
  meta_id: number;
  trimestre: 1 | 2 | 3 | 4;
  calificacion: number; // 0-100
  comentario?: string;
  admin_id: number;
}

export interface CalificacionGeneralInput {
  meta_id: number;
  calificacion_total_general: number; // 0-100
  comentario_general?: string;
  admin_id: number;
}

export interface MetaConCalificaciones {
  meta_id: number;
  meta: string;
  indicador: string;
  area_id: number;
  nombre_area: string;
  nombre_eje: string;
  nombre_sub_eje: string;
  
  // Asignaciones de trimestres
  asignado_t1: boolean;
  asignado_t2: boolean;
  asignado_t3: boolean;
  asignado_t4: boolean;
  
  // Calificaciones trimestrales (informativas)
  calificacion_t1: number;
  calificacion_t2: number;
  calificacion_t3: number;
  calificacion_t4: number;
  
  // Calificación Total General
  calificacion_total_general: number | null;
  
  // Comentarios
  comentario_t1: string | null;
  comentario_t2: string | null;
  comentario_t3: string | null;
  comentario_t4: string | null;
  comentario_general: string | null;
}

export interface PromedioArea {
  area_id: number;
  nombre_area: string;
  anio: number;
  total_metas: number;
  metas_calificadas: number;
  promedio_general_area: number;
  promedio_t1: number;
  promedio_t2: number;
  promedio_t3: number;
  promedio_t4: number;
}
