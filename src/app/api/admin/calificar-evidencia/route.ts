// src/app/api/admin/calificar-evidencia/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { evidencia_id, calificacion, comentario, estado } = body;

    console.log('📥 Datos recibidos:', { evidencia_id, calificacion, comentario, estado });

    if (!evidencia_id || calificacion === undefined || !estado) {
      console.log('❌ Validación falló:', { evidencia_id, calificacion, estado });
      return NextResponse.json({ 
        error: "evidencia_id, calificacion y estado son requeridos",
        received: { evidencia_id, calificacion, estado }
      }, { status: 400 });
    }

    // Validar calificación 0-100
    if (calificacion < 0 || calificacion > 100) {
      return NextResponse.json({ 
        error: "La calificación debe estar entre 0 y 100" 
      }, { status: 400 });
    }

    // Obtener información del usuario y la evidencia desde tabla evidencias
    const evidenciaInfo = await db.query(`
      SELECT 
        e.id,
        e.meta_id,
        pa.meta,
        e.trimestre,
        e.anio,
        u.id as usuario_id,
        u.nombre as usuario_nombre,
        u.email as usuario_email
      FROM evidencias e
      JOIN usuarios u ON e.usuario_id = u.id
      JOIN plan_accion pa ON e.meta_id = pa.id
      WHERE e.id = $1
    `, [evidencia_id]);

    if (evidenciaInfo.rows.length === 0) {
      return NextResponse.json({ error: "Evidencia no encontrada" }, { status: 404 });
    }

    const evidencia = evidenciaInfo.rows[0];

    // Actualizar calificación en tabla evidencias
    await db.query(`
      UPDATE evidencias 
      SET 
        calificacion = $1,
        estado = $2,
        comentario_admin = $3,
        fecha_revision = CURRENT_TIMESTAMP,
        revisado_por = $5
      WHERE id = $4
    `, [calificacion, estado, comentario || null, evidencia_id, userId]);

    // Enviar email al usuario con Resend
    try {
      const esAprobada = estado === 'aprobada' || estado === 'aprobado';
      
      await resend.emails.send({
        from: 'Plan de Acción <onboarding@resend.dev>',
        to: evidencia.usuario_email,
        subject: `${esAprobada ? '✅' : '❌'} Calificación de evidencia - Trimestre ${evidencia.trimestre}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #1f2937; margin-bottom: 20px;">Hola ${evidencia.usuario_nombre}</h1>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Tu evidencia del <strong>Trimestre ${evidencia.trimestre}</strong> ha sido calificada.
              </p>
              
              <div style="background-color: ${esAprobada ? '#ecfdf5' : '#fef2f2'}; border-left: 4px solid ${esAprobada ? '#10b981' : '#ef4444'}; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: ${esAprobada ? '#065f46' : '#991b1b'}; margin: 0; font-size: 14px;">
                  <strong>Meta:</strong> ${evidencia.meta}
                </p>
                <p style="color: ${esAprobada ? '#065f46' : '#991b1b'}; margin: 8px 0 0 0; font-size: 20px; font-weight: 700;">
                  Calificación: ${calificacion}%
                </p>
              </div>
              
              ${comentario ? `
                <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="color: #374151; margin: 0; font-size: 14px;">
                    <strong>Comentario del administrador:</strong><br>
                    ${comentario}
                  </p>
                </div>
              ` : ''}
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
                   style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  Ver Dashboard
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Continúa con el excelente trabajo en tu plan de acción.
              </p>
            </div>
          </div>
        `
      });

      console.log(`✅ Email enviado a ${evidencia.usuario_email}`);
    } catch (emailError) {
      console.error("Error al enviar email:", emailError);
      // No fallar la calificación si el email falla
    }

    return NextResponse.json({ 
      message: "Evidencia calificada correctamente",
      emailSent: true
    });
  } catch (error) {
    console.error("Error al calificar evidencia:", error);
    return NextResponse.json({ 
      error: "Error al calificar evidencia" 
    }, { status: 500 });
  }
}
