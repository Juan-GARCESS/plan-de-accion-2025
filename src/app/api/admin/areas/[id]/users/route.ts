import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

// API para obtener usuarios de un área específica con información de participación en trimestres
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const [admin] = await db.query<(RowDataPacket & {
      rol: string;
    })[]>(
      "SELECT rol FROM usuarios WHERE id = ? AND estado = 'activo'",
      [userId]
    );

    if (!admin || admin.length === 0 || admin[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const areaId = parseInt(id, 10);

    // Verificar que el área existe y no es "admin"
    const [area] = await db.query<(RowDataPacket & {
      nombre_area: string;
    })[]>(
      "SELECT nombre_area FROM areas WHERE id = ? AND nombre_area != 'admin'",
      [areaId]
    );

    if (!area || area.length === 0) {
      return NextResponse.json({ error: "Área no encontrada o no accesible" }, { status: 404 });
    }

    // Obtener año actual
    const currentYear = new Date().getFullYear();

    // Obtener usuarios del área con información de trimestres
    const [users] = await db.query<(RowDataPacket & {
      id: number;
      nombre: string;
      email: string;
      estado: string;
    })[]>(
      `SELECT u.id, u.nombre, u.email, u.estado 
       FROM usuarios u 
       WHERE u.area_id = ? AND u.rol = 'usuario' AND u.estado = 'activo'
       ORDER BY u.nombre`,
      [areaId]
    );

    // Para cada usuario, obtener información de trimestres
    const usersWithTrimestres = await Promise.all(
      users.map(async (user) => {
        // Obtener selecciones de trimestres del usuario para el año actual
        const [selecciones] = await db.query<(RowDataPacket & {
          trimestre: number;
          participando: number;
        })[]>(
          `SELECT trimestre, participando 
           FROM selecciones_trimestre 
           WHERE usuario_id = ? AND año = ?`,
          [user.id, currentYear]
        );

        // Obtener informes del usuario para el año actual
        const [informes] = await db.query<(RowDataPacket & {
          trimestre: number;
          meta_trimestral: string;
          estado: string;
          fecha_meta_creada: string;
          calificacion: number;
          comentario_admin: string;
        })[]>(
          `SELECT trimestre, meta_trimestral, estado, fecha_meta_creada, calificacion, comentario_admin
           FROM informes 
           WHERE usuario_id = ? AND area_id = ? AND año = ?`,
          [user.id, areaId, currentYear]
        );

        // Crear objeto con participación en trimestres (basado en selecciones_trimestre)
        const participacion_trimestres: { [key: number]: boolean } = {};
        const metas: { [key: number]: string } = {};
        const estados_informes: { [key: number]: string } = {};
        const calificaciones: { [key: number]: number | null } = {};
        const comentarios: { [key: number]: string | null } = {};

        // Llenar participación desde selecciones_trimestre
        selecciones.forEach((seleccion) => {
          participacion_trimestres[seleccion.trimestre] = Boolean(seleccion.participando);
        });

        // Llenar información de metas y estados desde informes
        informes.forEach((informe) => {
          metas[informe.trimestre] = informe.meta_trimestral || '';
          estados_informes[informe.trimestre] = informe.estado;
          calificaciones[informe.trimestre] = informe.calificacion;
          comentarios[informe.trimestre] = informe.comentario_admin;
        });

        return {
          ...user,
          participacion_trimestres,
          metas,
          estados_informes,
          calificaciones,
          comentarios
        };
      })
    );

    return NextResponse.json(usersWithTrimestres);
  } catch (error) {
    console.error("Error al obtener usuarios del área:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}