// src/app/api/me/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie"); // Leer cookies
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) return NextResponse.json({ error: "No logueado" }, { status: 401 });

    const result = await db.query(
      "SELECT id, nombre, email, estado, area_id, rol, foto_url FROM usuarios WHERE id = $1",
      [userId]
    );

    if (!result.rows || result.rows.length === 0 || result.rows[0].estado !== "activo") {
      return NextResponse.json({ error: "Usuario no activo" }, { status: 401 });
    }

    const usuario = result.rows[0];

    // Traer nombre del área si existe
    let area: string | null = null;
    if (usuario.area_id) {
      const areaResult = await db.query(
        "SELECT nombre_area FROM areas WHERE id = $1",
        [usuario.area_id]
      );
      area = areaResult.rows[0]?.nombre_area ?? null;
    }

    return NextResponse.json({ usuario, area });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
