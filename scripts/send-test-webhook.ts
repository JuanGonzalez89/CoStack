import dotenv from 'dotenv'
dotenv.config({ path: process.cwd() + '/.env.local' })
import Stripe from 'stripe'
import { prisma } from '../lib/prisma'

async function main() {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    console.error('STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing in environment')
    process.exit(1)
  }

  const seat = await prisma.seat.findFirst({ where: { status: 'pending' } })
  if (!seat) {
    console.error('No pending seat found. Run scripts/test-reserve.ts first to create pending seats.')
    process.exit(1)
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2025-07-30.basil' })

  const session = {
    id: `cs_test_${Math.random().toString(36).substring(2, 12)}`,
    object: 'checkout.session',
    client_reference_id: seat.id,
    metadata: { userId: seat.assigneeId, toolId: seat.toolId, groupId: seat.groupId },
    amount_total: 1000,
    payment_intent: `pi_test_${Math.random().toString(36).substring(2, 12)}`,
  }

  const event = {
    id: `evt_test_${Math.random().toString(36).substring(2, 12)}`,
    object: 'event',
    type: 'checkout.session.completed',
    data: { object: session },
  }

  const payload = JSON.stringify(event)
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret })

  const res = await globalThis.fetch('http://localhost:3000/api/webhooks/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'stripe-signature': header },
    body: payload,
  })

  console.log('Webhook response status:', res.status)
  const text = await res.text()
  console.log('Response body:', text)

  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(2) })
