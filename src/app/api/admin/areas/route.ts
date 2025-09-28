import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
  try {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        a.id, 
        a.nombre_area, 
        a.descripcion,
        CASE WHEN a.nombre_area IS NOT NULL THEN true ELSE false END as activa,
        COALESCE(COUNT(u.id), 0) as usuarios_count
      FROM areas a
      LEFT JOIN usuarios u ON u.area_id = a.id AND u.estado = 'activo' AND u.rol = 'usuario'
      WHERE a.nombre_area != 'admin'
      GROUP BY a.id, a.nombre_area, a.descripcion
      ORDER BY a.nombre_area
    `);
    return NextResponse.json({ areas: rows }, { status: 200 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error listar áreas:", errMsg);
    return NextResponse.json({ message: "Error al listar áreas", error: errMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nombre_area, descripcion } = await req.json();

    if (!nombre_area) {
      return NextResponse.json({ message: "Nombre de área requerido" }, { status: 400 });
    }

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO areas (nombre_area, descripcion) VALUES (?, ?)",
      [nombre_area, descripcion || null]
    );

    return NextResponse.json({ message: "Área creada", areaId: result.insertId }, { status: 201 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error crear área:", errMsg);
    return NextResponse.json({ message: "Error al crear área", error: errMsg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { areaId, nombre_area, descripcion } = await req.json();

    if (!areaId || !nombre_area) {
      return NextResponse.json({ message: "ID de área y nombre son requeridos" }, { status: 400 });
    }

    const [result] = await db.query<ResultSetHeader>(
      "UPDATE areas SET nombre_area = ?, descripcion = ? WHERE id = ?",
      [nombre_area, descripcion || null, areaId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Área no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ message: "Área actualizada correctamente" }, { status: 200 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error editar área:", errMsg);
    return NextResponse.json({ message: "Error al editar área", error: errMsg }, { status: 500 });
  }
}

