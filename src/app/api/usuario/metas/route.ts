import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener información del usuario
    const userResult = await db.query(
      "SELECT id, area_id, nombre, estado FROM usuarios WHERE id = $1 AND rol = 'usuario'",
      [userId]
    );
    
    if (!userResult.rows || userResult.rows.length === 0 || userResult.rows[0].estado !== 'activo' || !userResult.rows[0].area_id) {
      return NextResponse.json({ 
        message: "Usuario no válido, no activo o sin área asignada" 
      }, { status: 400 });
    }

    const currentUser = userResult.rows[0];
    const currentYear = new Date().getFullYear();

    // Obtener todas las metas e informes del usuario para el año actual
    const informesResult = await db.query(
      `SELECT i.id, i.trimestre, i.año, i.meta_trimestral, i.archivo, i.estado, 
              i.comentario_admin, i.calificacion, i.fecha_meta_creada, i.fecha_archivo_subido,
              ce.fecha_inicio, ce.fecha_fin, ce.abierto, ce.habilitado_manualmente,
              ce.dias_habilitados, ce.fecha_habilitacion_manual
       FROM informes i
       LEFT JOIN config_envios ce ON i.trimestre = ce.trimestre AND i.año = ce.año
       WHERE i.usuario_id = $1 AND i.area_id = $2 AND i.año = $3
       ORDER BY i.trimestre`,
      [userId, currentUser.area_id, currentYear]
    );

    return NextResponse.json({
      usuario: currentUser,
      informes: informesResult.rows,
      año_actual: currentYear
    });
  } catch (error) {
    console.error("Error al obtener metas:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación usando el mismo sistema que /api/me
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const { trimestre, año, meta_trimestral } = await request.json();

    if (!trimestre || !año || !meta_trimestral) {
      return NextResponse.json(
        { message: "Trimestre, año y meta son requeridos" },
        { status: 400 }
      );
    }

    // Obtener información del usuario
    const userResult = await db.query(
      "SELECT area_id FROM usuarios WHERE id = $1 AND rol = 'usuario'",
      [userId]
    );

    if (!userResult.rows || userResult.rows.length === 0 || !userResult.rows[0].area_id) {
      return NextResponse.json(
        { message: "Usuario no válido o sin área asignada" },
        { status: 400 }
      );
    }

    const areaId = userResult.rows[0].area_id;

    // Verificar si ya existe un informe para este trimestre
    const existingResult = await db.query(
      "SELECT id FROM informes WHERE usuario_id = $1 AND area_id = $2 AND trimestre = $3 AND año = $4",
      [userId, areaId, trimestre, año]
    );

    if (existingResult.rows && existingResult.rows.length > 0) {
      // Actualizar meta existente
      await db.query(
        "UPDATE informes SET meta_trimestral = $1, fecha_meta_creada = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [meta_trimestral, existingResult.rows[0].id]
      );
    } else {
      // Crear nuevo informe con meta
      await db.query(
        "INSERT INTO informes (usuario_id, area_id, trimestre, año, meta_trimestral, fecha_meta_creada, estado, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, 'planificando', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        [userId, areaId, trimestre, año, meta_trimestral]
      );
    }

    return NextResponse.json({ message: "Meta trimestral guardada correctamente" });
  } catch (error) {
    console.error("Error al guardar meta:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}