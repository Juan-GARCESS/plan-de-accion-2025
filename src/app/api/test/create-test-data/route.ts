// src/app/api/test/create-test-data/route.ts

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'login_app'
};

export async function POST() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Crear usuarios de prueba
      const hashedPassword = await bcrypt.hash('123456', 10);

      // Usuario pendiente
      await connection.execute(`
        INSERT IGNORE INTO usuarios (nombre, email, password, area_solicitada, rol, estado) 
        VALUES ('Juan Pérez', 'juan@test.com', ?, 'Tecnología', 'usuario', 'pendiente')
      `, [hashedPassword]);

      // Usuario pendiente 2
      await connection.execute(`
        INSERT IGNORE INTO usuarios (nombre, email, password, area_solicitada, rol, estado) 
        VALUES ('María García', 'maria@test.com', ?, 'Marketing', 'usuario', 'pendiente')
      `, [hashedPassword]);

      // Usuario activo
      await connection.execute(`
        INSERT IGNORE INTO usuarios (nombre, email, password, area_solicitada, rol, estado, area_id) 
        VALUES ('Carlos López', 'carlos@test.com', ?, 'Ventas', 'usuario', 'activo', 1)
      `, [hashedPassword]);

      // Crear áreas de prueba
      await connection.execute(`
        INSERT IGNORE INTO areas (nombre_area, descripcion, activa) 
        VALUES ('Tecnología', 'Área de desarrollo y sistemas', true)
      `);

      await connection.execute(`
        INSERT IGNORE INTO areas (nombre_area, descripcion, activa) 
        VALUES ('Marketing', 'Área de marketing y publicidad', true)
      `);

      await connection.execute(`
        INSERT IGNORE INTO areas (nombre_area, descripcion, activa) 
        VALUES ('Ventas', 'Área de ventas y comercialización', true)
      `);

      // Crear trimestres de prueba
      await connection.execute(`
        INSERT IGNORE INTO trimestres (trimestre, año, fecha_inicio, fecha_fin, abierto) 
        VALUES (4, 2024, '2024-10-01', '2024-12-31', true)
      `);

      await connection.execute(`
        INSERT IGNORE INTO trimestres (trimestre, año, fecha_inicio, fecha_fin, abierto) 
        VALUES (1, 2025, '2025-01-01', '2025-03-31', true)
      `);

      return NextResponse.json({
        success: true,
        message: 'Datos de prueba creados exitosamente'
      });

    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error creando datos de prueba:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}