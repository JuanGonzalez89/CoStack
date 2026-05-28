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
  const isOrganizer = user?.role === 'organizer'

  return (
    <div className="min-h-screen bg-[#07111d] text-slate-100 lg:flex">
      <Sidebar 
        isOrganizer={isOrganizer} 
        user={{ name: user?.name || session.user.name || '', email: session.user.email }} 
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav 
          isOrganizer={isOrganizer}
          user={{ name: user?.name || session.user.name || '', email: session.user.email }}
        />
        <main className="min-w-0 flex-1 bg-[#07111d] lg:pt-0">
          <div className="mx-auto max-w-7xl px-4 py-6 pb-24 pt-16 lg:px-8 lg:pb-8 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}