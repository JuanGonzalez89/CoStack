import type { ProvisionResult, ProvisionerProvider } from '../types'

export class WorkerProvider implements ProvisionerProvider {
  name = 'Worker Remoto (Render)'

  canHandle(_toolSlug: string): boolean {
    return true
  }

  async fulfill(lobbyId: string, toolName: string, members: { email: string; userId: string }[]): Promise<ProvisionResult> {
    const workerUrl = process.env.PROVISION_WORKER_URL
    if (!workerUrl) {
      return { status: 'failed', accessToken: null, providerName: this.name, inviteUrl: null, errors: ['PROVISION_WORKER_URL no configurada'] }
    }

    try {
      const response = await fetch(`${workerUrl}/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lobbyId, toolSlug: toolName.toLowerCase(), toolName, members }),
        signal: AbortSignal.timeout(120000),
      })

      if (!response.ok) {
        const text = await response.text()
        return { status: 'failed', accessToken: null, providerName: this.name, inviteUrl: null, errors: [`Worker respondió ${response.status}: ${text}`] }
      }

      const data = await response.json()
      return {
        status: data.status,
        accessToken: data.accessToken,
        providerName: this.name,
        inviteUrl: data.inviteUrl,
        errors: data.errors || [],
      }
    } catch (error: any) {
      return { status: 'failed', accessToken: null, providerName: this.name, inviteUrl: null, errors: [error.message] }
    }
  }
}
