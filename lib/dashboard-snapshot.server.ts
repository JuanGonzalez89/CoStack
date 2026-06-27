import { prisma } from '@/lib/prisma'
import type { DashboardSnapshot } from '@/lib/dashboard-snapshot'

export async function getDashboardSnapshot(userEmail?: string | null): Promise<DashboardSnapshot> {
  try {
    const [groups, memberships, payments, seats, posts, botEvents] = await Promise.all([
      prisma.group.count(),
      prisma.membership.count(),
      prisma.payment.count(),
      prisma.seat.count(),
      prisma.communityPost.count(),
      prisma.botEvent.count(),
    ])

    const userWhereClause = userEmail ? {
      members: { some: { user: { email: userEmail } } }
    } : {}

    const latestGroup = await prisma.group.findFirst({
      where: userWhereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        members: { include: { user: true } },
        seats: { include: { tool: true } },
        payments: { orderBy: { createdAt: 'desc' }, include: { tool: true, user: true } },
        posts: { orderBy: { createdAt: 'desc' }, include: { user: true } },
        botEvents: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })

    const activeGroups = await prisma.group.findMany({
      where: userWhereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        members: { include: { user: true } },
        seats: { include: { tool: true } },
        payments: { orderBy: { createdAt: 'desc' }, include: { tool: true, user: true } },
        posts: { orderBy: { createdAt: 'desc' }, include: { user: true } },
        botEvents: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })

    return {
      totals: { groups, memberships, payments, seats, posts, botEvents },
      latestGroup,
      activeGroups,
    }
  } catch (error) {
    console.warn("Database connection failed. Using mock dashboard snapshot data.")
    return {
      _isMock: true,
      totals: { groups: 1, memberships: 5, payments: 12, seats: 8, posts: 3, botEvents: 15 },
      latestGroup: {
        id: "mock-group-1",
        name: "CoStack Studio",
        inviteCode: "COSTACK-MOCK",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [],
        seats: [
          {
            id: "seat-1", groupId: "mock-group-1", toolId: "tool-1",
            status: "assigned", assigneeId: "user-1", accessToken: "TOKEN-123",
            createdAt: new Date(), updatedAt: new Date(),
            tool: { id: "tool-1", slug: "figma-pro", name: "Figma Pro", provider: "Figma", monthlyCost: 15, createdAt: new Date() } as any
          }
        ],
        payments: [],
        posts: [],
        botEvents: [
          { id: "event-1", type: "success", message: "Bot iniciado correctamente", createdAt: new Date(), groupId: "mock-group-1" }
        ],
      } as any,
      activeGroups: [
        {
          id: "mock-group-1",
          name: "CoStack Studio",
          inviteCode: "COSTACK-MOCK",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
          members: [],
          seats: [
            {
              id: "seat-1", groupId: "mock-group-1", toolId: "tool-1",
              status: "assigned", assigneeId: "user-1", accessToken: "TOKEN-123",
              createdAt: new Date(), updatedAt: new Date(),
              tool: { id: "tool-1", slug: "figma-pro", name: "Figma Pro", provider: "Figma", monthlyCost: 15, createdAt: new Date() } as any
            }
          ],
          payments: [],
          posts: [],
          botEvents: [],
        } as any
      ]
    }
  }
}