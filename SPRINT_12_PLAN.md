# SPRINT 12: Bot Unificado de Provisioning (Playwright + Session Hijacking)

## Objetivo

Reemplazar el mock de `API_PROXY` y el script aislado de GitHub por un **provisioner unificado** que use **Playwright** (session hijacking) para operar herramientas como ChatGPT y Canva automáticamente. GitHub se mantiene como provider vía API directa (Octokit).

**Meta final:** Demo en vivo con los profesores donde Juanpi, Juan y Santiago compran cupos reales, la sala se completa, y el bot provisiona el acceso a la herramienta automáticamente.

---

## Arquitectura

```
3 alumnos compran cupos
      │
      ▼
Lobby se completa (3/3)
      │
      ▼
MP captura los $30 totales (3 x $10)
      │
      ▼
Provisioner.fulfill(lobbyId, toolSlug, members)
      │
      ├── toolSlug = "copilot"
      │     └── GitHubProvider (API Octokit) ← YA FUNCIONA
      │
      ├── toolSlug = "chatgpt"
      │     └── PlaywrightProvider.ejecutarFlow("chatgpt", session, members)
      │           ├── 1. Cargar perfil .auth de la cuenta maestra de ChatGPT
      │           ├── 2. Ir a chatgpt.com → Dashboard Team
      │           ├── 3. Invitar a cada miembro por email
      │           └── 4. Extraer link de invitación → accessToken
      │
      └── toolSlug = "canva"
            └── PlaywrightProvider.ejecutarFlow("canva", session, members)
                  ├── 1. Cargar perfil .auth de la cuenta maestra de Canva
                  ├── 2. Ir a canva.com → Team Settings
                  ├── 3. Invitar a cada miembro por email
                  └── 4. Extraer link de invitación → accessToken
```

---

## Setup inicial (hacer una vez)

### 1. Instalar Playwright

```bash
npm install playwright
npx playwright install chromium
```

### 2. Script de autenticación (`scripts/auth-setup.ts`)

Crear un script que abre el navegador y permite al **humano** loguear manualmente cada herramienta:

```ts
import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch({ headless: false }) // visible!
  const context = await browser.newContext()

  const page = await context.newPage()

  // Paso 1: Login ChatGPT Team
  await page.goto('https://chatgpt.com/auth/login')
  console.log('👉 Logueate en ChatGPT manualmente. Después presioná Enter...')
  await waitForEnter()
  await context.storageState({ path: '.auth/chatgpt.json' })

  // Paso 2: Login Canva  
  await page.goto('https://www.canva.com/login')
  console.log('👉 Logueate en Canva manualmente. Después presioná Enter...')
  await waitForEnter()
  await context.storageState({ path: '.auth/canva.json' })

  await browser.close()
  console.log('✅ Sesiones guardadas en .auth/')
}
```

Este script **solo se corre una vez** (cuando configuran las cuentas maestras). Después el bot reutiliza las sesiones guardadas.

---

## Tareas

### T1. Crear estructura de directorios

```
lib/provisioner/
  ├── index.ts                    ← Orquestador
  ├── types.ts                    ← Interfaces
  ├── playwright-provider.ts      ← Provider que ejecuta flows con Playwright
  ├── flows/
  │     ├── chatgpt.ts            ← Flow de ChatGPT
  │     └── canva.ts              ← Flow de Canva
  └── providers/
        └── github.ts             ← GitHub provider (API directa, sin Playwright)

.auth/
  ├── chatgpt.json                ← Sesión guardada (gitignored)
  └── canva.json                  ← Sesión guardada (gitignored)

scripts/
  └── auth-setup.ts               ← Script para guardar sesiones
```

### T2. `lib/provisioner/types.ts`

