import type { PlaywrightFlow } from '../types'

export const chatgptFlow: PlaywrightFlow = {
  toolSlugs: ['chatgpt', 'chatgpt-team'],
  nombre: 'ChatGPT Team',

  async ejecutar(page, members) {
    await page.goto('https://chatgpt.com/g/admin')
    await page.waitForSelector('text=Team', { timeout: 10000 })

    await page.click('text=Add members')
    await page.waitForSelector('input[type="email"]')

    for (const member of members) {
      if (!member.email) continue
      await page.fill('input[type="email"]', member.email)
      await page.click('text=Send invite')
      await page.waitForTimeout(2000)
    }

    const inviteLink = await page.getAttribute('a[data-testid="invite-link"]', 'href')

    return {
      accessToken: inviteLink ?? 'INVITATION_SENT',
      inviteUrl: inviteLink ?? '',
    }
  },
}
