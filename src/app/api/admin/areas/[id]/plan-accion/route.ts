import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Obtener plan de acción para un área
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const areaId = parseInt(params.id);

    // Consulta que obtiene todos los ejes y sub-ejes asignados al área
    // junto con el plan de acción existente
    const query = `
      SELECT 
        pa.id,
        pa.area_id,
        pa.eje_id,
        pa.sub_eje_id,
        e.nombre_eje as eje_nombre,
        se.nombre_sub_eje as sub_eje_nombre,
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
      WHERE ae.area_id = ? 
        AND ae.activo = 1 
        AND e.activo = 1 
        AND se.activo = 1
      ORDER BY e.nombre_eje, se.nombre_sub_eje
    `;

    const [result] = await db.query<Array<{
      id: number | null;
      area_id: number;
      eje_id: number;
      sub_eje_id: number;
      eje_nombre: string;
      sub_eje_nombre: string;
      meta: string | null;
      indicador: string | null;
      accion: string | null;
      presupuesto: number | null;
    }> & RowDataPacket[]>(query, [areaId]);

    // Si hay filas sin plan_accion (id es null), crear registros
    const dataWithIds = [];
    for (const row of result) {
      if (!row.id) {
        // Crear registro en plan_accion
        const insertQuery = `
          INSERT INTO plan_accion (area_id, eje_id, sub_eje_id, meta, indicador, accion, presupuesto)
          VALUES (?, ?, ?, NULL, NULL, NULL, NULL)
        `;
        
        const [insertResult] = await db.query<ResultSetHeader>(insertQuery, [
          areaId,
          row.eje_id,
          row.sub_eje_id
        ]);

        dataWithIds.push({
          id: insertResult.insertId,
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
      SET ${field} = ?, fecha_actualizacion = NOW()
      WHERE id = ?
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