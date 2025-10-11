// src/app/api/admin/evidencias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminCheck = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [userId]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // TODO: Implementar sistema de evidencias
    // Por ahora devolver array vacío
    return NextResponse.json({ 
      evidencias: []
    });
  } catch (error) {
    console.error("Error al obtener evidencias:", error);
    return NextResponse.json({ 
      error: "Error al obtener evidencias" 
    }, { status: 500 });
  }
}
