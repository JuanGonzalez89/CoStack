import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { groupId, toolId, oauthToken } = body
    if (!groupId || !toolId) return NextResponse.json({ error: 'groupId and toolId are required' }, { status: 400 })

    const sub = await prisma.toolSubscription.create({
      data: {
        groupId,
        toolId,
        oauthTokenId: oauthToken || null,
      }
    })

    return NextResponse.json({ success: true, subscription: sub })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
