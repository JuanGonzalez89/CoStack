import { NextRequest, NextResponse } from 'next/server'
import {
  SESSION_COOKIE,
  SESSION_GROUP_COOKIE,
  SESSION_PAYMENT_COOKIE,
  SESSION_ROLE_COOKIE,
  type GroupState,
  type PaymentState,
  type UserRole,
  serializeDemoSession,
} from '@/lib/session'

function setDemoSession(response: NextResponse, session: { role: UserRole; group: GroupState; payment: PaymentState }) {
  response.cookies.set(SESSION_COOKIE, serializeDemoSession(session), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  response.cookies.set(SESSION_ROLE_COOKIE, session.role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  response.cookies.set(SESSION_GROUP_COOKIE, session.group, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  response.cookies.set(SESSION_PAYMENT_COOKIE, session.payment, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const role = body?.role === 'organizer' ? 'organizer' : 'member'
  const group = body?.group === 'active' ? 'active' : 'none'
  const payment = body?.payment === 'overdue' ? 'overdue' : 'current'

  const response = NextResponse.json({ ok: true, session: { role, group, payment } })
  setDemoSession(response, { role, group, payment })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })

  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  response.cookies.set(SESSION_ROLE_COOKIE, '', { path: '/', maxAge: 0 })
  response.cookies.set(SESSION_GROUP_COOKIE, '', { path: '/', maxAge: 0 })
  response.cookies.set(SESSION_PAYMENT_COOKIE, '', { path: '/', maxAge: 0 })

  return response
}