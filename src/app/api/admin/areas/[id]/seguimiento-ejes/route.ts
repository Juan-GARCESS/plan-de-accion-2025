import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: devuelve matriz de seguimiento por eje para un área
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const areaId = parseInt(id, 10);
    if (!areaId || Number.isNaN(areaId)) {
      return NextResponse.json({ success: false, error: 'Área inválida' }, { status: 400 });
    }

    // La tabla seguimiento_ejes ya debería existir del schema
    // Pero si no existe, este query no fallará gracias a LEFT JOIN

    // Traer ejes asignados al área y selecciones por trimestre
    const result = await db.query(`
      SELECT 
        e.id AS eje_id,
        e.nombre_eje AS eje_nombre,
        t1.seleccionado AS t1,
        t2.seleccionado AS t2,
        t3.seleccionado AS t3,
        t4.seleccionado AS t4
      FROM area_ejes ae
      INNER JOIN ejes e ON e.id = ae.eje_id AND e.activo = true
      LEFT JOIN seguimiento_ejes t1 ON t1.area_id = ae.area_id AND t1.eje_id = e.id AND t1.trimestre = 1
      LEFT JOIN seguimiento_ejes t2 ON t2.area_id = ae.area_id AND t2.eje_id = e.id AND t2.trimestre = 2
      LEFT JOIN seguimiento_ejes t3 ON t3.area_id = ae.area_id AND t3.eje_id = e.id AND t3.trimestre = 3
      LEFT JOIN seguimiento_ejes t4 ON t4.area_id = ae.area_id AND t4.eje_id = e.id AND t4.trimestre = 4
      WHERE ae.area_id = $1 AND ae.activo = true
      ORDER BY e.nombre_eje
    `, [areaId]);

    const data = result.rows.map(r => ({
      eje_id: r.eje_id as number,
      eje_nombre: (r.eje_nombre as string) || '',
      trimestres: {
        1: Boolean(r.t1),
        2: Boolean(r.t2),
        3: Boolean(r.t3),
        4: Boolean(r.t4),
      }
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error GET seguimiento-ejes:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
