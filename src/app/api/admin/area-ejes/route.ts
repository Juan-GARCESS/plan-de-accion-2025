// API para asignar/desasignar ejes a áreas
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('area_id');

    if (!areaId) {
      // Obtener todas las asignaciones
      const [asignaciones] = await db.execute(
        `SELECT ae.*, a.nombre_area, e.nombre_eje, e.descripcion as eje_descripcion
         FROM area_ejes ae
         JOIN areas a ON ae.area_id = a.id
         JOIN ejes e ON ae.eje_id = e.id
         WHERE ae.activo = 1
         ORDER BY a.nombre_area, e.nombre_eje`
      );
      return NextResponse.json(asignaciones);
    } else {
      // Obtener ejes asignados a un área específica
      const [ejesAsignados] = await db.execute(
        `SELECT e.id, e.nombre_eje, e.descripcion, ae.fecha_asignacion
         FROM area_ejes ae
         JOIN ejes e ON ae.eje_id = e.id
         WHERE ae.area_id = ? AND ae.activo = 1
         ORDER BY e.nombre_eje`,
        [areaId]
      );
      return NextResponse.json(ejesAsignados);
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
    const [existingArea] = await db.execute(
      'SELECT id FROM areas WHERE id = ?',
      [area_id]
    );

    if ((existingArea as unknown[]).length === 0) {
      return NextResponse.json(
        { error: 'El área especificada no existe' },
        { status: 400 }
      );
    }

    // Verificar que el eje existe
    const [existingEje] = await db.execute(
      'SELECT id FROM ejes WHERE id = ? AND activo = 1',
      [eje_id]
    );

    if ((existingEje as unknown[]).length === 0) {
      return NextResponse.json(
        { error: 'El eje especificado no existe' },
        { status: 400 }
      );
    }

    // Verificar si ya está asignado
    const [existingAsignacion] = await db.execute(
      'SELECT id FROM area_ejes WHERE area_id = ? AND eje_id = ?',
      [area_id, eje_id]
    );

    if ((existingAsignacion as unknown[]).length > 0) {
      return NextResponse.json(
        { error: 'Este eje ya está asignado a esta área' },
        { status: 400 }
      );
    }

    // Crear la asignación
    await db.execute(
      'INSERT INTO area_ejes (area_id, eje_id) VALUES (?, ?)',
      [area_id, eje_id]
    );

    // Obtener todos los sub-ejes del eje asignado
    const [subEjes] = await db.execute(
      'SELECT id FROM sub_ejes WHERE eje_id = ? AND activo = 1',
      [eje_id]
    );

    // Crear registros en plan_accion para cada sub-eje
    for (const subEje of (subEjes as { id: number }[])) {
      await db.execute(
        'INSERT IGNORE INTO plan_accion (area_id, eje_id, sub_eje_id) VALUES (?, ?, ?)',
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
    await db.execute(
      'UPDATE area_ejes SET activo = 0 WHERE area_id = ? AND eje_id = ?',
      [areaId, ejeId]
    );

    // Eliminar los registros de plan_accion relacionados
    await db.execute(
      'UPDATE plan_accion SET activo = 0 WHERE area_id = ? AND eje_id = ?',
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