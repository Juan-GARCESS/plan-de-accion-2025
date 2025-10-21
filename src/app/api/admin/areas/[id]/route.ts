import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [userId]
    );

    if (!adminResult.rows || adminResult.rows.length === 0 || adminResult.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const areaId = parseInt(id, 10);

    // Obtener información del área
    const areaResult = await db.query(
      "SELECT id, nombre_area, descripcion FROM areas WHERE id = $1",
      [areaId]
    );

    if (!areaResult.rows || areaResult.rows.length === 0) {
      return NextResponse.json({ error: "Área no encontrada" }, { status: 404 });
    }

    // Proteger el área "admin"
    if (areaResult.rows[0].nombre_area.toLowerCase() === 'admin') {
      return NextResponse.json({ error: "No se puede acceder al área 'admin'" }, { status: 403 });
    }

    return NextResponse.json({ area: areaResult.rows[0] });
  } catch (err) {
    console.error("Error al obtener área:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [userId]
    );

    if (!adminResult.rows || adminResult.rows.length === 0 || adminResult.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const areaId = parseInt(id, 10);
    const { nombre_area, descripcion } = await request.json();

    if (!nombre_area || nombre_area.trim().length === 0) {
      return NextResponse.json({ error: "Nombre del área es requerido" }, { status: 400 });
    }

    // Verificar que el área existe y no es "admin"
    const existingAreaResult = await db.query(
      "SELECT nombre_area FROM areas WHERE id = $1",
      [areaId]
    );

    if (!existingAreaResult.rows || existingAreaResult.rows.length === 0) {
      return NextResponse.json({ error: "Área no encontrada" }, { status: 404 });
    }

    // Proteger el área "admin"
    if (existingAreaResult.rows[0].nombre_area.toLowerCase() === 'admin') {
      return NextResponse.json({ error: "No se puede editar el área 'admin'" }, { status: 403 });
    }

    // Prevenir cambiar nombre a "admin"
    if (nombre_area.toLowerCase().trim() === 'admin') {
      return NextResponse.json({ error: "No se puede cambiar el nombre a 'admin'" }, { status: 400 });
    }

    // Actualizar área (sin columna activa)
    await db.query(
      "UPDATE areas SET nombre_area = $1, descripcion = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
      [nombre_area.trim(), descripcion || null, areaId]
    );

    return NextResponse.json({
      message: "Área actualizada correctamente",
      area: {
        id: areaId,
        nombre_area: nombre_area.trim(),
        descripcion: descripcion || null
      }
    });
  } catch (err) {
    console.error("Error al actualizar área:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}