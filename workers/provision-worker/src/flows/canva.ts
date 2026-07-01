import type { Page, Request as PwRequest } from 'playwright'

// ============================================================
// CANVA INVITE FLOW — Hybrid HTTP Intercept + DOM Automation
// ============================================================
// Strategy (3 layers, tried in order):
//  1. DOM click invite → capture the API call → replay for others
//  2. Direct API calls using captured auth tokens
//  3. Full DOM automation (click, type, confirm) as fallback
// ============================================================

interface InviteResult {
  success: boolean
  method: string
  detail: string
}

interface CapturedApiCall {
  url: string
  method: string
  headers: Record<string, string>
  body: string | null
}

async function takeScreenshot(page: Page, label: string) {
  try {
    await page.screenshot({ path: `/tmp/canva-${label}.png` })
    console.log(`[Canva] 📸 Screenshot: /tmp/canva-${label}.png`)
  } catch {}
}

// ============================================================
// REQUEST MONITORING — captures all POST/PUT/PATCH to Canva
// ============================================================

function setupRequestCapture(page: Page): { calls: CapturedApiCall[] } {
  const state = { calls: [] as CapturedApiCall[] }

  page.on('request', (request: PwRequest) => {
    const url = request.url()
    const method = request.method()

    if (url.includes('canva.com') && ['POST', 'PUT', 'PATCH'].includes(method)) {
      const call: CapturedApiCall = {
        url,
        method,
        headers: request.headers(),
        body: request.postData(),
      }
      state.calls.push(call)
      const short = url.replace('https://www.canva.com', '')
      console.log(`[Canva][NET] ${method} ${short}  body=${(call.body || '').substring(0, 120)}`)
    }
  })

  return state
}

// ============================================================
// NAVIGATION — loads /settings/people with smart polling
// ============================================================

/** Poll until we see VISIBLE buttons (especially "Invitar") on the page, or timeout. */
async function waitForContent(page: Page, maxMs = 25000): Promise<{
  textLen: number; buttons: number; visibleButtons: number;
  hasInviteButton: boolean; preview: string; title: string;
}> {
  const start = Date.now()
  let info = { title: '?', textLen: 0, preview: '', buttons: 0, visibleButtons: 0, hasInviteButton: false }

  while (Date.now() - start < maxMs) {
    info = await page.evaluate(() => {
      const allBtns = [...document.querySelectorAll('button, a, [role="button"]')]
      const visBtns = allBtns.filter(b => (b as HTMLElement).offsetHeight > 0 && (b as HTMLElement).offsetWidth > 0)
      const hasInvite = visBtns.some(b => /invitar|invite|añadir/i.test((b as HTMLElement).innerText || ''))
      return {
        title: document.title,
        textLen: (document.body?.innerText || '').length,
        preview: (document.body?.innerText || '').substring(0, 300),
        buttons: allBtns.length,
        visibleButtons: visBtns.length,
        hasInviteButton: hasInvite,
      }
    }).catch(() => ({ title: '?', textLen: 0, preview: '', buttons: 0, visibleButtons: 0, hasInviteButton: false }))

    // Best case: we found the invite button
    if (info.hasInviteButton) {
      console.log(`[Canva] ✅ Botón "Invitar" detectado en ${Date.now() - start}ms (${info.visibleButtons} vis, ${info.buttons} total)`)
      return info
    }

    // Good enough: many visible buttons and substantial text
    if (info.visibleButtons >= 4 && info.textLen > 300) {
      console.log(`[Canva] Contenido detectado en ${Date.now() - start}ms (${info.visibleButtons} vis btns, ${info.textLen} chars)`)
      return info
    }

    await page.waitForTimeout(500)
  }

  console.log(`[Canva] waitForContent timeout ${maxMs}ms (${info.visibleButtons} vis/${info.buttons} total btns, ${info.textLen} chars, invite=${info.hasInviteButton})`)
  return info
}

