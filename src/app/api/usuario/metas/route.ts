import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación usando el mismo sistema que /api/me
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const { trimestre, año, meta_trimestral } = await request.json();

    if (!trimestre || !año || !meta_trimestral) {
      return NextResponse.json(
        { message: "Trimestre, año y meta son requeridos" },
        { status: 400 }
      );
    }

    // Obtener información del usuario
    const [user] = await db.query(
      "SELECT area_id FROM usuarios WHERE id = ? AND rol = 'usuario'",
      [userId]
    );

    const userData = user as { area_id: number }[];
    if (userData.length === 0 || !userData[0].area_id) {
      return NextResponse.json(
        { message: "Usuario no válido o sin área asignada" },
        { status: 400 }
      );
    }

    const areaId = userData[0].area_id;

    // Verificar si ya existe un informe para este trimestre
    const [existing] = await db.query(
      "SELECT id FROM informes WHERE usuario_id = ? AND area_id = ? AND trimestre = ? AND año = ?",
      [userId, areaId, trimestre, año]
    );

    const existingData = existing as { id: number }[];

    if (existingData.length > 0) {
      // Actualizar meta existente
      await db.query(
        "UPDATE informes SET meta_trimestral = ?, fecha_meta_creada = NOW(), updated_at = NOW() WHERE id = ?",
        [meta_trimestral, existingData[0].id]
      );
    } else {
      // Crear nuevo informe con meta
      await db.query(
        "INSERT INTO informes (usuario_id, area_id, trimestre, año, meta_trimestral, fecha_meta_creada, estado, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), 'planificando', NOW(), NOW())",
        [userId, areaId, trimestre, año, meta_trimestral]
      );
    }

    return NextResponse.json({ message: "Meta trimestral guardada correctamente" });
  } catch (error) {
    console.error("Error al guardar meta:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}