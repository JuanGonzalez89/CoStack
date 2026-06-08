import { BilleteraView } from '@/components/dashboard/billetera-view'
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
  const organizedGroup = user ? await prisma.membership.findFirst({
    where: { userId: user.id, role: 'organizer' }
  }) : null
  const isOrganizer = !!organizedGroup

  return <BilleteraView isOrganizer={isOrganizer} />
}