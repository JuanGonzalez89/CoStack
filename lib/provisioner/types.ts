import type { Page } from 'playwright'

export type ProvisionerStatus = 'success' | 'partial' | 'failed'

export interface ProvisionResult {
  status: ProvisionerStatus
  accessToken: string | null
  providerName: string
  inviteUrl: string | null
  errors: string[]
}

export interface ProvisionerProvider {
  name: string
  canHandle(toolSlug: string): boolean
  fulfill(lobbyId: string, toolName: string, members: { email: string; userId: string }[]): Promise<ProvisionResult>
}

export interface PlaywrightFlow {
  toolSlugs: string[]
  nombre: string
  ejecutar(page: Page, members: { email: string; userId: string }[]): Promise<{
    accessToken: string
    inviteUrl: string
  }>
}
