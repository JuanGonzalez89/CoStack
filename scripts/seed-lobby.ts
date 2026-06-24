import { prisma as db } from '../lib/prisma'
import { v4 as uuidv4 } from 'uuid'

async function main() {
  let user1 = await db.user.findUnique({ where: { email: 'juanurro27@gmail.com' } })
  if (!user1) user1 = await db.user.create({ data: { id: uuidv4(), name: 'Juan Urro', email: 'juanurro27@gmail.com' } })
  let user2 = await db.user.findUnique({ where: { email: 'juangonzales@gmail.com' } })
  if (!user2) user2 = await db.user.create({ data: { id: uuidv4(), name: 'Juan Gonzales', email: 'juangonzales@gmail.com' } })

  const lobby = await db.lobby.create({
    data: {
      id: uuidv4(),
      toolSlug: 'huggingface',
      toolName: 'HuggingChat Premium',
      provider: 'huggingface',
      status: 'waiting',
      totalSeats: 3,
      pricePerSeat: 5,
      fullPrice: 15,
      creatorId: user1.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  })

  await db.lobbyMember.create({ data: { id: uuidv4(), lobbyId: lobby.id, userId: user1.id, status: 'paid', amount: 5, seatIndex: 1 } })
  await db.lobbyMember.create({ data: { id: uuidv4(), lobbyId: lobby.id, userId: user2.id, status: 'paid', amount: 5, seatIndex: 2 } })

  console.log(`Lobby seed completado. ID: ${lobby.id}. Asientos: 2/3`)
}

main().catch(console.error)
