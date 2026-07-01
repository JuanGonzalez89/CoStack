import type { Page } from 'playwright'
import { writeFileSync } from 'node:fs'

async function findInviteButton(page: Page) {
  const strategies = [
    // By role with regex
    () => page.getByRole('button', { name: /invitar|invite|a.adir|add.*member|add.*people/i }).first(),
    // Common button text patterns
    () => page.getByText(/invitar/i, { exact: false }).first(),
    () => page.getByText(/invite/i, { exact: false }).first(),
    () => page.getByText(/add people/i, { exact: false }).first(),
    () => page.getByText(/add member/i, { exact: false }).first(),
    () => page.getByText(/a.adir/i, { exact: false }).first(),
    () => page.getByText(/invitar a alguien/i, { exact: false }).first(),
    () => page.getByText(/invite someone/i, { exact: false }).first(),
    // By test-id attributes (Canva might use these)
    () => page.locator('[data-testid*="invite"], [data-testid*="add-member"]').first(),
    // By aria-label
    () => page.locator('[aria-label*="invite" i], [aria-label*="add" i]').first(),
    // Any button/link with "plus" icon near member section
    () => page.locator('button:has(svg)').filter({ hasText: /invitar|invite|a.adir|add/i }).first(),
    () => page.locator('a[href*="invite"], a[href*="add"]').first(),
    // Generic: first button in the member section header
    () => page.locator('section:has(h2, h3, h4)', { hasText: /member|people|team/i }).locator('button').first(),
    () => page.locator('header:has(h1,h2,h3,h4)', { hasText: /member|people|invite/i }).locator('button').first(),
    // Very broad: any button with a plus icon
    () => page.locator('button:has(svg)').filter({ has: page.locator('svg') }).first(),
    // Link styled as button
    () => page.locator('a[class*="button"], a[class*="btn"]').filter({ hasText: /invitar|invite|a.adir|add/i }).first(),
  ]

  for (const strategy of strategies) {
    try {
      const btn = strategy()
      const visible = await btn.isVisible({ timeout: 1500 }).catch(() => false)
      if (visible) {
        console.log('[Canva Worker] Botón encontrado')
        return btn
      }
    } catch { }
  }
  return null
}

export async function ejecutar(page: Page, members: { email: string }[]): Promise<{ accessToken: string; inviteUrl: string }> {
  // Navigate to team settings
  await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(3000)

  const pageUrl = page.url()
  const pageTitle = await page.title().catch(() => 'unknown')
  console.log('[Canva Worker] URL:', pageUrl)
  console.log('[Canva Worker] Título:', pageTitle)

  await page.screenshot({ path: '/tmp/canva-page.png' }).catch(() => {})

  // If we got redirected to login, the session expired
  if (pageUrl.includes('login') || pageUrl.includes('auth')) {
    throw new Error(`Redirigido a login. Sesión expirada. URL: ${pageUrl}`)
  }

  // If settings/people redirects elsewhere, maybe Canva changed the URL
  if (!pageUrl.includes('people') && !pageUrl.includes('member') && !pageUrl.includes('team')) {
    // Try alternative URLs
    const altUrls = [
      'https://www.canva.com/team/members',
      'https://www.canva.com/team',
      'https://www.canva.com/settings/team',
    ]
    for (const url of altUrls) {
      console.log('[Canva Worker] Probando URL alternativa:', url)
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
      await page.waitForTimeout(2000)
      await page.screenshot({ path: `/tmp/canva-alt-${Date.now()}.png` }).catch(() => {})
      const btn = await findInviteButton(page)
      if (btn) break
    }
  }

  for (const member of members) {
    if (!member.email) continue
    console.log('[Canva Worker] Invitando a:', member.email)

    // Increase timeout and add retries
    let inviteBtn = null
    for (let attempt = 0; attempt < 3; attempt++) {
      inviteBtn = await findInviteButton(page)
      if (inviteBtn) break
      console.log(`[Canva Worker] Intento ${attempt + 1}: botón no encontrado, recargando...`)
      await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
      await page.waitForTimeout(3000)
    }

    if (!inviteBtn) {
      const html = await page.content().catch(() => '')
      await page.screenshot({ path: '/tmp/canva-error.png' }).catch(() => {})
      throw new Error(`No se encontró botón de invitación. URL: ${page.url()}, Título: ${pageTitle}. HTML snippet: ${html.substring(0, 1000)}`)
    }

    await inviteBtn.scrollIntoViewIfNeeded()
    await inviteBtn.click({ timeout: 10000, force: true })
    console.log('[Canva Worker] Click en botón de invitación ejecutado')
    await page.waitForTimeout(3000)

    // Look for email input - try multiple strategies
    let emailInput = null
    const inputStrategies = [
      () => page.locator('input[type="email"]').first(),
      () => page.locator('input:not([type="hidden"]):not([type="checkbox"]):not([type="submit"]):not([type="radio"])').first(),
      () => page.locator('[contenteditable="true"]').first(),
      () => page.getByPlaceholder(/email|correo/i).first(),
    ]
    for (const strat of inputStrategies) {
      try {
        const el = strat()
        if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
          emailInput = el
          break
        }
      } catch { }
    }

    if (!emailInput) {
      throw new Error(`No se encontró campo de email después de hacer clic en invitar. URL: ${page.url()}`)
    }

    await emailInput.fill(member.email)
    await page.waitForTimeout(500)

    // Look for confirm/send button
    const confirmStrats = [
      () => page.getByText(/confirmar|send|invitar|enviar|invite/i).first(),
      () => page.getByRole('button', { name: /confirmar|send|invitar|enviar|invite/i }).first(),
      () => page.locator('button[type="submit"]').first(),
      () => page.locator('button:has(svg)').filter({ hasText: /confirmar|send|invitar|enviar/i }).first(),
    ]
    let confirmBtn = null
    for (const strat of confirmStrats) {
      try {
        const el = strat()
        if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
          confirmBtn = el
          break
        }
      } catch { }
    }

    if (!confirmBtn) {
      await page.screenshot({ path: '/tmp/canva-confirm-error.png' }).catch(() => {})
      throw new Error(`No se encontró botón de confirmar después de escribir email. HTML: ${(await page.content().catch(() => '')).substring(0, 1000)}`)
    }

    await confirmBtn.click({ force: true })
    console.log('[Canva Worker] Click en confirmar ejecutado')
    await page.waitForTimeout(3000)

    // Navigate back to settings for next member
    await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
    await page.waitForTimeout(2000)
  }

  return {
    accessToken: 'https://www.canva.com',
    inviteUrl: 'https://www.canva.com',
  }
}