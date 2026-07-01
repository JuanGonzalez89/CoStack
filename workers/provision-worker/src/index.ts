process.env.PLAYWRIGHT_BROWSERS_PATH = '0'

import express from 'express'
import { chromium } from 'playwright'
import { existsSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { ejecutar as canvaFlow } from './flows/canva'
import { ejecutar as chatgptFlow } from './flows/chatgpt'

const app = express()
app.use(express.json())

function ensureBrowser(): void {
  const pwCoreDir = resolve(__dirname, '..', 'node_modules', 'playwright-core', '.local-browsers')
  const localDir = resolve(__dirname, '..', 'node_modules', '.cache', 'ms-playwright')
  const possibleDirs = [pwCoreDir, localDir]
  for (const dir of possibleDirs) {
    if (existsSync(dir)) {
      const items = readdirSync(dir)
      if (items.some(i => i.includes('chromium'))) {
        console.log('[Worker] Chromium headless shell ya instalado en', dir)
        return
      }
    }
  }
  console.log('[Worker] Instalando chromium...')
  execSync('npx playwright install chromium --force', {
    stdio: 'inherit',
    cwd: resolve(__dirname, '..'),
    timeout: 120_000,
  })
  console.log('[Worker] Chromium instalado')
}

const SESSION_PATH = '/tmp/.auth/canva.json'

const FLOW_MAP: Record<string, (page: any, members: { email: string }[]) => Promise<{ accessToken: string; inviteUrl: string }>> = {
  // DESACTIVADO: Canva ahora usa CanvaInviteLinkProvider (invite link estático + email)
  // en la app principal. La automatización Playwright fue bloqueada por anti-bot (PerimeterX/HUMAN).
  // canva: canvaFlow,
  // 'canva-pro': canvaFlow,
  // diseno: canvaFlow,
  chatgpt: chatgptFlow,
}

function decodeSession() {
  const raw = process.env.CANVA_SESSION_BASE64
  if (!raw) {
    console.log('[Worker] No hay CANVA_SESSION_BASE64 configurada')
    return false
  }
  try {
    const json = Buffer.from(raw, 'base64').toString('utf-8')
    const dir = '/tmp/.auth'
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(SESSION_PATH, json, 'utf-8')
    console.log('[Worker] Sesión decodificada en', SESSION_PATH)
    return true
  } catch (err) {
    console.error('[Worker] Error decodificando sesión:', err)
    return false
  }
}

async function provision(toolSlug: string, toolName: string, members: { email: string; userId: string }[]) {
  const flowKey = Object.keys(FLOW_MAP).find(k => toolSlug.includes(k) || toolName.toLowerCase().includes(k))
  const flow = flowKey ? FLOW_MAP[flowKey] : null
  if (!flow) {
    return { status: 'failed' as const, accessToken: null, inviteUrl: null, errors: [`No flow for ${toolSlug}`] }
  }

  decodeSession()

  let browser
  try {
    browser = await chromium.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1080',
        '--lang=es-AR',
      ],
    })
  } catch (error: any) {
    console.error('[Worker] Error lanzando Chromium:', error.message)
    return { status: 'failed' as const, accessToken: null, inviteUrl: null, errors: [error.message] }
  }

  const contextOptions: any = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
  }

  if (existsSync(SESSION_PATH)) {
    console.log('[Worker] Usando sesión guardada')
    contextOptions.storageState = SESSION_PATH
  }

  const context = await browser.newContext(contextOptions)

  // Remove webdriver detection
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
  })

  const page = await context.newPage()

  try {
    // Safety timeout: abort the entire flow after 120 seconds
    const FLOW_TIMEOUT_MS = 120_000
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Flow timeout: exceeded ${FLOW_TIMEOUT_MS / 1000}s`)), FLOW_TIMEOUT_MS),
    )
    const result = await Promise.race([flow(page, members), timeoutPromise])
    return { status: 'success' as const, accessToken: result.accessToken, inviteUrl: result.inviteUrl, errors: [] }
  } catch (error: any) {
    console.error('[Worker] Error en flow:', error.message)
    return { status: 'failed' as const, accessToken: null, inviteUrl: null, errors: [error.message] }
  } finally {
    await browser.close()
  }
}

app.post('/provision', async (req, res) => {
  const { lobbyId, toolSlug, toolName, members } = req.body

  if (!toolSlug || !members?.length) {
    return res.status(400).json({ error: 'Faltan campos requeridos: toolSlug, members' })
  }

  console.log(`[Worker] Provisionando lobby=${lobbyId} tool=${toolSlug} members=${members.length}`)
  const result = await provision(toolSlug, toolName, members)
  console.log(`[Worker] Resultado:`, result.status)

  res.json({ lobbyId, ...result })
})

app.get('/debug', async (_req, res) => {
  console.log('[Worker] Debug: navegando a Canva settings…')
  decodeSession()

  let browser
  try {
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
        '--disable-blink-features=AutomationControlled', '--window-size=1920,1080', '--lang=es-AR'],
    })
  } catch (e: any) {
    return res.json({ error: 'chromium launch failed', detail: e.message })
  }

  const contextOptions: any = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }, locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires',
  }
  if (existsSync(SESSION_PATH)) contextOptions.storageState = SESSION_PATH

  const context = await browser.newContext(contextOptions)
  await context.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }) })
  const page = await context.newPage()

  try {
    const t0 = Date.now()
    await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 20000 })
    const gotoMs = Date.now() - t0

    const url = page.url()

    // Poll for content
    let info = { title: '?', textLen: 0, buttons: 0, preview: '' }
    const pollStart = Date.now()
    for (let i = 0; i < 20; i++) { // 10s max
      info = await page.evaluate(() => ({
        title: document.title,
        textLen: (document.body?.innerText || '').length,
        buttons: document.querySelectorAll('button').length,
        preview: (document.body?.innerText || '').substring(0, 500),
      })).catch(() => ({ title: '?', textLen: 0, buttons: 0, preview: '' }))
      if (info.buttons >= 3 && info.textLen > 100) break
      await page.waitForTimeout(500)
    }
    const pollMs = Date.now() - pollStart

    // Get visible buttons
    const visibleButtons = await page.evaluate(() =>
      [...document.querySelectorAll('button')]
        .filter(b => (b as HTMLElement).offsetHeight > 0 && (b as HTMLElement).offsetWidth > 0)
        .map(b => (b.innerText || '').substring(0, 40).trim())
        .filter(Boolean),
    ).catch(() => [])

    const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 50 }).catch(() => null)
    const screenshotBase64 = screenshotBuffer ? screenshotBuffer.toString('base64') : null

    res.json({
      url,
      gotoMs,
      pollMs,
      totalMs: Date.now() - t0,
      sessionValid: !url.includes('/login') && !url.includes('accounts.google'),
      title: info.title,
      textLength: info.textLen,
      buttonCount: info.buttons,
      visibleButtons,
      preview: info.preview.substring(0, 300),
      screenshotBase64,
    })
  } catch (e: any) {
    res.json({ error: e.message })
  } finally {
    await browser.close()
  }
})

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

ensureBrowser()

const PORT = parseInt(process.env.PORT || '3001', 10)
const INSTANCE_ID = Math.random().toString(36).substring(2, 8).toUpperCase()
console.log(`\n[Worker] 🚀 Instancia iniciada: ${INSTANCE_ID}`)

app.listen(PORT, () => {
  console.log(`[Worker] Servidor iniciado en puerto ${PORT}`)
})
