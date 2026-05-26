import type { ReactNode } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileNav } from '@/components/dashboard/mobile-nav'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="min-w-0 flex-1 lg:pt-0">
          <div className="mx-auto max-w-7xl px-4 py-6 pb-24 pt-16 lg:px-8 lg:pb-8 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}