```ts
export type ProvisionerStatus = 'success' | 'partial' | 'failed'

export interface ProvisionResult {
  status: ProvisionerStatus
  accessToken: string | null
  providerName: string
  inviteUrl: string | null
  errors: string[]
}

export interface ProvisionerProvider {
  name: string
  canHandle(toolSlug: string): boolean
  fulfill(lobbyId: string, toolName: string, members: { email: string; userId: string }[]): Promise<ProvisionResult>
}

export interface PlaywrightFlow {
  toolSlugs: string[]
  nombre: string
  ejecutar(page: Page, members: { email: string; userId: string }[]): Promise<{
    accessToken: string
    inviteUrl: string
  }>
}
```

### T3. `lib/provisioner/flows/chatgpt.ts`

```ts
import type { PlaywrightFlow } from '../types'

export const chatgptFlow: PlaywrightFlow = {
  toolSlugs: ['chatgpt', 'chatgpt-team'],
  nombre: 'ChatGPT Team',

  async ejecutar(page, members) {
    // Ir al dashboard
    await page.goto('https://chatgpt.com/g/admin')
    await page.waitForSelector('text=Team', { timeout: 10000 })

    // Click en "Invitar miembros"
    await page.click('text=Add members')
    await page.waitForSelector('input[type="email"]')

    // Invitar cada miembro
    for (const member of members) {
      if (!member.email) continue
      await page.fill('input[type="email"]', member.email)
      await page.click('text=Send invite')
      await page.waitForTimeout(2000)
    }

    // Extraer link de invitación
    const inviteLink = await page.getAttribute('a[data-testid="invite-link"]', 'href')

    return {
      accessToken: inviteLink ?? 'INVITATION_SENT',
      inviteUrl: inviteLink ?? '',
    }
  },
}
```

### T4. `lib/provisioner/flows/canva.ts`

```ts
import type { PlaywrightFlow } from '../types'

export const canvaFlow: PlaywrightFlow = {
  toolSlugs: ['canva', 'canva-pro', 'diseno'],
  nombre: 'Canva Pro',

  async ejecutar(page, members) {
    await page.goto('https://www.canva.com/team/members')
    await page.waitForSelector('text=Invite people', { timeout: 10000 })

    for (const member of members) {
      if (!member.email) continue
      await page.click('text=Invite people')
      await page.fill('input[placeholder*="email"]', member.email)
      await page.click('text=Send invite')
      await page.waitForTimeout(2000)
    }

    return {
      accessToken: 'INVITATION_SENT',
      inviteUrl: 'https://www.canva.com/team/members',
    }
  },
}
```

### T5. `lib/provisioner/playwright-provider.ts`

Provider genérico que recibe un flow y ejecuta Playwright:

```ts
import { chromium } from 'playwright'
import type { Page } from 'playwright'
import type { ProvisionResult, ProvisionerProvider, PlaywrightFlow } from './types'
import { chatgptFlow } from './flows/chatgpt'
import { canvaFlow } from './flows/canva'

const flows: PlaywrightFlow[] = [chatgptFlow, canvaFlow]

export class PlaywrightProvider implements ProvisionerProvider {
  name = 'Playwright (Session Hijacking)'

  canHandle(toolSlug: string): boolean {
    return flows.some(f => f.toolSlugs.includes(toolSlug))
  }

  async fulfill(lobbyId: string, toolName: string, members: { email: string; userId: string }[]): Promise<ProvisionResult> {
    const toolSlug = toolName.toLowerCase() //粗略匹配
    const flow = flows.find(f => f.toolSlugs.some(s => toolSlug.includes(s)))
    if (!flow) {
      return { status: 'failed', accessToken: null, providerName: this.name, inviteUrl: null, errors: ['No flow matched'] }
    }

    const sessionPath = `.auth/${flows.indexOf(flow) === 0 ? 'chatgpt' : 'canva'}.json`

    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({ storageState: sessionPath })
    const page = await context.newPage()

    try {
      const result = await flow.ejecutar(page, members)
      return {
        status: 'success',
        accessToken: result.accessToken,
        providerName: flow.nombre,
        inviteUrl: result.inviteUrl,
        errors: [],
      }
    } catch (error) {
      return {
        status: 'failed',
        accessToken: null,
        providerName: flow.nombre,
        inviteUrl: null,
        errors: [(error as Error).message],
      }
    } finally {
      await browser.close()
    }
  }
}
```

