import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Validación robusta de contraseña
function validatePassword(password: string): string | null {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe contener al menos una letra mayúscula';
  if (!/[a-z]/.test(password)) return 'La contraseña debe contener al menos una letra minúscula';
  if (!/[0-9]/.test(password)) return 'La contraseña debe contener al menos un número';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'La contraseña debe contener al menos un símbolo (!@#$%^&*...)';
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { email, password, nombre, area_solicitada } = await req.json();

    if (!email || !password || !nombre || !area_solicitada) {
      return NextResponse.json(
        { message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar fortaleza de contraseña
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json(
        { message: passwordError },
        { status: 400 }
      );
    }

    const result = await db.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );
    if (result.rows.length > 0) {
      return NextResponse.json(
        { message: "El usuario ya existe" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await db.query(
      "INSERT INTO usuarios (email, password, nombre, area_solicitada, rol, estado) VALUES ($1, $2, $3, $4, 'usuario', 'pendiente') RETURNING id",
      [email, hashedPassword, nombre, area_solicitada]
    );

    return NextResponse.json(
      { message: "Usuario registrado, esperando aprobación del admin", userId: insertResult.rows[0].id },
      { status: 201 }
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Registro error:", error);
    return NextResponse.json(
      { message: "Error en el registro", error: errMsg },
      { status: 500 }
    );
  }
}
