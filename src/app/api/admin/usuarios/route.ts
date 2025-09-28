import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [usuarios] = await db.query(
      "SELECT id, email, password, nombre, area_solicitada, area_id, rol, estado FROM usuarios ORDER BY estado DESC, created_at DESC"
    );
    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}
