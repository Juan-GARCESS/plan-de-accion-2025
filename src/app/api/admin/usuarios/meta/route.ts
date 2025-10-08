// src/app/api/admin/usuarios/meta/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';


export async function POST(request: NextRequest) {
  try {
    // 🔐 Verificar autenticación usando cookies
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const adminId = match ? parseInt(match[1], 10) : null;

    if (!adminId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 🔍 Verificar que el usuario es admin
    const adminCheckResult = await db.query(`
      SELECT rol FROM usuarios WHERE id = $1
    `, [adminId]);

    if (adminCheckResult.rows.length === 0 || adminCheckResult.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { userId, trimestre, meta } = await request.json();

    // ✅ Validaciones
    if (!userId || !trimestre || meta === undefined) {
      return NextResponse.json({
        error: 'Usuario, trimestre y meta son requeridos'
      }, { status: 400 });
    }

    if (trimestre < 1 || trimestre > 4) {
      return NextResponse.json({
        error: 'Trimestre debe estar entre 1 y 4'
      }, { status: 400 });
    }

    const año = new Date().getFullYear();

    // 🔍 Verificar que el usuario existe y aceptó participar en este trimestre
    const userCheckResult = await db.query(`
      SELECT u.nombre, u.email, st.participando
      FROM usuarios u
      LEFT JOIN selecciones_trimestre st ON u.id = st.usuario_id 
        AND st.trimestre = $1 AND st.año = $2
      WHERE u.id = $3
    `, [trimestre, año, userId]);

    if (userCheckResult.rows.length === 0) {
      return NextResponse.json({
        error: 'Usuario no encontrado'
      }, { status: 404 });
    }

    if (!userCheckResult.rows[0].participando) {
      return NextResponse.json({
        error: 'El usuario no aceptó participar en este trimestre'
      }, { status: 400 });
    }

    // 📝 Verificar si ya existe una meta para este usuario/trimestre
    const existingMetaResult = await db.query(`
      SELECT id FROM metas_trimestrales 
      WHERE usuario_id = $1 AND trimestre = $2 AND año = $3
    `, [userId, trimestre, año]);

    if (existingMetaResult.rows.length > 0) {
      // Actualizar meta existente
      await db.query(`
        UPDATE metas_trimestrales 
        SET meta_texto = $1, asignada_por = $2, updated_at = CURRENT_TIMESTAMP
        WHERE usuario_id = $3 AND trimestre = $4 AND año = $5
      `, [meta, adminId, userId, trimestre, año]);
    } else {
      // Crear nueva meta
      await db.query(`
        INSERT INTO metas_trimestrales (usuario_id, trimestre, año, meta_texto, asignada_por)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, trimestre, año, meta, adminId]);
    }

    // 🔔 Crear notificación para el usuario
    await db.query(`
      INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
      VALUES ($1, $2, $3, $4)
    `, [
      userId,
      `Meta asignada para Trimestre ${trimestre}`,
      `Se te ha asignado una nueva meta para el trimestre ${trimestre}/${año}. Revisa tu dashboard para más detalles.`,
      'info'
    ]);

    return NextResponse.json({
      message: 'Meta asignada correctamente',
      userId,
      trimestre,
      año
    });

  } catch (error) {
    console.error('Error al asignar meta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}