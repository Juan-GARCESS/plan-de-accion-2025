import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, email, password, rol, estado, area_id, area_solicitada, nombre FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const user = rows[0];

    if (user.estado === "pendiente") {
      return NextResponse.json({ message: "Cuenta pendiente de aprobación" }, { status: 403 });
    }
    if (user.estado === "rechazado") {
      return NextResponse.json({ message: "Cuenta rechazada, contacte al admin" }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Contraseña incorrecta" }, { status: 401 });
    }

    const res = NextResponse.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        area_id: user.area_id,
        area_solicitada: user.area_solicitada,
      },
    });

    res.cookies.set("userId", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // maxAge: 60 * 60 * 24 // opcional: 1 día
    });

    return res;

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Error en el login", error: errMsg },
      { status: 500 }
    );
  }
}
