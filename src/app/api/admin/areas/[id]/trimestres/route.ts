import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

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
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Obtener configuración de trimestres
    const [config] = await db.query<(RowDataPacket & {
      id: number;
      trimestre: number;
      año: number;
      fecha_inicio: string;
      fecha_fin: string;
      abierto: boolean;
      habilitado_manualmente: boolean;
      dias_habilitados: number | null;
      fecha_habilitacion_manual: string | null;
    })[]>(
      "SELECT * FROM config_envios WHERE año = ? ORDER BY trimestre",
      [currentYear]
    );

    // Obtener informes de usuarios de esta área
    const [informes] = await db.query<(RowDataPacket & {
      id: number;
      usuario_id: number;
      usuario_nombre: string;
      usuario_email: string;
      trimestre: number;
      año: number;
      archivo: string | null;
      meta_trimestral: string | null;
      estado: 'planificando' | 'pendiente' | 'aceptado' | 'rechazado';
      comentario_admin: string | null;
      calificacion: number | null;
      fecha_meta_creada: string | null;
      fecha_archivo_subido: string | null;
    })[]>(`
      SELECT 
        i.id,
        i.usuario_id,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        i.trimestre,
        i.año,
        i.archivo,
        i.meta_trimestral,
        i.estado,
        i.comentario_admin,
        i.calificacion,
        i.fecha_meta_creada,
        i.fecha_archivo_subido
      FROM informes i
      JOIN usuarios u ON u.id = i.usuario_id
      WHERE i.area_id = ? AND i.año = ? AND u.estado = 'activo'
      ORDER BY i.trimestre, u.nombre
    `, [areaId, currentYear]);

    // Crear respuesta con estado de cada trimestre
    const trimestres = config.map(trimestre => {
      const informesTrimestre = informes.filter(inf => inf.trimestre === trimestre.trimestre);
      const fechaInicio = new Date(trimestre.fecha_inicio);
      const fechaFin = new Date(trimestre.fecha_fin);
      
      // Determinar si está disponible (similar lógica al endpoint de usuario)
      let disponible = false;
      let razon = "";

      if (trimestre.habilitado_manualmente) {
        if (trimestre.dias_habilitados && trimestre.fecha_habilitacion_manual) {
          const fechaHabilitacion = new Date(trimestre.fecha_habilitacion_manual);
          const fechaLimite = new Date(fechaHabilitacion.getTime() + (trimestre.dias_habilitados * 24 * 60 * 60 * 1000));
          
          if (currentDate <= fechaLimite) {
            disponible = true;
            razon = `Habilitado manualmente hasta ${fechaLimite.toLocaleDateString()}`;
          } else {
            razon = `Habilitación manual expiró el ${fechaLimite.toLocaleDateString()}`;
          }
        } else {
          disponible = true;
          razon = "Habilitado manualmente sin límite de tiempo";
        }
      } else if (trimestre.abierto && currentDate >= fechaInicio && currentDate <= fechaFin) {
        disponible = true;
        razon = "Período regular abierto";
      } else if (currentDate < fechaInicio) {
        razon = `Inicia el ${fechaInicio.toLocaleDateString()}`;
      } else if (currentDate > fechaFin) {
        razon = `Finalizó el ${fechaFin.toLocaleDateString()}`;
      } else {
        razon = "Período cerrado por configuración";
      }

      return {
        id: trimestre.id,
        trimestre: trimestre.trimestre,
        año: trimestre.año,
        fecha_inicio: trimestre.fecha_inicio,
        fecha_fin: trimestre.fecha_fin,
        disponible,
        razon,
        informes: informesTrimestre
      };
    });

    return NextResponse.json({ trimestres });
  } catch (err) {
    console.error("Error al obtener trimestres del área:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}