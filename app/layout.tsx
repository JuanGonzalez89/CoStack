import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://costack.app'),
  applicationName: 'CoStack',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CoStack — Administrador Invisible de Suscripciones',
    description: 'Gestiona suscripciones compartidas de software para tu equipo freelance. Pagos, acceso ciego y turnos de uso.',
    url: '/',
    siteName: 'CoStack',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'CoStack dashboard preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoStack — Administrador Invisible de Suscripciones',
    description: 'Gestiona suscripciones compartidas de software para tu equipo freelance. Pagos, acceso ciego y turnos de uso.',
    images: ['/twitter-image'],
  },
  icons: {
    icon: '/CoStack_Logo.png',
    apple: '/CoStack_Logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0f1e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`bg-[#07111d] ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#07111d] font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" theme="dark" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
