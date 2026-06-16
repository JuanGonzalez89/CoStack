import { SuscripcionesView } from '@/components/dashboard/suscripciones-view'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function SuscripcionesPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user?.email 
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { memberships: true }
      })
    : null
    
  return <SuscripcionesView isOrganizer={user?.memberships.some(m => m.role === 'organizer') ?? false} />
}