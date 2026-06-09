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
  const user = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email } }) : null
  const isOrganizer = user?.role === 'organizer'

  return <BilleteraPageClient isOverdue={searchParams?.status === 'overdue'} isOrganizer={isOrganizer} />
}