// API para gestionar ejes - GET (listar) y POST (crear)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const ejesResult = await db.query(
      `SELECT e.id, e.nombre_eje, e.descripcion, e.fecha_creacion,
              COUNT(se.id) as total_sub_ejes
       FROM ejes e 
       LEFT JOIN sub_ejes se ON e.id = se.eje_id AND se.activo = true
       WHERE e.activo = true 
       GROUP BY e.id, e.nombre_eje, e.descripcion, e.fecha_creacion
       ORDER BY e.fecha_creacion DESC`
    );

    return NextResponse.json(ejesResult.rows);
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
    const existingEjeResult = await db.query(
      'SELECT id FROM ejes WHERE nombre_eje = $1 AND activo = true',
      [nombre_eje.trim()]
    );

    if (existingEjeResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un eje con ese nombre' },
        { status: 400 }
      );
    }

    // Crear el nuevo eje
    const result = await db.query(
      'INSERT INTO ejes (nombre_eje, descripcion) VALUES ($1, $2) RETURNING id',
      [nombre_eje.trim(), descripcion || null]
    );

    // Obtener el eje creado
    const nuevoEjeResult = await db.query(
      'SELECT * FROM ejes WHERE id = $1',
      [result.rows[0].id]
    );

    return NextResponse.json({
      message: 'Eje creado exitosamente',
      eje: nuevoEjeResult.rows[0]
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
    const existingEjeResult = await db.query(
      'SELECT id FROM ejes WHERE id = $1 AND activo = true',
      [id]
    );

    if (existingEjeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'El eje especificado no existe' },
        { status: 404 }
      );
    }

    // Verificar si ya existe otro eje con el mismo nombre
    const duplicateEjeResult = await db.query(
      'SELECT id FROM ejes WHERE nombre_eje = $1 AND id != $2 AND activo = true',
      [nombre_eje.trim(), id]
    );

    if (duplicateEjeResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un eje con ese nombre' },
        { status: 400 }
      );
    }

    // Actualizar el eje
    await db.query(
      'UPDATE ejes SET nombre_eje = $1, descripcion = $2 WHERE id = $3',
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
    const existingEjeResult = await db.query(
      'SELECT id FROM ejes WHERE id = $1 AND activo = true',
      [id]
    );

    if (existingEjeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'El eje especificado no existe' },
        { status: 404 }
      );
    }

    // Verificar si tiene sub-ejes activos
    const subEjesResult = await db.query(
      'SELECT id FROM sub_ejes WHERE eje_id = $1 AND activo = true',
      [id]
    );

    if (subEjesResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el eje porque tiene sub-ejes asociados' },
        { status: 400 }
      );
    }

    // Verificar si está asignado a áreas
    const areaEjesResult = await db.query(
      'SELECT id FROM area_ejes WHERE eje_id = $1',
      [id]
    );

    if (areaEjesResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el eje porque está asignado a áreas' },
        { status: 400 }
      );
    }

    // Eliminar (marcar como inactivo)
    await db.query(
      'UPDATE ejes SET activo = false WHERE id = $1',
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