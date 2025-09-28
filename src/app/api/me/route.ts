// src/app/api/me/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie"); // Leer cookies
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) return NextResponse.json({ error: "No logueado" }, { status: 401 });

    const [usuarios] = await db.query<(RowDataPacket & {
      id: number;
      nombre: string;
      email: string;
      area_id: number | null;
      estado: string;
      rol: string;
    })[]>(
      "SELECT id, nombre, email, estado, area_id, rol FROM usuarios WHERE id = ?",
      [userId]
    );

    if (!usuarios || usuarios.length === 0 || usuarios[0].estado !== "activo") {
      return NextResponse.json({ error: "Usuario no activo" }, { status: 401 });
    }

    const usuario = usuarios[0];

    // Traer nombre del área si existe
    let area: string | null = null;
    if (usuario.area_id) {
      const [areas] = await db.query<(RowDataPacket & { nombre_area: string })[]>(
        "SELECT nombre_area FROM areas WHERE id = ?",
        [usuario.area_id]
      );
      area = areas[0]?.nombre_area ?? null;
    }

    return NextResponse.json({ usuario, area });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
