// src/app/api/usuario/seleccionar-trimestre/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';


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
    const existingSelectionResult = await db.query(`
      SELECT id FROM selecciones_trimestre 
      WHERE usuario_id = $1 AND trimestre = $2 AND año = $3
    `, [userId, trimestre, año]);

    if (existingSelectionResult.rows.length > 0) {
      // Actualizar la selección existente
      await db.query(`
        UPDATE selecciones_trimestre 
        SET participando = $1, updated_at = CURRENT_TIMESTAMP
        WHERE usuario_id = $2 AND trimestre = $3 AND año = $4
      `, [participando ? 1 : 0, userId, trimestre, año]);
      
      console.log('Selección actualizada:', { participando: participando ? 1 : 0 });
    } else {
      // Crear nueva selección
      await db.query(`
        INSERT INTO selecciones_trimestre (usuario_id, trimestre, año, participando, created_at, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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