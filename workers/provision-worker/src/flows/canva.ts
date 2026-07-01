import type { Page } from 'playwright'

export async function ejecutar(page: Page, members: { email: string }[]): Promise<{ accessToken: string; inviteUrl: string }> {
  // 1. Ir directo a /settings/people (gestión de personas)
  await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(2000)

  for (const member of members) {
    if (!member.email) continue

    console.log('[Canva Worker] Invitando a:', member.email)

    // 2. Buscar botón de invitar en la página de people
    // Posibles textos: "Invitar", "Añadir", "Add people", "Invitar a alguien"
    const inviteBtn = page.getByText('Invitar').or(page.getByText('Añadir')).or(page.getByText('Add people')).or(page.getByText('Invitar a alguien')).first()
    await inviteBtn.scrollIntoViewIfNeeded()
    await inviteBtn.click({ timeout: 10000 })
    await page.waitForTimeout(3000)

    // 3. Buscar cualquier input de texto visible (email)
    const emailInput = page.locator('input:not([type="hidden"]):not([type="checkbox"]):not([type="submit"]):not([type="radio"])').first()
    await emailInput.waitFor({ state: 'visible', timeout: 10000 })
    await emailInput.fill(member.email)
    await page.waitForTimeout(500)

    // 4. Buscar botón "Confirmar e invitar" en el modal
    const confirmBtn = page.getByText('Confirmar e invitar')
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 })
    await confirmBtn.click()
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