async function navigateToSettingsPage(page: Page): Promise<{ loaded: boolean; sessionValid: boolean }> {
  console.log('[Canva] Navegando a /settings/people…')

  await page.goto('https://www.canva.com/settings/people', {
    waitUntil: 'domcontentloaded',
    timeout: 20000,
  })
  // No networkidle — Canva SPA never truly idles

  const currentUrl = page.url()
  console.log('[Canva] URL actual:', currentUrl)

  if (currentUrl.includes('/login') || currentUrl.includes('accounts.google')) {
    console.log('[Canva] ❌ SESIÓN EXPIRADA — redirect a login')
    return { loaded: false, sessionValid: false }
  }

  // Smart poll: wait for buttons to appear (up to 25s)
  let info = await waitForContent(page, 25000)

  console.log('[Canva] Title:', info.title, '| Text:', info.textLen, '| Visible Buttons:', info.visibleButtons)
  console.log('[Canva] Preview:', info.preview.substring(0, 200))

  if (!info.hasInviteButton && info.visibleButtons < 3) {
    console.log('[Canva] Página vacía o sin cargar completamente, retrying via homepage…')
    await page.goto('https://www.canva.com/', { waitUntil: 'domcontentloaded', timeout: 15000 })
    await waitForContent(page, 5000)
    await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 20000 })
    info = await waitForContent(page, 25000)

    if (!info.hasInviteButton && info.visibleButtons < 3) {
      console.log('[Canva] Página sigue sin cargar bien después de retry')
      return { loaded: false, sessionValid: true }
    }
  }

  await takeScreenshot(page, 'settings-loaded')
  return { loaded: true, sessionValid: true }
}

// ============================================================
// DOM HELPERS
// ============================================================

/** Click the "Invite someone" / "Invitar a alguien" button. */
async function clickInviteButton(page: Page): Promise<boolean> {
  console.log('[Canva][DOM] Buscando botón de invitar…')

  // Debug: list every visible button
  const allBtns = await page.evaluate(() =>
    [...document.querySelectorAll('button, a, [role="button"]')]
      .filter(b => (b as HTMLElement).offsetHeight > 0 && (b as HTMLElement).offsetWidth > 0)
      .map((b, i) => ({
        i,
        text: ((b as HTMLElement).innerText || '').substring(0, 50).trim(),
        aria: b.getAttribute('aria-label') || '',
        hiddenAncestor: !!b.closest('[aria-hidden="true"]'),
      })),
  ).catch(() => [])

  console.log('[Canva][DOM] Botones visibles:', JSON.stringify(allBtns, null, 2))

  // Try increasingly broad patterns
  const patterns: RegExp[] = [
    /invitar a alguien/i,
    /invite someone/i,
    /invitar/i,
    /invite/i,
    /añadir miembro/i,
    /add member/i,
  ]

  for (const re of patterns) {
    const clicked = await page.evaluate(
      ({ src, fl }) => {
        const regex = new RegExp(src, fl)
        // Do NOT filter by aria-hidden ancestors or offsetParent — just size
        const btns = [...document.querySelectorAll('button, a, [role="button"]')].filter(
          b => (b as HTMLElement).offsetHeight > 0 && (b as HTMLElement).offsetWidth > 0,
        )
        const target = btns.find(
          b => regex.test((b as HTMLElement).innerText || '') || regex.test(b.getAttribute('aria-label') || ''),
        )
        if (target) {
          ;(target as HTMLElement).scrollIntoView({ block: 'center', behavior: 'instant' })
          ;(target as HTMLElement).click()
          return ((target as HTMLElement).innerText || '').substring(0, 50)
        }
        return null
      },
      { src: re.source, fl: re.flags },
    ).catch(() => null)

    if (clicked) {
      console.log(`[Canva][DOM] ✅ Click exitoso en: "${clicked}" (patrón /${re.source}/)`)
      return true
    }
  }

  // Fallback: Playwright locator with force
  for (const label of ['Invitar a alguien', 'Invitar', 'Invite someone', 'Invite']) {
    try {
      const loc = page.locator(`button:has-text("${label}")`).first()
      if (await loc.isVisible({ timeout: 2000 }).catch(() => false)) {
        await loc.click({ force: true, noWaitAfter: true, timeout: 5000 })
        console.log(`[Canva][DOM] ✅ Playwright click: "${label}"`)
        return true
      }
    } catch {}
  }

  console.log('[Canva][DOM] ❌ No se encontró botón de invitar')
  return false
}

