import express from 'express'
import { chromium } from 'playwright'
import { existsSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { ejecutar as canvaFlow } from './flows/canva'
import { ejecutar as chatgptFlow } from './flows/chatgpt'

const app = express()
app.use(express.json())

function ensureBrowser(): void {
  const home = process.env.HOME || '/opt/render'
  const cacheDir = `${home}/.cache/ms-playwright`
  if (existsSync(cacheDir)) {
    const items = readdirSync(cacheDir)
    if (items.some(i => i.includes('chromium'))) {
      console.log('[Worker] Chromium headless shell ya instalado')
      return
    }
  }
  console.log('[Worker] Instalando chromium-headless-shell...')
  execSync('PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install chromium-headless-shell --force', {
    stdio: 'inherit',
    cwd: __dirname,
    timeout: 120_000,
  })
  console.log('[Worker] Chromium headless shell instalado')
}

const SESSION_PATH = '/tmp/.auth/canva.json'

const FLOW_MAP: Record<string, (page: any, members: { email: string }[]) => Promise<{ accessToken: string; inviteUrl: string }>> = {
  canva: canvaFlow,
  'canva-pro': canvaFlow,
  diseno: canvaFlow,
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

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })

  const contextOptions: any = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  }

  if (existsSync(SESSION_PATH)) {
    console.log('[Worker] Usando sesión guardada')
    contextOptions.storageState = SESSION_PATH
  }

  const context = await browser.newContext(contextOptions)
  const page = await context.newPage()

  try {
    const result = await flow(page, members)
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

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

ensureBrowser()

const PORT = parseInt(process.env.PORT || '3001', 10)
app.listen(PORT, () => {
  console.log(`[Worker] Servidor iniciado en puerto ${PORT}`)
})
