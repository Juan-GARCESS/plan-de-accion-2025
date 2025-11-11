// src/app/api/admin/evidencias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminCheck = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [userId]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener parámetros de filtro
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('areaId');
    const trimestre = searchParams.get('trimestre');

    // ============================================
    // VERIFICAR SI EXISTE UN ENVÍO
    // ============================================
    if (areaId && trimestre) {
      const anioActual = new Date().getFullYear();
      
      const envioCheck = await db.query(
        `SELECT id, usuario_id, estado, fecha_envio
         FROM envios_trimestre
         WHERE area_id = $1 AND trimestre = $2 AND anio = $3`,
        [parseInt(areaId), parseInt(trimestre), anioActual]
      );

      if (envioCheck.rows.length === 0) {
        // NO HAY ENVÍO - devolver mensaje
        return NextResponse.json({ 
          sin_envio: true,
          mensaje: 'Aún no se ha enviado ninguna evidencia para este trimestre'
        });
      }
    }

    // ============================================
    // CONSTRUIR QUERY PARA EVIDENCIAS
    // ============================================
    let query = `
      SELECT 
        e.id,
        e.meta_id,
        e.usuario_id,
        u.nombre as usuario_nombre,
        a.id as area_id,
        a.nombre_area as area_nombre,
        e.trimestre,
        e.anio,
        e.envio_id,
        pa.meta,
        pa.indicador,
        pa.accion,
        pa.presupuesto,
        ej.nombre_eje as eje_nombre,
        se.nombre_sub_eje as sub_eje_nombre,
        e.descripcion,
        e.archivo_url,
        e.archivo_nombre,
        e.archivo_tipo,
        e.archivo_tamano,
        e.calificacion,
        e.estado,
        e.comentario_admin,
        e.fecha_envio,
        e.fecha_revision
      FROM evidencias e
      JOIN usuarios u ON e.usuario_id = u.id
      JOIN plan_accion pa ON e.meta_id = pa.id
      JOIN ejes ej ON pa.eje_id = ej.id
      LEFT JOIN sub_ejes se ON pa.sub_eje_id = se.id
      JOIN areas a ON pa.area_id = a.id
      WHERE e.envio_id IS NOT NULL
    `;

    const params: (number)[] = [];
    let paramCount = 1;

    if (areaId) {
      query += ` AND a.id = $${paramCount}`;
      params.push(parseInt(areaId));
      paramCount++;
    }

    if (trimestre) {
      query += ` AND e.trimestre = $${paramCount}`;
      params.push(parseInt(trimestre));
      paramCount++;
    }

    query += ` ORDER BY e.id DESC`;

    const result = await db.query(query, params);

    // ============================================
    // OBTENER CALIFICACIÓN DEL TRIMESTRE
    // ============================================
    let calificacionTrimestre = null;
    if (areaId && trimestre && result.rows.length > 0) {
      const anioActual = new Date().getFullYear();
      const usuarioId = result.rows[0].usuario_id;

      const calificacionResult = await db.query(
        `SELECT 
          calificacion_general,
          comentario_general,
          calcular_automatico,
          fecha_calificacion,
          calificado_por
         FROM calificaciones_trimestre
         WHERE area_id = $1 AND trimestre = $2 AND usuario_id = $3 AND anio = $4`,
        [parseInt(areaId), parseInt(trimestre), usuarioId, anioActual]
      );

      if (calificacionResult.rows.length > 0) {
        calificacionTrimestre = calificacionResult.rows[0];
      }
    }

    return NextResponse.json({ 
      evidencias: result.rows,
      sin_envio: false,
      calificacion_trimestre: calificacionTrimestre
    });
  } catch (error) {
    console.error("Error al obtener evidencias:", error);
    return NextResponse.json({ 
      error: "Error al obtener evidencias" 
    }, { status: 500 });
  }
}

// POST - Calificar evidencia
export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminCheck = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [userId]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { evidencia_id, estado, observaciones, calificacion } = body;

    if (!evidencia_id || !estado) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Actualizar evidencia
    const result = await db.query(
      `UPDATE evidencias 
       SET estado = $1, 
           comentario_admin = $2, 
           calificacion = $3,
           fecha_revision = CURRENT_TIMESTAMP,
           revisado_por = $5
       WHERE id = $4
       RETURNING *`,
      [estado, observaciones || null, calificacion || null, evidencia_id, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Evidencia no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      evidencia: result.rows[0] 
    });
  } catch (error) {
    console.error("Error al calificar evidencia:", error);
    return NextResponse.json({ 
      error: "Error al calificar evidencia" 
    }, { status: 500 });
  }
}
