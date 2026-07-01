import type { Page } from 'playwright'

async function takeDebugScreenshot(page: Page, label: string) {
  const path = `/tmp/canva-${label}.png`
  await page.screenshot({ path, fullPage: true }).catch(() => {})
  console.log(`[Canva Debug] Screenshot guardado: ${path}`)
}

async function waitForSpa(page: Page, timeout = 30000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    const text = await page.evaluate(() => document.body?.innerText || '').catch(() => '')
    if (text.length > 300) {
      return text
    }
    await page.waitForTimeout(2000)
  }
  return await page.evaluate(() => document.body?.innerText || '').catch(() => '')
}

export async function ejecutar(page: Page, members: { email: string }[]): Promise<{ accessToken: string; inviteUrl: string }> {
  // Capture console errors from the page
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('[Canva Page Error]', msg.text().substring(0, 300))
    }
  })

  // 1. Navigate to homepage first to establish session in SPA context
  console.log('[Canva Worker] Navegando a canva.com...')
  await page.goto('https://www.canva.com/', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
  console.log('[Canva Worker] URL:', page.url())

  // Wait for SPA to render
  await page.waitForTimeout(3000)
  let bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 2000) || '').catch(() => '')
  console.log('[Canva Worker] Texto homepage:', bodyText.substring(0, 500))
  await takeDebugScreenshot(page, 'homepage')

  // 2. Navigate to /settings/people
  console.log('[Canva Worker] Navegando a /settings/people...')
  await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})

  // Wait for SPA content
  await page.waitForTimeout(3000)
  bodyText = await waitForSpa(page)
  console.log('[Canva Worker] URL settings:', page.url())
  console.log('[Canva Worker] Texto settings:', bodyText.substring(0, 500))
  await takeDebugScreenshot(page, 'settings')

  // If the page is mostly empty shell, try reloading
  if (bodyText.length < 200) {
    console.log('[Canva Worker] Página vacía, recargando...')
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
    await page.waitForTimeout(5000)
    bodyText = await waitForSpa(page)
    console.log('[Canva Worker] Texto después de recargar:', bodyText.substring(0, 500))
    await takeDebugScreenshot(page, 'settings-reload')
  }

  for (const member of members) {
    if (!member.email) continue
    console.log('[Canva Worker] Invitando a:', member.email)

    // Update bodyText before each member in case it changed
    bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 3000) || '').catch(() => '')

    // 3. Buscar botón de invitar con múltiples estrategias
    const btnSelectors = [
      // Text-based
      ...['Invitar', 'Añadir', 'Add people', 'Invitar a alguien', 'Invite', 'Add member', 'Add team member', 'Agregar', 'Share', 'Compartir', '+'].map(t => `text=${t}`),
      // Common testids / attributes
      '[data-testid="invite-button"]',
      '[data-testid="add-people-button"]',
      '[aria-label*="invitar" i]',
      '[aria-label*="añadir" i]',
      '[aria-label*="add" i]',
      // By role
      'button:has-text("Invitar")',
      'button:has-text("Añadir")',
      'button:has-text("Add")',
    ]
    let inviteBtn = null
    for (const sel of btnSelectors) {
      try {
        const btn = page.locator(sel).first()
        if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
          inviteBtn = btn
          console.log('[Canva Worker] Botón encontrado con selector:', sel)
          break
        }
      } catch { }
    }

    if (!inviteBtn) {
      await takeDebugScreenshot(page, 'no-invite-btn')
      throw new Error(`No se encontró botón de invitar. Texto visible: ${bodyText.substring(0, 1000)}`)
    }

    await inviteBtn.scrollIntoViewIfNeeded()
    await inviteBtn.click({ timeout: 10000, force: true })
    await page.waitForTimeout(3000)

    // 4. Buscar cualquier input de texto visible (email)
    const emailInputSelectors = [
      'input[type="email"]',
      'input[type="text"]:not([type="hidden"])',
      'input:not([type="hidden"]):not([type="checkbox"]):not([type="submit"]):not([type="radio"]):not([type="search"])',
      '[contenteditable="true"]',
      'textarea',
    ]
    let emailInput = null
    for (const sel of emailInputSelectors) {
      try {
        const input = page.locator(sel).first()
        if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
          emailInput = input
          console.log('[Canva Worker] Input encontrado con selector:', sel)
          break
        }
      } catch { }
    }

    if (!emailInput) {
      await takeDebugScreenshot(page, 'no-email-input')
      const html = await page.evaluate(() => document.querySelector('[role=dialog]')?.innerHTML?.substring(0, 2000) || 'sin modal').catch(() => '')
      console.log('[Canva Debug] HTML modal:', html)
      throw new Error('No se encontró campo de email')
    }

    await emailInput.fill(member.email)
    await page.waitForTimeout(500)

    // 5. Buscar botón de confirmar/invitar
    const confirmSelectors = [
      'button:has-text("Confirmar e invitar")',
      'button:has-text("Send invite")',
      'button:has-text("Invitar")',
      'button:has-text("Enviar")',
      'button:has-text("Send")',
      'button:has-text("Confirmar")',
      'button:has-text("Invite")',
      '[data-testid="confirm-invite-button"]',
      'button[type="submit"]',
    ]
    let confirmBtn = null
    for (const sel of confirmSelectors) {
      try {
        const btn = page.locator(sel).first()
        if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
          confirmBtn = btn
          console.log('[Canva Worker] Confirm encontrado con selector:', sel)
          break
        }
      } catch { }
    }
    if (!confirmBtn) {
      throw new Error('No se encontró botón de confirmar')
    }
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 })
    await confirmBtn.click({ force: true })
    console.log('[Canva Worker] Click en confirmar ejecutado')
    await page.waitForTimeout(3000)

    // 6. Volver a /settings/people para el siguiente miembro
    await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
    await page.waitForTimeout(3000)
  }

  return {
    accessToken: 'https://www.canva.com',
    inviteUrl: 'https://www.canva.com',
  }
}
