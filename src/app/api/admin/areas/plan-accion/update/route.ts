// src/app/api/admin/areas/plan-accion/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminCheck = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [userId]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, meta, indicador } = body;

    if (!id) {
      return NextResponse.json({ 
        error: "ID requerido" 
      }, { status: 400 });
    }

    // Construir query dinámicamente
    const updates: string[] = [];
    const values: (string | number)[] = [];
    let paramCount = 1;

    if (meta !== undefined) {
      updates.push(`meta = $${paramCount}`);
      values.push(meta);
      paramCount++;
    }

    if (indicador !== undefined) {
      updates.push(`indicador = $${paramCount}`);
      values.push(indicador);
      paramCount++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ 
        error: "No hay campos para actualizar" 
      }, { status: 400 });
    }

    values.push(id);
    const query = `
      UPDATE plan_accion 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: "Registro no encontrado" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error en PUT plan-accion/update:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
