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

    await inviteBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await inviteBtn.click({ force: true })
    await page.waitForTimeout(3000)

    // Find email input
    const emailInput = page.locator('input[type="email"], input:not([type])').first()
    if (!(await emailInput.isVisible({ timeout: 5000 }).catch(() => false))) {
      await takeScreenshot(page, 'no-input')
      throw new Error('No se encontró input email')
    }
    await emailInput.fill(member.email)
    await page.waitForTimeout(500)

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
    await confirmBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await confirmBtn.click({ force: true })
    console.log('[Canva] Invitación enviada')
    await page.waitForTimeout(2000)
  }

  return { accessToken: 'https://www.canva.com', inviteUrl: 'https://www.canva.com' }
}
