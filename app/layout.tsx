import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: 'CoStack — Administrador Invisible de Suscripciones',
  description: 'Gestiona suscripciones compartidas de software para tu equipo freelance. Pagos, acceso ciego y turnos de uso.',
  generator: 'v0.app',
  icons: {
    icon: '/CoStack_Logo.png',
    apple: '/CoStack_Logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`bg-background ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
