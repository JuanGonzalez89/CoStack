import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.role !== 'organizer') return NextResponse.json({ error: 'Only organizers can request payouts' }, { status: 403 })

    const { amount, provider, providerRef } = await request.json()
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

    const pr = await prisma.payoutRequest.create({
      data: {
        organizerId: user.id,
        amount: Number(amount),
        provider: provider || null,
        providerRef: providerRef || null,
        status: 'pending'
      }
    })

    await prisma.botEvent.create({ data: { groupId: null, type: 'payout_request', message: `Payout requested by ${user.email} for $${amount}` } })

    return NextResponse.json({ success: true, payoutRequest: pr })
  } catch (err) {
    console.error('Payout request error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}