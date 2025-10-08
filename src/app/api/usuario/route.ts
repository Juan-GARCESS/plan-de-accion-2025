import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const result = await db.query(
      "SELECT id, nombre, email, estado, area_id FROM usuarios WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const usuario = result.rows[0];

    let area: string | null = null;
    if (usuario.area_id) {
      const areaResult = await db.query(
        "SELECT nombre_area FROM areas WHERE id = $1",
        [usuario.area_id]
      );
      area = areaResult.rows?.[0]?.nombre_area ?? null;
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
