import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [groups, memberships, payments, seats, posts, botEvents] = await Promise.all([
    prisma.group.count(),
    prisma.membership.count(),
    prisma.payment.count(),
    prisma.seat.count(),
    prisma.communityPost.count(),
    prisma.botEvent.count(),
  ])

  const latestGroup = await prisma.group.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      members: { include: { user: true } },
      seats: { include: { tool: true } },
      payments: { orderBy: { createdAt: 'desc' }, include: { tool: true, user: true } },
      posts: { orderBy: { createdAt: 'desc' }, include: { user: true } },
      botEvents: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })

  return NextResponse.json({
    totals: { groups, memberships, payments, seats, posts, botEvents },
    latestGroup,
  })
}