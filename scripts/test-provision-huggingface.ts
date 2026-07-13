import { config } from "dotenv"
config({ path: ".env.local" })

import { prisma } from "../lib/prisma"
import { fulfillProvision } from "../lib/provisioner"
import { hash } from "bcryptjs"

const TEST_EMAILS = [
  "test-hf-1@costack.local",
  "test-hf-2@costack.local",
  "test-hf-3@costack.local",
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
      toolSlug: "huggingface",
      toolName: "HuggingChat Premium",
      provider: "Hugging Face",
      totalSeats: 3,
      pricePerSeat: 5,
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
        amount: 5,
        status: "paid",
        paymentRef: "",
      },
    })
    console.log("  Miembro:", users[i].email, "| seat:", i + 1)
  }

  const membersToInvite = users.map((u) => ({ email: u.email!, userId: u.id }))

  console.log("\n--- INICIANDO PROVISIONING (Hugging Face) ---")
  const result = await fulfillProvision(lobby.id, "huggingface", "HuggingChat Premium", membersToInvite)

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
}

main()
  .catch((err) => {
    console.error("Error:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
