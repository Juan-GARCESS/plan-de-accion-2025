import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const match = cookie?.match(/userId=(\d+)/);
    const adminUserId = match ? parseInt(match[1], 10) : null;

    if (!adminUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que es admin
    const adminResult = await db.query(
      "SELECT rol FROM usuarios WHERE id = $1 AND estado = 'activo'",
      [adminUserId]
    );

    if (!adminResult.rows || adminResult.rows.length === 0 || adminResult.rows[0].rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { user_id, area_id } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }
    if (!area_id) {
      return NextResponse.json({ error: "Área requerida para aprobar" }, { status: 400 });
    }

    // Verificar que el usuario existe y está pendiente
    const userResult = await db.query(
      "SELECT id, estado FROM usuarios WHERE id = $1",
      [user_id]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Verificar que el área existe
    const areaResult = await db.query(
      "SELECT id FROM areas WHERE id = $1",
      [area_id]
    );

    if (!areaResult.rows || areaResult.rows.length === 0) {
      return NextResponse.json({ error: "Área no encontrada" }, { status: 404 });
    }

    // Obtener información del usuario y área
    const userInfoResult = await db.query(
      "SELECT u.email, u.nombre, a.nombre as area_nombre FROM usuarios u JOIN areas a ON a.id = $1 WHERE u.id = $2",
      [area_id, user_id]
    );

    const { email, nombre, area_nombre } = userInfoResult.rows[0];

    // Actualizar estado a 'activo' y asignar el área
    await db.query(
      "UPDATE usuarios SET estado = 'activo', area_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [area_id, user_id]
    );

    // Enviar email de bienvenida con Resend
    try {
      await resend.emails.send({
        from: 'Plan de Acción <onboarding@resend.dev>',
        to: email,
        subject: '¡Bienvenido al Sistema de Plan de Acción! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #1f2937; margin-bottom: 20px;">¡Bienvenido ${nombre}! 🎉</h1>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Tu cuenta ha sido <strong style="color: #10b981;">aprobada exitosamente</strong> por el administrador.
              </p>
              
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #065f46; margin: 0; font-size: 14px;">
                  <strong>📍 Área asignada:</strong> ${area_nombre}
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Ya puedes acceder al sistema y comenzar a trabajar en tu plan de acción trimestral.
              </p>
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}" 
                   style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  Acceder al Sistema
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Si tienes alguna pregunta, no dudes en contactar al administrador.
              </p>
            </div>
          </div>
        `
      });

      // Registrar el email enviado
      await db.query(
        `INSERT INTO emails_enviados (usuario_id, tipo, asunto, estado) 
         VALUES ($1, 'aprobacion', 'Cuenta aprobada', 'enviado')`,
        [user_id]
      );
    } catch (emailError) {
      console.error("Error al enviar email:", emailError);
      // No fallar la aprobación si el email falla
    }

    return NextResponse.json({ 
      message: "Usuario aprobado correctamente",
      emailSent: true 
    });
  } catch (error) {
    console.error("Error al aprobar usuario:", error);
    return NextResponse.json({ error: "Error al aprobar usuario" }, { status: 500 });
  }
}