### T6. `lib/provisioner/github.ts`

Migrar desde `lib/github-bot.server.ts` (ya existe, mismo código):

```ts
import { createTeamForLobby } from '../../github-bot.server'
import type { ProvisionResult, ProvisionerProvider } from '../types'

export class GitHubProvider implements ProvisionerProvider {
  name = 'GitHub'

  canHandle(toolSlug: string): boolean {
    return ['copilot', 'codespaces', 'github'].includes(toolSlug)
  }

  async fulfill(lobbyId: string, toolName: string, members: { email: string; userId: string }[]): Promise<ProvisionResult> {
    const team = await createTeamForLobby(lobbyId, toolName)
    return {
      status: 'success',
      accessToken: team.html_url,
      providerName: 'GitHub',
      inviteUrl: team.html_url,
      errors: [],
    }
  }
}
```

### T7. `lib/provisioner/index.ts` — Orquestador

```ts
import type { ProvisionResult } from './types'
import { GitHubProvider } from './providers/github'
import { PlaywrightProvider } from './playwright-provider'

const providers = [
  new GitHubProvider(),
  new PlaywrightProvider(),
]

export async function fulfillProvision(
  lobbyId: string,
  toolSlug: string,
  toolName: string,
  members: { email: string; userId: string }[]
): Promise<ProvisionResult> {
  const provider = providers.find(p => p.canHandle(toolSlug))
  if (!provider) {
    return { status: 'failed', accessToken: null, providerName: 'unknown', inviteUrl: null, errors: [`No provider for ${toolSlug}`] }
  }
  console.log(`[Provisioner] Usando ${provider.name} para ${toolSlug}`)
  return provider.fulfill(lobbyId, toolName, members)
}
```

### T8. `lib/headless.server.ts` — Simplificar

Reemplazar el contenido actual con:

```ts
import { fulfillProvision } from './provisioner'

export async function runPurchaseBot(params: {
  lobbyId: string
  toolSlug: string
  toolName: string
  members: { email: string; userId: string }[]
}) {
  const result = await fulfillProvision(params.lobbyId, params.toolSlug, params.toolName, params.members)
  if (result.status === 'failed') {
    throw new Error(`Provisioning failed: ${result.errors.join(', ')}`)
  }
  return result.accessToken || ''
}
```

### T9. `app/api/lobby/[id]/route.ts` — Pasar members + eliminar mocks

Cambiar la llamada a `runPurchaseBot` para pasar `members` y `toolSlug`, y **eliminar la lógica de mocks virtuales** (`getMockState`, `clearMockState`, `virtualSeats`):

```ts
// Después de capturar fondos...
const membersToInvite = lobby.members.map(m => ({
  email: m.user.email,
  userId: m.userId,
}))

const generatedToken = await runPurchaseBot({
  lobbyId: lobby.id,
  toolSlug: lobby.toolSlug,
  toolName: lobby.toolName,
  members: membersToInvite,
})
```

### T10. `scripts/auth-setup.ts`

Crear el script que usan Uds. para guardar las sesiones:

```ts
import { chromium } from 'playwright'
import * as readline from 'readline'

function waitForEnter(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question('', () => { rl.close(); resolve() }))
}

async function main() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()

  const page = await context.newPage()

  console.log('=== ChatGPT ===')
  await page.goto('https://chatgpt.com/auth/login')
  console.log('👉 Logueate en ChatGPT con la cuenta maestra (admin@costack.la).')
  console.log('👉 Después presioná Enter para continuar...')
  await waitForEnter()
  await context.storageState({ path: '.auth/chatgpt.json' })
  console.log('✅ Sesión de ChatGPT guardada.\n')

  console.log('=== Canva ===')
  await page.goto('https://www.canva.com/login')
  console.log('👉 Logueate en Canva con la cuenta maestra.')
  console.log('👉 Después presioná Enter para continuar...')
  await waitForEnter()
  await context.storageState({ path: '.auth/canva.json' })
  console.log('✅ Sesión de Canva guardada.\n')

  await browser.close()
  console.log('🎉 Sesiones guardadas. Ya podés correr el bot.')
}

main()
```

---

## Demo con profesores

### Setup (antes de la presentación)

1. Juanpi, Juan y Santiago se crean cuenta en CoStack en `localhost:3000/register`
2. Crean una sala para ChatGPT o Canva (uno es organizador)
3. Cada uno compra su cupo ($10 c/u con tarjeta de prueba)
4. La sala se completa automáticamente

### Durante la presentación

1. Mostrar el lobby con los 3 miembros pagados
2. Refrescar la página → el bot detecta `filledSeats >= totalSeats`
3. En la terminal se ve:
   ```
   [Escrow] Sala llena. Iniciando CAPTURA...
   [Escrow] Fondos capturados correctamente.
   [Provisioner] Usando Playwright (Session Hijacking) para chatgpt
   [Playwright] Invitando a juanpi@uade.edu.ar al team...
   [Playwright] Invitando a juan@uade.edu.ar al team...
   [Playwright] Invitando a santiago@uade.edu.ar al team...
   [Provisioner] Acceso provisionado: https://chatgpt.com/invite/xxx
   ```
4. Cada alumno abre su email → ve la invitación a ChatGPT Team
5. Acepta la invitación → ChatGPT Team funcionando 🎉

### Si algo falla en vivo

Tener preparado:
- Un **video corto** del flujo funcionando (por si la demo se cae)
- Capturas de pantalla de cada paso
- El código del provisioner abierto en VSCode para mostrar la arquitectura

---

## Archivos a modificar/crear

| Archivo | Acción |
|---|---|
| `lib/provisioner/types.ts` | **CREAR** |
| `lib/provisioner/index.ts` | **CREAR** |
| `lib/provisioner/playwright-provider.ts` | **CREAR** |
| `lib/provisioner/flows/chatgpt.ts` | **CREAR** |
| `lib/provisioner/flows/canva.ts` | **CREAR** |
| `lib/provisioner/providers/github.ts` | **CREAR** (migrar) |
| `lib/headless.server.ts` | **MODIFICAR** — usar `fulfillProvision` |
| `app/api/lobby/[id]/route.ts` | **MODIFICAR** — pasar members, sacar mocks |
| `scripts/auth-setup.ts` | **CREAR** |
| `.gitignore` | **MODIFICAR** — agregar `.auth/` |
| `lib/github-bot.server.ts` | **ELIMINAR** (opcional, se puede dejar hasta migrar) |
| `lib/lobby-mock-store.ts` | **ELIMINAR** |

---

## Criterios de aceptación

- [ ] `scripts/auth-setup.ts` guarda sesiones de ChatGPT y Canva correctamente
- [ ] `PlaywrightProvider.ejecutar()` carga la sesión guardada y ejecuta el flow
- [ ] `chatgptFlow` invita miembros por email exitosamente
- [ ] `canvaFlow` invita miembros por email exitosamente
- [ ] `GitHubProvider` funciona igual que antes vía API
- [ ] `Provisioner.fulfill()` elige el provider correcto según `toolSlug`
- [ ] El lobby se completa sin mocks (solo miembros reales)
- [ ] Cada miembro recibe notificación con el acceso provisionado
- [ ] Si un flow falla, el error se captura y el lobby se marca como `completed` igual (graceful degradation)
