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

    // Construir query dinámica
    let query = `
      SELECT 
        e.id,
        e.meta_id,
        u.nombre as usuario_nombre,
        a.nombre_area as area_nombre,
        e.trimestre,
        e.anio,
        pa.meta,
        pa.indicador,
        pa.accion,
        pa.presupuesto,
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
      JOIN areas a ON u.area_id = a.id
      WHERE 1=1
    `;

    const params: (number)[] = [];
    let paramCount = 1;

    if (areaId) {
      query += ` AND u.area_id = $${paramCount}`;
      params.push(parseInt(areaId));
      paramCount++;
    }

    if (trimestre) {
      query += ` AND e.trimestre = $${paramCount}`;
      params.push(parseInt(trimestre));
      paramCount++;
    }

    query += ` ORDER BY e.fecha_envio DESC`;

    const result = await db.query(query, params);

    return NextResponse.json({ 
      evidencias: result.rows
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
