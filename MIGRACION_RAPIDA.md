# ⚠️ INFORMACIÓN IMPORTANTE PARA MIGRACIÓN

## 🔑 Copia esta información de tu .env.local ACTUAL

Antes de migrar al otro computador, **COPIA ESTOS VALORES** de tu archivo `.env.local` actual:

### 1. URL de Base de Datos (OBLIGATORIO)
```
DATABASE_URL="postgresql://xxxxx:xxxxx@ep-xxxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 2. Secretos JWT (OPCIONAL - puedes generar nuevos)
```
JWT_SECRET="tu_jwt_secret_actual"
NEXTAUTH_SECRET="tu_nextauth_secret_actual"
```

### 3. Credenciales Microsoft (OPCIONAL - solo si configuraste Azure)
```
NEXT_PUBLIC_MICROSOFT_CLIENT_ID="tu_client_id_si_lo_tienes"
MICROSOFT_CLIENT_SECRET="tu_client_secret_si_lo_tienes"
MICROSOFT_TENANT_ID="common"
```

---

## 📝 Cómo encontrar el archivo .env.local

**Windows:**
```
C:\Users\[TuUsuario]\Desktop\Plataforma de gestion\login-app\.env.local
```

**Mac/Linux:**
```
~/Desktop/Plataforma de gestion/login-app/.env.local
```

---

## ✅ Checklist de Migración

- [ ] Copiaste el `DATABASE_URL` de `.env.local`
- [ ] Hiciste `git push` (ya está hecho ✅)
- [ ] En el otro PC: `git clone` del repositorio
- [ ] En el otro PC: `npm install`
- [ ] En el otro PC: crear `.env.local` con el DATABASE_URL
- [ ] En el otro PC: `npm run dev`
- [ ] Probar login con admin@sistema.com / admin123

---

## 🚀 Comando Rápido para el Otro PC

```bash
# 1. Clonar
git clone https://github.com/Juan-GARCESS/plan-de-accion-2025.git
cd plan-de-accion-2025

# 2. Instalar
npm install

# 3. Crear .env.local (pega tu DATABASE_URL aquí)
# Usa notepad, nano, vim, o tu editor favorito
notepad .env.local

# 4. Iniciar
npm run dev
```

---

## ⚡ Lo MÁS IMPORTANTE

**SOLO NECESITAS COPIAR:**
```
DATABASE_URL="tu_url_de_neon_postgresql_completa"
```

Todo lo demás se instala automáticamente con `npm install`.

---

## 🔍 Verificar que Funciona

Después de hacer `npm run dev`:
1. Abre http://localhost:3000
2. Deberías ver la página de login
3. Inicia sesión con `admin@sistema.com` / `admin123`
4. Si entras al dashboard, ¡todo funciona! ✅
