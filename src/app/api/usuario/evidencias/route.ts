// src/app/api/usuario/evidencias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST - Subir evidencia
export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { meta_id, archivo, nombre_archivo, tipo_archivo, tamano } = body;

    if (!meta_id || !archivo) {
      return NextResponse.json({ 
        error: "meta_id y archivo son requeridos" 
      }, { status: 400 });
    }

    // Validar tamaño (5MB = 5 * 1024 * 1024 bytes)
    if (tamano > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "El archivo no debe superar 5MB" 
      }, { status: 400 });
    }

    // Verificar que la meta pertenece al usuario
    const metaCheck = await db.query(
      "SELECT id FROM usuario_metas WHERE id = $1 AND usuario_id = $2",
      [meta_id, userId]
    );

    if (metaCheck.rows.length === 0) {
      return NextResponse.json({ 
        error: "Meta no encontrada" 
      }, { status: 404 });
    }

    // Insertar en tabla evidencias
    const result = await db.query(`
      INSERT INTO evidencias (
        meta_id, 
        usuario_id, 
        archivo_base64, 
        nombre_archivo, 
        tipo_archivo, 
        tamano_bytes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [meta_id, userId, archivo, nombre_archivo, tipo_archivo, tamano]);

    const evidenciaId = result.rows[0].id;

    // Actualizar evidencia_url en usuario_metas
    await db.query(
      "UPDATE usuario_metas SET evidencia_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [`evidencia_${evidenciaId}`, meta_id]
    );

    return NextResponse.json({ 
      message: "Evidencia subida correctamente",
      url: `evidencia_${evidenciaId}`,
      evidencia_id: evidenciaId
    });
  } catch (error) {
    console.error("Error al subir evidencia:", error);
    return NextResponse.json({ 
      error: "Error al subir evidencia" 
    }, { status: 500 });
  }
}

// GET - Obtener evidencia
export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const evidenciaId = searchParams.get('id');

    if (!evidenciaId) {
      return NextResponse.json({ 
        error: "ID de evidencia requerido" 
      }, { status: 400 });
    }

    // Obtener evidencia
    const result = await db.query(
      `SELECT archivo_base64, nombre_archivo, tipo_archivo 
       FROM evidencias 
       WHERE id = $1 AND usuario_id = $2`,
      [evidenciaId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: "Evidencia no encontrada" 
      }, { status: 404 });
    }

    const evidencia = result.rows[0];

    return NextResponse.json({
      archivo: evidencia.archivo_base64,
      nombre: evidencia.nombre_archivo,
      tipo: evidencia.tipo_archivo
    });
  } catch (error) {
    console.error("Error al obtener evidencia:", error);
    return NextResponse.json({ 
      error: "Error al obtener evidencia" 
    }, { status: 500 });
  }
}
