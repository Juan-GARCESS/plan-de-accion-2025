import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie');
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const { eje_id, trimestre, seleccionado } = body || {};
    if (!eje_id || !trimestre || trimestre < 1 || trimestre > 4 || typeof seleccionado !== 'boolean') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Obtener área del usuario
    const uResult = await db.query(
      "SELECT area_id FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [userId]
    );
    const areaId = uResult.rows[0]?.area_id || null;
    if (!areaId) return NextResponse.json({ error: 'Usuario sin área asignada' }, { status: 400 });

    // UPSERT selección (PostgreSQL usa ON CONFLICT)
    await db.query(
      `INSERT INTO seguimiento_ejes(area_id, eje_id, trimestre, seleccionado)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (area_id, eje_id, trimestre) 
       DO UPDATE SET seleccionado = EXCLUDED.seleccionado, updated_at = CURRENT_TIMESTAMP`,
      [areaId, eje_id, trimestre, seleccionado]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error POST seguimiento-ejes:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