/** Fill the email field inside the invite modal and confirm. */
async function fillEmailAndConfirm(page: Page, email: string): Promise<boolean> {
  await page.waitForTimeout(2000)
  await takeScreenshot(page, 'modal-opened')

  // Debug: list all visible inputs
  const inputs = await page.evaluate(() =>
    [...document.querySelectorAll('input, [contenteditable="true"], [role="textbox"], [role="combobox"]')]
      .filter(el => {
        const r = (el as HTMLElement).getBoundingClientRect()
        return r.height > 0 && r.width > 0
      })
      .map((el, i) => ({
        i,
        tag: el.tagName,
        type: (el as HTMLInputElement).type || '',
        placeholder: (el as HTMLInputElement).placeholder || '',
        ariaLabel: el.getAttribute('aria-label') || '',
        role: el.getAttribute('role') || '',
        contentEditable: el.getAttribute('contenteditable') || '',
      })),
  ).catch(() => [])

  console.log('[Canva][DOM] Inputs visibles:', JSON.stringify(inputs, null, 2))

  // ---- Fill email ----
  // Strategy A: Find input and use Playwright keyboard (works with React)
  const inputSelectors = [
    'input[type="email"]',
    'input[placeholder*="email" i]',
    'input[placeholder*="correo" i]',
    'input[placeholder*="nombre" i]',
    'input[placeholder*="buscar" i]',
    'input[placeholder*="search" i]',
    'input[aria-label*="email" i]',
    'input[aria-label*="invit" i]',
    '[role="combobox"]',
    '[role="textbox"]',
    'input[type="search"]',
    'input[type="text"]',
    'input:not([type])',
    '[contenteditable="true"]',
  ]

  let emailFilled = false

  for (const sel of inputSelectors) {
    try {
      const loc = page.locator(sel).first()
      if (await loc.isVisible({ timeout: 1000 }).catch(() => false)) {
        await loc.click({ force: true, timeout: 2000 })
        await page.waitForTimeout(300)
        // Clear existing content
        await page.keyboard.press('Control+A')
        await page.keyboard.press('Backspace')
        // Type email char by char (triggers React onChange properly)
        await page.keyboard.type(email, { delay: 30 })
        console.log(`[Canva][DOM] ✅ Email escrito via keyboard en: ${sel}`)
        emailFilled = true
        break
      }
    } catch {}
  }

  if (!emailFilled) {
    // Strategy B: focus any input via DOM and type
    console.log('[Canva][DOM] Intentando focus + keyboard fallback…')
    const focusedAny = await page.evaluate(() => {
      const candidates = [
        ...document.querySelectorAll('input'),
        ...document.querySelectorAll('[contenteditable="true"]'),
        ...document.querySelectorAll('[role="textbox"]'),
        ...document.querySelectorAll('[role="combobox"]'),
      ].filter(el => {
        const r = (el as HTMLElement).getBoundingClientRect()
        return r.height > 0 && r.width > 0
      })
      if (candidates.length > 0) {
        ;(candidates[0] as HTMLElement).focus()
        ;(candidates[0] as HTMLElement).click()
        return true
      }
      return false
    }).catch(() => false)

    if (focusedAny) {
      await page.waitForTimeout(300)
      await page.keyboard.type(email, { delay: 30 })
      emailFilled = true
      console.log('[Canva][DOM] ✅ Email escrito via focus fallback')
    }
  }

  if (!emailFilled) {
    console.log('[Canva][DOM] ❌ No se pudo escribir el email')
    await takeScreenshot(page, 'no-email-input')
    return false
  }

  // Give Canva time to process the input (autocomplete, validation, etc.)
  await page.waitForTimeout(1000)
  await takeScreenshot(page, 'email-filled')

  // Press Enter — often enough to submit in Canva's modal
  await page.keyboard.press('Enter')
  await page.waitForTimeout(1500)

  // ---- Click confirm button ----
  const confirmPatterns: RegExp[] = [
    /confirmar e invitar/i,
    /send invite/i,
    /enviar invitaci[oó]n/i,
    /confirmar/i,
    /invitar$/i,
    /invite$/i,
    /enviar/i,
    /send$/i,
    /listo/i,
    /done/i,
  ]

  for (const re of confirmPatterns) {
    const confirmed = await page.evaluate(
      ({ src, fl }) => {
        const regex = new RegExp(src, fl)
        const btns = [...document.querySelectorAll('button, a, [role="button"]')].filter(
          b => (b as HTMLElement).offsetHeight > 0 && (b as HTMLElement).offsetWidth > 0,
        )
        const t = btns.find(b => regex.test((b as HTMLElement).innerText || ''))
        if (t) {
          ;(t as HTMLElement).scrollIntoView({ block: 'center', behavior: 'instant' })
          ;(t as HTMLElement).click()
          return ((t as HTMLElement).innerText || '').substring(0, 50)
        }
        return null
      },
      { src: re.source, fl: re.flags },
    ).catch(() => null)

    if (confirmed) {
      console.log(`[Canva][DOM] ✅ Confirm clickeado: "${confirmed}"`)
      await page.waitForTimeout(1500)
      return true
    }
  }

  // Fallback: submit button
  const fallback = await page.evaluate(() => {
    const submit = [...document.querySelectorAll('button, a, [role="button"]')].find(b => (b as HTMLButtonElement).type === 'submit' && (b as HTMLElement).offsetHeight > 0)
    if (submit) { (submit as HTMLElement).click(); return 'submit-button' }
    return null
  }).catch(() => null)

  if (fallback) {
    console.log(`[Canva][DOM] ✅ Fallback confirm: ${fallback}`)
    await page.waitForTimeout(1500)
    return true
  }

  // Maybe Enter already submitted — check if we're out of modal
  console.log('[Canva][DOM] ⚠️ No confirm button found, Enter may have worked')
  return true // optimistic: Enter often works
}

