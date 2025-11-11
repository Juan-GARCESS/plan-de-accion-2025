// src/app/api/admin/calificar-trimestre/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const adminId = match ? parseInt(match[1], 10) : null;

    if (!adminId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { area_id, trimestre, usuario_id, calificacion_general, comentario_general, calcular_automatico } = body;

    if (!area_id || !trimestre || !usuario_id || calificacion_general === undefined) {
      return NextResponse.json({ 
        error: 'Datos incompletos' 
      }, { status: 400 });
    }

    // Validar calificación
    if (calificacion_general < 0 || calificacion_general > 100) {
      return NextResponse.json({ 
        error: 'La calificacion debe estar entre 0 y 100' 
      }, { status: 400 });
    }

    const anioActual = new Date().getFullYear();

    // Verificar si ya existe calificación del trimestre
    const existente = await db.query(
      `SELECT id FROM calificaciones_trimestre 
       WHERE usuario_id = $1 AND area_id = $2 AND trimestre = $3 AND anio = $4`,
      [usuario_id, area_id, trimestre, anioActual]
    );

    if (existente.rows.length > 0) {
      // Actualizar
      await db.query(
        `UPDATE calificaciones_trimestre 
         SET 
           calificacion_general = $1,
           comentario_general = $2,
           calcular_automatico = $3,
           calificado_por = $4,
           fecha_calificacion = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [calificacion_general, comentario_general || null, calcular_automatico, adminId, existente.rows[0].id]
      );
    } else {
      // Crear
      await db.query(
        `INSERT INTO calificaciones_trimestre 
          (usuario_id, area_id, trimestre, anio, calificacion_general, comentario_general, calcular_automatico, calificado_por)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [usuario_id, area_id, trimestre, anioActual, calificacion_general, comentario_general || null, calcular_automatico, adminId]
      );
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Calificacion del trimestre guardada correctamente'
    });

  } catch (error) {
    console.error("Error al calificar trimestre:", error);
    return NextResponse.json({ 
      error: "Error al procesar la calificacion",
      detalles: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
