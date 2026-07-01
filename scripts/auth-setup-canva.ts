import { chromium } from 'playwright'
import * as readline from 'readline'

function waitForEnter(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question('', () => { rl.close(); resolve() }))
}

async function main() {
  const browser = await chromium.launch({
    headless: false,
    channel: 'msedge',
    args: ['--disable-blink-features=AutomationControlled'],
  })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
  })
  const page = await context.newPage()

  await page.goto('https://www.canva.com/login')

  console.log('=== Canva ===')
  console.log('👉 Logueate en Canva con la cuenta maestra.')
  console.log('👉 Después presioná Enter para continuar...')
  await waitForEnter()

  await context.storageState({ path: '.auth/canva.json' })
  console.log('✅ Sesión de Canva guardada.\n')

  await browser.close()
  console.log('🎉 Sesión guardada en .auth/canva.json')
}

main()
