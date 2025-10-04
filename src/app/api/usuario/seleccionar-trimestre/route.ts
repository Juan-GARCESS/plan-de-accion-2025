// src/app/api/usuario/seleccionar-trimestre/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    // 🔐 Verificar autenticación usando cookies
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { trimestre, participando, año } = await request.json();

    // ✅ Validaciones
    if (!trimestre || año === undefined || participando === undefined) {
      return NextResponse.json({
        error: 'Trimestre, año y participando son requeridos'
      }, { status: 400 });
    }

    // Verificar que el trimestre esté en rango válido
    if (trimestre < 1 || trimestre > 4) {
      return NextResponse.json({
        error: 'Trimestre debe estar entre 1 y 4'
      }, { status: 400 });
    }

    console.log('API recibió:', { trimestre, participando, año, userId });

    // 🔍 Verificar si ya existe una selección para este trimestre
    const [existingSelection] = await db.query<RowDataPacket[]>(`
      SELECT id FROM selecciones_trimestre 
      WHERE usuario_id = ? AND trimestre = ? AND año = ?
    `, [userId, trimestre, año]);

    if (existingSelection.length > 0) {
      // Actualizar la selección existente
      await db.execute(`
        UPDATE selecciones_trimestre 
        SET participando = ?, updated_at = NOW()
        WHERE usuario_id = ? AND trimestre = ? AND año = ?
      `, [participando ? 1 : 0, userId, trimestre, año]);
      
      console.log('Selección actualizada:', { participando: participando ? 1 : 0 });
    } else {
      // Crear nueva selección
      await db.execute(`
        INSERT INTO selecciones_trimestre (usuario_id, trimestre, año, participando, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `, [userId, trimestre, año, participando ? 1 : 0]);
      
      console.log('Nueva selección creada:', { participando: participando ? 1 : 0 });
    }

    return NextResponse.json({
      message: 'Selección actualizada correctamente',
      trimestre,
      participando,
      año
    });

  } catch (error) {
    console.error('Error al seleccionar trimestre:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}