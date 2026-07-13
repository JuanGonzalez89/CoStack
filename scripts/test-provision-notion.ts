import { config } from "dotenv"
config({ path: ".env.local" })

import { prisma } from "../lib/prisma"
import { fulfillProvision } from "../lib/provisioner"
import { hash } from "bcryptjs"

const TEST_EMAILS = [
  "test-notion-1@costack.local",
  "test-notion-2@costack.local",
  "test-notion-3@costack.local",
  "test-notion-4@costack.local",
]
const TEST_PASSWORD = "TestPass123!"

async function main() {
  const passwordHash = await hash(TEST_PASSWORD, 10)

  const users = []
  for (const email of TEST_EMAILS) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: email.split("@")[0], passwordHash, role: "member" },
    })
    users.push(user)
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const lobby = await prisma.lobby.create({
    data: {
      toolSlug: "notion",
      toolName: "Notion Team",
      provider: "Notion",
      totalSeats: 4,
      pricePerSeat: 7,
      fullPrice: 20,
      expiresAt,
      accessMethod: "INVITATION_LINK",
      creatorId: users[0].id,
      status: "waiting",
    },
  })
  console.log("Lobby creado:", lobby.id)

  for (let i = 0; i < users.length; i++) {
    await prisma.lobbyMember.create({
      data: {
        lobbyId: lobby.id,
        userId: users[i].id,
        seatIndex: i + 1,
        amount: 7,
        status: "paid",
        paymentRef: "",
      },
    })
    console.log("  Miembro:", users[i].email, "| seat:", i + 1)
  }

  const membersToInvite = users.map((u) => ({ email: u.email!, userId: u.id }))

  console.log("\n--- INICIANDO PROVISIONING (Notion) ---")
  const result = await fulfillProvision(lobby.id, "notion", "Notion Team", membersToInvite)

  console.log("\n--- RESULTADO ---")
  console.log("Status:", result.status)
  console.log("Provider:", result.providerName)
  console.log("AccessToken:", result.accessToken)
  console.log("InviteUrl:", result.inviteUrl)
  console.log("Errors:", result.errors)

  if (result.status === "success") {
    await prisma.lobby.update({
      where: { id: lobby.id },
      data: { status: "completed", completedAt: new Date(), accessToken: result.accessToken },
    })
    console.log("\n✅ Lobby completado.")
  } else {
    console.log("\n❌ Provisioning falló, lobby queda en waiting.")
  }

  console.log("\nLobby ID:", lobby.id)
  console.log("Login de prueba:", TEST_EMAILS[0], "/", TEST_PASSWORD)
}

main()
  .catch((err) => {
    console.error("Error:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
