// API para gestionar sub-ejes - GET (listar por eje) y POST (crear)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ejeId = searchParams.get('eje_id');

    if (!ejeId) {
      return NextResponse.json(
        { error: 'El ID del eje es requerido' },
        { status: 400 }
      );
    }

    const subEjesResult = await db.query(
      `SELECT se.id, se.nombre_sub_eje, se.descripcion, se.fecha_creacion,
              e.nombre_eje
       FROM sub_ejes se
       JOIN ejes e ON se.eje_id = e.id
       WHERE se.eje_id = $1 AND se.activo = true
       ORDER BY se.fecha_creacion DESC`,
      [ejeId]
    );

    return NextResponse.json(subEjesResult.rows);
  } catch (error) {
    console.error('Error fetching sub-ejes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los sub-ejes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { eje_id, nombre_sub_eje, descripcion } = await request.json();

    if (!eje_id || !nombre_sub_eje || nombre_sub_eje.trim() === '') {
      return NextResponse.json(
        { error: 'El ID del eje y el nombre del sub-eje son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el eje existe
    const existingEjeResult = await db.query(
      'SELECT id FROM ejes WHERE id = $1 AND activo = true',
      [eje_id]
    );

    if (existingEjeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'El eje especificado no existe' },
        { status: 400 }
      );
    }

    // Verificar si el sub-eje ya existe para este eje
    const existingSubEjeResult = await db.query(
      'SELECT id FROM sub_ejes WHERE eje_id = $1 AND nombre_sub_eje = $2 AND activo = true',
      [eje_id, nombre_sub_eje.trim()]
    );

    if (existingSubEjeResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un sub-eje con ese nombre para este eje' },
        { status: 400 }
      );
    }

    // Crear el nuevo sub-eje
    const result = await db.query(
      'INSERT INTO sub_ejes (eje_id, nombre_sub_eje, descripcion) VALUES ($1, $2, $3) RETURNING id',
      [eje_id, nombre_sub_eje.trim(), descripcion || null]
    );

    const insertId = result.rows[0].id;

    // Obtener el sub-eje creado con información del eje
    const nuevoSubEjeResult = await db.query(
      `SELECT se.*, e.nombre_eje 
       FROM sub_ejes se 
       JOIN ejes e ON se.eje_id = e.id 
       WHERE se.id = $1`,
      [insertId]
    );

    return NextResponse.json({
      message: 'Sub-eje creado exitosamente',
      subEje: nuevoSubEjeResult.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating sub-eje:', error);
    return NextResponse.json(
      { error: 'Error al crear el sub-eje' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, nombre_sub_eje, descripcion, eje_id } = await request.json();

    if (!id || !nombre_sub_eje || nombre_sub_eje.trim() === '' || !eje_id) {
      return NextResponse.json(
        { error: 'ID, nombre del sub-eje y eje_id son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el sub-eje existe
    const existingSubEjeResult = await db.query(
      'SELECT id FROM sub_ejes WHERE id = $1 AND activo = true',
      [id]
    );

    if (existingSubEjeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'El sub-eje especificado no existe' },
        { status: 404 }
      );
    }

    // Verificar que el eje existe
    const existingEjeResult = await db.query(
      'SELECT id FROM ejes WHERE id = $1 AND activo = true',
      [eje_id]
    );

    if (existingEjeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'El eje especificado no existe' },
        { status: 400 }
      );
    }

    // Verificar si ya existe otro sub-eje con el mismo nombre para este eje
    const duplicateSubEjeResult = await db.query(
      'SELECT id FROM sub_ejes WHERE eje_id = $1 AND nombre_sub_eje = $2 AND id != $3 AND activo = true',
      [eje_id, nombre_sub_eje.trim(), id]
    );

    if (duplicateSubEjeResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un sub-eje con ese nombre para este eje' },
        { status: 400 }
      );
    }

    // Actualizar el sub-eje
    await db.query(
      'UPDATE sub_ejes SET nombre_sub_eje = $1, descripcion = $2, eje_id = $3 WHERE id = $4',
      [nombre_sub_eje.trim(), descripcion || null, eje_id, id]
    );

    return NextResponse.json({
      message: 'Sub-eje actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error updating sub-eje:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el sub-eje' },
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
        { error: 'ID del sub-eje es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el sub-eje existe
    const existingSubEjeResult = await db.query(
      'SELECT id FROM sub_ejes WHERE id = $1 AND activo = true',
      [id]
    );

    if (existingSubEjeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'El sub-eje especificado no existe' },
        { status: 404 }
      );
    }

    // Eliminar (marcar como inactivo)
    await db.query(
      'UPDATE sub_ejes SET activo = false WHERE id = $1',
      [id]
    );

    return NextResponse.json({
      message: 'Sub-eje eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting sub-eje:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el sub-eje' },
      { status: 500 }
    );
  }
}