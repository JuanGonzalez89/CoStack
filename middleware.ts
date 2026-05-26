import { NextRequest, NextResponse } from 'next/server'
import { ROUTES } from '@/lib/constants/routes'
import { parseDemoSession, SESSION_COOKIE, type DemoSession } from '@/lib/session'

function getSession(request: NextRequest): DemoSession | null {
  return parseDemoSession(request.cookies.get(SESSION_COOKIE)?.value)
}

function isDashboardPath(pathname: string) {
  return [
    ROUTES.onboarding,
    ROUTES.overview,
    ROUTES.suscripciones,
    ROUTES.asientos,
    ROUTES.comunidad,
    ROUTES.billetera,
    ROUTES.settings,
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function redirect(request: NextRequest, pathname: string, search?: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = search ?? ''
  return NextResponse.redirect(url)
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = getSession(request)
  const isProtected = isDashboardPath(pathname)
  const isAuthPath = pathname === ROUTES.login || pathname === ROUTES.register
  const isOnboardingPath = pathname === ROUTES.onboarding || pathname.startsWith(`${ROUTES.onboarding}/`)

  if (!session) {
    if (isProtected) {
      return redirect(request, ROUTES.login)
    }

    return NextResponse.next()
  }

  if (pathname === ROUTES.home) {
    return redirect(request, session.group === 'active' ? ROUTES.overview : ROUTES.onboarding)
  }

  if (isAuthPath) {
    return redirect(request, session.group === 'active' ? ROUTES.overview : ROUTES.onboarding)
  }

  if (!isOnboardingPath && session.group === 'none') {
    return redirect(request, ROUTES.onboarding)
  }

  if (pathname === ROUTES.settingsGroup && session.role !== 'organizer') {
    return redirect(request, ROUTES.settings)
  }

  if (session.payment === 'overdue' && session.role === 'member') {
    const allowedPaths = [ROUTES.overview, ROUTES.billetera]
    const isAllowed = allowedPaths.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    if (!isAllowed) {
      return redirect(request, ROUTES.billetera, search ? `${search}&status=overdue` : '?status=overdue')
    }
  }

  if (isOnboardingPath && session.group === 'active') {
    return redirect(request, ROUTES.overview)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/register', '/onboarding/:path*', '/overview/:path*', '/suscripciones/:path*', '/asientos/:path*', '/comunidad/:path*', '/billetera/:path*', '/settings/:path*'],
}