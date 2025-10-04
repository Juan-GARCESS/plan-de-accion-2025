import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

// API para asignar metas a usuarios que participan en trimestres
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const { id: areaId, userId } = await params;
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const adminId = match ? parseInt(match[1], 10) : null;

    if (!adminId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const [admin] = await db.query<(RowDataPacket & {
      rol: string;
    })[]>(
      "SELECT rol FROM usuarios WHERE id = ? AND estado = 'activo'",
      [adminId]
    );

    if (!admin || admin.length === 0 || admin[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { trimestre, meta } = await request.json();

    if (!trimestre || !meta || meta.trim().length === 0) {
      return NextResponse.json({ 
        error: "Trimestre y meta son requeridos" 
      }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();
    const areaIdNum = parseInt(areaId, 10);
    const userIdNum = parseInt(userId, 10);

    // Verificar que el usuario existe y está en el área correcta
    const [user] = await db.query<(RowDataPacket & {
      id: number;
      area_id: number;
      nombre: string;
    })[]>(
      "SELECT id, area_id, nombre FROM usuarios WHERE id = ? AND area_id = ? AND rol = 'usuario' AND estado = 'activo'",
      [userIdNum, areaIdNum]
    );

    if (!user || user.length === 0) {
      return NextResponse.json({ 
        error: "Usuario no encontrado o no pertenece al área" 
      }, { status: 404 });
    }

    // Verificar que el usuario está participando en este trimestre (desde selecciones_trimestre)
    const [seleccion] = await db.query<(RowDataPacket & {
      participando: number;
    })[]>(
      "SELECT participando FROM selecciones_trimestre WHERE usuario_id = ? AND trimestre = ? AND año = ?",
      [userIdNum, trimestre, currentYear]
    );

    if (!seleccion || seleccion.length === 0 || !seleccion[0].participando) {
      return NextResponse.json({ 
        error: "El usuario no está participando en este trimestre" 
      }, { status: 400 });
    }

    // Verificar si ya existe un informe para este trimestre, si no, crearlo
    const [informeResult] = await db.query<(RowDataPacket & {
      id: number;
      estado: string;
    })[]>(
      "SELECT id, estado FROM informes WHERE usuario_id = ? AND area_id = ? AND trimestre = ? AND año = ?",
      [userIdNum, areaIdNum, trimestre, currentYear]
    );

    let informeId: number;

    if (!informeResult || informeResult.length === 0) {
      // Crear nuevo informe si no existe
      const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO informes (usuario_id, area_id, trimestre, año, estado, created_at, updated_at) 
         VALUES (?, ?, ?, ?, 'esperando_meta', NOW(), NOW())`,
        [userIdNum, areaIdNum, trimestre, currentYear]
      );
      informeId = result.insertId;
    } else {
      informeId = informeResult[0].id;
    }

    // Actualizar la meta
    await db.query(
      `UPDATE informes 
       SET meta_trimestral = ?, estado = 'meta_asignada', fecha_meta_creada = NOW() 
       WHERE id = ?`,
      [meta.trim(), informeId]
    );

    return NextResponse.json({ 
      message: "Meta asignada correctamente",
      success: true 
    });

  } catch (error) {
    console.error("Error al asignar meta:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}