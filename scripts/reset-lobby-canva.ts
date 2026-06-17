import { prisma } from '../lib/prisma'
import { hash } from 'bcryptjs'

async function main() {
  const lobbyId = 'cmqhjhdq60003s0lyl4mrn1td'

  // Crear los 3 usuarios de prueba si no existen
  const testUsers = [
    { email: 'jpgarciamallorquin@gmail.com', name: 'JP García' },
    { email: 'Juanurro27@gmail.com', name: 'Juan U. Rro' },
    { email: 'juanignaciogonzalez.ca@gmail.com', name: 'Juan Ignacio González' },
  ]

  const passwordHash = await hash('password123', 10)

  const userIds: string[] = []
  for (const u of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: 'member',
      },
    })
    userIds.push(user.id)
    console.log('Usuario:', user.email, user.id)
  }

  // Crear/actualizar lobby
  await prisma.lobby.upsert({
    where: { id: lobbyId },
    update: {
      status: 'waiting',
      accessToken: null,
      completedAt: null,
    },
    create: {
      id: lobbyId,
      toolSlug: 'canva',
      toolName: 'Canva Pro Team',
      provider: 'Canva',
      totalSeats: 3,
      pricePerSeat: 10,
      fullPrice: 30,
      status: 'waiting',
      accessMethod: 'INVITATION_LINK',
      creatorId: userIds[0],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  // Recrear miembros del lobby
  await prisma.lobbyMember.deleteMany({ where: { lobbyId } })

  // Orden: jpgarciamallorquin = seat 1, Juanurro27 = seat 2, juanignaciogonzalez = seat 3
  for (let i = 0; i < userIds.length; i++) {
    await prisma.lobbyMember.create({
      data: {
        lobbyId,
        userId: userIds[i],
        seatIndex: i + 1,
        amount: 10,
        status: 'paid',
        paymentRef: null,
      },
    })
  }

  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: { members: { include: { user: { select: { email: true } } } } },
  })

  console.log('\nLobby listo:')
  console.log('  id:', lobby?.id)
  console.log('  status:', lobby?.status)
  console.log('  accessToken:', lobby?.accessToken)
  console.log('  completedAt:', lobby?.completedAt)
  console.log('  members:', lobby?.members.length)
  lobby?.members.forEach(m =>
    console.log('    - seat', m.seatIndex, m.user.email, 'paymentRef:', m.paymentRef, 'userId:', m.userId)
  )

  await prisma.$disconnect()
}

main().catch(console.error)
