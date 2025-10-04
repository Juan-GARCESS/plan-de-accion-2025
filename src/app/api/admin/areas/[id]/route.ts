import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

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
    const [admin] = await db.query<(RowDataPacket & {
      rol: string;
    })[]>(
      "SELECT rol FROM usuarios WHERE id = ? AND estado = 'activo'",
      [userId]
    );

    if (!admin || admin.length === 0 || admin[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const areaId = parseInt(id, 10);

    // Obtener información del área
    const [area] = await db.query<(RowDataPacket & {
      id: number;
      nombre_area: string;
      descripcion: string;
    })[]>(
      "SELECT id, nombre_area, descripcion FROM areas WHERE id = ?",
      [areaId]
    );

    if (!area || area.length === 0) {
      return NextResponse.json({ error: "Área no encontrada" }, { status: 404 });
    }

    // Proteger el área "admin"
    if (area[0].nombre_area.toLowerCase() === 'admin') {
      return NextResponse.json({ error: "No se puede acceder al área 'admin'" }, { status: 403 });
    }

    return NextResponse.json({ area: area[0] });
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
    const [admin] = await db.query<(RowDataPacket & {
      rol: string;
    })[]>(
      "SELECT rol FROM usuarios WHERE id = ? AND estado = 'activo'",
      [userId]
    );

    if (!admin || admin.length === 0 || admin[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const areaId = parseInt(id, 10);
    const { nombre_area, descripcion, activa } = await request.json();

    if (!nombre_area || nombre_area.trim().length === 0) {
      return NextResponse.json({ error: "Nombre del área es requerido" }, { status: 400 });
    }

    // Verificar que el área existe y no es "admin"
    const [existingArea] = await db.query<(RowDataPacket & {
      nombre_area: string;
    })[]>(
      "SELECT nombre_area FROM areas WHERE id = ?",
      [areaId]
    );

    if (!existingArea || existingArea.length === 0) {
      return NextResponse.json({ error: "Área no encontrada" }, { status: 404 });
    }

    // Proteger el área "admin"
    if (existingArea[0].nombre_area.toLowerCase() === 'admin') {
      return NextResponse.json({ error: "No se puede editar el área 'admin'" }, { status: 403 });
    }

    // Prevenir cambiar nombre a "admin"
    if (nombre_area.toLowerCase().trim() === 'admin') {
      return NextResponse.json({ error: "No se puede cambiar el nombre a 'admin'" }, { status: 400 });
    }

    // Actualizar área
    await db.execute(
      "UPDATE areas SET nombre_area = ?, descripcion = ?, activa = ? WHERE id = ?",
      [nombre_area.trim(), descripcion || null, activa ? 1 : 0, areaId]
    );

    return NextResponse.json({
      message: "Área actualizada correctamente",
      area: {
        id: areaId,
        nombre_area: nombre_area.trim(),
        descripcion: descripcion || null,
        activa: activa ? 1 : 0
      }
    });
  } catch (err) {
    console.error("Error al actualizar área:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}