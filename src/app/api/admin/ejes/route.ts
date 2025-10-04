// API para gestionar ejes - GET (listar) y POST (crear)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [ejes] = await db.execute(
      `SELECT e.id, e.nombre_eje, e.descripcion, e.fecha_creacion,
              COUNT(se.id) as total_sub_ejes
       FROM ejes e 
       LEFT JOIN sub_ejes se ON e.id = se.eje_id AND se.activo = 1
       WHERE e.activo = 1 
       GROUP BY e.id, e.nombre_eje, e.descripcion, e.fecha_creacion
       ORDER BY e.fecha_creacion DESC`
    );

    return NextResponse.json(ejes);
  } catch (error) {
    console.error('Error fetching ejes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los ejes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nombre_eje, descripcion } = await request.json();

    if (!nombre_eje || nombre_eje.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del eje es requerido' },
        { status: 400 }
      );
    }

    // Verificar si el eje ya existe
    const [existingEje] = await db.execute(
      'SELECT id FROM ejes WHERE nombre_eje = ? AND activo = 1',
      [nombre_eje.trim()]
    );

    if ((existingEje as unknown[]).length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un eje con ese nombre' },
        { status: 400 }
      );
    }

    // Crear el nuevo eje
    const [result] = await db.execute(
      'INSERT INTO ejes (nombre_eje, descripcion) VALUES (?, ?)',
      [nombre_eje.trim(), descripcion || null]
    );

    // Obtener el eje creado
    const [nuevoEje] = await db.execute(
      'SELECT * FROM ejes WHERE id = ?',
      [(result as { insertId: number }).insertId]
    );

    return NextResponse.json({
      message: 'Eje creado exitosamente',
      eje: (nuevoEje as unknown[])[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating eje:', error);
    return NextResponse.json(
      { error: 'Error al crear el eje' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, nombre_eje, descripcion } = await request.json();

    if (!id || !nombre_eje || nombre_eje.trim() === '') {
      return NextResponse.json(
        { error: 'ID y nombre del eje son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el eje existe
    const [existingEje] = await db.execute(
      'SELECT id FROM ejes WHERE id = ? AND activo = 1',
      [id]
    );

    if ((existingEje as unknown[]).length === 0) {
      return NextResponse.json(
        { error: 'El eje especificado no existe' },
        { status: 404 }
      );
    }

    // Verificar si ya existe otro eje con el mismo nombre
    const [duplicateEje] = await db.execute(
      'SELECT id FROM ejes WHERE nombre_eje = ? AND id != ? AND activo = 1',
      [nombre_eje.trim(), id]
    );

    if ((duplicateEje as unknown[]).length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un eje con ese nombre' },
        { status: 400 }
      );
    }

    // Actualizar el eje
    await db.execute(
      'UPDATE ejes SET nombre_eje = ?, descripcion = ? WHERE id = ?',
      [nombre_eje.trim(), descripcion || null, id]
    );

    return NextResponse.json({
      message: 'Eje actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error updating eje:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el eje' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID del eje es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el eje existe
    const [existingEje] = await db.execute(
      'SELECT id FROM ejes WHERE id = ? AND activo = 1',
      [id]
    );

    if ((existingEje as unknown[]).length === 0) {
      return NextResponse.json(
        { error: 'El eje especificado no existe' },
        { status: 404 }
      );
    }

    // Verificar si tiene sub-ejes activos
    const [subEjes] = await db.execute(
      'SELECT id FROM sub_ejes WHERE eje_id = ? AND activo = 1',
      [id]
    );

    if ((subEjes as unknown[]).length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el eje porque tiene sub-ejes asociados' },
        { status: 400 }
      );
    }

    // Verificar si está asignado a áreas
    const [areaEjes] = await db.execute(
      'SELECT id FROM area_ejes WHERE eje_id = ?',
      [id]
    );

    if ((areaEjes as unknown[]).length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el eje porque está asignado a áreas' },
        { status: 400 }
      );
    }

    // Eliminar (marcar como inactivo)
    await db.execute(
      'UPDATE ejes SET activo = 0 WHERE id = ?',
      [id]
    );

    return NextResponse.json({
      message: 'Eje eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting eje:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el eje' },
      { status: 500 }
    );
  }
}