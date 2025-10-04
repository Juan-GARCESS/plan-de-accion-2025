import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function PUT(request: NextRequest) {
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

    const { user_id, nombre, email, password, area_id } = await request.json();

    if (!user_id || !nombre || !email) {
      return NextResponse.json(
        { error: "ID de usuario, nombre y email son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const [existingUser] = await db.query<RowDataPacket[]>(
      "SELECT id FROM usuarios WHERE id = ?",
      [user_id]
    );

    if (!existingUser || existingUser.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el email ya existe en otro usuario
    const [emailCheck] = await db.query<RowDataPacket[]>(
      "SELECT id FROM usuarios WHERE email = ? AND id != ?",
      [email, user_id]
    );

    if (emailCheck && emailCheck.length > 0) {
      return NextResponse.json(
        { error: "Este email ya está en uso por otro usuario" },
        { status: 400 }
      );
    }

    // Preparar la consulta de actualización
    let query = "UPDATE usuarios SET nombre = ?, email = ?, area_id = ?, updated_at = NOW() WHERE id = ?";
    let params = [nombre, email, area_id || null, user_id];

    // Si se proporciona una nueva contraseña, la encriptamos
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = "UPDATE usuarios SET nombre = ?, email = ?, password = ?, area_id = ?, updated_at = NOW() WHERE id = ?";
      params = [nombre, email, hashedPassword, area_id || null, user_id];
    }

    await db.execute(query, params);

    return NextResponse.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}