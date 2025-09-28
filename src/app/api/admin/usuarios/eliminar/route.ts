import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "ID del usuario es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const [user] = await db.execute(
      "SELECT id, rol FROM usuarios WHERE id = ?",
      [id]
    );

    if (!Array.isArray(user) || user.length === 0) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Evitar que se elimine a sí mismo o eliminar el único admin
    const userData = user[0] as { id: number; rol: string };
    if (userData.rol === 'admin') {
      const [adminCount] = await db.execute(
        "SELECT COUNT(*) as count FROM usuarios WHERE rol = 'admin'"
      );
      const adminCountData = adminCount as { count: number }[];
      
      if (adminCountData[0].count <= 1) {
        return NextResponse.json(
          { message: "No se puede eliminar el único administrador del sistema" },
          { status: 400 }
        );
      }
    }

    // Eliminar el usuario (las relaciones con informes se eliminan por CASCADE)
    await db.execute("DELETE FROM usuarios WHERE id = ?", [id]);

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}