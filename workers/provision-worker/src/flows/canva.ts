import type { Page } from 'playwright'

async function takeScreenshot(page: Page, label: string) {
  try {
    await page.screenshot({ path: `/tmp/canva-${label}.png`, fullPage: true })
  } catch {}
}

export async function ejecutar(page: Page, members: { email: string }[]): Promise<{ accessToken: string; inviteUrl: string }> {
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[Page Error]', msg.text().substring(0, 200))
  })

  // Navigate directly to settings/people
  console.log('[Canva] Navegando a /settings/people...')
  await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  console.log('[Canva] URL:', page.url())
  console.log('[Canva] Title:', await page.title().catch(() => '?'))
  await page.waitForTimeout(3000)
  await takeScreenshot(page, 'settings')

  // Log all text and count buttons
  const info = await page.evaluate(() => ({
    text: document.body?.innerText?.substring(0, 3000) || '',
    buttons: [...document.querySelectorAll('button')].map(b => ({ t: b.innerText?.substring(0, 40), v: b.offsetHeight > 0 })).filter(b => b.v),
    links: [...document.querySelectorAll('a')].map(a => a.innerText?.substring(0, 40)).filter(Boolean),
  })).catch(() => ({ text: '', buttons: [], links: [] }))
  console.log('[Canva] Text:', info.text.substring(0, 500))
  console.log('[Canva] Buttons:', info.buttons.map(b => b.t).join(' | '))

  // If text is just the shell, try homepage first then settings
  if (info.text.trim().length < 100) {
    console.log('[Canva] Shell vacío, intentando homepage primero...')
    await page.goto('https://www.canva.com/', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(3000)
    await takeScreenshot(page, 'homepage')
    const homeText = await page.evaluate(() => document.body?.innerText?.substring(0, 1000) || '').catch(() => '')
    console.log('[Canva] Homepage text:', homeText.substring(0, 300))

    console.log('[Canva] Navegando a /settings/people (v2)...')
    await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(5000)
    await takeScreenshot(page, 'settings-v2')

    const info2 = await page.evaluate(() => ({
      text: document.body?.innerText?.substring(0, 3000) || '',
      buttons: [...document.querySelectorAll('button')].map(b => ({ t: b.innerText?.substring(0, 40), v: b.offsetHeight > 0 })).filter(b => b.v),
    })).catch(() => ({ text: '', buttons: [] }))
    console.log('[Canva] Text v2:', info2.text.substring(0, 500))
    console.log('[Canva] Buttons v2:', info2.buttons.map(b => b.t).join(' | '))

    if (info2.text.trim().length < 100) {
      throw new Error(`Canva no carga contenido. URL final: ${page.url()}. Text: ${info2.text.substring(0, 200)}`)
    }
  }

  for (const member of members) {
    if (!member.email) continue
    console.log('[Canva] Invitando a:', member.email)

    // Wait for page to be stable (no loading spinners)
    await page.waitForTimeout(2000)

    const bodyText = await page.evaluate(() => document.body?.innerText || '').catch(() => '')

    // Find invite button — only really-visible buttons (not aria-hidden)
    const inviteCandidates = await page.evaluate(() => {
      const allBtns = [...document.querySelectorAll('button')]
      return allBtns
        .filter(b =>
          b.offsetParent !== null &&
          b.offsetHeight > 0 &&
          b.getAttribute('aria-hidden') !== 'true' &&
          !b.closest('[aria-hidden="true"]') &&
          /invitar|añadir|add|invite|share|compartir/i.test(b.innerText)
        )
        .map(b => ({ text: b.innerText.substring(0, 50), idx: allBtns.indexOf(b) }))
    })
    console.log('[Canva] Invite candidates:', JSON.stringify(inviteCandidates))

    let inviteBtn = null
    if (inviteCandidates.length > 0) {
      inviteBtn = page.locator('button').nth(inviteCandidates[0].idx)
    }

    if (!inviteBtn) {
      await takeScreenshot(page, 'no-invite-btn')
      const allBtnTexts = await page.evaluate(() =>
        [...document.querySelectorAll('button')].map(b => ({
          t: b.innerText.substring(0, 40),
          v: b.offsetParent !== null && b.offsetHeight > 0,
          h: b.getAttribute('aria-hidden')
        }))
      )
      throw new Error(`No se encontró botón invitar. Todos: ${JSON.stringify(allBtnTexts)}`)
    }

    await inviteBtn.click({ force: true, timeout: 15000, noWaitAfter: true })
    await page.waitForTimeout(4000)
    await takeScreenshot(page, 'after-invite-click')

    // Debug: log all interactive elements on the page
    const allInputs = await page.evaluate(() => {
      const all = [...document.querySelectorAll('input, textarea, [contenteditable], [role="textbox"]')]
        .map(el => ({
          tag: el.tagName,
          type: (el as HTMLInputElement).type || '',
          placeholder: (el as HTMLInputElement).placeholder || '',
          ariaLabel: el.getAttribute('aria-label') || '',
          role: el.getAttribute('role') || '',
          visible: el.offsetParent !== null && el.offsetHeight > 0,
          rect: el.getBoundingClientRect(),
          value: (el as HTMLInputElement).value?.substring(0, 20) || '',
        }))
        .filter(i => i.visible)
      return all
    }).catch(() => [])
    console.log('[Canva] Inputs visibles:', JSON.stringify(allInputs))

    // Find email input — try many selectors
    const emailSelectors = [
      'input[type="email"]',
      'input[type="search"]',
      'input[type="text"]',
      'input:not([type])',
      'input[placeholder*="email" i]',
      'input[placeholder*="correo" i]',
      'input[placeholder*="people" i]',
      'input[placeholder*="name" i]',
      'input[aria-label*="email" i]',
      'input[aria-label*="correo" i]',
      '[contenteditable="true"]',
      '[role="textbox"]',
      'textarea',
    ]
    let emailInput = null
    for (const sel of emailSelectors) {
      try {
        const el = page.locator(sel).first()
        if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
          emailInput = el
          console.log('[Canva] Email input encontrado con:', sel)
          break
        }
      } catch {}
    }

    if (!emailInput) {
      await takeScreenshot(page, 'no-input')
      throw new Error(`No se encontró input email. Inputs: ${JSON.stringify(allInputs)}`)
    }

    await emailInput.click({ force: true, noWaitAfter: true })
    await emailInput.fill(member.email)
    await page.waitForTimeout(1000)

    // Find confirm button (visible, not aria-hidden)
    const confirmCandidates = await page.evaluate(() => {
      const allBtns = [...document.querySelectorAll('button')]
      return allBtns
        .filter(b =>
          b.offsetParent !== null &&
          b.offsetHeight > 0 &&
          b.getAttribute('aria-hidden') !== 'true' &&
          !b.closest('[aria-hidden="true"]') &&
          /confirmar|send|invitar|invite|enviar/i.test(b.innerText)
        )
        .map(b => ({ text: b.innerText.substring(0, 50), idx: allBtns.indexOf(b) }))
    })
    console.log('[Canva] Confirm candidates:', JSON.stringify(confirmCandidates))

    let confirmBtn = null
    if (confirmCandidates.length > 0) {
      confirmBtn = page.locator('button').nth(confirmCandidates[0].idx)
    }

    if (!confirmBtn) {
      throw new Error('No se encontró botón confirmar')
    }
    await confirmBtn.click({ force: true, timeout: 15000, noWaitAfter: true })
    console.log('[Canva] Invitación enviada')
    await page.waitForTimeout(2000)
  }

  return { accessToken: 'https://www.canva.com', inviteUrl: 'https://www.canva.com' }
}
