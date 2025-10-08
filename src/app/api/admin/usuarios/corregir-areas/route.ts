import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    // Obtener usuarios activos sin área asignada
    const usuariosSinAreaResult = await db.query(
      "SELECT id, nombre, area_solicitada FROM usuarios WHERE estado = 'activo' AND area_id IS NULL"
    );

    const usuarios = usuariosSinAreaResult.rows as { id: number; nombre: string; area_solicitada: string }[];
    
    if (usuarios.length === 0) {
      return NextResponse.json({ message: "No hay usuarios activos sin área asignada" });
    }

    // Intentar asignar áreas basándose en area_solicitada
    let corregidos = 0;
    
    for (const usuario of usuarios) {
      if (usuario.area_solicitada) {
        // Buscar área que coincida con la solicitada
        const areaResult = await db.query(
          "SELECT id FROM areas WHERE LOWER(nombre_area) = LOWER($1)",
          [usuario.area_solicitada.trim()]
        );
        
        const areaData = areaResult.rows as { id: number }[];
        
        if (areaData.length > 0) {
          // Asignar el área encontrada
          await db.query(
            "UPDATE usuarios SET area_id = $1 WHERE id = $2",
            [areaData[0].id, usuario.id]
          );
          corregidos++;
        }
      }
    }

    return NextResponse.json({ 
      message: `Se corrigieron ${corregidos} de ${usuarios.length} usuarios sin área asignada`,
      usuariosCorregidos: corregidos,
      usuariosSinCorregir: usuarios.length - corregidos
    });
  } catch (error) {
    console.error("Error al corregir usuarios sin área:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}