## Sprint 14 — Migración de BD local a Neon (PostgreSQL cloud) + Deploy en Vercel funcional

### Objetivo

Reemplazar la base de datos PostgreSQL local (`localhost:5432`) por una base en Neon cloud, para que el deploy en Vercel (https://co-stack.vercel.app) funcione con persistencia real y los usuarios puedan iniciar sesión.

---

### 1. Crear la base de datos en Neon

1. Andá a https://console.neon.tech y create una cuenta (GitHub o Google).
2. Creá un nuevo proyecto con nombre **costack** (región la más cercana, ej: US East).
3. Una vez creado, Neon te muestra **dos connection strings**:
   - **Pooled connection** (termina en `-pooler`) → para el runtime de la app
   - **Direct connection** (sin pooler) → para migraciones de Prisma
4. Copialas, las vas a usar en el paso 2.

> 💡 Si querés hacerlo desde CLI con `neonctl`:
> ```bash
> npm install -g neonctl
> neonctl auth
> neonctl projects create --name costack --set-context
> neonctl connection-string --pooled   # pooled
> neonctl connection-string --direct   # direct
> ```

---

### 2. Actualizar `.env.local`

Cambiar las URLs de BD local por las de Neon, y apuntar las URLs de la app al deploy de Vercel.

```diff
- DATABASE_URL="postgresql://postgres:1234@localhost:5432/costack?schema=public"
+ DATABASE_URL="postgresql://[USER]:[PASSWORD]@[POOLED-HOST].neon.tech/costack?sslmode=require"
+ DIRECT_URL="postgresql://[USER]:[PASSWORD]@[DIRECT-HOST].neon.tech/costack?sslmode=require"
- NEXT_PUBLIC_APP_URL="http://localhost:3000"
+ NEXT_PUBLIC_APP_URL="https://co-stack.vercel.app"
- NEXTAUTH_URL="http://localhost:3000"
+ NEXTAUTH_URL="https://co-stack.vercel.app"
```

**¿Por qué `DIRECT_URL`?**  
El `prisma.config.ts` ya lee `DIRECT_URL` primero si existe (línea 24-26) y lo usa para migraciones.  
`lib/prisma.ts` en runtime lee `DATABASE_URL` (línea 27-29), que es la pooled.  
Esta separación es exactamente lo que Neon necesita.

> ⚠️ Las demás variables (MP, Stripe, GitHub, NEXTAUTH_SECRET) se quedan igual.  
> ⚠️ No subas `.env.local` al repo — ya está en `.gitignore`.

---

### 3. Aplicar migraciones contra la nube

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

- `migrate deploy` aplica las migraciones existentes (`prisma/migrations/`) a la BD cloud
- `db seed` crea los usuarios de prueba (`martin@costack.app` / `santiago@costack.app`, password: `password123`), el grupo "CoStack Studio", las tools del catálogo y los asientos semi-poblados

---

### 4. Configurar variables de entorno en Vercel

Andá a https://vercel.com → Proyecto `co-stack` → **Settings → Environment Variables** y agregá:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Pooled connection de Neon |
| `DIRECT_URL` | Direct connection de Neon |
| `NEXTAUTH_URL` | `https://co-stack.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://co-stack.vercel.app` |

Las que ya existen (MP_ACCESS_TOKEN, NEXT_PUBLIC_MP_PUBLIC_KEY, STRIPE_SECRET_KEY, etc.) **verificá que sigan estando** y sean las mismas de `.env.local`.

---

### 5. Hacer deploy

```bash
git add .env.local SPRINT_14_SUMMARY.md
git commit -m "Sprint 14: migrar BD a Neon cloud para deploy en Vercel"
git push
```

Vercel detecta el push, hace build y deploy automático.

---

### 6. Verificar que anda

1. Andá a https://co-stack.vercel.app
2. Iniciá sesión con `martin@costack.app` / `password123`
3. Si ves el dashboard con las tool cards y los datos de seed → migración exitosa

---

### 7. (Opcional) Tests E2E contra deploy

Si querés ejecutar los tests E2E contra Vercel:

```bash
# En playwright.config.ts cambia baseURL si no está ya apuntando a prod
# npx playwright test --config=playwright.config.ts
```

Los tests de `tests/flujo-completo-compra.spec.ts` cubren registro, lobby, pago MP sandbox y auto-completado.

---

### Resumen de cambios

| Archivo | Cambio |
|---------|--------|
| `.env.local` | `DATABASE_URL` → pooled Neon, nueva `DIRECT_URL`, `NEXT_PUBLIC_APP_URL` y `NEXTAUTH_URL` → Vercel |
| `prisma.config.ts` | ✅ Ya soporta `DIRECT_URL` (sin cambios) |
| `lib/prisma.ts` | ✅ Ya usa `DATABASE_URL` para runtime (sin cambios) |
| `SPRINT_14_SUMMARY.md` | Este archivo |