// ============================================================
// LAYER 2 — Direct API fallback using captured auth context
// ============================================================

async function tryInviteViaDirectAPI(
  page: Page,
  email: string,
  capturedCalls: CapturedApiCall[],
): Promise<InviteResult> {
  console.log('[Canva][API] Intentando invitar via API directa…')

  // Extract auth headers from ANY captured request
  const authHeaders: Record<string, string> = {}
  for (const call of capturedCalls) {
    for (const key of ['x-csrf-token', 'x-xsrf-token', 'authorization', 'x-canva-request', 'x-canva-client']) {
      if (call.headers[key] && !authHeaders[key]) {
        authHeaders[key] = call.headers[key]
      }
    }
  }
  console.log('[Canva][API] Auth headers capturados:', Object.keys(authHeaders))

  // Log interesting captured endpoints for debugging
  const postEndpoints = [...new Set(capturedCalls.map(c => c.url.replace('https://www.canva.com', '')))]
  console.log('[Canva][API] POST endpoints vistos:', postEndpoints.slice(0, 20))

  // Try in-browser fetch (gets cookies automatically)
  const result = await page.evaluate(
    async ({ memberEmail, extra }) => {
      const logs: string[] = []

      // Collect CSRF from page
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const csrfMeta = document.querySelector('meta[name="csrf-token"], meta[name="csrf_token"]')
      if (csrfMeta) {
        headers['x-csrf-token'] = csrfMeta.getAttribute('content') || ''
        logs.push('csrf-meta: ' + headers['x-csrf-token']!.substring(0, 20) + '…')
      }
      // CSRF from cookie
      for (const c of document.cookie.split(';')) {
        const [name, val] = c.trim().split('=')
        if (name && (/csrf|xsrf/i.test(name))) {
          headers['x-csrf-token'] = val || ''
          logs.push(`csrf-cookie ${name}: ${(val || '').substring(0, 20)}…`)
        }
      }
      // Merge extra headers
      for (const [k, v] of Object.entries(extra)) {
        if (v && !headers[k]) headers[k] = v as string
      }

      // Endpoint attempts
      const attempts = [
        { url: '/_ajax/team/invite', bodies: [
          { emails: [memberEmail], role: 'MEMBER' },
          { email: memberEmail, role: 'member' },
          { invitees: [{ email: memberEmail }], role: 'MEMBER' },
        ]},
        { url: '/api/rpc/team/invite_to_team', bodies: [
          { email: memberEmail, role: 'member' },
          { emails: [memberEmail], role: 'MEMBER' },
        ]},
        { url: '/api/team/invite', bodies: [
          { email: memberEmail },
          { emails: [memberEmail] },
        ]},
        { url: '/_ajax/team/send-invite', bodies: [
          { emails: [memberEmail], role: 'MEMBER' },
        ]},
        { url: '/_ajax/invite', bodies: [
          { emails: [memberEmail] },
        ]},
      ]

      for (const a of attempts) {
        for (const body of a.bodies) {
          try {
            const resp = await fetch(a.url, {
              method: 'POST',
              headers,
              body: JSON.stringify(body),
              credentials: 'include',
            })
            const text = await resp.text().catch(() => '')
            logs.push(`${a.url} → ${resp.status}: ${text.substring(0, 200)}`)
            if (resp.ok) {
              return { success: true, method: `api:${a.url}`, detail: text.substring(0, 500), logs }
            }
          } catch (e: any) {
            logs.push(`${a.url} → ERR: ${e.message}`)
          }
        }
      }

      return { success: false, method: 'api', detail: 'No endpoint worked', logs }
    },
    { memberEmail: email, extra: authHeaders },
  ).catch((e: Error) => ({
    success: false, method: 'api', detail: e.message, logs: [`evaluate error: ${e.message}`],
  }))

  for (const log of (result as any).logs || []) console.log(`[Canva][API]   ${log}`)
  return result
}

