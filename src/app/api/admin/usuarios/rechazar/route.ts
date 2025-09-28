import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });

    await db.query("UPDATE usuarios SET estado = 'rechazado' WHERE id = ?", [id]);
    return NextResponse.json({ message: "Usuario rechazado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al rechazar usuario" }, { status: 500 });
  }
}

