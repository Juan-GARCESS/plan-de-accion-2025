import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const adminUserId = match ? parseInt(match[1], 10) : null;

    if (!adminUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = ? AND estado = 'activo'",
      [adminUserId]
    );

    if (!admin || admin.length === 0 || admin[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener todas las selecciones de trimestres de usuarios activos
    const seleccionesResult = await db.query(`
      SELECT 
        us.id as usuario_id,
        us.nombre as usuario_nombre,
        us.email as usuario_email,
        a.nombre_area as area_nombre,
        st.trimestre,
        st.año,
        st.participando,
        st.created_at as fecha_seleccion,
        st.updated_at as fecha_actualizacion
      FROM selecciones_trimestre st
      JOIN usuarios us ON st.usuario_id = us.id
      LEFT JOIN areas a ON us.area_id = a.id
      WHERE us.estado = 'activo'
        AND st.año = YEAR(NOW())
      ORDER BY 
        a.nombre_area ASC,
        us.nombre ASC,
        st.trimestre ASC
    `);

    // Agrupar las selecciones por área
    interface SeleccionTrimestre {
      usuario_id: number;
      usuario_nombre: string;
      usuario_email: string;
      trimestre: number;
      año: number;
      participando: boolean;
      fecha_seleccion: Date;
      fecha_actualizacion: Date;
    }
    
    const seleccionesPorArea: { [key: string]: SeleccionTrimestre[] } = {};
    
    selecciones.forEach((seleccion) => {
      const areaNombre = seleccion.area_nombre || 'Sin área asignada';
      
      if (!seleccionesPorArea[areaNombre]) {
        seleccionesPorArea[areaNombre] = [];
      }
      
      seleccionesPorArea[areaNombre].push({
        usuario_id: seleccion.usuario_id,
        usuario_nombre: seleccion.usuario_nombre,
        usuario_email: seleccion.usuario_email,
        trimestre: seleccion.trimestre,
        año: seleccion.año,
        participando: Boolean(seleccion.participando),
        fecha_seleccion: seleccion.fecha_seleccion,
        fecha_actualizacion: seleccion.fecha_actualizacion
      });
    });

    // Obtener estadísticas generales
    const estadisticasResult = await db.query(`
      SELECT 
        st.trimestre,
        COUNT(*) as total_selecciones,
        SUM(CASE WHEN st.participando = 1 THEN 1 ELSE 0 END) as participando,
        SUM(CASE WHEN st.participando = 0 THEN 1 ELSE 0 END) as no_participando
      FROM selecciones_trimestre st
      JOIN usuarios us ON st.usuario_id = us.id
      WHERE us.estado = 'activo'
        AND st.año = YEAR(NOW())
      GROUP BY st.trimestre
      ORDER BY st.trimestre
    `);

    return NextResponse.json({
      selecciones_por_area: seleccionesPorArea,
      estadisticas: estadisticas.map(stat => ({
        trimestre: stat.trimestre,
        total_selecciones: stat.total_selecciones,
        participando: stat.participando,
        no_participando: stat.no_participando
      })),
      año_actual: new Date().getFullYear()
    });

  } catch (error) {
    console.error("Error al obtener selecciones de trimestres:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}