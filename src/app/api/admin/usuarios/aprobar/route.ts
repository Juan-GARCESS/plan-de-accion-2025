import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const adminUserId = match ? parseInt(match[1], 10) : null;

    if (!adminUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const [admin] = await db.query<(RowDataPacket & {
      rol: string;
    })[]>(
      "SELECT rol FROM usuarios WHERE id = ? AND estado = 'activo'",
      [adminUserId]
    );

    if (!admin || admin.length === 0 || admin[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { user_id, area_id } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }
    if (!area_id) {
      return NextResponse.json({ error: "Área requerida para aprobar" }, { status: 400 });
    }

    // Verificar que el usuario existe y está pendiente
    const [user] = await db.query<RowDataPacket[]>(
      "SELECT id, estado FROM usuarios WHERE id = ?",
      [user_id]
    );

    if (!user || user.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Verificar que el área existe
    const [area] = await db.query<RowDataPacket[]>(
      "SELECT id FROM areas WHERE id = ?",
      [area_id]
    );

    if (!area || area.length === 0) {
      return NextResponse.json({ error: "Área no encontrada" }, { status: 404 });
    }

    // Actualizar estado a 'activo' y asignar el área
    await db.execute(
      "UPDATE usuarios SET estado = 'activo', area_id = ?, updated_at = NOW() WHERE id = ?",
      [area_id, user_id]
    );

    return NextResponse.json({ message: "Usuario aprobado correctamente" });
  } catch (error) {
    console.error("Error al aprobar usuario:", error);
    return NextResponse.json({ error: "Error al aprobar usuario" }, { status: 500 });
  }
}
