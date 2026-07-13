interface InviteMemberResult {
  success: boolean
  error?: string
}

function getBaseUrl(): string {
  return process.env.SENTRY_API_BASE_URL || "https://sentry.io"
}

function getToken(): string {
  const token = process.env.SENTRY_API_TOKEN
  if (!token) {
    throw new Error("SENTRY_API_TOKEN no está configurado en el .env")
  }
  return token
}

function getOrg(): string {
  const org = process.env.SENTRY_ORG_SLUG
  if (!org) {
    throw new Error("SENTRY_ORG_SLUG no está configurado en el .env")
  }
  return org
}

/**
 * Invita a un miembro a la organización de Sentry vía API oficial.
 * Mismo patrón que github-bot.server.ts: invitación real por email, sin
 * links públicos ni auto-approve descubrible.
 */
export async function inviteMemberToOrg(email: string): Promise<InviteMemberResult> {
  const token = getToken()
  const org = getOrg()
  const base = getBaseUrl()

  try {
    const response = await fetch(`${base}/api/0/organizations/${org}/members/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, orgRole: "member" }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const msg = data.email?.[0] || data.detail || `Sentry respondió ${response.status}`
      console.error(`[Sentry Bot] Error invitando a ${email}:`, msg)
      return { success: false, error: msg }
    }

    console.log(`[Sentry Bot] Usuario ${email} invitado a la organización ${org}`)
    return { success: true }
  } catch (error: any) {
    console.error(`[Sentry Bot] Error invitando a ${email}:`, error.message)
    return { success: false, error: error.message }
  }
}
