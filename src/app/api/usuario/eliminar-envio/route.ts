// src/app/api/usuario/eliminar-envio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * DELETE - Eliminar envío del trimestre (solo si NO tiene calificaciones)
 * 
 * Permite al usuario eliminar su envío y volver a enviar si:
 * - El envío existe
 * - NINGUNA meta ha sido calificada aún
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trimestre = searchParams.get('trimestre');
    const area_id = searchParams.get('area_id');

    if (!trimestre || !area_id) {
      return NextResponse.json({ 
        error: 'Parámetros requeridos: trimestre, area_id' 
      }, { status: 400 });
    }

    const anioActual = new Date().getFullYear();

    // ============================================
    // 1. VERIFICAR SI EXISTE EL ENVÍO
    // ============================================
    const envioCheck = await db.query(
      `SELECT id FROM envios_trimestre 
       WHERE usuario_id = $1 AND area_id = $2 AND trimestre = $3 AND anio = $4`,
      [userId, area_id, trimestre, anioActual]
    );

    if (envioCheck.rows.length === 0) {
      return NextResponse.json({
        error: 'No existe ningún envío para eliminar'
      }, { status: 404 });
    }

    const envio_id = envioCheck.rows[0].id;

    // ============================================
    // 2. VERIFICAR SI HAY CALIFICACIONES
    // ============================================
    const calificacionesCheck = await db.query(
      `SELECT COUNT(*) as total_calificadas
       FROM evidencias
       WHERE envio_id = $1 
       AND estado IN ('aprobado', 'rechazado')`,
      [envio_id]
    );

    const totalCalificadas = parseInt(calificacionesCheck.rows[0].total_calificadas);

    if (totalCalificadas > 0) {
      return NextResponse.json({
        error: 'No puedes eliminar este envío',
        mensaje: `El administrador ya ha calificado ${totalCalificadas} meta(s). Contacta al administrador si necesitas hacer cambios.`,
        puede_eliminar: false
      }, { status: 403 });
    }

    // ============================================
    // 3. CONTAR METAS A ELIMINAR
    // ============================================
    const metasCheck = await db.query(
      `SELECT COUNT(*) as total_metas FROM evidencias WHERE envio_id = $1`,
      [envio_id]
    );

    const totalMetas = parseInt(metasCheck.rows[0].total_metas);

    // ============================================
    // 4. ELIMINAR EVIDENCIAS Y ENVÍO
    // ============================================
    await db.query('DELETE FROM evidencias WHERE envio_id = $1', [envio_id]);
    await db.query('DELETE FROM envios_trimestre WHERE id = $1', [envio_id]);

    // ============================================
    // 5. RESPUESTA EXITOSA
    // ============================================
    return NextResponse.json({
      success: true,
      mensaje: 'Envío eliminado exitosamente. Ahora puedes volver a enviar tus evidencias.',
      metas_eliminadas: totalMetas,
      puede_reenviar: true
    });

  } catch (error) {
    console.error("Error al eliminar envío:", error);
    return NextResponse.json({ 
      error: "Error al procesar la solicitud",
      detalles: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET - Verificar si puede eliminar el envío
 */
export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trimestre = searchParams.get('trimestre');
    const area_id = searchParams.get('area_id');

    if (!trimestre || !area_id) {
      return NextResponse.json({ 
        error: 'Parámetros requeridos: trimestre, area_id' 
      }, { status: 400 });
    }

    const anioActual = new Date().getFullYear();

    // Verificar si existe envío
    const envioCheck = await db.query(
      `SELECT id FROM envios_trimestre 
       WHERE usuario_id = $1 AND area_id = $2 AND trimestre = $3 AND anio = $4`,
      [userId, area_id, trimestre, anioActual]
    );

    if (envioCheck.rows.length === 0) {
      return NextResponse.json({
        puede_eliminar: false,
        motivo: 'No hay envío para eliminar'
      });
    }

    const envio_id = envioCheck.rows[0].id;

    // Verificar calificaciones
    const calificacionesCheck = await db.query(
      `SELECT COUNT(*) as total_calificadas
       FROM evidencias
       WHERE envio_id = $1 
       AND estado IN ('aprobado', 'rechazado')`,
      [envio_id]
    );

    const totalCalificadas = parseInt(calificacionesCheck.rows[0].total_calificadas);

    return NextResponse.json({
      puede_eliminar: totalCalificadas === 0,
      total_calificadas: totalCalificadas,
      motivo: totalCalificadas > 0 
        ? `El administrador ya ha calificado ${totalCalificadas} meta(s)`
        : 'Puedes eliminar este envío y volver a enviar'
    });

  } catch (error) {
    console.error("Error al verificar envío:", error);
    return NextResponse.json({ 
      error: "Error al procesar la solicitud"
    }, { status: 500 });
  }
}
