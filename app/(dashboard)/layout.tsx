import type { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileNav } from '@/components/dashboard/mobile-nav'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const organizedGroup = user ? await prisma.membership.findFirst({
    where: { userId: user.id, role: 'organizer' }
  }) : null
  const isOrganizer = !!organizedGroup

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 lg:flex">
      <Sidebar 
        isOrganizer={isOrganizer} 
        user={{ name: user?.name || session.user.name || '', email: session.user.email }} 
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav 
          isOrganizer={isOrganizer}
          user={{ name: user?.name || session.user.name || '', email: session.user.email }}
        />
        <main className="min-w-0 flex-1 bg-zinc-950 lg:pt-0">
          <div className="px-4 py-6 pb-24 pt-16 lg:px-12 lg:pb-12 lg:pt-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}