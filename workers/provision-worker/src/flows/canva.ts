import type { Page } from 'playwright'

// ============================================================
// CANVA INVITE FLOW — DIRECT HTTP API (Playwright Intercept)
// ============================================================

const FALLBACK_USER_ID = 'UAHNgoPwV24'
const FALLBACK_BRAND_ID = 'BAHNgvTPHaQ'

export async function ejecutar(
  page: Page,
  members: { email: string }[],
): Promise<{ accessToken: string; inviteUrl: string }> {

  console.log('[Canva] Navegando a Canva para validar sesión y capturar auth headers...')

  const capturedAuth: Record<string, string> = {}
  let capturedBrandId = ''
  let capturedSourceUrl = ''
  let postCandidatesSeen = 0

  // Usamos Playwright nativo para espiar todas las peticiones y robar los headers de Auth
  page.on('request', req => {
    if (req.url().includes('canva.com') && req.method() === 'POST') {
      postCandidatesSeen++
      
      if (req.url().includes('/_ajax/')) {
        const bodyStr = req.postData()
        
        // Si tiene body, es una request representativa de datos
        if (bodyStr && bodyStr.length > 2) {
          
          // 1. Extraer Brand ID / User ID del body si es session/validate
          if (req.url().includes('/session/validate')) {
            try {
              const body = JSON.parse(bodyStr)
              if (body.B && !capturedBrandId) capturedBrandId = body.B
              if (body.A && !capturedAuth['x-canva-user']) capturedAuth['x-canva-user'] = body.A
            } catch (e) {}
          }

          // 2. Capturar TODOS los headers de una SOLA petición representativa
          if (!capturedSourceUrl) {
            capturedSourceUrl = req.url()
            const headers = req.headers()
            for (const [k, v] of Object.entries(headers)) {
              const key = k.toLowerCase()
              if (key.startsWith('x-canva-') || key.includes('csrf') || key === 'authorization') {
                capturedAuth[key] = v
              }
            }
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
  
  // Esperar hasta que tengamos headers de una request fuente (max 15 segs)
  for (let i = 0; i < 60; i++) {
    if (capturedSourceUrl && capturedBrandId) break
    await page.waitForTimeout(250)
  }

  console.log(`[Canva] Headers capturados de la fuente: ${capturedSourceUrl || '⚠️ NINGUNA (fallback)'}`)
  console.log(`[Canva] Peticiones POST vistas en la ventana: ${postCandidatesSeen}`)

  // Si falló la intercepción, usar los valores estables de la cuenta
  if (!capturedBrandId) {
    console.log('[Canva] ⚠️ Brand ID no capturado de la red. Usando constante FALLBACK_BRAND_ID.')
    capturedBrandId = FALLBACK_BRAND_ID
  }
  if (!capturedAuth['x-canva-user']) {
    capturedAuth['x-canva-user'] = FALLBACK_USER_ID
  }

  // Mandatory header for the invite endpoint
  capturedAuth['x-canva-request'] = 'createbrandinvitations'
  // Canva needs a content-type for the POST payload
  capturedAuth['Content-Type'] = 'application/json;charset=UTF-8'

  console.log(`[Canva] Headers capturados (${Object.keys(capturedAuth).length}):`, Object.keys(capturedAuth))
  console.log(`[Canva] Brand ID final: ${capturedBrandId}`)

  // Forzar a Canva a adjuntar credenciales / enviar csrf-token copiando las cookies al header de Auth (opcional, fetch 'include' ya lo hace)


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
        // --- EXTRAER TOKENS CRÍTICOS DE LAS COOKIES ---
        // Canva requiere CAZ (x-canva-authz) y CAU (x-canva-active-user). 
        // A veces no se envían en las peticiones de background, así que los sacamos crudos.
        const cookies = document.cookie.split(';')

        const cazMatch = cookies.find(c => c.trim().startsWith('CAZ='))
        const caz = cazMatch ? cazMatch.split('=')[1].trim() : undefined
        if (caz) authHeaders['x-canva-authz'] = caz

        const cauMatch = cookies.find(c => c.trim().startsWith('CAU='))
        const cau = cauMatch ? cauMatch.split('=')[1].trim() : undefined
        if (cau) authHeaders['x-canva-active-user'] = cau

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
        
        // Log final headers safe mode
        const logHeaders: Record<string, string> = {}
        for (const [k, v] of Object.entries(authHeaders)) {
          if (k.toLowerCase().includes('auth') || k.toLowerCase().includes('token')) {
            logHeaders[k] = v.substring(0, 15) + '***'
          } else {
            logHeaders[k] = v
          }
        }
        console.log(`[Canva] Headers finales para fetch:`, JSON.stringify(logHeaders, null, 2))

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
