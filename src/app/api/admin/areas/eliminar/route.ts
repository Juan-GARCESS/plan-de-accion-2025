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
    const [areaInfo] = await db.execute(
      "SELECT nombre_area FROM areas WHERE id = ?",
      [areaId]
    );

    const areaData = areaInfo as { nombre_area: string }[];

    if (areaData.length === 0) {
      return NextResponse.json(
        { error: "Área no encontrada" },
        { status: 404 }
      );
    }

    if (areaData[0].nombre_area.toLowerCase() === 'admin') {
      return NextResponse.json(
        { error: "No se puede eliminar el área 'admin'" },
        { status: 403 }
      );
    }

    // Verificar si hay usuarios asignados a esta área
    const [usersInArea] = await db.execute(
      "SELECT COUNT(*) as count FROM usuarios WHERE area_id = ?",
      [areaId]
    );

    const userCount = usersInArea as { count: number }[];

    if (userCount[0].count > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el área porque tiene ${userCount[0].count} usuario(s) asignado(s)` },
        { status: 400 }
      );
    }

    // Verificar si hay informes asociados a esta área
    const [informesInArea] = await db.execute(
      "SELECT COUNT(*) as count FROM informes WHERE area_id = ?",
      [areaId]
    );

    const informeCount = informesInArea as { count: number }[];

    if (informeCount[0].count > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el área porque tiene ${informeCount[0].count} informe(s) asociado(s)` },
        { status: 400 }
      );
    }

    // Eliminar el área
    await db.execute("DELETE FROM areas WHERE id = ?", [areaId]);

    return NextResponse.json({ message: "Área eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar área:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}