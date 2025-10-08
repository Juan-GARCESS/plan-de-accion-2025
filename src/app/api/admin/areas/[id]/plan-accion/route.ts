import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener plan de acción para un área
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const areaId = parseInt(id);

    // Consulta que obtiene todos los ejes y sub-ejes asignados al área
    // junto con el plan de acción existente
    const query = `
      SELECT 
        pa.id,
        ae.area_id AS area_id,
        e.id AS eje_id,
        se.id AS sub_eje_id,
        e.nombre_eje AS eje_nombre,
        se.nombre_sub_eje AS sub_eje_nombre,
        pa.meta,
        pa.indicador,
        pa.accion,
        pa.presupuesto
      FROM area_ejes ae
      INNER JOIN ejes e ON ae.eje_id = e.id
      INNER JOIN sub_ejes se ON e.id = se.eje_id
      LEFT JOIN plan_accion pa ON (
        pa.area_id = ae.area_id AND 
        pa.eje_id = e.id AND 
        pa.sub_eje_id = se.id
      )
      WHERE ae.area_id = $1
        AND ae.activo = true
        AND e.activo = true
        AND se.activo = true
      ORDER BY e.nombre_eje, se.nombre_sub_eje
    `;

    const result = await db.query(query, [areaId]);

    // Si hay filas sin plan_accion (id es null), crear registros
    const dataWithIds = [];
    for (const row of result.rows) {
      if (!row.id) {
        // Crear registro en plan_accion
        const insertQuery = `
          INSERT INTO plan_accion (area_id, eje_id, sub_eje_id, meta, indicador, accion, presupuesto)
          VALUES ($1, $2, $3, NULL, NULL, NULL, NULL)
          RETURNING id
        `;
        
        const insertResult = await db.query(insertQuery, [
          areaId,
          row.eje_id,
          row.sub_eje_id
        ]);

        dataWithIds.push({
          id: insertResult.rows[0].id,
          area_id: areaId,
          eje_id: row.eje_id,
          sub_eje_id: row.sub_eje_id,
          eje_nombre: row.eje_nombre,
          sub_eje_nombre: row.sub_eje_nombre,
          meta: null,
          indicador: null,
          accion: null,
          presupuesto: null
        });
      } else {
        dataWithIds.push(row);
      }
    }

    return NextResponse.json({
      success: true,
      data: dataWithIds
    });

  } catch (error) {
    console.error('Error en GET plan-accion:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un campo del plan de acción
export async function PUT(request: NextRequest) {
  try {
    const { id, field, value } = await request.json();

    // Validar que el campo sea permitido
    const allowedFields = ['meta', 'indicador', 'accion', 'presupuesto'];
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: 'Campo no válido' },
        { status: 400 }
      );
    }

    // Construir la consulta de actualización
    const query = `
      UPDATE plan_accion 
      SET ${field} = $1, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await db.query(query, [value, id]);

    return NextResponse.json({
      success: true,
      message: 'Campo actualizado correctamente'
    });

  } catch (error) {
    console.error('Error en PUT plan-accion:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}