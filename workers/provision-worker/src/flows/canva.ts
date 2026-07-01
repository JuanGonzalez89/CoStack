import type { Page } from 'playwright'

async function takeScreenshot(page: Page, label: string) {
  try { await page.screenshot({ path: `/tmp/canva-${label}.png`, fullPage: true }) } catch {}
}

async function domClick(page: Page, selector: string, timeout = 10000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const clicked = await page.evaluate((sel) => {
      const el = document.querySelector(sel) as HTMLElement | null
      if (el && el.offsetParent !== null && el.offsetHeight > 0 && el.getAttribute('aria-hidden') !== 'true') {
        el.scrollIntoView({ block: 'center', behavior: 'instant' })
        el.click()
        return true
      }
      return false
    }, selector).catch(() => false)
    if (clicked) return
    await page.waitForTimeout(500)
  }
  throw new Error(`domClick: no se pudo hacer click en "${selector}"`)
}

async function domType(page: Page, selector: string, text: string, timeout = 10000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const done = await page.evaluate(({ sel, txt }) => {
      const el = document.querySelector(sel) as HTMLInputElement | null
      if (!el || el.offsetParent === null || el.offsetHeight === 0) return false
      el.focus()
      el.value = txt
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    }, { sel: selector, txt: text }).catch(() => false)
    if (done) return
    await page.waitForTimeout(500)
  }
  throw new Error(`domType: no se pudo escribir en "${selector}"`)
}

export async function ejecutar(page: Page, members: { email: string }[]): Promise<{ accessToken: string; inviteUrl: string }> {
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[Page Error]', msg.text().substring(0, 200))
  })

  // Navigate to settings/people
  console.log('[Canva] Navegando a /settings/people...')
  await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  console.log('[Canva] URL:', page.url())
  console.log('[Canva] Title:', await page.title().catch(() => '?'))
  await page.waitForTimeout(3000)

  // Check if page loaded
  const pageText = await page.evaluate(() => document.body?.innerText || '').catch(() => '')
  console.log('[Canva] Page text (first 300):', pageText.substring(0, 300))

  if (pageText.trim().length < 100) {
    console.log('[Canva] Shell vacío, reintentando vía homepage...')
    await page.goto('https://www.canva.com/', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(3000)
    await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(5000)
  }

  await takeScreenshot(page, 'settings')
  console.log('[Canva] Buttons:', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b=>b.offsetHeight>0).map(b=>b.innerText.substring(0,30))).catch(()=>[]))

  for (const member of members) {
    if (!member.email) continue
    console.log('[Canva] Invitando a:', member.email)

    // 1. Click invite button — find by text content
    const inviteClicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')]
        .filter(b => b.offsetHeight > 0 && !b.closest('[aria-hidden="true"]'))
      const target = btns.find(b => /invitar|añadir|add|invite|share|gestionar/i.test(b.innerText))
      if (!target) return 'no-match'
      target.scrollIntoView({ block: 'center', behavior: 'instant' })
      target.click()
      return 'ok'
    }).catch(() => 'error')
    console.log('[Canva] Invite click result:', inviteClicked)
    if (inviteClicked !== 'ok') {
      await takeScreenshot(page, 'no-invite')
      const visBtns = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b=>b.offsetHeight>0).map(b=>b.innerText.substring(0,40)).filter(Boolean)).catch(()=>[])
      throw new Error(`No se pudo clickear invitar. Botones visibles: ${JSON.stringify(visBtns)}`)
    }

    await page.waitForTimeout(3000)
    await takeScreenshot(page, 'modal')

    // 2. Find and fill email input
    await domType(page, 'input[type="email"], input[type="search"], input:not([type]), input[placeholder*="email" i], input[placeholder*="correo" i]', member.email, 10000)

    // 3. Click confirm button
    const confirmClicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')]
        .filter(b => b.offsetHeight > 0 && !b.closest('[aria-hidden="true"]'))
      const target = btns.find(b => /confirmar e invitar|send invite|confirmar|invitar|enviar|send|invite/i.test(b.innerText))
      if (!target) return 'no-match'
      target.scrollIntoView({ block: 'center', behavior: 'instant' })
      target.click()
      return 'ok'
    }).catch(() => 'error')
    console.log('[Canva] Confirm click result:', confirmClicked)
    if (confirmClicked !== 'ok') {
      // Fallback: try to find submit button in modal
      const fallback = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')].filter(b => b.offsetHeight > 0)
        const submit = btns.find(b => b.type === 'submit') || btns[btns.length - 1]
        if (submit) { submit.click(); return 'ok' }
        return 'no-match'
      }).catch(() => 'error')
      console.log('[Canva] Confirm fallback:', fallback)
      if (fallback !== 'ok') {
        await takeScreenshot(page, 'no-confirm')
        const visBtns = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b=>b.offsetHeight>0).map(b=>b.innerText.substring(0,40)).filter(Boolean)).catch(()=>[])
        throw new Error(`No se pudo clickear confirmar. Botones: ${JSON.stringify(visBtns)}`)
      }
    }

    console.log('[Canva] Invitación enviada a', member.email)
    await page.waitForTimeout(2000)
  }

  return { accessToken: 'https://www.canva.com', inviteUrl: 'https://www.canva.com' }
}
