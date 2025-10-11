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

    // Obtener todas las evidencias con información de usuario y meta
    const result = await db.query(`
      SELECT 
        e.id,
        e.meta_id,
        e.nombre_archivo,
        e.created_at as fecha_subida,
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
        um.comentario_admin
      FROM evidencias e
      JOIN usuario_metas um ON e.meta_id = um.id
      JOIN usuarios u ON e.usuario_id = u.id
      JOIN areas a ON um.area_id = a.id
      ORDER BY e.created_at DESC
    `);

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
