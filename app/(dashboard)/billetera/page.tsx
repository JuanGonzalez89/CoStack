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
    include: {
      payments: {
        include: { tool: true, group: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  }) : null
  const isOrganizer = user?.role === 'organizer'

  const lobbyMembers = user?.id ? await prisma.lobbyMember.findMany({
    where: { userId: user.id },
    include: { lobby: true },
    orderBy: { createdAt: 'desc' }
  }) : []

  const payments = user?.payments ?? []
  
  const mergedPayments = [
    ...payments.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      description: `${p.tool.name} · ${p.group?.name ?? 'Suscripción'}`,
      toolName: p.tool.name,
      isLobby: false
    })),
    ...lobbyMembers.map(lm => ({
      id: lm.id,
      amount: Number(lm.amount),
      status: lm.status,
      createdAt: lm.createdAt.toISOString(),
      description: `${lm.lobby.toolName} · Reserva de Sala`,
      toolName: lm.lobby.toolName,
      isLobby: true
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const balance = mergedPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const nextCharge = mergedPayments.filter(p => p.status !== 'paid' && !p.isLobby).reduce((sum, p) => sum + p.amount, 0)

  return (
    <BilleteraPageClient
      isOverdue={searchParams?.status === 'overdue'}
      isOrganizer={isOrganizer}
      initialPayments={mergedPayments}
      balance={balance}
      nextCharge={nextCharge}
    />
  )
}
