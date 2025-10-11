// src/app/api/usuario/trimestre-metas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Obtener metas del usuario por trimestre
export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trimestre = searchParams.get('trimestre');
    const areaId = searchParams.get('area_id');

    if (!trimestre || !areaId) {
      return NextResponse.json({ 
        error: "Parámetros requeridos: trimestre, area_id" 
      }, { status: 400 });
    }

    // TODO: Implementar sistema de evidencias con plan_accion
    // Por ahora retornamos un array vacío para evitar errores
    return NextResponse.json({ 
      metas: []
    });
  } catch (error) {
    console.error("Error al obtener metas:", error);
    return NextResponse.json({ 
      error: "Error al obtener metas" 
    }, { status: 500 });
  }
}
