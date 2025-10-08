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

    const { user_id } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    // Verificar que el usuario existe
    const userResult = await db.query(
      "SELECT id FROM usuarios WHERE id = $1",
      [user_id]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await db.query(
      "UPDATE usuarios SET estado = 'rechazado', updated_at = CURRENT_TIMESTAMP WHERE id = $1", 
      [user_id]
    );
    
    return NextResponse.json({ message: "Usuario rechazado correctamente" });
  } catch (error) {
    console.error("Error al rechazar usuario:", error);
    return NextResponse.json({ error: "Error al rechazar usuario" }, { status: 500 });
  }
}

