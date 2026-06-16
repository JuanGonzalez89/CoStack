import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { memberships: true }
    })
    
    const isOrganizer = user?.memberships.some(m => m.role === 'organizer')
    if (!isOrganizer) return NextResponse.json({ error: 'Only organizers can request payouts' }, { status: 403 })

    const userId = user!.id

    const { amount, provider, providerRef } = await request.json()
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

    const pr = await prisma.payoutRequest.create({
      data: {
        organizerId: userId,
        amount: Number(amount),
        provider: provider || null,
        providerRef: providerRef || null,
        status: 'pending'
      }
    })

    await prisma.botEvent.create({ data: { groupId: null, type: 'payout_request', message: `Payout requested by ${userId} for $${amount}` } })

    return NextResponse.json({ success: true, payoutRequest: pr })
  } catch (err) {
    console.error('Payout request error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}