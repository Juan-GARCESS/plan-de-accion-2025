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

    const { user_id, motivo } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    // Verificar que el usuario existe
    const userResult = await db.query(
      "SELECT id, email, nombre FROM usuarios WHERE id = $1",
      [user_id]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { email, nombre } = userResult.rows[0];

    await db.query(
      "UPDATE usuarios SET estado = 'rechazado', updated_at = CURRENT_TIMESTAMP WHERE id = $1", 
      [user_id]
    );

    // Enviar email de notificación
    try {
      await resend.emails.send({
        from: 'Plan de Acción <onboarding@resend.dev>',
        to: email,
        subject: 'Actualización sobre tu solicitud de registro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #1f2937; margin-bottom: 20px;">Hola ${nombre}</h1>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Lamentamos informarte que tu solicitud de registro en el Sistema de Plan de Acción <strong style="color: #ef4444;">no ha sido aprobada</strong>.
              </p>
              
              ${motivo ? `
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="color: #991b1b; margin: 0; font-size: 14px;">
                    <strong>Motivo:</strong> ${motivo}
                  </p>
                </div>
              ` : ''}
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Si crees que esto es un error o necesitas más información, por favor contacta al administrador del sistema.
              </p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Gracias por tu comprensión.
              </p>
            </div>
          </div>
        `
      });

      // Registrar el email enviado
      await db.query(
        `INSERT INTO emails_enviados (usuario_id, tipo, asunto, estado) 
         VALUES ($1, 'rechazo', 'Solicitud rechazada', 'enviado')`,
        [user_id]
      );
    } catch (emailError) {
      console.error("Error al enviar email:", emailError);
    }
    
    return NextResponse.json({ message: "Usuario rechazado correctamente" });
  } catch (error) {
    console.error("Error al rechazar usuario:", error);
    return NextResponse.json({ error: "Error al rechazar usuario" }, { status: 500 });
  }
}

