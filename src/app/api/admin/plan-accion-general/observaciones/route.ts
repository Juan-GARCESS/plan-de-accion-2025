// src/app/api/admin/plan-accion-general/observaciones/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminCheck = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [userId]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { evidenciaId, observacion } = body;

    if (!evidenciaId) {
      return NextResponse.json({ error: "ID de evidencia requerido" }, { status: 400 });
    }

    // Crear o actualizar la columna observaciones_admin en la tabla evidencias
    // Primero verificamos si la columna existe, si no, la agregamos
    const columnCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'evidencias' 
      AND column_name = 'observaciones_admin'
    `);

    if (columnCheck.rows.length === 0) {
      // Agregar la columna si no existe
      await db.query(`
        ALTER TABLE evidencias 
        ADD COLUMN observaciones_admin TEXT
      `);
    }

    // Actualizar la observación
    await db.query(
      `UPDATE evidencias 
       SET observaciones_admin = $1 
       WHERE id = $2`,
      [observacion || null, evidenciaId]
    );

    return NextResponse.json({ 
      success: true,
      message: "Observación guardada correctamente" 
    });
  } catch (error) {
    console.error("Error al guardar observación:", error);
    return NextResponse.json({ 
      error: "Error al guardar observación" 
    }, { status: 500 });
  }
}
