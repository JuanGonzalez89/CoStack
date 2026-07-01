import type { Page } from 'playwright'

export async function ejecutar(page: Page, members: { email: string }[]): Promise<{ accessToken: string; inviteUrl: string }> {
  await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(2000)

  for (const member of members) {
    if (!member.email) continue
    console.log('[Canva Worker] Invitando a:', member.email)

    const inviteBtn = page.getByText('Invitar').or(page.getByText('Añadir')).or(page.getByText('Add people')).or(page.getByText('Invitar a alguien')).first()
    await inviteBtn.scrollIntoViewIfNeeded()
    await inviteBtn.click({ timeout: 10000 })
    await page.waitForTimeout(3000)

    const emailInput = page.locator('input:not([type="hidden"]):not([type="checkbox"]):not([type="submit"]):not([type="radio"])').first()
    await emailInput.waitFor({ state: 'visible', timeout: 10000 })
    await emailInput.fill(member.email)
    await page.waitForTimeout(500)

    const confirmBtn = page.getByText('Confirmar e invitar')
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 })
    await confirmBtn.click()
    console.log('[Canva Worker] Click en confirmar ejecutado')
    await page.waitForTimeout(3000)

    await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(2000)
  }

  return {
    accessToken: 'https://www.canva.com',
    inviteUrl: 'https://www.canva.com',
  }
}
