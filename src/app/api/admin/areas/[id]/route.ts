import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const [admin] = await db.query<(RowDataPacket & {
      rol: string;
    })[]>(
      "SELECT rol FROM usuarios WHERE id = ? AND estado = 'activo'",
      [userId]
    );

    if (!admin || admin.length === 0 || admin[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const areaId = parseInt(id, 10);

    // Obtener información del área
    const [area] = await db.query<(RowDataPacket & {
      id: number;
      nombre_area: string;
      descripcion: string;
    })[]>(
      "SELECT id, nombre_area, descripcion FROM areas WHERE id = ?",
      [areaId]
    );

    if (!area || area.length === 0) {
      return NextResponse.json({ error: "Área no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ area: area[0] });
  } catch (err) {
    console.error("Error al obtener área:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}