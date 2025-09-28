import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const { id, area_id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    if (!area_id) return NextResponse.json({ error: "Área requerida para aprobar" }, { status: 400 });

    // Actualizar estado a 'activo' y asignar el área
    await db.query(
      "UPDATE usuarios SET estado = 'activo', area_id = ? WHERE id = ?",
      [area_id, id]
    );

    return NextResponse.json({ message: "Usuario aprobado correctamente" });
  } catch (error) {
    console.error("Error al aprobar usuario:", error);
    return NextResponse.json({ error: "Error al aprobar usuario" }, { status: 500 });
  }
}
