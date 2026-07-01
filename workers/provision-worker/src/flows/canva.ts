import type { Page } from 'playwright'

// ============================================================
// CANVA INVITE FLOW — DIRECT HTTP API (Playwright Intercept)
// ============================================================

export async function ejecutar(
  page: Page,
  members: { email: string }[],
): Promise<{ accessToken: string; inviteUrl: string }> {

  console.log('[Canva] Navegando a Canva para validar sesión y capturar auth headers...')

  const capturedAuth: Record<string, string> = {}
  let capturedBrandId = ''

  // Usamos Playwright nativo para espiar todas las peticiones y robar los headers de Auth
  // Esto es infalible porque atrapa fetch, XHR, y todo lo que salga del browser
  page.on('request', req => {
    if (req.url().includes('canva.com')) {
      const headers = req.headers()
      for (const [k, v] of Object.entries(headers)) {
        const key = k.toLowerCase()
        if (key.startsWith('x-canva-') || key.includes('csrf') || key === 'authorization') {
          // No pisar si ya lo tenemos y es válido, a menos que sea un token fresco
          if (!capturedAuth[key]) {
            capturedAuth[key] = v
          }
          if (key === 'x-canva-brand' && !capturedBrandId) {
            capturedBrandId = v
          }
        }
      }
    }
  })

  // Ir a settings para forzar a Canva a disparar su inicialización de SPA
  await page.goto('https://www.canva.com/settings/people', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })

  const currentUrl = page.url()
  if (currentUrl.includes('/login') || currentUrl.includes('accounts.google')) {
    throw new Error('❌ Sesión de Canva expirada. Regenerar con auth-setup-canva.ts')
  }

  console.log('[Canva] Esperando peticiones en background para recolectar tokens...')
  
  // Esperar hasta que tengamos el Brand ID o timeout (max 5 segs)
  for (let i = 0; i < 20; i++) {
    if (capturedBrandId && capturedAuth['x-canva-user']) break
    await page.waitForTimeout(250)
  }

  // Mandatory header for the invite endpoint
  capturedAuth['x-canva-request'] = 'createbrandinvitations'
  // Canva needs a content-type for the POST payload
  capturedAuth['Content-Type'] = 'application/json;charset=UTF-8'

  console.log(`[Canva] Headers capturados (${Object.keys(capturedAuth).length}):`, Object.keys(capturedAuth))
  console.log(`[Canva] Brand ID: ${capturedBrandId || '⚠️ NO DETECTADO'}`)

  if (!capturedBrandId) {
    throw new Error('❌ No se pudo capturar el Brand ID de Canva (x-canva-brand header ausente).')
  }

  // ============================================================
  // EXECUTE INVITATIONS
  // ============================================================
  for (const member of members) {
    if (!member.email) continue
    console.log(`\n[Canva] ══════════ Invitando vía HTTP (API): ${member.email} ══════════`)

    // Inject the captured headers and execute fetch directly inside the browser 
    // to utilize the existing cookies automatically.
    const result = await page.evaluate(async ({ email, authHeaders, brandId }) => {
      try {
        const url = '/_ajax/invitation/brand/invitations/create'
        
        // Exact payload schema expected by Canva
        const body = {
          "K": brandId,
          "A?": "A",
          "A": [
            { "A": email, "B": "B" } // B = Member role
          ],
          "B": true
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(body),
          credentials: 'include' // Send cookies automatically
        })

        const text = await response.text()
        return { ok: response.ok, status: response.status, text: text.substring(0, 500) }

      } catch (err: any) {
        return { ok: false, status: 0, text: err.message }
      }
    }, { email: member.email, authHeaders: capturedAuth, brandId: capturedBrandId })

    if (result.ok) {
      console.log(`[Canva] ✅ API HTTP exitosa para ${member.email}: [${result.status}] ${result.text}`)
    } else {
      console.log(`[Canva] ❌ Error en API HTTP para ${member.email}: [${result.status}] ${result.text}`)
      throw new Error(`Canva API falló: Status ${result.status} | Res: ${result.text}`)
    }
    
    // Pause briefly between members if multiple
    if (members.length > 1) await page.waitForTimeout(1000)
  }

  return { accessToken: 'https://www.canva.com', inviteUrl: 'https://www.canva.com' }
}
