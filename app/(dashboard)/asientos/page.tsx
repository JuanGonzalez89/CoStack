import { GestionAsientosView } from '@/components/dashboard/gestion-asientos-view'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getDashboardSnapshot } from '@/lib/dashboard-snapshot.server'

export default async function AsientosPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (user?.role !== 'organizer') {
    redirect('/overview')
  }

  const snapshot = await getDashboardSnapshot()

  return <GestionAsientosView snapshot={snapshot} />
}