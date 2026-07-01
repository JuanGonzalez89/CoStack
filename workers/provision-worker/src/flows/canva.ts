import type { Page } from 'playwright'

// ============================================================
// CANVA INVITE FLOW — DIRECT HTTP API
// ============================================================
// Strategy: 
// 1. Navigate to Canva to establish the authenticated browser context.
// 2. Steal x-canva-* headers and CSRF tokens by temporarily hooking fetch.
// 3. Execute the invitation POST directly via page.evaluate(fetch), 
//    bypassing all DOM interaction and React remount issues.
// ============================================================

export async function ejecutar(
  page: Page,
  members: { email: string }[],
): Promise<{ accessToken: string; inviteUrl: string }> {

  console.log('[Canva] Navegando a Canva para validar sesión y capturar auth headers...')

  // Go to settings just to get the SPA initialized with valid context
  await page.goto('https://www.canva.com/settings/people', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })

  const currentUrl = page.url()
  if (currentUrl.includes('/login') || currentUrl.includes('accounts.google')) {
    throw new Error('❌ Sesión de Canva expirada. Regenerar con auth-setup-canva.ts')
  }

  console.log('[Canva] Interceptando fetch para robar headers internos...')

  const authData = await page.evaluate(async () => {
    return new Promise<{ headers: Record<string, string>, brandId: string }>((resolve) => {
      const headers: Record<string, string> = {}
      
      // 1. Get CSRF tokens from cookies (Canva might send these if present)
      for (const c of document.cookie.split(';')) {
        const [name, val] = c.trim().split('=')
        if (name && (/csrf|xsrf/i.test(name))) {
          headers['x-csrf-token'] = val || ''
        }
      }

      // 2. Try to get Brand ID from cookie (CB=...)
      let brandId = ''
      const cbCookie = document.cookie.split(';').find(c => c.trim().startsWith('CB='))
      if (cbCookie) {
        brandId = cbCookie.split('=')[1].trim()
      }

      // 3. Hook window.fetch to capture x-canva-* headers from Canva's own telemetry/ajax
      const origFetch = window.fetch
      let captured = false
      
      window.fetch = function(...args) {
        const [resource, opts] = args
        if (!captured && opts && opts.headers) {
          const h = opts.headers as any
          const entries = h.entries ? Array.from(h.entries() as Iterable<any>) : Object.entries(h)
          let foundCanvaHeaders = false
          
          for (const [k, v] of entries) {
            const key = k.toLowerCase()
            if (key.startsWith('x-canva-') || key.includes('csrf') || key === 'authorization') {
              headers[key] = v as string
              foundCanvaHeaders = true
            }
          }
          
          if (foundCanvaHeaders) {
            captured = true
            if (!brandId && headers['x-canva-brand']) {
              brandId = headers['x-canva-brand']
            }
            resolve({ headers, brandId })
            window.fetch = origFetch // Restore original
          }
        }
        return origFetch.apply(window, args as any)
      }

      // 4. Force a dummy request if Canva is quiet
      setTimeout(() => {
        if (!captured) {
          origFetch('/_ajax/session/validate', { method: 'POST', body: '{}' }).catch(() => {})
        }
      }, 500)
      
      // 5. Ultimate timeout fallback
      setTimeout(() => {
        if (!captured) resolve({ headers, brandId })
      }, 4000)
    })
  })

  // Mandatory header for the invite endpoint
  authData.headers['x-canva-request'] = 'createbrandinvitations'
  // Canva needs a content-type for the POST payload
  authData.headers['Content-Type'] = 'application/json;charset=UTF-8'

  console.log(`[Canva] Headers capturados (${Object.keys(authData.headers).length}):`, Object.keys(authData.headers))
  console.log(`[Canva] Brand ID: ${authData.brandId || '⚠️ NO DETECTADO'}`)

  if (!authData.brandId) {
    throw new Error('❌ No se pudo capturar el Brand ID de Canva (CB cookie o x-canva-brand header ausentes).')
  }

  // ============================================================
  // EXECUTE INVITATIONS
  // ============================================================
  for (const member of members) {
    if (!member.email) continue
    console.log(`\n[Canva] ══════════ Invitando vía HTTP (API): ${member.email} ══════════`)

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
    }, { email: member.email, authHeaders: authData.headers, brandId: authData.brandId })

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
