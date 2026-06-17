import { Octokit } from "@octokit/rest"

interface CreateTeamResult {
  success: boolean
  inviteLink?: string
  teamSlug?: string
  error?: string
}

function getOctokit(): Octokit {
  const token = process.env.GITHUB_BOT_TOKEN
  if (!token) {
    throw new Error("GITHUB_BOT_TOKEN no está configurado en el .env")
  }
  return new Octokit({ auth: token })
}

function getOrg(): string {
  return process.env.GITHUB_ORG_NAME || "costack-bot-test"
}

export async function createTeamForLobby(lobbyId: string, toolName: string): Promise<CreateTeamResult> {
  const octokit = getOctokit()
  const org = getOrg()

  try {
    const { data: team } = await octokit.rest.teams.create({
      org,
      name: `Sala ${toolName} - ${lobbyId.slice(0, 6)}`,
      privacy: "closed",
    })

    console.log(`[GitHub Bot] Team creado: ${team.html_url}`)
    return { success: true, inviteLink: team.html_url, teamSlug: team.slug }
  } catch (error: any) {
    console.error(`[GitHub Bot] Error creando team:`, error.message)
    return { success: false, error: error.message }
  }
}

export async function inviteMemberToTeam(teamSlug: string, email: string): Promise<boolean> {
  const octokit = getOctokit()
  const org = getOrg()

  try {
    await octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
      org,
      teamSlug,
      username: email,
      role: "member",
    })
    console.log(`[GitHub Bot] Usuario ${email} invitado al team ${teamSlug}`)
    return true
  } catch (error: any) {
    console.error(`[GitHub Bot] Error invitando a ${email}:`, error.message)
    return false
  }
}
