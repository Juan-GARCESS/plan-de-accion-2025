import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function DELETE(request: NextRequest) {
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
      return NextResponse.json(
        { error: "ID del usuario es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const [user] = await db.query<RowDataPacket[]>(
      "SELECT id, rol FROM usuarios WHERE id = ?",
      [user_id]
    );

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userData = user[0] as { id: number; rol: string };

    // Evitar que se elimine el admin actual
    if (userData.id === adminUserId) {
      return NextResponse.json(
        { error: "No puedes eliminarte a ti mismo" },
        { status: 400 }
      );
    }

    // Evitar eliminar el único admin
    if (userData.rol === 'admin') {
      const [adminCount] = await db.query<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM usuarios WHERE rol = 'admin'"
      );
      const adminCountData = adminCount[0] as { count: number };
      
      if (adminCountData.count <= 1) {
        return NextResponse.json(
          { error: "No se puede eliminar el único administrador del sistema" },
          { status: 400 }
        );
      }
    }

    // Eliminar el usuario (las relaciones con informes se eliminan por CASCADE)
    await db.execute("DELETE FROM usuarios WHERE id = ?", [user_id]);

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}