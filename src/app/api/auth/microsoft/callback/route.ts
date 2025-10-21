// src/app/api/auth/microsoft/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Microsoft OAuth error:', error);
      return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    // Intercambiar el código por un token de acceso
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || 'common'}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          code: code,
          redirect_uri: `${request.nextUrl.origin}/api/auth/microsoft/callback`,
          grant_type: 'authorization_code',
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/?error=token_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Obtener información del usuario de Microsoft Graph
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch user info from Microsoft Graph');
      return NextResponse.redirect(new URL('/?error=user_info_failed', request.url));
    }

    const microsoftUser = await userResponse.json();
    const email = microsoftUser.mail || microsoftUser.userPrincipalName;
    const nombre = microsoftUser.displayName;

    // Verificar que el email es del dominio institucional
    if (!email.endsWith('@campusucc.edu.co')) {
      return NextResponse.redirect(
        new URL('/?error=invalid_domain', request.url)
      );
    }

    // Buscar o crear el usuario en la base de datos
    let userResult = await db.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    let userId;
    let userRol;

    if (userResult.rows.length === 0) {
      // Crear nuevo usuario con estado pendiente
      const insertResult = await db.query(
        `INSERT INTO usuarios (nombre, email, password, estado, rol, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW()) 
         RETURNING id, rol`,
        [nombre, email, 'oauth_microsoft', 'pendiente', 'usuario']
      );
      
      userId = insertResult.rows[0].id;
      userRol = insertResult.rows[0].rol;

      // Redirigir a página de pendiente de aprobación
      return NextResponse.redirect(
        new URL('/?error=pending', request.url)
      );
    } else {
      const user = userResult.rows[0];
      userId = user.id;
      userRol = user.rol;

      // Verificar estado del usuario
      if (user.estado === 'pendiente') {
        return NextResponse.redirect(
          new URL('/?error=pending', request.url)
        );
      }

      if (user.estado !== 'activo') {
        return NextResponse.redirect(
          new URL('/?error=inactive', request.url)
        );
      }

      // Verificar que tenga área asignada (si no es admin)
      if (userRol !== 'admin' && !user.area_id) {
        return NextResponse.redirect(
          new URL('/?error=no_area', request.url)
        );
      }
    }

    // Crear cookie de sesión
    const response = NextResponse.redirect(
      new URL(userRol === 'admin' ? '/admin/dashboard' : '/dashboard', request.url)
    );

    response.cookies.set('userId', userId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Microsoft OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
