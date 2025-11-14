// src/app/api/usuario/perfil/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_secreto_cambiame';

export async function PUT(request: NextRequest) {
  try {
    console.log('=== INICIO UPDATE PERFIL ===');
    
    // Verificar autenticación usando la cookie userId
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId')?.value;
    
    console.log('Cookie userId:', userIdCookie);

    if (!userIdCookie) {
      console.error('No se encontró cookie userId');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = parseInt(userIdCookie, 10);
    
    if (isNaN(userId)) {
      console.error('userId no es un número válido:', userIdCookie);
      return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, foto_url } = body;

    console.log('Datos recibidos:', { userId, nombre, foto_url });

    if (!nombre || nombre.trim() === '') {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    // Actualizar perfil en la base de datos incluyendo foto_url
    const result = await db.query(
      'UPDATE usuarios SET nombre = $1, foto_url = $2 WHERE id = $3 RETURNING *',
      [nombre.trim(), foto_url || null, userId]
    );

    console.log('Usuario actualizado:', result.rows[0]);

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      usuario: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar el perfil' },
      { status: 500 }
    );
  }
}
