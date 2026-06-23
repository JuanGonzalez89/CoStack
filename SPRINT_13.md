# Sprint 13 — Provisioning automático de Canva y fixes para presentación

## Objetivo
Cerrar el flujo de provisioning automático de Canva Pro para que funcione end-to-end sin intervención manual, y asegurar que la presentación no tenga bloqueos operativos.

## Cambios realizados

### 1. Fix: selector del botón "Confirmar e invitar"
**Archivo:** `lib/provisioner/flows/canva.ts:48`

**Problema:** El selector `getByText('Confirmar').or(getByText('Invitar')).or(...).last()` matcheaba el botón "Invitar a alguien" del sidebar (`aria-hidden="true"`, fuera de viewport) en vez del botón "Confirmar e invitar" del modal, causando timeout al hacer click.

**Solución:** Selector exacto: `page.getByText('Confirmar e invitar')`.

### 2. Fix: sesión de Canva expirada
El archivo `.auth/canva.json` contenía una sesión vencida que devolvía 403 y pantalla de error ("Hemos tenido un problema"). Se re-ejectuó `scripts/auth-setup-canva.ts` para renovarla.

### 3. Lección técnica: contexto de Playwright
Canva bloquea Playwright sin las opciones correctas. El `playwright-provider.ts` ya las usaba (custom userAgent, `--disable-blink-features=AutomationControlled`, `locale: es-AR`, timezone Argentina), pero el test directo no. Al alinearlas, Canva dejó de dar 403.

### 4. Limpieza de debug
Se eliminaron screenshots, dumps de texto completo e inspección de inputs del flujo `canva.ts`. Quedaron solo logs esenciales.

### 5. Rate limit de groups desactivado
**Archivo:** `app/api/checkout/pay/route.ts:70-81`

**Problema:** CoStack limitaba a 2 lobbies cada 24hs por organizer. Para la presentación esto podía bloquear demos repetidas.

**Solución:** Se comentó el bloque de rate limit temporalmente. Fácil de revertir después de la presentación.

## Archivos modificados
| Archivo | Cambio |
|---|---|
| `lib/provisioner/flows/canva.ts` | Selector de confirmBtn, eliminación de debug |
| `app/api/checkout/pay/route.ts` | Rate limit comentado |

## Próximos pasos / post-presentación
- Restaurar rate limit en `pay/route.ts` (borrar comentarios)
- Monitorear si Canva cambia su anti-bot y rompe el flow
- Agregar verificación post-invite para confirmar que la invitación se envió antes de seguir al próximo miembro

---

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
