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
    const { meta_id, calificacion, comentario, estado } = body;

    if (!meta_id || calificacion === undefined || !estado) {
      return NextResponse.json({ 
        error: "meta_id, calificacion y estado son requeridos" 
      }, { status: 400 });
    }

    // Obtener información del usuario y meta
    const metaInfo = await db.query(`
      SELECT 
        um.id,
        um.meta,
        um.trimestre,
        u.id as usuario_id,
        u.nombre as usuario_nombre,
        u.email as usuario_email
      FROM usuario_metas um
      JOIN usuarios u ON um.usuario_id = u.id
      WHERE um.id = $1
    `, [meta_id]);

    if (metaInfo.rows.length === 0) {
      return NextResponse.json({ error: "Meta no encontrada" }, { status: 404 });
    }

    const meta = metaInfo.rows[0];

    // Actualizar calificación en usuario_metas
    await db.query(`
      UPDATE usuario_metas 
      SET 
        calificacion = $1,
        estado_calificacion = $2,
        comentario_admin = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [calificacion, estado, comentario || null, meta_id]);

    // Enviar email al usuario
    try {
      const esAprobada = estado === 'aprobada';
      
      await resend.emails.send({
        from: 'Plan de Acción <onboarding@resend.dev>',
        to: meta.usuario_email,
        subject: `${esAprobada ? '✓' : '✗'} Calificación de evidencia - Trimestre ${meta.trimestre}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #1f2937; margin-bottom: 20px;">Hola ${meta.usuario_nombre}</h1>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Tu evidencia del <strong>Trimestre ${meta.trimestre}</strong> ha sido calificada.
              </p>
              
              <div style="background-color: ${esAprobada ? '#ecfdf5' : '#fef2f2'}; border-left: 4px solid ${esAprobada ? '#10b981' : '#ef4444'}; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: ${esAprobada ? '#065f46' : '#991b1b'}; margin: 0; font-size: 14px;">
                  <strong>Meta:</strong> ${meta.meta}
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
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard" 
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

      // Registrar email enviado
      await db.query(
        `INSERT INTO emails_enviados (usuario_id, tipo, asunto, estado) 
         VALUES ($1, 'calificacion', 'Evidencia calificada', 'enviado')`,
        [meta.usuario_id]
      );
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
