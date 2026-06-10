// Use global fetch available in Node 18+

type Provider = 'github' | 'google' | 'microsoft' | 'slack' | 'test' | string

const endpoints: Record<string, { url: string; method?: string; header?: string }[]> = {
  github: [{ url: 'https://api.github.com/user', method: 'GET', header: 'Authorization' }],
  google: [{ url: 'https://www.googleapis.com/oauth2/v3/userinfo', method: 'GET', header: 'Authorization' }],
  microsoft: [{ url: 'https://graph.microsoft.com/v1.0/me', method: 'GET', header: 'Authorization' }],
  slack: [{ url: 'https://slack.com/api/auth.test', method: 'GET', header: 'Authorization' }],
}

export async function validateProviderToken(provider: Provider, token: string) {
  if (!token) return { valid: false, reason: 'no_token' }

  if (provider === 'test' || provider === 'mock') return { valid: true }

  const targets = endpoints[provider]
  if (!targets || targets.length === 0) return { valid: false, reason: 'no_validator_for_provider' }

  for (const t of targets) {
    try {
      const res = await fetch(t.url, { method: t.method || 'GET', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) return { valid: true }
      // Continue to next target if not ok
    } catch (err) {
      // ignore and try next
    }
  }

  return { valid: false, reason: 'provider_check_failed' }
}

export default { validateProviderToken }
