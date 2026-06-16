import { BilleteraPageClient } from '@/components/dashboard/billetera-page-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function BilleteraPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  const session = await getServerSession(authOptions)
  const user = session?.user?.email ? await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { memberships: true }
  }) : null
  const isOrganizer = user?.memberships.some(m => m.role === 'organizer') ?? false

  return <BilleteraPageClient isFailed={searchParams?.status === 'failed'} isOrganizer={isOrganizer} />
}