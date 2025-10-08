import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const adminUserId = match ? parseInt(match[1], 10) : null;

    if (!adminUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [adminUserId]
    );

    if (!adminResult.rows || adminResult.rows.length === 0 || adminResult.rows[0].rol !== 'admin') {
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
    const existingUserResult = await db.query(
      "SELECT id FROM usuarios WHERE id = $1",
      [user_id]
    );

    if (!existingUserResult.rows || existingUserResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el email ya existe en otro usuario
    const emailCheckResult = await db.query(
      "SELECT id FROM usuarios WHERE email = $1 AND id != $2",
      [email, user_id]
    );

    if (emailCheckResult.rows && emailCheckResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Este email ya está en uso por otro usuario" },
        { status: 400 }
      );
    }

    // Preparar la consulta de actualización
    let query = "UPDATE usuarios SET nombre = $1, email = $2, area_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4";
    let params = [nombre, email, area_id || null, user_id];

    // Si se proporciona una nueva contraseña, la encriptamos
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = "UPDATE usuarios SET nombre = $1, email = $2, password = $3, area_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5";
      params = [nombre, email, hashedPassword, area_id || null, user_id];
    }

    await db.query(query, params);

    return NextResponse.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}