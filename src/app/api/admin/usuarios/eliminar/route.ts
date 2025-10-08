import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request: NextRequest) {
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
      return NextResponse.json(
        { error: "ID del usuario es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const userResult = await db.query(
      "SELECT id, rol FROM usuarios WHERE id = $1",
      [user_id]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userData = userResult.rows[0];

    // Evitar que se elimine el admin actual
    if (userData.id === adminUserId) {
      return NextResponse.json(
        { error: "No puedes eliminarte a ti mismo" },
        { status: 400 }
      );
    }

    // Evitar eliminar el único admin
    if (userData.rol === 'admin') {
      const adminCountResult = await db.query(
        "SELECT COUNT(*) as count FROM usuarios WHERE rol = 'admin'"
      );
      
      const adminCountData = parseInt(adminCountResult.rows[0].count, 10);
      
      if (adminCountData <= 1) {
        return NextResponse.json(
          { error: "No se puede eliminar el único administrador del sistema" },
          { status: 400 }
        );
      }
    }

    // Eliminar el usuario (las relaciones con informes se eliminan por CASCADE)
    await db.query("DELETE FROM usuarios WHERE id = $1", [user_id]);

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}