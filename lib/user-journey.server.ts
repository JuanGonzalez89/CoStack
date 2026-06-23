import { prisma } from '@/lib/prisma'
import { ROUTES } from '@/lib/constants/routes'

export async function resolvePostAuthPath(userEmail: string | null | undefined) {
  if (!userEmail) {
    return ROUTES.login
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    })

    if (!user) {
      return ROUTES.suscripciones
    }

    const [membershipsCount, paymentsCount, lobbyMembersCount] = await Promise.all([
      prisma.membership.count({ where: { userId: user.id } }),
      prisma.payment.count({ where: { userId: user.id } }),
      prisma.lobbyMember.count({ where: { userId: user.id } })
    ])

    const isFirstTimeUser = membershipsCount === 0 && paymentsCount === 0 && lobbyMembersCount === 0

    return isFirstTimeUser ? ROUTES.welcome : ROUTES.overview
  } catch {
    // If the database is temporarily unavailable, preserve access to the product.
    return ROUTES.overview
  }
}
