import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { email, password, nombre, area_solicitada } = await req.json();

    if (!email || !password || !nombre || !area_solicitada) {
      return NextResponse.json(
        { message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );
    if (rows.length > 0) {
      return NextResponse.json(
        { message: "El usuario ya existe" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO usuarios (email, password, nombre, area_solicitada, rol, estado) VALUES (?, ?, ?, ?, 'usuario', 'pendiente')",
      [email, hashedPassword, nombre, area_solicitada]
    );

    return NextResponse.json(
      { message: "Usuario registrado, esperando aprobación del admin", userId: result.insertId },
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
