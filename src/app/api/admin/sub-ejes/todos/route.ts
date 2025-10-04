import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [subEjes] = await db.execute(
      `SELECT se.id, se.nombre_sub_eje, se.descripcion, se.fecha_creacion, se.eje_id,
              e.nombre_eje
       FROM sub_ejes se
       JOIN ejes e ON se.eje_id = e.id
       WHERE se.activo = 1
       ORDER BY e.nombre_eje ASC, se.fecha_creacion DESC`
    );

    return NextResponse.json(subEjes);
  } catch (error) {
    console.error('Error fetching all sub-ejes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los sub-ejes' },
      { status: 500 }
    );
  }
}