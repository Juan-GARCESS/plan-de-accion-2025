// src/app/api/usuario/trimestre-metas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Obtener metas del usuario por trimestre
export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trimestre = searchParams.get('trimestre');
    const areaId = searchParams.get('area_id');

    if (!trimestre || !areaId) {
      return NextResponse.json({ 
        error: "Parámetros requeridos: trimestre, area_id" 
      }, { status: 400 });
    }

    // Obtener plan de acción del área con las evidencias del usuario
    // Solo las metas que tienen marcado el trimestre específico
    const trimestreColumn = `t${trimestre}`;
    
    const result = await db.query(
      `SELECT 
        pa.id,
        pa.meta,
        pa.indicador,
        pa.accion,
        pa.presupuesto,
        e.nombre_eje as eje_nombre,
        se.nombre_sub_eje as sub_eje_nombre,
        um.id as evidencia_id,
        um.evidencia_texto,
        um.evidencia_url,
        um.estado,
        um.observaciones,
        um.calificacion,
        um.fecha_envio
      FROM plan_accion pa
      JOIN ejes e ON pa.eje_id = e.id
      JOIN sub_ejes se ON pa.sub_eje_id = se.id
      LEFT JOIN usuario_metas um ON pa.id = um.plan_accion_id 
        AND um.usuario_id = $1 
        AND um.trimestre = $2
      WHERE pa.area_id = $3
        AND pa.${trimestreColumn} = TRUE
      ORDER BY e.nombre_eje, se.nombre_sub_eje`,
      [userId, trimestre, areaId]
    );

    return NextResponse.json({ metas: result.rows });
  } catch (error) {
    console.error("Error al obtener metas:", error);
    return NextResponse.json({ 
      error: "Error al obtener metas",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Enviar evidencia
export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { plan_accion_id, trimestre, evidencia_texto, evidencia_url } = body;

    if (!plan_accion_id || !trimestre) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Insertar o actualizar evidencia
    const result = await db.query(
      `INSERT INTO usuario_metas 
        (usuario_id, plan_accion_id, trimestre, evidencia_texto, evidencia_url, estado)
      VALUES ($1, $2, $3, $4, $5, 'pendiente')
      ON CONFLICT (usuario_id, plan_accion_id, trimestre)
      DO UPDATE SET
        evidencia_texto = $4,
        evidencia_url = $5,
        estado = 'pendiente',
        fecha_envio = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [userId, plan_accion_id, trimestre, evidencia_texto, evidencia_url]
    );

    return NextResponse.json({ 
      success: true, 
      evidencia: result.rows[0] 
    });
  } catch (error) {
    console.error("Error al guardar evidencia:", error);
    return NextResponse.json({ 
      error: "Error al guardar evidencia" 
    }, { status: 500 });
  }
}
