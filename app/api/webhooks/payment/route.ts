import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

function createStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    return null
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-07-30.basil',
  })
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const rawBody = await request.text()
  const stripe = createStripeClient()

  if (!stripe || !signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing Stripe webhook config' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const seatId = session.client_reference_id;
    const { userId, toolId, groupId } = session.metadata || {};

    if (seatId && userId && toolId && groupId) {
      // Idempotency check: see if payment already recorded for this intent
      const existingPayment = await prisma.payment.findFirst({
        where: { providerRef: session.payment_intent as string }
      });

      if (!existingPayment) {
        // 1. Update Seat
        await prisma.seat.update({
          where: { id: seatId },
          data: {
            status: 'assigned',
            expiresAt: null,
            accessToken: `sk_live_${Math.random().toString(36).substring(2, 15)}` // fake tool token
          }
        });

        // 2. Create Payment
        await prisma.payment.create({
          data: {
            userId,
            groupId,
            toolId,
            amount: (session.amount_total || 0) / 100,
            status: 'paid',
            providerRef: session.payment_intent as string
          }
        });
        
        await prisma.botEvent.create({
          data: {
            groupId,
            type: 'payment',
            message: `Stripe checkout completado para asiento ${seatId}`,
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true })
}