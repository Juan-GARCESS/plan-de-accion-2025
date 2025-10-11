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

    // Verificar rol del usuario
    const userCheck = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    }

    const isAdmin = userCheck.rows[0].rol === 'admin';

    const body = await request.json();
    const { id, meta, indicador, accion, presupuesto, t1, t2, t3, t4 } = body;

    if (!id) {
      return NextResponse.json({ 
        error: "ID requerido" 
      }, { status: 400 });
    }

    // Validar permisos según rol
    if (!isAdmin && (meta !== undefined || indicador !== undefined)) {
      return NextResponse.json({ 
        error: "No tienes permiso para editar Meta o Indicador" 
      }, { status: 403 });
    }

    // Construir query dinámicamente
    const updates: string[] = [];
    const values: (string | number | boolean)[] = [];
    let paramCount = 1;

    // Admin puede editar meta e indicador
    if (isAdmin && meta !== undefined) {
      updates.push(`meta = $${paramCount}`);
      values.push(meta);
      paramCount++;
    }

    if (isAdmin && indicador !== undefined) {
      updates.push(`indicador = $${paramCount}`);
      values.push(indicador);
      paramCount++;
    }

    // Todos pueden editar accion, presupuesto y trimestres
    if (accion !== undefined) {
      updates.push(`accion = $${paramCount}`);
      values.push(accion);
      paramCount++;
    }

    if (presupuesto !== undefined) {
      updates.push(`presupuesto = $${paramCount}`);
      values.push(presupuesto);
      paramCount++;
    }

    if (t1 !== undefined) {
      updates.push(`t1 = $${paramCount}`);
      values.push(t1);
      paramCount++;
    }

    if (t2 !== undefined) {
      updates.push(`t2 = $${paramCount}`);
      values.push(t2);
      paramCount++;
    }

    if (t3 !== undefined) {
      updates.push(`t3 = $${paramCount}`);
      values.push(t3);
      paramCount++;
    }

    if (t4 !== undefined) {
      updates.push(`t4 = $${paramCount}`);
      values.push(t4);
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
