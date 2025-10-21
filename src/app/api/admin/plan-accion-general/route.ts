// src/app/api/admin/plan-accion-general/route.ts
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

    // Obtener parámetros de filtro opcionales
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('areaId');
    const trimestre = searchParams.get('trimestre');
    const usuarioId = searchParams.get('usuarioId');
    const busqueda = searchParams.get('busqueda');

    // Query para obtener todas las evidencias aprobadas
    let query = `
      SELECT 
        e.id,
        e.meta_id,
        e.usuario_id,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        a.id as area_id,
        a.nombre_area,
        e.trimestre,
        e.anio,
        pa.meta,
        pa.indicador,
        pa.accion,
        pa.presupuesto,
        ej.nombre_eje as eje,
        se.nombre_sub_eje as sub_eje,
        e.descripcion,
        e.archivo_url,
        e.archivo_nombre,
        e.archivo_tipo,
        e.archivo_tamano,
        e.calificacion,
        e.estado,
        e.comentario_admin,
        e.fecha_envio,
        e.fecha_revision,
        admin.nombre as revisado_por_nombre
      FROM evidencias e
      JOIN usuarios u ON e.usuario_id = u.id
      JOIN plan_accion pa ON e.meta_id = pa.id
      JOIN areas a ON u.area_id = a.id
      LEFT JOIN ejes ej ON pa.eje_id = ej.id
      LEFT JOIN sub_ejes se ON pa.sub_eje_id = se.id
      LEFT JOIN usuarios admin ON e.revisado_por = admin.id
      WHERE e.estado = 'aprobado'
    `;

    const params: (number | string)[] = [];
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

    if (usuarioId) {
      query += ` AND e.usuario_id = $${paramCount}`;
      params.push(parseInt(usuarioId));
      paramCount++;
    }

    if (busqueda) {
      query += ` AND (
        LOWER(pa.meta) LIKE LOWER($${paramCount}) OR
        LOWER(pa.indicador) LIKE LOWER($${paramCount}) OR
        LOWER(u.nombre) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${busqueda}%`);
      paramCount++;
    }

    // Ordenar por calificación descendente y fecha de revisión
    query += ` ORDER BY e.calificacion DESC, e.fecha_revision DESC`;

    const result = await db.query(query, params);

    // Calcular estadísticas
    const stats = {
      total: result.rows.length,
      promedioCalificacion: result.rows.length > 0 
        ? Math.round(result.rows.reduce((sum, row) => sum + (row.calificacion || 0), 0) / result.rows.length)
        : 0,
      porArea: {} as Record<string, number>,
      porTrimestre: {} as Record<number, number>
    };

    result.rows.forEach(row => {
      // Contar por área
      if (!stats.porArea[row.nombre_area]) {
        stats.porArea[row.nombre_area] = 0;
      }
      stats.porArea[row.nombre_area]++;

      // Contar por trimestre
      if (!stats.porTrimestre[row.trimestre]) {
        stats.porTrimestre[row.trimestre] = 0;
      }
      stats.porTrimestre[row.trimestre]++;
    });

    return NextResponse.json({ 
      evidencias: result.rows,
      stats
    });
  } catch (error) {
    console.error("Error al obtener plan de acción general:", error);
    return NextResponse.json({ 
      error: "Error al obtener plan de acción general" 
    }, { status: 500 });
  }
}
