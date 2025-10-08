// API para asignar/desasignar ejes a áreas
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('area_id');

    if (!areaId) {
      // Obtener todas las asignaciones
      const asignacionesResult = await db.query(
        `SELECT ae.*, a.nombre_area, e.nombre_eje, e.descripcion as eje_descripcion
         FROM area_ejes ae
         JOIN areas a ON ae.area_id = a.id
         JOIN ejes e ON ae.eje_id = e.id
         WHERE ae.activo = true
         ORDER BY a.nombre_area, e.nombre_eje`
      );
      return NextResponse.json(asignacionesResult.rows);
    } else {
      // Obtener ejes asignados a un área específica
      const ejesAsignadosResult = await db.query(
        `SELECT e.id, e.nombre_eje, e.descripcion, ae.fecha_asignacion
         FROM area_ejes ae
         JOIN ejes e ON ae.eje_id = e.id
         WHERE ae.area_id = $1 AND ae.activo = true
         ORDER BY e.nombre_eje`,
        [areaId]
      );
      return NextResponse.json(ejesAsignadosResult.rows);
    }
  } catch (error) {
    console.error('Error fetching asignaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener las asignaciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { area_id, eje_id } = await request.json();

    if (!area_id || !eje_id) {
      return NextResponse.json(
        { error: 'El ID del área y del eje son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el área existe
    const existingAreaResult = await db.query(
      'SELECT id FROM areas WHERE id = $1',
      [area_id]
    );

    if (!existingAreaResult.rows || existingAreaResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'El área especificada no existe' },
        { status: 400 }
      );
    }

    // Verificar que el eje existe
    const existingEjeResult = await db.query(
      'SELECT id FROM ejes WHERE id = $1 AND activo = true',
      [eje_id]
    );

    if (!existingEjeResult.rows || existingEjeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'El eje especificado no existe' },
        { status: 400 }
      );
    }

    // Verificar si ya está asignado
    const existingAsignacionResult = await db.query(
      'SELECT id FROM area_ejes WHERE area_id = $1 AND eje_id = $2',
      [area_id, eje_id]
    );

    if (existingAsignacionResult.rows && existingAsignacionResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este eje ya está asignado a esta área' },
        { status: 400 }
      );
    }

    // Crear la asignación
    await db.query(
      'INSERT INTO area_ejes (area_id, eje_id) VALUES ($1, $2)',
      [area_id, eje_id]
    );

    // Obtener todos los sub-ejes del eje asignado
    const subEjesResult = await db.query(
      'SELECT id FROM sub_ejes WHERE eje_id = $1 AND activo = true',
      [eje_id]
    );

    // Crear registros en plan_accion para cada sub-eje
    for (const subEje of subEjesResult.rows) {
      await db.query(
        'INSERT INTO plan_accion (area_id, eje_id, sub_eje_id) VALUES ($1, $2, $3) ON CONFLICT (area_id, eje_id, sub_eje_id) DO NOTHING',
        [area_id, eje_id, subEje.id]
      );
    }

    return NextResponse.json({
      message: 'Eje asignado exitosamente al área'
    }, { status: 201 });

  } catch (error) {
    console.error('Error assigning eje to area:', error);
    return NextResponse.json(
      { error: 'Error al asignar el eje al área' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('area_id');
    const ejeId = searchParams.get('eje_id');

    if (!areaId || !ejeId) {
      return NextResponse.json(
        { error: 'El ID del área y del eje son requeridos' },
        { status: 400 }
      );
    }

    // Eliminar la asignación
    await db.query(
      'UPDATE area_ejes SET activo = false WHERE area_id = $1 AND eje_id = $2',
      [areaId, ejeId]
    );

    // Eliminar los registros de plan_accion relacionados
    await db.query(
      'UPDATE plan_accion SET activo = false WHERE area_id = $1 AND eje_id = $2',
      [areaId, ejeId]
    );

    return NextResponse.json({
      message: 'Eje desasignado exitosamente del área'
    });

  } catch (error) {
    console.error('Error unassigning eje from area:', error);
    return NextResponse.json(
      { error: 'Error al desasignar el eje del área' },
      { status: 500 }
    );
  }
}