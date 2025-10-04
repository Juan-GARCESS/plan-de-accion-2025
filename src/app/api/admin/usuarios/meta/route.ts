// src/app/api/admin/usuarios/meta/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

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
    const [adminCheck] = await db.query<RowDataPacket[]>(`
      SELECT rol FROM usuarios WHERE id = ?
    `, [adminId]);

    if (adminCheck.length === 0 || adminCheck[0].rol !== 'admin') {
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
    const [userCheck] = await db.query<RowDataPacket[]>(`
      SELECT u.nombre, u.email, st.participando
      FROM usuarios u
      LEFT JOIN selecciones_trimestre st ON u.id = st.usuario_id 
        AND st.trimestre = ? AND st.año = ?
      WHERE u.id = ?
    `, [trimestre, año, userId]);

    if (userCheck.length === 0) {
      return NextResponse.json({
        error: 'Usuario no encontrado'
      }, { status: 404 });
    }

    if (!userCheck[0].participando) {
      return NextResponse.json({
        error: 'El usuario no aceptó participar en este trimestre'
      }, { status: 400 });
    }

    // 📝 Verificar si ya existe una meta para este usuario/trimestre
    const [existingMeta] = await db.query<RowDataPacket[]>(`
      SELECT id FROM metas_trimestrales 
      WHERE usuario_id = ? AND trimestre = ? AND año = ?
    `, [userId, trimestre, año]);

    if (existingMeta.length > 0) {
      // Actualizar meta existente
      await db.execute(`
        UPDATE metas_trimestrales 
        SET meta_texto = ?, asignada_por = ?, updated_at = NOW()
        WHERE usuario_id = ? AND trimestre = ? AND año = ?
      `, [meta, adminId, userId, trimestre, año]);
    } else {
      // Crear nueva meta
      await db.execute(`
        INSERT INTO metas_trimestrales (usuario_id, trimestre, año, meta_texto, asignada_por)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, trimestre, año, meta, adminId]);
    }

    // 🔔 Crear notificación para el usuario
    await db.execute(`
      INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
      VALUES (?, ?, ?, ?)
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