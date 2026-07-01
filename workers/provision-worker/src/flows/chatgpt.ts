import type { Page } from 'playwright'

export async function ejecutar(page: Page, members: { email: string }[]): Promise<{ accessToken: string; inviteUrl: string }> {
  await page.goto('https://chatgpt.com/admin', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(2000)

  for (const member of members) {
    if (!member.email) continue
    console.log('[ChatGPT Worker] Invitando a:', member.email)

    await page.goto('https://chatgpt.com/admin', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const input = page.locator('input[type="email"]')
    await input.waitFor({ state: 'visible', timeout: 10000 })
    await input.fill(member.email)
    await page.waitForTimeout(500)

    const addBtn = page.getByText('Añadir').or(page.getByText('Add')).or(page.getByText('Invitar')).first()
    await addBtn.click({ timeout: 5000 })
    await page.waitForTimeout(2000)
  }

  return {
    accessToken: page.url(),
    inviteUrl: 'https://chatgpt.com/admin',
  }
}
