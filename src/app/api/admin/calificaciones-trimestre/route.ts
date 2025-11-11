// src/app/api/admin/calificaciones-trimestre/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Obtener calificación general de un trimestre específico
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuario_id = searchParams.get('usuario_id');
    const trimestre = searchParams.get('trimestre');
    const anio = searchParams.get('anio') || '2025';

    if (!usuario_id || !trimestre) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const result = await query(
      `SELECT * FROM calificaciones_trimestre 
       WHERE usuario_id = $1 AND trimestre = $2 AND anio = $3`,
      [usuario_id, trimestre, anio]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error al obtener calificación de trimestre:', error);
    return NextResponse.json({ error: 'Error al obtener calificación' }, { status: 500 });
  }
}

// POST: Crear calificación general del trimestre
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario_id, area_id, trimestre, calificacion_general, comentario_general, admin_id } = body;

    // Validaciones
    if (!usuario_id || !area_id || !trimestre || calificacion_general === undefined || !admin_id) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    if (calificacion_general < 0 || calificacion_general > 100) {
      return NextResponse.json({ error: 'Calificación debe estar entre 0 y 100' }, { status: 400 });
    }

    if (trimestre < 1 || trimestre > 4) {
      return NextResponse.json({ error: 'Trimestre debe estar entre 1 y 4' }, { status: 400 });
    }

    // Verificar si ya existe una calificación para este usuario/trimestre
    const existing = await query(
      `SELECT id FROM calificaciones_trimestre 
       WHERE usuario_id = $1 AND trimestre = $2 AND anio = 2025`,
      [usuario_id, trimestre]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ 
        error: 'Ya existe una calificación general para este trimestre. Use PATCH para actualizar.' 
      }, { status: 400 });
    }

    // Insertar nueva calificación
    const result = await query(
      `INSERT INTO calificaciones_trimestre 
       (usuario_id, area_id, trimestre, anio, calificacion_general, comentario_general, calificado_por, fecha_calificacion)
       VALUES ($1, $2, $3, 2025, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
      [usuario_id, area_id, trimestre, calificacion_general, comentario_general || null, admin_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Calificación general del trimestre guardada correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al guardar calificación de trimestre:', error);
    return NextResponse.json({ error: 'Error al guardar calificación' }, { status: 500 });
  }
}

// PATCH: Actualizar calificación general del trimestre
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario_id, trimestre, calificacion_general, comentario_general, admin_id } = body;

    // Validaciones
    if (!usuario_id || !trimestre || calificacion_general === undefined || !admin_id) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    if (calificacion_general < 0 || calificacion_general > 100) {
      return NextResponse.json({ error: 'Calificación debe estar entre 0 y 100' }, { status: 400 });
    }

    // Actualizar calificación existente
    const result = await query(
      `UPDATE calificaciones_trimestre 
       SET 
         calificacion_general = $1,
         comentario_general = $2,
         calificado_por = $3,
         fecha_calificacion = CURRENT_TIMESTAMP,
         fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE usuario_id = $4 AND trimestre = $5 AND anio = 2025
       RETURNING *`,
      [calificacion_general, comentario_general || null, admin_id, usuario_id, trimestre]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: 'No se encontró la calificación. Use POST para crear una nueva.' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Calificación general del trimestre actualizada correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar calificación de trimestre:', error);
    return NextResponse.json({ error: 'Error al actualizar calificación' }, { status: 500 });
  }
}
