import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { nombre_area, descripcion } = await req.json();

    if (!nombre_area) {
      return NextResponse.json({ message: "Nombre de área requerido" }, { status: 400 });
    }

    const resultResult = await db.query(
      "INSERT INTO areas (nombre_area, descripcion) VALUES (?, ?)",
      [nombre_area, descripcion || null]
    );

    return NextResponse.json({ message: "Área creada", areaId: result.insertId }, { status: 201 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error crear área:", error);
    return NextResponse.json({ message: "Error al crear área", error: errMsg }, { status: 500 });
  }
}
