// src/app/api/admin/ver-evidencia/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const evidenciaId = searchParams.get('id');

    if (!evidenciaId) {
      return NextResponse.json({ 
        error: "ID de evidencia requerido" 
      }, { status: 400 });
    }

    // Si el ID es una URL de S3, redirigir directamente
    if (evidenciaId.startsWith('http')) {
      return NextResponse.json({
        url: evidenciaId,
        tipo: 'url'
      });
    }

    // Si es un ID numérico, obtener la evidencia de la BD
    const result = await db.query(
      `SELECT archivo_url, archivo_nombre, archivo_tipo 
       FROM evidencias 
       WHERE id = $1`,
      [evidenciaId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: "Evidencia no encontrada" 
      }, { status: 404 });
    }

    const evidencia = result.rows[0];

    return NextResponse.json({
      url: evidencia.archivo_url,
      nombre: evidencia.archivo_nombre,
      tipo: evidencia.archivo_tipo
    });
  } catch (error) {
    console.error("Error al obtener evidencia:", error);
    return NextResponse.json({ 
      error: "Error al obtener evidencia" 
    }, { status: 500 });
  }
}
