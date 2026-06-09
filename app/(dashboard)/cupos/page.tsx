import { GestionAsientosView } from '@/components/dashboard/gestion-cupos-view'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getDashboardSnapshot } from '@/lib/dashboard-snapshot.server'

export default async function AsientosPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const organizedGroup = user ? await prisma.membership.findFirst({
    where: { userId: user.id, role: 'organizer' }
  }) : null

  if (!organizedGroup) {
    redirect('/overview')
  }

  const snapshot = await getDashboardSnapshot(session.user.email)

  return <GestionAsientosView snapshot={snapshot} />
}