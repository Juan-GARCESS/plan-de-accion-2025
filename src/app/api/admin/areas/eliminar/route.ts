import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request: NextRequest) {
  try {
    const { area_id, id } = await request.json();
    const areaId = area_id || id; // Acepta ambos nombres

    if (!areaId) {
      return NextResponse.json(
        { error: "ID del área es requerido" },
        { status: 400 }
      );
    }

    // Verificar si es el área "admin" y protegerla
    const areaInfoResult = await db.query(
      "SELECT nombre_area FROM areas WHERE id = $1",
      [areaId]
    );

    if (areaInfoResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Área no encontrada" },
        { status: 404 }
      );
    }

    if (areaInfoResult.rows[0].nombre_area.toLowerCase() === 'admin') {
      return NextResponse.json(
        { error: "No se puede eliminar el área 'admin'" },
        { status: 403 }
      );
    }

    // Verificar si hay usuarios asignados a esta área
    const usersInAreaResult = await db.query(
      "SELECT COUNT(*) as count FROM usuarios WHERE area_id = $1",
      [areaId]
    );

    const userCount = parseInt(usersInAreaResult.rows[0].count, 10);

    if (userCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el área porque tiene ${userCount} usuario(s) asignado(s)` },
        { status: 400 }
      );
    }

    // Verificar si hay informes asociados a esta área
    const informesInAreaResult = await db.query(
      "SELECT COUNT(*) as count FROM informes WHERE area_id = $1",
      [areaId]
    );

    const informeCount = parseInt(informesInAreaResult.rows[0].count, 10);

    if (informeCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el área porque tiene ${informeCount} informe(s) asociado(s)` },
        { status: 400 }
      );
    }

    // Eliminar el área
    await db.query("DELETE FROM areas WHERE id = $1", [areaId]);

    return NextResponse.json({ message: "Área eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar área:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}