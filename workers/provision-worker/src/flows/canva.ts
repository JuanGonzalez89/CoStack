import type { Page } from 'playwright'
import { writeFileSync } from 'node:fs'

async function takeDebugScreenshot(page: Page, label: string) {
  const path = `/tmp/canva-${label}.png`
  await page.screenshot({ path }).catch(() => {})
  console.log(`[Canva Debug] Screenshot guardado: ${path}`)
}

export async function ejecutar(page: Page, members: { email: string }[]): Promise<{ accessToken: string; inviteUrl: string }> {
  // 1. Ir directo a /settings/people (gestión de personas)
  await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(2000)

  console.log('[Canva Worker] URL:', page.url())
  console.log('[Canva Worker] Título:', await page.title().catch(() => '?'))
  await takeDebugScreenshot(page, 'landing')

  // Log all visible text content to find the button text
  const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 3000) || '').catch(() => '')
  console.log('[Canva Debug] Texto visible:', bodyText.substring(0, 1000))

  for (const member of members) {
    if (!member.email) continue

    console.log('[Canva Worker] Invitando a:', member.email)

    // 2. Buscar botón de invitar con múltiples estrategias
    const btnTexts = ['Invitar', 'Añadir', 'Add people', 'Invitar a alguien', 'Invite', 'Add member', 'Add team member', 'Agregar', 'Invitar a', 'Share', 'Compartir', '+']
    let inviteBtn = null
    for (const text of btnTexts) {
      try {
        const btn = page.getByText(text, { exact: false }).first()
        if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
          inviteBtn = btn
          console.log('[Canva Worker] Botón encontrado con texto:', text)
          break
        }
      } catch { }
    }

    // Try by role
    if (!inviteBtn) {
      try {
        const btn = page.getByRole('button', { name: /invite|invitar|añadir|add|share/i })
        if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
          inviteBtn = btn
          console.log('[Canva Worker] Botón encontrado por role')
        }
      } catch { }
    }

    if (!inviteBtn) {
      await takeDebugScreenshot(page, 'no-invite-btn')
      throw new Error(`No se encontró botón de invitar. Texto visible: ${bodyText.substring(0, 500)}`)
    }

    await inviteBtn.scrollIntoViewIfNeeded()
    await inviteBtn.click({ timeout: 10000, force: true })
    await page.waitForTimeout(3000)

    // 3. Buscar cualquier input de texto visible (email)
    const emailInput = page.locator('input:not([type="hidden"]):not([type="checkbox"]):not([type="submit"]):not([type="radio"])').first()
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill(member.email)
      await page.waitForTimeout(500)
    } else {
      await takeDebugScreenshot(page, 'no-email-input')
      console.log('[Canva Debug] HTML modal:', await page.evaluate(() => document.querySelector('[role=dialog]')?.innerHTML?.substring(0, 1000) || 'sin modal').catch(() => ''))
      throw new Error('No se encontró campo de email')
    }

    // 4. Buscar botón de confirmar/invitar en el modal
    const confirmTexts = ['Confirmar e invitar', 'Send invite', 'Invitar', 'Enviar', 'Send', 'Confirmar', 'Invite']
    let confirmBtn = null
    for (const text of confirmTexts) {
      try {
        const btn = page.getByRole('button', { name: new RegExp(text, 'i') }).first()
        if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
          confirmBtn = btn
          break
        }
      } catch { }
    }
    if (!confirmBtn) {
      confirmBtn = page.getByText(/confirmar e invitar|send invite|invitar|enviar/i).first()
    }
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 })
    await confirmBtn.click({ force: true })
    console.log('[Canva Worker] Click en confirmar ejecutado')
    await page.waitForTimeout(3000)

    // 5. Volver a /settings/people para el siguiente miembro
    await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(2000)
  }

  return {
    accessToken: 'https://www.canva.com',
    inviteUrl: 'https://www.canva.com',
  }
}
