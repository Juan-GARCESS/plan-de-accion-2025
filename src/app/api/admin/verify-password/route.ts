// src/app/api/admin/verify-password/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'La contraseña es requerida', valid: false },
        { status: 400 }
      );
    }

    // Obtener el usuario admin de la sesión actual
    const sessionRes = await fetch(new URL('/api/me', request.url), {
      headers: request.headers
    });

    if (!sessionRes.ok) {
      return NextResponse.json(
        { error: 'No autenticado', valid: false },
        { status: 401 }
      );
    }

    const sessionData = await sessionRes.json();

    // Verificar que sea admin
    if (sessionData.rol !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado', valid: false },
        { status: 403 }
      );
    }

    // Obtener el hash de la contraseña del admin desde la base de datos
    const result = await db.query(
      'SELECT password FROM usuarios WHERE id = $1 AND rol = $2',
      [sessionData.id, 'admin']
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado', valid: false },
        { status: 404 }
      );
    }

    const adminUser = result.rows[0];

    // Comparar la contraseña proporcionada con el hash almacenado
    const isValid = await bcrypt.compare(password, adminUser.password);

    return NextResponse.json({
      valid: isValid,
      message: isValid ? 'Contraseña correcta' : 'Contraseña incorrecta'
    });

  } catch (error) {
    console.error('Error al verificar contraseña:', error);
    return NextResponse.json(
      { error: 'Error al verificar contraseña', valid: false },
      { status: 500 }
    );
  }
}
