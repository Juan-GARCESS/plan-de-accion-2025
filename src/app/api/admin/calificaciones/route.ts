import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Obtener calificaciones de una meta específica
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metaId = searchParams.get('metaId');
    const areaId = searchParams.get('areaId');
    const anio = searchParams.get('anio') || '2025';

    if (metaId) {
      // Obtener calificación de una meta específica
      const result = await query(
        `SELECT * FROM calificaciones_metas 
         WHERE meta_id = $1 AND anio = $2`,
        [metaId, anio]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Calificación no encontrada' }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);
    } else if (areaId) {
      // Obtener todas las calificaciones de un área
      const result = await query(
        `SELECT * FROM vista_calificaciones_detalle 
         WHERE area_id = $1 AND anio = $2
         ORDER BY meta_id`,
        [areaId, anio]
      );

      return NextResponse.json(result.rows);
    } else {
      return NextResponse.json({ error: 'Debe proporcionar metaId o areaId' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    return NextResponse.json({ error: 'Error al obtener calificaciones' }, { status: 500 });
  }
}

// POST: Calificar un trimestre de una meta (calificación informativa)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meta_id, trimestre, calificacion, comentario, admin_id } = body;

    // Validaciones
    if (!meta_id || !trimestre || calificacion === undefined || !admin_id) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    if (trimestre < 1 || trimestre > 4) {
      return NextResponse.json({ error: 'Trimestre debe ser entre 1 y 4' }, { status: 400 });
    }

    if (calificacion < 0 || calificacion > 100) {
      return NextResponse.json({ error: 'Calificación debe estar entre 0 y 100' }, { status: 400 });
    }

    // Verificar que la meta existe
    const metaCheck = await query('SELECT id, area_id FROM plan_accion WHERE id = $1', [meta_id]);
    if (metaCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Meta no encontrada' }, { status: 404 });
    }

    const area_id = metaCheck.rows[0].area_id;

    // Verificar si ya existe el registro de calificaciones para esta meta
    const existingCal = await query(
      'SELECT id FROM calificaciones_metas WHERE meta_id = $1 AND anio = 2025',
      [meta_id]
    );

    if (existingCal.rows.length === 0) {
      // Crear registro inicial
      await query(
        'INSERT INTO calificaciones_metas (meta_id, area_id, anio) VALUES ($1, $2, 2025)',
        [meta_id, area_id]
      );
    }

    // Actualizar calificación del trimestre específico
    const updateQuery = `
      UPDATE calificaciones_metas 
      SET 
        cal_trimestre_${trimestre} = $1,
        comentario_t${trimestre} = $2,
        fecha_calificacion_t${trimestre} = CURRENT_TIMESTAMP,
        calificado_por_t${trimestre} = $3
      WHERE meta_id = $4 AND anio = 2025
      RETURNING *
    `;

    const result = await query(updateQuery, [calificacion, comentario || null, admin_id, meta_id]);

    return NextResponse.json({
      success: true,
      message: `Calificación del trimestre ${trimestre} guardada correctamente`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al guardar calificación trimestral:', error);
    return NextResponse.json({ error: 'Error al guardar calificación' }, { status: 500 });
  }
}

// PATCH: Actualizar calificación Total General (LA IMPORTANTE)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { meta_id, calificacion_total_general, comentario_general, admin_id } = body;

    // Validaciones
    if (!meta_id || calificacion_total_general === undefined || !admin_id) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    if (calificacion_total_general < 0 || calificacion_total_general > 100) {
      return NextResponse.json({ error: 'Calificación debe estar entre 0 y 100' }, { status: 400 });
    }

    // Verificar que la meta existe
    const metaCheck = await query('SELECT id, area_id FROM plan_accion WHERE id = $1', [meta_id]);
    if (metaCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Meta no encontrada' }, { status: 404 });
    }

    const area_id = metaCheck.rows[0].area_id;

    // Verificar si ya existe el registro de calificaciones para esta meta
    const existingCal = await query(
      'SELECT id FROM calificaciones_metas WHERE meta_id = $1 AND anio = 2025',
      [meta_id]
    );

    let result;

    if (existingCal.rows.length === 0) {
      // Crear registro con la calificación general
      result = await query(
        `INSERT INTO calificaciones_metas 
         (meta_id, area_id, anio, calificacion_total_general, comentario_general, calificado_por_general, fecha_calificacion_general) 
         VALUES ($1, $2, 2025, $3, $4, $5, CURRENT_TIMESTAMP)
         RETURNING *`,
        [meta_id, area_id, calificacion_total_general, comentario_general || null, admin_id]
      );
    } else {
      // Actualizar calificación general existente
      result = await query(
        `UPDATE calificaciones_metas 
         SET 
           calificacion_total_general = $1,
           comentario_general = $2,
           fecha_calificacion_general = CURRENT_TIMESTAMP,
           calificado_por_general = $3
         WHERE meta_id = $4 AND anio = 2025
         RETURNING *`,
        [calificacion_total_general, comentario_general || null, admin_id, meta_id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Calificación Total General guardada correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al guardar calificación general:', error);
    return NextResponse.json({ error: 'Error al guardar calificación general' }, { status: 500 });
  }
}
