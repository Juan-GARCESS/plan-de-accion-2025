// src/app/api/usuario/check-plan-generado/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('areaId');

    if (!areaId) {
      return NextResponse.json({ error: 'Falta areaId' }, { status: 400 });
    }

    // Verificar que el usuario pertenece al área
    const userCheck = await db.query(
      "SELECT area_id FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].area_id !== parseInt(areaId)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const anioActual = new Date().getFullYear();

    // Verificar si existe al menos 1 evidencia (buzón) para este año
    const result = await db.query(
      `SELECT COUNT(*) as total 
       FROM evidencias 
       WHERE usuario_id = $1 AND anio = $2`,
      [userId, anioActual]
    );

    const generado = parseInt(result.rows[0].total) > 0;

    return NextResponse.json({
      generado,
      total: parseInt(result.rows[0].total)
    });

  } catch (error) {
    console.error('Error al verificar plan:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
