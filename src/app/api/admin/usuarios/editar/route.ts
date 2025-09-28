import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const { id, nombre, email, password, area_id } = await request.json();

    if (!id || !nombre || !email) {
      return NextResponse.json(
        { message: "ID, nombre y email son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe en otro usuario
    const [existingUser] = await db.execute(
      "SELECT id FROM usuarios WHERE email = ? AND id != ?",
      [email, id]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { message: "Este email ya está en uso por otro usuario" },
        { status: 400 }
      );
    }

    // Preparar la consulta de actualización
    let query = "UPDATE usuarios SET nombre = ?, email = ?, area_id = ?, updated_at = NOW() WHERE id = ?";
    let params = [nombre, email, area_id || null, id];

    // Si se proporciona una nueva contraseña, la encriptamos
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = "UPDATE usuarios SET nombre = ?, email = ?, password = ?, area_id = ?, updated_at = NOW() WHERE id = ?";
      params = [nombre, email, hashedPassword, area_id || null, id];
    }

    await db.execute(query, params);

    return NextResponse.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}