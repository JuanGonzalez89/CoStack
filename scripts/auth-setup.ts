import { chromium } from 'playwright'
import * as readline from 'readline'

function waitForEnter(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question('', () => { rl.close(); resolve() }))
}

async function main() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()

  const page = await context.newPage()

  console.log('=== ChatGPT ===')
  await page.goto('https://chatgpt.com/auth/login')
  console.log('👉 Logueate en ChatGPT con la cuenta maestra (admin@costack.la).')
  console.log('👉 Después presioná Enter para continuar...')
  await waitForEnter()
  await context.storageState({ path: '.auth/chatgpt.json' })
  console.log('✅ Sesión de ChatGPT guardada.\n')

  console.log('=== Canva ===')
  await page.goto('https://www.canva.com/login')
  console.log('👉 Logueate en Canva con la cuenta maestra.')
  console.log('👉 Después presioná Enter para continuar...')
  await waitForEnter()
  await context.storageState({ path: '.auth/canva.json' })
  console.log('✅ Sesión de Canva guardada.\n')

  await browser.close()
  console.log('🎉 Sesiones guardadas. Ya podés correr el bot.')
}

main()
