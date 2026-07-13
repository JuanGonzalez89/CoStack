import type { ProvisionResult, ProvisionerProvider } from './types'
import { CanvaInviteLinkProvider } from './providers/canva'
import { NotionInviteLinkProvider } from './providers/notion'
import { HuggingFaceInviteProvider } from './providers/huggingface'
import { GitHubProvider } from './providers/github'
import { SentryProvider } from './providers/sentry'
import { WorkerProvider } from './providers/worker'

const staticProviders: ProvisionerProvider[] = [
  new CanvaInviteLinkProvider(),
  new NotionInviteLinkProvider(),
  new HuggingFaceInviteProvider(),
  new GitHubProvider(),
  new SentryProvider(),
  // WorkerProvider.canHandle() devuelve true para TODO, así que debe ir último:
  // es el fallback que reenvía al worker remoto cuando ningún provider específico aplica.
  new WorkerProvider(),
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
  for (const provider of staticProviders) {
    if (provider.canHandle(toolSlug)) {
      console.log(`[Provisioner] Probando ${provider.name} para ${toolSlug}`)
      const result = await provider.fulfill(lobbyId, toolName, members)
      if (result.status === 'success') {
        return result
      }
      console.log(`[Provisioner] ${provider.name} falló:`, result.errors)
    }
  }

  const pwProvider = await getPlaywrightProvider()
  if (pwProvider && pwProvider.canHandle(toolSlug)) {
    console.log(`[Provisioner] Usando ${pwProvider.name} para ${toolSlug}`)
    return pwProvider.fulfill(lobbyId, toolName, members)
  }

  return { status: 'failed', accessToken: null, providerName: 'unknown', inviteUrl: null, errors: [`No provider for ${toolSlug}`] }
}
