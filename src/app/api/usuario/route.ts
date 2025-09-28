import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

interface UsuarioRow extends RowDataPacket {
  id: number;
  nombre: string;
  email: string;
  estado: string;
  area_id: number | null;
}

interface AreaRow extends RowDataPacket {
  nombre: string;
}

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies: Record<string, string> = {};
    cookieHeader.split(";").forEach((pair) => {
      const [key, value] = pair.trim().split("=");
      if (key && value !== undefined) cookies[key] = decodeURIComponent(value);
    });

    const userId = cookies["userId"] ? parseInt(cookies["userId"], 10) : null;

    if (!userId) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const [rows] = await db.query<UsuarioRow[]>(
      "SELECT id, nombre, email, estado, area_id FROM usuarios WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const usuario = rows[0];

    let area: string | null = null;
    if (usuario.area_id) {
      const [areas] = await db.query<AreaRow[]>(
        "SELECT nombre FROM areas WHERE id = ?",
        [usuario.area_id]
      );
      area = areas?.[0]?.nombre ?? null;
    }

    return NextResponse.json(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        estado: usuario.estado,
        area,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en /api/usuario:", error);
    return NextResponse.json({ message: "Error al obtener usuario" }, { status: 500 });
  }
}
