## Sprint 14 — Test E2E contra Vercel + DB cloud

### Pendientes para después de la presentación

#### 1. Migrar DB local a cloud (Neon / Supabase)
**Problema:** Hoy `DATABASE_URL` apunta a `localhost:5432`. Vercel no puede conectarse ahí.
**Tarea:** Crear una base PostgreSQL gratuita en Neon, migrar datos, y actualizar `DATABASE_URL` tanto en `.env.local` como en Vercel.

#### 2. Ejecutar el test E2E contra el deploy
**Archivo:** `playwright.config.ts`
**Cambio:** `baseURL: 'http://localhost:3000'` → `baseURL: 'https://co-stack.vercel.app'`
**Validación:** El flujo completo de compra (registro → lobby → pago → completion) debe pasar contra el deploy.

#### 3. Cleanup server-side
**Problema:** El `afterAll` del test usa `PrismaClient` local. Si la DB es cloud y accesible desde la máquina local, funciona igual. Si no, crear endpoint `POST /api/test/cleanup` con clave secreta.

#### 4. Fix: import de `playwright` en provisioner
**Archivo:** `lib/provisioner/playwright-provider.ts`
**Cambio:** `import('playwright')` → `import('@playwright/test')` *(ya aplicado)*
**Motivo:** `playwright` no es dependencia directa, solo transitiva via `@playwright/test`. pnpm no hoistea transitivas.

#### 5. Fix: lazy-load PlaywrightProvider
**Archivo:** `lib/provisioner/index.ts`
**Cambio:** `PlaywrightProvider` se carga con `await import()` dinámico en vez de import estático *(ya aplicado)*
**Motivo:** Turbopack sigue el rastro de imports dinámicos. Al separar `PlaywrightProvider` en un chunk aparte, el build de Vercel no necesita resolver `playwright` hasta runtime (y en runtime nunca se ejecuta porque no hay `.auth/canva.json`).

#### 6. Nuevo test agregado
**Archivo:** `tests/flujo-completo-compra.spec.ts`
**Descripción:** Test E2E que cubre registro de 3 usuarios, creación de lobby, pago con tarjeta MP sandbox, auto-completado y verificación de acceso. Incluye self-cleaning via `afterAll`.