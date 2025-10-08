import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [userId]
    );

    if (!adminResult.rows || adminResult.rows.length === 0 || adminResult.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Obtener estadísticas de trimestres
    const estadisticasResult = await db.query(`
      SELECT 
        ce.trimestre,
        ce.año,
        ce.fecha_inicio,
        ce.fecha_fin,
        COALESCE(COUNT(DISTINCT u.id), 0) as total_usuarios,
        COALESCE(SUM(CASE WHEN i.meta_trimestral IS NOT NULL THEN 1 ELSE 0 END), 0) as metas_creadas,
        COALESCE(SUM(CASE WHEN i.archivo IS NOT NULL THEN 1 ELSE 0 END), 0) as informes_subidos,
        COALESCE(SUM(CASE WHEN i.estado = 'pendiente' THEN 1 ELSE 0 END), 0) as informes_pendientes,
        COALESCE(SUM(CASE WHEN i.estado = 'aceptado' THEN 1 ELSE 0 END), 0) as informes_aceptados,
        COALESCE(SUM(CASE WHEN i.estado = 'rechazado' THEN 1 ELSE 0 END), 0) as informes_rechazados
      FROM config_envios ce
      LEFT JOIN usuarios u ON u.rol = 'usuario' AND u.estado = 'activo' AND u.area_id IS NOT NULL
      LEFT JOIN informes i ON i.usuario_id = u.id AND i.trimestre = ce.trimestre AND i.año = ce.año
      WHERE ce.año = $1
      GROUP BY ce.trimestre, ce.año, ce.fecha_inicio, ce.fecha_fin
      ORDER BY ce.trimestre
    `, [currentYear]);

    return NextResponse.json({ 
      estadisticas: estadisticasResult.rows || []
    });
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}