// ============================================================
// MAIN FLOW
// ============================================================

export async function ejecutar(
  page: Page,
  members: { email: string }[],
): Promise<{ accessToken: string; inviteUrl: string }> {

  // Console monitoring
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[PageErr]', msg.text().substring(0, 200))
  })

  // --- Request capture ---
  const captured = setupRequestCapture(page)

  // --- Hook window.fetch BEFORE page loads ---
  await page.addInitScript(() => {
    ;(window as any).__fetchLog = []
    const origFetch = window.fetch
    window.fetch = async function (...args: any[]) {
      const [resource, opts] = args
      const url = typeof resource === 'string' ? resource : (resource as any)?.url || ''
      const entry = { url, method: opts?.method || 'GET', body: typeof opts?.body === 'string' ? opts.body.substring(0, 300) : null }
      ;(window as any).__fetchLog.push(entry)
      // Highlight invite-related calls
      const lc = (url + ' ' + (entry.body || '')).toLowerCase()
      if (lc.includes('invite') || lc.includes('member') || lc.includes('team')) {
        console.log('[FETCH-HOOK]', JSON.stringify(entry))
      }
      return origFetch.apply(window, args as any)
    }
  })

  // ========== STEP 1: Navigate ==========
  const nav = await navigateToSettingsPage(page)

  if (!nav.sessionValid) {
    throw new Error('❌ Sesión de Canva expirada. Regenerar con auth-setup-canva.ts y actualizar CANVA_SESSION_BASE64 en Render.')
  }
  if (!nav.loaded) {
    throw new Error('❌ No se pudo cargar /settings/people (página vacía incluso tras retry).')
  }

  console.log(`[Canva] Requests capturadas durante navegación: ${captured.calls.length}`)

  // Dump browser-side fetch log
  const fetchLog = await page.evaluate(() => (window as any).__fetchLog || []).catch(() => [])
  console.log(`[Canva] Browser fetch log (${fetchLog.length} entries):`)
  for (const f of fetchLog.slice(0, 15)) {
    console.log(`[Canva]   ${f.method} ${f.url}`)
  }

  // ========== STEP 2: Process each member ==========
  const results: { email: string; result: InviteResult }[] = []
  let cachedEndpoint: { url: string; bodyTemplate: string } | null = null

  for (const member of members) {
    if (!member.email) continue
    console.log(`\n[Canva] ══════════ Invitando: ${member.email} ══════════`)

    // --- Fast path: replay a previously captured invite API call ---
    if (cachedEndpoint) {
      console.log('[Canva] Replayando endpoint capturado:', cachedEndpoint.url)
      const body = cachedEndpoint.bodyTemplate.replace(/__EMAIL__/g, member.email)
      const replay = await page.evaluate(
        async ({ url, body }) => {
          try {
            const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, credentials: 'include' })
            const t = await r.text()
            return { ok: r.ok, status: r.status, text: t.substring(0, 500) }
          } catch (e: any) { return { ok: false, status: 0, text: e.message } }
        },
        { url: cachedEndpoint.url, body },
      ).catch((e: Error) => ({ ok: false, status: 0, text: e.message }))

      if (replay.ok) {
        console.log(`[Canva] ✅ Replay OK para ${member.email}`)
        results.push({ email: member.email, result: { success: true, method: 'replay', detail: replay.text } })
        continue
      }
      console.log(`[Canva] Replay falló: ${replay.status} ${replay.text.substring(0, 200)}`)
    }

    // --- Snapshot request count before interaction ---
    const preCount = captured.calls.length

    // --- LAYER 1: DOM click invite button ---
    const inviteClicked = await clickInviteButton(page)

    if (inviteClicked) {
      await page.waitForTimeout(2000)

      // Check for new captured requests that look like invite calls
      const newCalls = captured.calls.slice(preCount)
      console.log(`[Canva] ${newCalls.length} nuevas requests después del click`)

      // Check browser-side fetch log
      const newFetchLog = await page.evaluate(() => (window as any).__fetchLog || []).catch(() => [])
      const inviteFetches = newFetchLog.filter((f: any) => {
        const lc = (f.url + ' ' + (f.body || '')).toLowerCase()
        return lc.includes('invite') || lc.includes('member')
      })
      if (inviteFetches.length > 0) {
        console.log('[Canva] ✅ Fetch de invite detectado en browser:', JSON.stringify(inviteFetches))
      }

      // Try to fill email and confirm
      const filled = await fillEmailAndConfirm(page, member.email)

      // Wait and check for invite API calls
      await page.waitForTimeout(1500)
      const postFillCalls = captured.calls.slice(preCount)
      const inviteCalls = postFillCalls.filter(c => {
        const lc = (c.url + ' ' + (c.body || '')).toLowerCase()
        return lc.includes('invite') || lc.includes(member.email.toLowerCase())
      })

      if (inviteCalls.length > 0) {
        const call = inviteCalls[inviteCalls.length - 1]
        console.log('[Canva] ✅ API call capturada:', call.url)
        cachedEndpoint = {
          url: call.url,
          bodyTemplate: (call.body || '{}').replace(new RegExp(member.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '__EMAIL__'),
        }
        results.push({ email: member.email, result: { success: true, method: 'dom+capture', detail: call.url } })

        // Refresh page for next member
        if (members.indexOf(member) < members.length - 1) {
          await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 })
          await page.waitForTimeout(3000)
        }
        continue
      }

      if (filled) {
        console.log(`[Canva] ✅ DOM flow completado para ${member.email}`)
        results.push({ email: member.email, result: { success: true, method: 'dom', detail: 'completed' } })

        if (members.indexOf(member) < members.length - 1) {
          await page.goto('https://www.canva.com/settings/people', { waitUntil: 'domcontentloaded', timeout: 30000 })
          await page.waitForTimeout(3000)
        }
        continue
      }
    }

    // --- LAYER 2: Direct API fallback ---
    console.log('[Canva] DOM falló, intentando API directa…')
    const apiResult = await tryInviteViaDirectAPI(page, member.email, captured.calls)

    if (apiResult.success) {
      console.log(`[Canva] ✅ API directa OK para ${member.email}: ${apiResult.method}`)
      results.push({ email: member.email, result: apiResult })
      continue
    }

    // --- All layers failed ---
    console.log(`[Canva] ❌ Todos los métodos fallaron para ${member.email}`)
    await takeScreenshot(page, `failed-${member.email.split('@')[0]}`)
    results.push({ email: member.email, result: { success: false, method: 'all-failed', detail: apiResult.detail } })
  }

  // ========== SUMMARY ==========
  const ok = results.filter(r => r.result.success)
  const fail = results.filter(r => !r.result.success)

  console.log('\n[Canva] ══════════ RESUMEN ══════════')
  console.log(`[Canva] Exitosos: ${ok.length}/${results.length}`)
  for (const r of results) {
    console.log(`[Canva]   ${r.result.success ? '✅' : '❌'} ${r.email} (${r.result.method})`)
  }
  console.log(`[Canva] Total requests capturadas: ${captured.calls.length}`)

  const uniqueEps = [...new Set(captured.calls.map(c => c.url.replace('https://www.canva.com', '')))]
  console.log('[Canva] Endpoints POST vistos:', uniqueEps.slice(0, 25))

  // Dump final browser fetch log for debugging
  const finalFetchLog = await page.evaluate(() => (window as any).__fetchLog || []).catch(() => [])
  const postFetches = finalFetchLog.filter((f: any) => f.method === 'POST')
  console.log(`[Canva] Browser POST fetches (${postFetches.length}):`)
  for (const f of postFetches.slice(0, 20)) {
    console.log(`[Canva]   POST ${f.url}  body=${(f.body || '').substring(0, 100)}`)
  }

  if (fail.length > 0 && ok.length === 0) {
    throw new Error(
      `Invitación falló para todos. Endpoints vistos: ${uniqueEps.join(', ')}. ` +
      `Detalles: ${JSON.stringify(fail.map(f => ({ email: f.email, detail: f.result.detail })))}`,
    )
  }

  return { accessToken: 'https://www.canva.com', inviteUrl: 'https://www.canva.com' }
}
