// src/app/api/usuario/trimestres-disponibles/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';


interface SeleccionTrimestre extends RowDataPacket {
  trimestre: number;
  participando: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // 🔐 Verificar autenticación usando cookies
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 📅 Obtener selecciones actuales del usuario para todos los trimestres del año actual
    const seleccionesResult = await db.query(`
      SELECT trimestre, participando 
      FROM selecciones_trimestre 
      WHERE usuario_id = ? AND año = YEAR(NOW())
      ORDER BY trimestre
    `, [userId]);

    // Crear array con los 4 trimestres del año
    const trimestresData = [1, 2, 3, 4].map(trimestre => {
      const seleccion = selecciones.find(s => s.trimestre === trimestre);
      return {
        trimestre,
        participando: seleccion ? Boolean(seleccion.participando) : false
      };
    });

    return NextResponse.json({
      selecciones: trimestresData,
      año: new Date().getFullYear()
    });

  } catch (error) {
    console.error('Error al obtener trimestres disponibles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}