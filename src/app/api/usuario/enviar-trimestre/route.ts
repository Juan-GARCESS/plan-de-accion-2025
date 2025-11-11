// src/app/api/usuario/enviar-trimestre/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST - Enviar TODAS las metas del trimestre EN UN SOLO ENVÍO
 * 
 * Flujo:
 * 1. Validar que el usuario tenga metas asignadas en el trimestre
 * 2. Verificar que TODAS las metas tengan descripción y archivo
 * 3. Crear registro en envios_trimestre
 * 4. Actualizar evidencias con el envio_id
 */
export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { trimestre, area_id, metas } = body;

    // Validar parámetros
    if (!trimestre || !area_id || !metas || !Array.isArray(metas) || metas.length === 0) {
      return NextResponse.json({ 
        error: 'Datos incompletos. Se requiere: trimestre, area_id y metas[]' 
      }, { status: 400 });
    }

    const anioActual = new Date().getFullYear();

    // ============================================
    // 1. VALIDAR QUE TODAS LAS METAS ESTÉN COMPLETAS
    // ============================================
    const metasIncompletas = metas.filter(m => 
      !m.descripcion?.trim() || !m.archivo_url
    );

    if (metasIncompletas.length > 0) {
      return NextResponse.json({
        error: `Faltan datos: ${metasIncompletas.length} meta(s) sin descripción o archivo`,
        metas_incompletas: metasIncompletas.map(m => m.meta_id)
      }, { status: 400 });
    }

    // ============================================
    // 2. VERIFICAR SI YA EXISTE UN ENVÍO
    // ============================================
    const envioExistente = await db.query(
      `SELECT id FROM envios_trimestre 
       WHERE usuario_id = $1 AND area_id = $2 AND trimestre = $3 AND anio = $4`,
      [userId, area_id, trimestre, anioActual]
    );

    if (envioExistente.rows.length > 0) {
      return NextResponse.json({
        error: 'Ya existe un envío para este trimestre',
        mensaje: 'Solo puedes hacer un envío por trimestre. Si necesitas modificarlo, contacta al administrador.'
      }, { status: 409 }); // 409 Conflict
    }

    // ============================================
    // 3. CREAR REGISTRO DE ENVÍO
    // ============================================
    const envioResult = await db.query(
      `INSERT INTO envios_trimestre (usuario_id, area_id, trimestre, anio, estado)
       VALUES ($1, $2, $3, $4, 'pendiente')
       RETURNING id, fecha_envio`,
      [userId, area_id, trimestre, anioActual]
    );

    const envio_id = envioResult.rows[0].id;
    const fecha_envio = envioResult.rows[0].fecha_envio;

    // ============================================
    // 4. ACTUALIZAR EVIDENCIAS EXISTENTES CON EL ENVIO_ID
    // ============================================
    // Las evidencias ya fueron creadas por /api/usuario/upload-evidencia
    // Solo necesitamos vincularlas con el envío
    
    const meta_ids = metas.map(m => m.meta_id);
    
    const updateResult = await db.query(
      `UPDATE evidencias 
       SET 
         envio_id = $1,
         estado = 'pendiente',
         fecha_envio = CURRENT_TIMESTAMP
       WHERE meta_id = ANY($2::int[])
         AND usuario_id = $3
         AND trimestre = $4
         AND anio = $5
       RETURNING id`,
      [envio_id, meta_ids, userId, trimestre, anioActual]
    );

    const evidenciasActualizadas = updateResult.rows.map(r => r.id);

    // ============================================
    // 5. RESPUESTA EXITOSA
    // ============================================
    return NextResponse.json({
      success: true,
      mensaje: `Envío del Trimestre ${trimestre} completado exitosamente`,
      data: {
        envio_id,
        fecha_envio,
        total_metas: metas.length,
        evidencias_procesadas: evidenciasActualizadas.length
      }
    });

  } catch (error) {
    console.error("Error al enviar evidencias del trimestre:", error);
    return NextResponse.json({ 
      error: "Error al procesar el envío",
      detalles: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
