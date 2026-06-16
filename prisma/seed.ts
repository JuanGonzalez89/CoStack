import { UserRole, GroupStatus, PaymentStatus, SeatStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { TOOLS } from '../lib/constants/tools'

async function main() {
  const toolRecords = await Promise.all(
    TOOLS.map((tool) =>
      prisma.tool.upsert({
        where: { slug: tool.slug },
        update: {
          name: tool.name,
          provider: tool.provider,
          monthlyCost: tool.monthlyCost,
          marketPrice: tool.marketPrice,
        },
        create: {
          slug: tool.slug,
          name: tool.name,
          provider: tool.provider,
          monthlyCost: tool.monthlyCost,
          marketPrice: tool.marketPrice,
        },
      }),
    ),
  )

  const passwordHash = await hash('password123', 10)

  const organizer = await prisma.user.upsert({
    where: { email: 'martin@costack.app' },
    update: {
      name: 'Martín Pérez',
    },
    create: {
      name: 'Martín Pérez',
      email: 'martin@costack.app',
      passwordHash,
    },
  })

  const member = await prisma.user.upsert({
    where: { email: 'santiago@costack.app' },
    update: {
      name: 'Santiago Gómez',
    },
    create: {
      name: 'Santiago Gómez',
      email: 'santiago@costack.app',
      passwordHash,
    },
  })

  const group = await prisma.group.upsert({
    where: { inviteCode: 'COSTACK-84A2' },
    update: {
      name: 'CoStack Studio',
      status: GroupStatus.active,
    },
    create: {
      name: 'CoStack Studio',
      inviteCode: 'COSTACK-84A2',
      status: GroupStatus.active,
    },
  })

  await prisma.membership.upsert({
    where: {
      userId_groupId: {
        userId: organizer.id,
        groupId: group.id,
      },
    },
    update: {
      role: UserRole.organizer,
      status: PaymentStatus.paid,
    },
    create: {
      userId: organizer.id,
      groupId: group.id,
      role: UserRole.organizer,
      status: PaymentStatus.paid,
    },
  })

  await prisma.membership.upsert({
    where: {
      userId_groupId: {
        userId: member.id,
        groupId: group.id,
      },
    },
    update: {
      role: UserRole.member,
      status: PaymentStatus.pending,
    },
    create: {
      userId: member.id,
      groupId: group.id,
      role: UserRole.member,
      status: PaymentStatus.pending,
    },
  })

  for (const [index, tool] of toolRecords.entries()) {
    await prisma.seat.upsert({
      where: { id: `${group.id}-${tool.id}` },
      update: {
        status: index === 0 ? SeatStatus.assigned : SeatStatus.pending,
        assigneeId: index === 0 ? organizer.id : member.id,
        accessToken: index === 0 ? 'COSTACK-74A2-9X11' : 'COSTACK-84A2-2B22',
      },
      create: {
        id: `${group.id}-${tool.id}`,
        groupId: group.id,
        toolId: tool.id,
        assigneeId: index === 0 ? organizer.id : member.id,
        status: index === 0 ? SeatStatus.assigned : SeatStatus.pending,
        accessToken: index === 0 ? 'COSTACK-74A2-9X11' : 'COSTACK-84A2-2B22',
      },
    })
  }

  await prisma.payment.createMany({
    data: [
      {
        userId: organizer.id,
        groupId: group.id,
        toolId: toolRecords[0].id,
        amount: 30,
        status: PaymentStatus.paid,
        providerRef: 'seed-payment-1',
      },
      {
        userId: member.id,
        groupId: group.id,
        toolId: toolRecords[1].id,
        amount: 45,
        status: PaymentStatus.pending,
        providerRef: 'seed-payment-2',
      },
    ],
  })

  await prisma.communityPost.createMany({
    data: [
      {
        userId: organizer.id,
        groupId: group.id,
        content: 'Primer seed real de comunidad para Sprint 3.',
        likes: 5,
        reposts: 1,
      },
    ],
  })

  await prisma.botEvent.createMany({
    data: [
      {
        groupId: group.id,
        type: 'seed',
        message: 'Seed inicial cargado correctamente.',
      },
    ],
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })