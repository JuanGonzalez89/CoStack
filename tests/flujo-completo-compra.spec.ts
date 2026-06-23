import { test, expect, type Page, type BrowserContext } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function getDbUrl(): string {
  const paths = [
    resolve(process.cwd(), '.env.local'),
    resolve(process.cwd(), '.env'),
  ]
  for (const filePath of paths) {
    if (existsSync(filePath)) {
      const raw = readFileSync(filePath, 'utf8')
      const m = raw.match(/^DATABASE_URL=(.+)$/m)
      if (m) return m[1].replace(/^['"]|['"]$/g, '')
    }
  }
  throw new Error('DATABASE_URL not found in .env.local or .env')
}

const databaseUrl = getDbUrl()
const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const TEST_USERS = [
  { email: 'juanignaciogonzalez.ca@gmail.com', name: 'Juanpi', role: 'organizer' as const },
  { email: 'Juanurro27@gmail.com', name: 'Juan', role: 'member' as const },
  { email: 'calderonsantiago2019@gmail.com', name: 'Santiago', role: 'member' as const },
]

const PASSWORD = 'password123'
const TOOL_SLUG = 'canva'
const TEST_CARD = {
  number: '5031 7557 3453 0604',
  expiry: '12/28',
  cvv: '123',
  name: 'APRO',
  docType: 'DNI',
  docNumber: '12345678',
}

test.describe('Flujo Completo de Compra', () => {
  let contexts: BrowserContext[] = []
  let pages: Page[] = []
  let createdLobbyId: string | null = null

  test.beforeAll(async () => {
    const emails = TEST_USERS.map(u => u.email)

    await prisma.notification.deleteMany({
      where: { lobby: { creator: { email: { in: emails } } } },
    }).catch(() => {})
    await prisma.lobbyMember.deleteMany({
      where: { lobby: { creator: { email: { in: emails } } } },
    }).catch(() => {})
    await prisma.lobby.deleteMany({
      where: { creator: { email: { in: emails } } },
    }).catch(() => {})
    await prisma.membership.deleteMany({
      where: { user: { email: { in: emails } } },
    }).catch(() => {})
    await prisma.group.deleteMany({
      where: {
        members: { none: {} },
        name: { in: ['Mi Espacio', 'Personal'] },
      },
    }).catch(() => {})
    await prisma.user.deleteMany({
      where: { email: { in: emails } },
    }).catch(() => {})
  })

  test('Paso 1-3: Registro + Creación de Lobby + Pagos', async ({ browser }) => {
    for (let i = 0; i < 3; i++) {
      const ctx = await browser.newContext()
      contexts.push(ctx)
    }

    for (let i = 0; i < TEST_USERS.length; i++) {
      const page = await contexts[i].newPage()
      pages.push(page)

      await page.goto('/register')
      await page.waitForLoadState('networkidle')

      await page.getByLabel('Nombre completo').fill(TEST_USERS[i].name)
      await page.getByLabel('Email').fill(TEST_USERS[i].email)
      await page.getByLabel('Contraseña').fill(PASSWORD)
      await page.getByRole('button', { name: 'Crear cuenta' }).click()
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveURL(/\/welcome/)
      console.log(`  ✓ ${TEST_USERS[i].name} registrado`)
    }

    await pages[0].getByText('Configurar espacio de equipo').click()
    await pages[0].waitForLoadState('networkidle')
    await expect(pages[0]).toHaveURL(/\/suscripciones/)
    console.log('  ✓ Juanpi completó onboarding (organizer)')

    for (let i = 1; i < 3; i++) {
      await pages[i].getByText('Ver herramientas disponibles').click()
      await pages[i].waitForLoadState('networkidle')
      await expect(pages[i]).toHaveURL(/\/suscripciones/)
      console.log(`  ✓ ${TEST_USERS[i].name} completó onboarding (member)`)
    }

    const orgPage = pages[0]
    await expect(orgPage.getByRole('heading', { name: /Catálogo/ })).toBeVisible()

    const canvaCard = orgPage.locator('.group').filter({ hasText: 'Canva Pro Team' })
    const configurarBtn = canvaCard.getByRole('button', { name: 'Configurar Grupo y Añadir' })
    await expect(configurarBtn).toBeVisible()
    await configurarBtn.click()

    await expect(orgPage.getByText('Configurar y pagar')).toBeVisible({ timeout: 5000 })
    await orgPage.getByText('Configurar y pagar').click()

    await expect(orgPage).toHaveURL(/.*\/checkout\/canva/)
    await orgPage.waitForLoadState('networkidle')

    await fillTestCard(orgPage)
    await expect(orgPage.getByRole('button', { name: /Pagar/ })).toBeEnabled({ timeout: 15000 })
    await orgPage.getByRole('button', { name: /Pagar/ }).click()

    await orgPage.waitForURL(/\/suscripciones\/success/, { timeout: 30000 })
    await orgPage.waitForLoadState('networkidle')

    const url = new URL(orgPage.url())
    createdLobbyId = url.searchParams.get('lobbyId')
    expect(createdLobbyId).toBeTruthy()
    console.log(`  ✓ Lobby creado: ${createdLobbyId}`)

    for (let i = 1; i < 3; i++) {
      const memberPage = pages[i]

      await memberPage.goto('/suscripciones')
      await memberPage.waitForLoadState('networkidle')

      const canvaCardMember = memberPage.locator('.group').filter({ hasText: 'Canva Pro Team' })
      const unirseBtn = canvaCardMember.getByRole('button', { name: 'Unirse vía Automatch' })
      await expect(unirseBtn).toBeVisible()
      await unirseBtn.click()

      await expect(memberPage.getByText('OK, lo tengo')).toBeVisible({ timeout: 5000 })
      await memberPage.getByText('OK, lo tengo').click()

      await expect(memberPage).toHaveURL(/.*\/checkout\/canva/)
      await memberPage.waitForLoadState('networkidle')

      await fillTestCard(memberPage)
      await expect(memberPage.getByRole('button', { name: /Pagar/ })).toBeEnabled({ timeout: 15000 })
      await memberPage.getByRole('button', { name: /Pagar/ }).click()

      await memberPage.waitForURL(/\/suscripciones\/success/, { timeout: 30000 })
      console.log(`  ✓ ${TEST_USERS[i].name} pagó y se unió al lobby`)
    }
  })

  test('Paso 4: Verificar lobby completo', async () => {
    expect(createdLobbyId).toBeTruthy()
    const orgPage = pages[0]

    const accessToken = await pollLobbyUntilComplete(orgPage, createdLobbyId!)
    expect(accessToken).toBeTruthy()
    console.log(`  ✓ Lobby completado! Access token: ${accessToken}`)

    await orgPage.goto(`/lobby/${createdLobbyId}`)
    await orgPage.waitForLoadState('networkidle')

    const body = orgPage.locator('body')
    await expect(body).toContainText(/Preparando detalles finales|acceso|Credencial|licencia|Completado/, { timeout: 15000 })
    console.log('  ✓ UI del lobby completada verificada')
  })

  test.afterAll(async () => {
    console.log('🧹 Limpiando datos de prueba...')

    if (createdLobbyId) {
      try {
        const lobbyMembers = await prisma.lobbyMember.findMany({
          where: { lobbyId: createdLobbyId },
          select: { paymentRef: true },
        })

        const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
        if (MP_ACCESS_TOKEN) {
          for (const member of lobbyMembers) {
            if (member.paymentRef) {
              try {
                await fetch(`https://api.mercadopago.com/v1/payments/${member.paymentRef}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ status: 'cancelled' }),
                })
              } catch {
                // best effort
              }
            }
          }
        }

        await prisma.notification.deleteMany({ where: { lobbyId: createdLobbyId } }).catch(() => {})
        await prisma.lobbyMember.deleteMany({ where: { lobbyId: createdLobbyId } }).catch(() => {})
        await prisma.lobby.delete({ where: { id: createdLobbyId } }).catch(() => {})
      } catch {
        // best effort
      }
    }

    const emails = TEST_USERS.map(u => u.email)
    await prisma.membership.deleteMany({ where: { user: { email: { in: emails } } } }).catch(() => {})
    await prisma.user.deleteMany({ where: { email: { in: emails } } }).catch(() => {})

    await prisma.$disconnect()

    for (const ctx of contexts) {
      await ctx.close().catch(() => {})
    }

    console.log('  ✓ Cleanup completo')
  })
})

async function fillTestCard(page: Page) {
  await page.getByPlaceholder('1234 5678 9012 3456').fill(TEST_CARD.number)
  await page.getByPlaceholder('MM/AA').fill(TEST_CARD.expiry)
  await page.getByPlaceholder('123', { exact: true }).fill(TEST_CARD.cvv)
  await page.getByPlaceholder('Como figura en la tarjeta').fill(TEST_CARD.name)
  await page.getByPlaceholder('12345678', { exact: true }).fill(TEST_CARD.docNumber)
}

async function pollLobbyUntilComplete(page: Page, lobbyId: string, timeout = 120_000): Promise<string> {
  const start = Date.now()
  let lastStatus = ''

  while (Date.now() - start < timeout) {
    try {
      const result = await page.evaluate(async (id) => {
        const res = await fetch(`/api/lobby/${id}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        return { status: data.status, accessToken: data.accessToken } as { status: string; accessToken?: string }
      }, lobbyId)

      if (result.status !== lastStatus) {
        console.log(`  Lobby status: ${result.status}${result.accessToken ? ' (with token!)' : ''}`)
        lastStatus = result.status
      }

      if (result.status === 'completed' && result.accessToken) {
        return result.accessToken
      }

      await page.waitForTimeout(3000)
    } catch {
      await page.waitForTimeout(3000)
    }
  }

  throw new Error(`Lobby no se completó en ${timeout / 1000}s (último estado: ${lastStatus})`)
}
