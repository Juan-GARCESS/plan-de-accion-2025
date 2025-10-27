// src/app/api/admin/evidencias/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

// PATCH - Actualizar calificación y comentario
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar que es admin
    const userCheck = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = await params;
    const { calificacion, comentario_admin } = await request.json();

    // Validar calificación
    if (typeof calificacion !== 'number' || calificacion < 0 || calificacion > 100) {
      return NextResponse.json(
        { error: 'Calificación inválida (debe ser entre 0 y 100)' },
        { status: 400 }
      );
    }

    // Actualizar evidencia
    const result = await db.query(
      `UPDATE evidencias 
       SET calificacion = $1, 
           comentario_admin = $2,
           fecha_revision = NOW()
       WHERE id = $3
       RETURNING *`,
      [calificacion, comentario_admin || null, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Evidencia no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      evidencia: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar evidencia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar evidencia
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar que es admin
    const userCheck = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = await params;

    // Eliminar evidencia (también se podría hacer un soft delete cambiando el estado)
    const result = await db.query(
      'DELETE FROM evidencias WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Evidencia no encontrada' }, { status: 404 });
    }

    // Opcional: Si usas S3 y quieres eliminar el archivo también
    // const archivo_url = result.rows[0].archivo_url;
    // await eliminarDeS3(archivo_url);

    return NextResponse.json({
      success: true,
      message: 'Evidencia eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar evidencia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
