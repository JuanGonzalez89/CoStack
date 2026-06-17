import { NextResponse } from 'next/server'

export async function POST() {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json(
      { ok: true, message: 'Dev login ok' },
      {
        status: 200,
        headers: {
          'Set-Cookie': 'next-auth.session-token=dev-session-token; Path=/; HttpOnly; Secure; SameSite=Lax',
        },
      }
    )
  }

  return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
}
