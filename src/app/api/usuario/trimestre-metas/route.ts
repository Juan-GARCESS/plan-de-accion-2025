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

    // Obtener metas del trimestre
    const result = await db.query(`
      SELECT 
        um.id,
        um.meta,
        um.indicador,
        um.accion,
        um.presupuesto,
        um.evidencia_url,
        um.calificacion,
        e.nombre as eje_nombre,
        se.nombre as subeje_nombre
      FROM usuario_metas um
      LEFT JOIN sub_ejes se ON um.sub_eje_id = se.id
      LEFT JOIN ejes e ON se.eje_id = e.id
      JOIN usuarios u ON um.usuario_id = u.id
      WHERE u.area_id = $1 
        AND um.trimestre = $2
        AND um.usuario_id = $3
      ORDER BY e.nombre, se.nombre
    `, [areaId, trimestre, userId]);

    return NextResponse.json({ 
      metas: result.rows
    });
  } catch (error) {
    console.error("Error al obtener metas:", error);
    return NextResponse.json({ 
      error: "Error al obtener metas" 
    }, { status: 500 });
  }
}

// PUT - Actualizar acción o presupuesto
export async function PUT(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { meta_id, accion, presupuesto } = body;

    if (!meta_id) {
      return NextResponse.json({ error: "meta_id requerido" }, { status: 400 });
    }

    // Verificar que la meta pertenece al usuario
    const verificacion = await db.query(
      "SELECT id FROM usuario_metas WHERE id = $1 AND usuario_id = $2",
      [meta_id, userId]
    );

    if (verificacion.rows.length === 0) {
      return NextResponse.json({ 
        error: "Meta no encontrada" 
      }, { status: 404 });
    }

    // Construir query de actualización
    const updates: string[] = [];
    const values: (string | null)[] = [];
    let paramCount = 1;

    if (accion !== undefined) {
      updates.push(`accion = $${paramCount}`);
      values.push(accion);
      paramCount++;
    }

    if (presupuesto !== undefined) {
      updates.push(`presupuesto = $${paramCount}`);
      values.push(presupuesto);
      paramCount++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ 
        error: "No hay campos para actualizar" 
      }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(meta_id.toString());

    await db.query(
      `UPDATE usuario_metas SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    return NextResponse.json({ 
      message: "Actualizado correctamente"
    });
  } catch (error) {
    console.error("Error al actualizar:", error);
    return NextResponse.json({ 
      error: "Error al actualizar" 
    }, { status: 500 });
  }
}
