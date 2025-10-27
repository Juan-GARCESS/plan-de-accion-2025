// src/app/api/usuario/generar-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { areaId, metas } = await request.json();

    if (!areaId || !metas || !Array.isArray(metas)) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Verificar que el usuario pertenece al área
    const userCheck = await db.query(
      "SELECT area_id FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].area_id !== areaId) {
      return NextResponse.json(
        { error: 'No autorizado para esta área' },
        { status: 403 }
      );
    }

    const anioActual = new Date().getFullYear();
    let buzones_creados = 0;
    let duplicados = 0;

    // Crear buzones de evidencia para cada meta y trimestre marcado
    for (const metaItem of metas) {
      const { metaId, trimestres } = metaItem;

      for (const trimestre of trimestres) {
        // Verificar si ya existe buzón para esta meta + trimestre + año
        const existente = await db.query(
          `SELECT id FROM evidencias 
           WHERE meta_id = $1 AND usuario_id = $2 AND trimestre = $3 AND anio = $4`,
          [metaId, userId, trimestre, anioActual]
        );

        if (existente.rows.length > 0) {
          // Ya existe, no crear duplicado
          duplicados++;
          continue;
        }

        // Crear nuevo buzón vacío
        await db.query(
          `INSERT INTO evidencias (
            meta_id,
            usuario_id,
            trimestre,
            anio,
            descripcion,
            archivo_url,
            archivo_nombre,
            archivo_tipo,
            archivo_tamano,
            estado
          ) VALUES ($1, $2, $3, $4, NULL, NULL, NULL, NULL, NULL, NULL)`,
          [metaId, userId, trimestre, anioActual]
        );

        buzones_creados++;
      }
    }

    return NextResponse.json({
      success: true,
      creados: buzones_creados,
      duplicados,
      message: `Se crearon ${buzones_creados} buzones de envío${duplicados > 0 ? ` (${duplicados} ya existían)` : ''}`
    });

  } catch (error) {
    console.error('Error al generar plan:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
