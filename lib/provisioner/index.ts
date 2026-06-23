import type { ProvisionResult, ProvisionerProvider } from './types'
import { GitHubProvider } from './providers/github'

const staticProviders: ProvisionerProvider[] = [
  new GitHubProvider(),
]

async function getPlaywrightProvider(): Promise<ProvisionerProvider | null> {
  try {
    const { PlaywrightProvider } = await import('./playwright-provider')
    return new PlaywrightProvider()
  } catch {
    return null
  }
}

export async function fulfillProvision(
  lobbyId: string,
  toolSlug: string,
  toolName: string,
  members: { email: string; userId: string }[],
): Promise<ProvisionResult> {
  const staticMatch = staticProviders.find(p => p.canHandle(toolSlug))
  if (staticMatch) {
    console.log(`[Provisioner] Usando ${staticMatch.name} para ${toolSlug}`)
    return staticMatch.fulfill(lobbyId, toolName, members)
  }

  const pwProvider = await getPlaywrightProvider()
  if (pwProvider && pwProvider.canHandle(toolSlug)) {
    console.log(`[Provisioner] Usando ${pwProvider.name} para ${toolSlug}`)
    return pwProvider.fulfill(lobbyId, toolName, members)
  }

  return { status: 'failed', accessToken: null, providerName: 'unknown', inviteUrl: null, errors: [`No provider for ${toolSlug}`] }
}
