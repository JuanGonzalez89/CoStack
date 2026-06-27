import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { GroupSettingsClient } from './group-settings-client'

export default async function GroupSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect(ROUTES.login)

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      memberships: {
        include: {
          group: {
            include: {
              members: { include: { user: { select: { name: true, email: true } } } },
            },
          },
        },
      },
    },
  })

  if (!user) redirect(ROUTES.login)

  const groups = user.memberships
    .filter(m => m.role === 'organizer')
    .map(m => m.group)

  if (groups.length === 0) {
    return (
      <section className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-400">Espacio</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Gestión del espacio</h1>
          <p className="text-sm text-zinc-400">No administrás ningún grupo actualmente.</p>
        </div>
      </section>
    )
  }

  const group = groups[0]

  return (
    <GroupSettingsClient
      groupId={group.id}
      groupName={group.name}
      inviteCode={group.inviteCode}
      members={group.members.map(m => ({
        name: m.user.name,
        email: m.user.email,
        role: m.role,
      }))}
    />
  )
}