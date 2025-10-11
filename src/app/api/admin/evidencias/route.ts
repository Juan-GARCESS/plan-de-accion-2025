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
        um.id,
        um.plan_accion_id as meta_id,
        u.nombre as usuario_nombre,
        a.nombre_area as area_nombre,
        um.trimestre,
        pa.meta,
        pa.indicador,
        pa.accion,
        pa.presupuesto,
        um.evidencia_texto,
        um.evidencia_url,
        um.calificacion,
        um.estado as estado_calificacion,
        um.observaciones as comentario_admin,
        um.evidencia_texto as nombre_archivo,
        um.fecha_envio as fecha_subida
      FROM usuario_metas um
      JOIN usuarios u ON um.usuario_id = u.id
      JOIN plan_accion pa ON um.plan_accion_id = pa.id
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
      query += ` AND um.trimestre = $${paramCount}`;
      params.push(parseInt(trimestre));
      paramCount++;
    }

    query += ` ORDER BY um.fecha_envio DESC`;

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
      `UPDATE usuario_metas 
       SET estado = $1, 
           observaciones = $2, 
           calificacion = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [estado, observaciones || null, calificacion || null, evidencia_id]
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
