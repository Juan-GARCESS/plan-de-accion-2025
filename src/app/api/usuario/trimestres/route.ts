import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación usando el mismo sistema que /api/me
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener información del usuario
    const userResult = await db.query(
      "SELECT id, area_id, nombre, estado FROM usuarios WHERE id = ? AND rol = 'usuario'",
      [userId]
    );

    const userData = user as { id: number; area_id: number; nombre: string; estado: string }[];
    
    if (userData.length === 0 || userData[0].estado !== 'activo' || !userData[0].area_id) {
      return NextResponse.json({ 
        message: "Usuario no válido, no activo o sin área asignada" 
      }, { status: 400 });
    }

    const currentUser = userData[0];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Obtener configuración de trimestres
    const configResult = await db.query(
      "SELECT * FROM config_envios WHERE año = ? ORDER BY trimestre",
      [currentYear]
    );

    const configData = config as {
      id: number;
      trimestre: number;
      año: number;
      fecha_inicio: string;
      fecha_fin: string;
      abierto: boolean;
      habilitado_manualmente: boolean;
      dias_habilitados: number | null;
      fecha_habilitacion_manual: string | null;
    }[];

    // Obtener informes existentes del usuario
    const informesResult = await db.query(
      "SELECT * FROM informes WHERE usuario_id = ? AND año = ?",
      [userId, currentYear]
    );

    const informesData = informes as {
      id: number;
      usuario_id: number;
      area_id: number;
      trimestre: number;
      año: number;
      archivo: string | null;
      meta_trimestral: string;
      estado: string;
      comentario_admin: string | null;
      calificacion: number | null;
      fecha_meta_creada: string | null;
      fecha_archivo_subido: string | null;
    }[];

    // Crear respuesta con estado de cada trimestre
    const trimestres = configData.map(trimestre => {
      const informe = informesData.find(inf => inf.trimestre === trimestre.trimestre);
      const fechaInicio = new Date(trimestre.fecha_inicio);
      const fechaFin = new Date(trimestre.fecha_fin);
      
      // Determinar si está disponible
      let disponible = false;
      let razon = "";

      if (trimestre.habilitado_manualmente && trimestre.fecha_habilitacion_manual && trimestre.dias_habilitados) {
        // Verificar si aún está en el período manual
        const fechaHabilitacion = new Date(trimestre.fecha_habilitacion_manual);
        const fechaVencimiento = new Date(fechaHabilitacion);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + trimestre.dias_habilitados);
        
        if (currentDate <= fechaVencimiento) {
          disponible = true;
          razon = `Habilitado manualmente hasta ${fechaVencimiento.toLocaleDateString()}`;
        } else {
          razon = "Período manual vencido";
        }
      } else if (trimestre.abierto) {
        // Verificar fechas normales
        if (currentDate >= fechaInicio && currentDate <= fechaFin) {
          disponible = true;
          razon = "Período normal activo";
        } else if (currentDate < fechaInicio) {
          razon = `Disponible desde ${fechaInicio.toLocaleDateString()}`;
        } else {
          razon = `Cerrado desde ${fechaFin.toLocaleDateString()}`;
        }
      } else {
        razon = "Trimestre cerrado por administrador";
      }

      return {
        ...trimestre,
        informe: informe || null,
        disponible,
        razon,
        usuario_id: currentUser.id,
        area_id: currentUser.area_id
      };
    });

    return NextResponse.json({
      usuario: currentUser,
      trimestres,
      año_actual: currentYear
    });
  } catch (error) {
    console.error("Error al obtener trimestres:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const userId = match ? parseInt(match[1], 10) : null;

    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener información del usuario
    const userResult = await db.query(
      "SELECT id, area_id, nombre, estado FROM usuarios WHERE id = ? AND rol = 'usuario'",
      [userId]
    );

    const userData = user as { id: number; area_id: number; nombre: string; estado: string }[];
    
    if (userData.length === 0 || userData[0].estado !== 'activo' || !userData[0].area_id) {
      return NextResponse.json({ 
        message: "Usuario no válido, no activo o sin área asignada" 
      }, { status: 400 });
    }

    const currentUser = userData[0];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Obtener datos del request
    const { trimestre, participara } = await request.json();

    if (!trimestre || typeof participara !== 'boolean') {
      return NextResponse.json({ 
        message: "Trimestre y participación son requeridos" 
      }, { status: 400 });
    }

    // Verificar que el trimestre es válido (1-4)
    if (trimestre < 1 || trimestre > 4) {
      return NextResponse.json({ 
        message: "Trimestre debe estar entre 1 y 4" 
      }, { status: 400 });
    }

    // Verificar que el trimestre está disponible para configuración
    const configResult = await db.query(
      "SELECT * FROM config_envios WHERE año = ? AND trimestre = ?",
      [currentYear, trimestre]
    );

    const configData = config as {
      id: number;
      trimestre: number;
      año: number;
      fecha_inicio: string;
      fecha_fin: string;
      abierto: boolean;
      habilitado_manualmente: boolean;
      dias_habilitados: number | null;
      fecha_habilitacion_manual: string | null;
    }[];

    if (configData.length === 0) {
      return NextResponse.json({ 
        message: "Configuración de trimestre no encontrada" 
      }, { status: 400 });
    }

    const trimestreConfig = configData[0];

    // Verificar si el usuario puede configurar este trimestre
    // (normalmente antes de que inicie o durante períodos especiales)
    let puedeConfigurar = false;
    
    if (trimestreConfig.habilitado_manualmente && trimestreConfig.fecha_habilitacion_manual && trimestreConfig.dias_habilitados) {
      // Verificar si aún está en el período manual de configuración
      const fechaHabilitacion = new Date(trimestreConfig.fecha_habilitacion_manual);
      const fechaVencimiento = new Date(fechaHabilitacion);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + trimestreConfig.dias_habilitados);
      
      if (currentDate <= fechaVencimiento) {
        puedeConfigurar = true;
      }
    } else {
      // Permitir configuración antes del inicio del trimestre
      const fechaInicio = new Date(trimestreConfig.fecha_inicio);
      if (currentDate < fechaInicio) {
        puedeConfigurar = true;
      }
    }

    if (!puedeConfigurar) {
      return NextResponse.json({ 
        message: "No se puede configurar participación en este trimestre en este momento" 
      }, { status: 400 });
    }

    if (participara) {
      // Crear informe si el usuario dice que participará
      // Verificar si ya existe un informe para este trimestre
      const existingReportResult = await db.query(
        "SELECT id FROM informes WHERE usuario_id = ? AND area_id = ? AND trimestre = ? AND año = ?",
        [userId, currentUser.area_id, trimestre, currentYear]
      );

      const existingData = existingReport as { id: number }[];

      if (existingData.length === 0) {
        // Crear nuevo informe
        await db.query(
          `INSERT INTO informes (usuario_id, area_id, trimestre, año, meta_trimestral, estado) 
           VALUES (?, ?, ?, ?, '', 'esperando_meta')`,
          [userId, currentUser.area_id, trimestre, currentYear]
        );
      } else {
        // Actualizar estado si existe
        await db.query(
          "UPDATE informes SET estado = 'esperando_meta' WHERE id = ?",
          [existingData[0].id]
        );
      }
    } else {
      // Eliminar informe si el usuario dice que no participará
      await db.query(
        "DELETE FROM informes WHERE usuario_id = ? AND area_id = ? AND trimestre = ? AND año = ?",
        [userId, currentUser.area_id, trimestre, currentYear]
      );
    }

    return NextResponse.json({ 
      message: participara ? "Participación confirmada" : "Participación cancelada",
      success: true 
    });

  } catch (error) {
    console.error("Error al actualizar participación en trimestre:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}