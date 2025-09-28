import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación usando el mismo sistema que /api/me
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("archivo") as File;
    const trimestre = formData.get("trimestre") as string;
    const año = formData.get("año") as string;

    if (!file || !trimestre || !año) {
      return NextResponse.json(
        { message: "Archivo, trimestre y año son requeridos" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Tipo de archivo no permitido. Solo PDF, Word y Excel" },
        { status: 400 }
      );
    }

    // Limitar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: "El archivo es demasiado grande. Máximo 10MB" },
        { status: 400 }
      );
    }

    // Obtener información del usuario
    const [user] = await db.query(
      "SELECT area_id FROM usuarios WHERE id = ? AND rol = 'usuario'",
      [userId]
    );

    const userData = user as { area_id: number }[];
    if (userData.length === 0 || !userData[0].area_id) {
      return NextResponse.json(
        { message: "Usuario no válido o sin área asignada" },
        { status: 400 }
      );
    }

    const areaId = userData[0].area_id;

    // Verificar que existe el informe con meta
    const [informe] = await db.query(
      "SELECT id, estado FROM informes WHERE usuario_id = ? AND area_id = ? AND trimestre = ? AND año = ?",
      [userId, areaId, trimestre, año]
    );

    const informeData = informe as { id: number; estado: string }[];
    if (informeData.length === 0) {
      return NextResponse.json(
        { message: "Debe crear primero la meta trimestral" },
        { status: 400 }
      );
    }

    // Generar nombre único para el archivo
    const fileExtension = path.extname(file.name);
    const fileName = `informe_${userId}_${areaId}_${trimestre}_${año}_${Date.now()}${fileExtension}`;
    
    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'informes');
    
    try {
      await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));
    } catch (error) {
      console.error("Error al crear directorio:", error);
      // Crear directorio y reintentar
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));
    }

    // Actualizar informe con archivo
    await db.query(
      "UPDATE informes SET archivo = ?, fecha_archivo_subido = NOW(), estado = 'pendiente', updated_at = NOW() WHERE id = ?",
      [fileName, informeData[0].id]
    );

    return NextResponse.json({ 
      message: "Archivo subido correctamente",
      archivo: fileName
    });
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}