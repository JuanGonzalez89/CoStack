import { existsSync } from 'node:fs'
import type { ProvisionResult, ProvisionerProvider, PlaywrightFlow } from './types'
import type { BrowserContextOptions } from 'playwright'
import { chatgptFlow } from './flows/chatgpt'
import { canvaFlow } from './flows/canva'

const flows: PlaywrightFlow[] = [chatgptFlow, canvaFlow]

const FLOW_SESSION_MAP: Record<string, string> = {
  chatgpt: '.auth/chatgpt.json',
  canva: '.auth/canva.json',
}

export class PlaywrightProvider implements ProvisionerProvider {
  name = 'Playwright (Session Hijacking)'

  canHandle(toolSlug: string): boolean {
    return flows.some(f => f.toolSlugs.includes(toolSlug))
  }

  async fulfill(lobbyId: string, toolName: string, members: { email: string; userId: string }[]): Promise<ProvisionResult> {
    const toolSlug = toolName.toLowerCase()
    const flow = flows.find(f => f.toolSlugs.some(s => toolSlug.includes(s)))
    if (!flow) {
      return { status: 'failed', accessToken: null, providerName: this.name, inviteUrl: null, errors: ['No flow matched'] }
    }

    const sessionKey = flow.toolSlugs[0]
    const sessionPath = FLOW_SESSION_MAP[sessionKey] ?? '.auth/chatgpt.json'

    if (!existsSync(sessionPath)) {
      console.log(`[PlaywrightProvider] Modo simulación: no hay sesión en ${sessionPath}`)
      return {
        status: 'success',
        accessToken: `https://www.${sessionKey}.com/team/members`,
        providerName: flow.nombre,
        inviteUrl: `https://www.${sessionKey}.com/team/members`,
        errors: [],
      }
    }

    const { chromium } = await import('playwright')
    const browser = await chromium.launch({
      headless: false,
      args: ['--disable-blink-features=AutomationControlled'],
    })
    const contextOptions: BrowserContextOptions = {
      storageState: sessionPath,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      locale: sessionKey === 'canva' ? 'es-AR' : 'en-US',
      timezoneId: sessionKey === 'canva' ? 'America/Argentina/Buenos_Aires' : 'America/New_York',
      viewport: { width: 1280, height: 800 },
    }
    const context = await browser.newContext(contextOptions)
    const page = await context.newPage()

    try {
      const result = await flow.ejecutar(page, members)
      await page.screenshot({ path: `.auth/debug-${sessionKey}-success.png` }).catch(() => {})
      return {
        status: 'success',
        accessToken: result.accessToken,
        providerName: flow.nombre,
        inviteUrl: result.inviteUrl,
        errors: [],
      }
    } catch (error) {
      const errorMsg = (error as Error).message
      console.error(`[PlaywrightProvider] Error en ${flow.nombre}: ${errorMsg}`)
      console.error(`[PlaywrightProvider] URL actual: ${page.url()}`)
      await page.screenshot({ path: `.auth/debug-${sessionKey}-error.png` }).catch(() => {})
      const html = await page.content().catch(() => '')
      console.error(`[PlaywrightProvider] HTML (primeros 2000 chars): ${html.slice(0, 2000)}`)
      return {
        status: 'failed',
        accessToken: null,
        providerName: flow.nombre,
        inviteUrl: null,
        errors: [errorMsg],
      }
    } finally {
      await browser.close()
    }
  }
}
