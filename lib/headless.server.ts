import { createTeamForLobby } from "@/lib/github-bot.server"

interface BotTaskConfig {
  toolProvider: string
  accessMethod: 'INVITATION_LINK' | 'API_PROXY'
  corporateEmail: string
  lobbyId: string
}

export async function runPurchaseBot(config: BotTaskConfig): Promise<string> {
  console.log(`[Bot] Procesando lobby ${config.lobbyId} con método ${config.accessMethod}`)

  if (config.accessMethod === 'INVITATION_LINK') {
    const result = await createTeamForLobby(config.lobbyId, config.toolProvider)

    if (!result.success || !result.inviteLink) {
      throw new Error(`[Bot] Falló la creación del team: ${result.error}`)
    }

    console.log(`[Bot] Team creado exitosamente: ${result.inviteLink}`)
    return result.inviteLink
  }

  // API_PROXY — devuelve un token simulado (no hay SaaS real conectado aún)
  console.log(`[Bot] Generando API Key simulada para ${config.toolProvider}`)
  const token = `sk_live_lobby_${Math.random().toString(36).substring(2, 15)}`
  console.log(`[Bot] API Key generada: ${token}`)
  return token
}
