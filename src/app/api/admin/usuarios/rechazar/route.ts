import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const adminUserId = match ? parseInt(match[1], 10) : null;

    if (!adminUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const [admin] = await db.query<(RowDataPacket & {
      rol: string;
    })[]>(
      "SELECT rol FROM usuarios WHERE id = ? AND estado = 'activo'",
      [adminUserId]
    );

    if (!admin || admin.length === 0 || admin[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { user_id } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    // Verificar que el usuario existe
    const [user] = await db.query<RowDataPacket[]>(
      "SELECT id FROM usuarios WHERE id = ?",
      [user_id]
    );

    if (!user || user.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await db.execute(
      "UPDATE usuarios SET estado = 'rechazado', updated_at = NOW() WHERE id = ?", 
      [user_id]
    );
    
    return NextResponse.json({ message: "Usuario rechazado correctamente" });
  } catch (error) {
    console.error("Error al rechazar usuario:", error);
    return NextResponse.json({ error: "Error al rechazar usuario" }, { status: 500 });
  }
}

