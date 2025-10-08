// src/app/api/admin/areas/[id]/usuarios/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 🔐 Verificar autenticación usando cookies
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 🔍 Verificar que el usuario es admin
    const adminCheckResult = await db.query(`
      SELECT rol FROM usuarios WHERE id = $1
    `, [userId]);

    if (adminCheckResult.rows.length === 0 || adminCheckResult.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

  const { id } = await context.params;
  const areaId = parseInt(id, 10);

    // 📊 Obtener usuarios del área con sus selecciones de trimestre y metas
    const usuariosResult = await db.query(`
      SELECT 
        u.id,
        u.nombre,
        u.email,
        u.area_id,
        -- Selecciones de trimestre (si participó o no)
        MAX(CASE WHEN st.trimestre = 1 THEN st.participando END) as trimestre1,
        MAX(CASE WHEN st.trimestre = 2 THEN st.participando END) as trimestre2,
        MAX(CASE WHEN st.trimestre = 3 THEN st.participando END) as trimestre3,
        MAX(CASE WHEN st.trimestre = 4 THEN st.participando END) as trimestre4,
        -- Metas asignadas (si las tienen)
        MAX(CASE WHEN m.trimestre = 1 THEN m.meta_texto END) as meta1,
        MAX(CASE WHEN m.trimestre = 2 THEN m.meta_texto END) as meta2,
        MAX(CASE WHEN m.trimestre = 3 THEN m.meta_texto END) as meta3,
        MAX(CASE WHEN m.trimestre = 4 THEN m.meta_texto END) as meta4
      FROM usuarios u
      LEFT JOIN selecciones_trimestre st ON u.id = st.usuario_id AND st.año = EXTRACT(YEAR FROM CURRENT_TIMESTAMP)
      LEFT JOIN metas_trimestrales m ON u.id = m.usuario_id AND m.año = EXTRACT(YEAR FROM CURRENT_TIMESTAMP)
      WHERE u.area_id = $1 AND u.estado = 'activo' AND u.rol = 'usuario'
      GROUP BY u.id, u.nombre, u.email, u.area_id
      ORDER BY u.nombre
    `, [areaId]);

    // Convertir valores booleanos para las selecciones de trimestre
    const usuariosFormateados = usuariosResult.rows.map((user: any) => ({
      ...user,
      trimestre1: !!user.trimestre1,
      trimestre2: !!user.trimestre2,
      trimestre3: !!user.trimestre3,
      trimestre4: !!user.trimestre4
    }));

    return NextResponse.json({
      usuarios: usuariosFormateados
    });

  } catch (error) {
    console.error('Error al obtener usuarios del área:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}