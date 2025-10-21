// src/app/api/areas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const result = await db.query(
      'SELECT id, nombre_area, descripcion FROM areas WHERE id = $1 AND activo = true',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Área no encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener área:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del área' },
      { status: 500 }
    );
  }
}
