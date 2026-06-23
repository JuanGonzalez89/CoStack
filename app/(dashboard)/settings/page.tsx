import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SettingsPageClient } from '@/components/dashboard/settings-page-client'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      payments: {
        where: { status: 'paid' },
        include: { tool: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!user) redirect('/login')

  const subscriptions = user.payments.map(p => {
    const renewDate = new Date(p.createdAt)
    renewDate.setDate(renewDate.getDate() + 30)
    return {
      toolName: p.tool.name,
      amount: Number(p.amount),
      date: p.createdAt.toISOString(),
      renewDate: renewDate.toISOString(),
    }
  })

  return (
    <SettingsPageClient
      userName={user.name ?? 'Usuario'}
      userEmail={user.email}
      userRole={user.role}
      subscriptionsCount={subscriptions.length}
      activeSubscriptions={subscriptions}
    />
  )
}
