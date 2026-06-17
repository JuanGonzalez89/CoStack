import { createTeamForLobby, inviteMemberToTeam } from '@/lib/github-bot.server'
import type { ProvisionResult, ProvisionerProvider } from '../types'

export class GitHubProvider implements ProvisionerProvider {
  name = 'GitHub'

  canHandle(toolSlug: string): boolean {
    return ['copilot', 'codespaces', 'github'].includes(toolSlug)
  }

  async fulfill(lobbyId: string, toolName: string, members: { email: string; userId: string }[]): Promise<ProvisionResult> {
    const team = await createTeamForLobby(lobbyId, toolName)

    if (!team.success) {
      return {
        status: 'failed',
        accessToken: null,
        providerName: this.name,
        inviteUrl: null,
        errors: [team.error ?? 'Failed to create team'],
      }
    }

    for (const member of members) {
      if (!member.email) continue
      await inviteMemberToTeam(team.teamSlug!, member.email)
    }

    return {
      status: 'success',
      accessToken: team.inviteLink ?? '',
      providerName: this.name,
      inviteUrl: team.inviteLink ?? null,
      errors: [],
    }
  }
}
