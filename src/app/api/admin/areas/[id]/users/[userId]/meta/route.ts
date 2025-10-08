import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// API para asignar metas a usuarios que participan en trimestres
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const { id: areaId, userId } = await params;
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const adminId = match ? parseInt(match[1], 10) : null;

    if (!adminId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [adminId]
    );

    if (!adminResult.rows || adminResult.rows.length === 0 || adminResult.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { trimestre, meta } = await request.json();

    if (!trimestre || !meta || meta.trim().length === 0) {
      return NextResponse.json({ 
        error: "Trimestre y meta son requeridos" 
      }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();
    const areaIdNum = parseInt(areaId, 10);
    const userIdNum = parseInt(userId, 10);

    // Verificar que el usuario existe y está en el área correcta
    const userResult = await db.query(
      "SELECT id, area_id, nombre FROM usuarios WHERE id = $1 AND area_id = $2 AND rol = 'usuario' AND estado = 'activo'",
      [userIdNum, areaIdNum]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json({ 
        error: "Usuario no encontrado o no pertenece al área" 
      }, { status: 404 });
    }

    // Verificar que el usuario está participando en este trimestre (desde selecciones_trimestre)
    const seleccionResult = await db.query(
      "SELECT participando FROM selecciones_trimestre WHERE usuario_id = $1 AND trimestre = $2 AND año = $3",
      [userIdNum, trimestre, currentYear]
    );

    if (!seleccionResult.rows || seleccionResult.rows.length === 0 || !seleccionResult.rows[0].participando) {
      return NextResponse.json({ 
        error: "El usuario no está participando en este trimestre" 
      }, { status: 400 });
    }

    // Verificar si ya existe un informe para este trimestre, si no, crearlo
    const informeResult = await db.query(
      "SELECT id, estado FROM informes WHERE usuario_id = $1 AND area_id = $2 AND trimestre = $3 AND año = $4",
      [userIdNum, areaIdNum, trimestre, currentYear]
    );

    let informeId: number;

    if (!informeResult.rows || informeResult.rows.length === 0) {
      // Crear nuevo informe si no existe
      const result = await db.query(
        `INSERT INTO informes (usuario_id, area_id, trimestre, año, estado, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, 'esperando_meta', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`,
        [userIdNum, areaIdNum, trimestre, currentYear]
      );
      informeId = result.rows[0].id;
    } else {
      informeId = informeResult.rows[0].id;
    }

    // Actualizar la meta
    await db.query(
      `UPDATE informes 
       SET meta_trimestral = $1, estado = 'meta_asignada', fecha_meta_creada = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [meta.trim(), informeId]
    );

    return NextResponse.json({ 
      message: "Meta asignada correctamente",
      success: true 
    });

  } catch (error) {
    console.error("Error al asignar meta:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}