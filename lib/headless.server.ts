import { fulfillProvision } from './provisioner'

export async function runPurchaseBot(params: {
  lobbyId: string
  toolSlug: string
  toolName: string
  members: { email: string; userId: string }[]
}) {
  const result = await fulfillProvision(params.lobbyId, params.toolSlug, params.toolName, params.members)
  if (result.status === 'failed') {
    throw new Error(`Provisioning failed: ${result.errors.join(', ')}`)
  }
  return result.accessToken || ''
}
