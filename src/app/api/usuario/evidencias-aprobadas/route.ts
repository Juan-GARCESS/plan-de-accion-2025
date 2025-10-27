// src/app/api/usuario/evidencias-aprobadas/route.ts
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

    // Obtener área del usuario
    const userCheck = await db.query(
      "SELECT area_id FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [userId]
    );

    if (userCheck.rows.length === 0 || !userCheck.rows[0].area_id) {
      return NextResponse.json({ error: "Usuario sin área asignada" }, { status: 403 });
    }

    const areaId = userCheck.rows[0].area_id;

    // Obtener parámetro de área (opcional, para validar)
    const { searchParams } = new URL(request.url);
    const requestedAreaId = searchParams.get('areaId');

    // Validar que el usuario solo pueda ver evidencias de su propia área
    if (requestedAreaId && parseInt(requestedAreaId) !== areaId) {
      return NextResponse.json({ error: "No autorizado para ver esta área" }, { status: 403 });
    }

    // Query para obtener evidencias aprobadas del área del usuario
    const query = `
      SELECT 
        e.id,
        e.meta_id,
        pa.meta,
        pa.indicador,
        pa.accion,
        pa.presupuesto,
        ej.nombre_eje as eje,
        se.nombre_sub_eje as sub_eje,
        e.trimestre,
        e.anio,
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
        admin.nombre as revisado_por_nombre,
        a.nombre_area
      FROM evidencias e
      JOIN usuarios u ON e.usuario_id = u.id
      JOIN plan_accion pa ON e.meta_id = pa.id
      JOIN areas a ON u.area_id = a.id
      LEFT JOIN ejes ej ON pa.eje_id = ej.id
      LEFT JOIN sub_ejes se ON pa.sub_eje_id = se.id
      LEFT JOIN usuarios admin ON e.revisado_por = admin.id
      WHERE e.estado = 'aprobado' AND u.area_id = $1
      ORDER BY e.trimestre ASC, e.fecha_revision DESC
    `;

    const result = await db.query(query, [areaId]);

    return NextResponse.json({ 
      evidencias: result.rows,
      areaNombre: result.rows[0]?.nombre_area || 'Mi Área'
    });
  } catch (error) {
    console.error("Error al obtener evidencias aprobadas:", error);
    return NextResponse.json({ 
      error: "Error al obtener evidencias aprobadas" 
    }, { status: 500 });
  }
}
