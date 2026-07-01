import type { Page } from 'playwright'
import { writeFileSync } from 'node:fs'

export async function ejecutar(page: Page, members: { email: string }[]): Promise<{ accessToken: string; inviteUrl: string }> {
  await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(3000)

  await page.screenshot({ path: '/tmp/canva-settings.png', fullPage: true }).catch(() => {})
  const pageTitle = await page.title().catch(() => 'unknown')
  console.log('[Canva Worker] Título de página:', pageTitle)
  console.log('[Canva Worker] URL actual:', page.url())

  for (const member of members) {
    if (!member.email) continue
    console.log('[Canva Worker] Invitando a:', member.email)

    // Try multiple strategies to find the invite trigger
    let inviteBtn = null
    const strategies = [
      () => page.getByRole('button', { name: /invitar|invite|añadir|add/i }).first(),
      () => page.getByText('Invitar', { exact: false }).first(),
      () => page.getByText('Add people', { exact: false }).first(),
      () => page.getByText('Añadir', { exact: false }).first(),
      () => page.getByText('Invitar a alguien', { exact: false }).first(),
      () => page.locator('[data-testid="invite-button"], [data-testid="add-member-button"]').first(),
      () => page.locator('button:has(svg)').filter({ hasText: /invitar|invite|añadir|add/i }).first(),
      () => page.locator('a').filter({ hasText: /invitar|invite|añadir|add/i }).first(),
    ]

    for (const strategy of strategies) {
      try {
        const btn = strategy()
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
          inviteBtn = btn
          console.log('[Canva Worker] Botón encontrado con estrategia exitosa')
          break
        }
      } catch { }
    }

    if (!inviteBtn) {
      // Try clicking a general "people" or "members" section first
      const peopleLink = page.getByText(/miembros|members|people/i).first()
      if (await peopleLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await peopleLink.click().catch(() => {})
        await page.waitForTimeout(2000)
        // Retry finding invite button
        for (const strategy of strategies) {
          try {
            const btn = strategy()
            if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
              inviteBtn = btn
              console.log('[Canva Worker] Botón encontrado después de navegar a miembros')
              break
            }
          } catch { }
        }
      }
    }

    if (!inviteBtn) {
      const html = await page.content().catch(() => '')
      const snippet = html.substring(0, 2000)
      await page.screenshot({ path: '/tmp/canva-error.png', fullPage: true }).catch(() => {})
      throw new Error(`No se encontró botón de invitación. URL: ${page.url()}. HTML snippet: ${snippet.substring(0, 500)}`)
    }

    await inviteBtn.scrollIntoViewIfNeeded()
    await inviteBtn.click({ timeout: 10000 })
    await page.waitForTimeout(3000)

    const emailInput = page.locator('input:not([type="hidden"]):not([type="checkbox"]):not([type="submit"]):not([type="radio"])').first()
    await emailInput.waitFor({ state: 'visible', timeout: 15000 })
    await emailInput.fill(member.email)
    await page.waitForTimeout(500)

    const confirmBtn = page.getByText(/confirmar e invitar|send invite|invitar|enviar/i).first()
    await confirmBtn.waitFor({ state: 'visible', timeout: 10000 })
    await confirmBtn.click()
    console.log('[Canva Worker] Click en confirmar ejecutado')
    await page.waitForTimeout(3000)

    await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(2000)
  }

  return {
    accessToken: 'https://www.canva.com',
    inviteUrl: 'https://www.canva.com',
  }
}
