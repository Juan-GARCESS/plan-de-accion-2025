import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { nombre_area, descripcion } = await req.json();

    if (!nombre_area) {
      return NextResponse.json({ message: "Nombre de área requerido" }, { status: 400 });
    }

    const result = await db.query(
      "INSERT INTO areas (nombre_area, descripcion) VALUES ($1, $2) RETURNING id",
      [nombre_area, descripcion || null]
    );

    return NextResponse.json({ message: "Área creada", areaId: result.rows[0].id }, { status: 201 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error crear área:", error);
    return NextResponse.json({ message: "Error al crear área", error: errMsg }, { status: 500 });
  }
}
