import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Obtener promedio de un área
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('areaId');
    const anio = searchParams.get('anio') || '2025';

    if (!areaId) {
      // Obtener promedios de todas las áreas
      const result = await query(
        'SELECT * FROM vista_promedios_area WHERE anio = $1 ORDER BY nombre_area',
        [anio]
      );
      return NextResponse.json(result.rows);
    } else {
      // Obtener promedio de un área específica
      const result = await query(
        'SELECT * FROM vista_promedios_area WHERE area_id = $1 AND anio = $2',
        [areaId, anio]
      );

      if (result.rows.length === 0) {
        // Si no hay datos, devolver estructura vacía
        return NextResponse.json({
          area_id: parseInt(areaId),
          nombre_area: '',
          anio: parseInt(anio),
          total_metas: 0,
          metas_calificadas: 0,
          promedio_general_area: null,
          promedio_t1: null,
          promedio_t2: null,
          promedio_t3: null,
          promedio_t4: null
        });
      }

      return NextResponse.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error al obtener promedios:', error);
    return NextResponse.json({ error: 'Error al obtener promedios' }, { status: 500 });
  }
}
