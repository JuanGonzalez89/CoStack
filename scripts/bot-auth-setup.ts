/**
 * Script para autenticar la Master Account de CoStack y guardar la sesión
 *
 * Uso:
 *   npx tsx scripts/bot-auth-setup.ts
 *
 * Abre un navegador para que vos te loguees MANUALMENTE en GitHub
 * (completando CAPTCHA, 2FA, etc.). Una vez que detecta que estás
 * autenticado, guarda la sesión en .auth/github-state.json para que
 * el bot la reutilice.
 */
import { chromium } from "@playwright/test"
import * as path from "path"
import * as fs from "fs"

const AUTH_DIR = path.resolve(__dirname, "..", ".auth")
const AUTH_FILE = path.join(AUTH_DIR, "github-state.json")

async function waitForLogin(page: any): Promise<boolean> {
  for (let i = 0; i < 120; i++) {
    const url = page.url()
    if (url === "https://github.com/" || url.startsWith("https://github.com/?")) {
      return true
    }
    try {
      const dashboardLink = await page.$('a[href*="dashboard"]')
      if (dashboardLink) return true
      const avatarImg = await page.$('img.avatar')
      if (avatarImg) return true
    } catch {}
    await new Promise(r => setTimeout(r, 1000))
  }
  return false
}

async function main() {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true })
  }

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    console.log("🌐 Abriendo navegador...")
    await page.goto("https://github.com/login", { waitUntil: "networkidle" })

    console.log("")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🔐 INSTRUCCIONES:")
    console.log("  1. Completá el login con las credenciales:")
    console.log("     Email: costack.dev.bot@gmail.com")
    console.log("  2. Resolvé el CAPTCHA / 2FA si aparece")
    console.log("  3. Esperá a que cargue el dashboard de GitHub")
    console.log("")
    console.log("⏳ El script detectará el login automáticamente...")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("")

    const loggedIn = await waitForLogin(page)

    if (!loggedIn) {
      console.error("❌ Tiempo de espera agotado (120s). No se detectó login.")
      await page.screenshot({ path: path.join(AUTH_DIR, "auth-timeout.png") })
      process.exit(1)
    }

    console.log("✅ Login detectado! Guardando sesión...")

    await page.goto("https://github.com/costack-bot-test", { waitUntil: "networkidle" })
    const orgTitle = await page.title()
    console.log(`🏢 Organization page: ${orgTitle}`)

    await context.storageState({ path: AUTH_FILE })
    console.log(`💾 Sesión guardada en: ${AUTH_FILE}`)
    console.log("🎉 Autenticación completada con éxito!")
    console.log("Ya podés cerrar el navegador.")
  } catch (error) {
    console.error("❌ Error:", error)
    await page.screenshot({ path: path.join(AUTH_DIR, "auth-error.png") })
  } finally {
    await new Promise(() => {})
  }
}

main()
