import "dotenv/config"
import { createTeamForLobby, inviteMemberToTeam } from "../lib/github-bot.server"

async function test() {
  console.log("Iniciando prueba rápida del Bot de GitHub...")
  const email = "calderonsantiago2019@gmail.com"
  
  const randomLobbyId = Math.random().toString(36).substring(2, 10)
  const teamResult = await createTeamForLobby(randomLobbyId, "GitHub Copilot")
  console.log("Resultado de creación de Team:", teamResult)
  
  if (teamResult.success && teamResult.teamSlug) {
    console.log(`Invitando a ${email} al team ${teamResult.teamSlug}...`)
    const inviteSuccess = await inviteMemberToTeam(teamResult.teamSlug, email)
    console.log("Invitación exitosa:", inviteSuccess)
  } else {
    console.log("No se pudo crear el team para invitar al usuario.")
  }
}

test()
