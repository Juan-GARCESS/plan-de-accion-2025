import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

// Función para generar contraseña aleatoria
function generateRandomPassword(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
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

    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "ID del usuario es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const userResult = await db.query(
      "SELECT id, nombre, email FROM usuarios WHERE id = $1",
      [user_id]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Generar nueva contraseña
    const newPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos
    await db.query(
      "UPDATE usuarios SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [hashedPassword, user_id]
    );

    return NextResponse.json({ 
      message: "Contraseña generada correctamente",
      password: newPassword,
      user: userResult.rows[0]
    });
  } catch (error) {
    console.error("Error al generar contraseña:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}