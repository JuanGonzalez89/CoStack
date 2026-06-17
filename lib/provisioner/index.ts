import type { ProvisionResult } from './types'
import { GitHubProvider } from './providers/github'
import { PlaywrightProvider } from './playwright-provider'

const providers = [
  new GitHubProvider(),
  new PlaywrightProvider(),
]

export async function fulfillProvision(
  lobbyId: string,
  toolSlug: string,
  toolName: string,
  members: { email: string; userId: string }[],
): Promise<ProvisionResult> {
  const provider = providers.find(p => p.canHandle(toolSlug))
  if (!provider) {
    return { status: 'failed', accessToken: null, providerName: 'unknown', inviteUrl: null, errors: [`No provider for ${toolSlug}`] }
  }
  console.log(`[Provisioner] Usando ${provider.name} para ${toolSlug}`)
  return provider.fulfill(lobbyId, toolName, members)
}
