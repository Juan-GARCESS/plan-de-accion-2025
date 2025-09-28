import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ResultSetHeader } from "mysql2";

export async function PATCH(req: Request) {
  try {
    const { areaId, nombre_area, descripcion } = await req.json();

    if (!areaId || !nombre_area) {
      return NextResponse.json(
        { message: "ID de área y nombre son requeridos" },
        { status: 400 }
      );
    }

    const [result] = await db.query<ResultSetHeader>(
      "UPDATE areas SET nombre_area = ?, descripcion = ? WHERE id = ?",
      [nombre_area, descripcion || null, areaId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Área no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Área actualizada correctamente" }, { status: 200 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error editar área:", error);
    return NextResponse.json(
      { message: "Error al editar área", error: errMsg },
      { status: 500 }
    );
  }
}

