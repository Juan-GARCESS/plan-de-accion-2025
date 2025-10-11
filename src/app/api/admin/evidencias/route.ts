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

    // Construir query con filtros opcionales
    let query = `
      SELECT 
        um.id,
        um.id as meta_id,
        u.nombre as usuario_nombre,
        a.nombre_area as area_nombre,
        um.trimestre,
        um.meta,
        um.indicador,
        um.accion,
        um.presupuesto,
        um.evidencia_url,
        um.calificacion,
        um.estado_calificacion,
        um.comentario_admin,
        um.created_at as fecha_subida
      FROM usuario_metas um
      JOIN usuarios u ON um.usuario_id = u.id
      JOIN areas a ON u.area_id = a.id
      WHERE um.evidencia_url IS NOT NULL
    `;

    const params: (string | number)[] = [];
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

    query += ` ORDER BY um.created_at DESC`;

    const result = await db.query(query, params);

    // Agregar nombre_archivo desde evidencia_url
    const evidencias = result.rows.map(row => ({
      ...row,
      nombre_archivo: row.evidencia_url ? 'evidencia.pdf' : null
    }));

    return NextResponse.json({ 
      evidencias
    });
  } catch (error) {
    console.error("Error al obtener evidencias:", error);
    return NextResponse.json({ 
      error: "Error al obtener evidencias" 
    }, { status: 500 });
  }
}
