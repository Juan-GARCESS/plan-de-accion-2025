import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const adminUserId = match ? parseInt(match[1], 10) : null;

    if (!adminUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [adminUserId]
    );

    if (!adminResult.rows || adminResult.rows.length === 0 || adminResult.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { user_id, area_id } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }
    if (!area_id) {
      return NextResponse.json({ error: "Área requerida para aprobar" }, { status: 400 });
    }

    // Verificar que el usuario existe y está pendiente
    const userResult = await db.query(
      "SELECT id, estado FROM usuarios WHERE id = $1",
      [user_id]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Verificar que el área existe
    const areaResult = await db.query(
      "SELECT id FROM areas WHERE id = $1",
      [area_id]
    );

    if (!areaResult.rows || areaResult.rows.length === 0) {
      return NextResponse.json({ error: "Área no encontrada" }, { status: 404 });
    }

    // Actualizar estado a 'activo' y asignar el área
    await db.query(
      "UPDATE usuarios SET estado = 'activo', area_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [area_id, user_id]
    );

    return NextResponse.json({ message: "Usuario aprobado correctamente" });
  } catch (error) {
    console.error("Error al aprobar usuario:", error);
    return NextResponse.json({ error: "Error al aprobar usuario" }, { status: 500 });
  }
}
