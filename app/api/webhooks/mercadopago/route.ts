import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { action, data, type } = body

    if (type !== 'payment' || !data?.id) {
      return NextResponse.json({ received: true })
    }

    const paymentId = data.id
    console.log(`[Mercado Pago Webhook] Evento recibido: ${action} para pago ${paymentId}`)

    if (action === 'payment.created' || action === 'payment.updated') {
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      })

      if (!mpResponse.ok) {
        console.error(`[Mercado Pago Webhook] Error al consultar pago ${paymentId}`)
        return NextResponse.json({ received: true })
      }

      const payment = await mpResponse.json()

      if (payment.status === 'approved') {
        await prisma.payment.updateMany({
          where: { providerRef: paymentId },
          data: { status: 'paid' },
        })
        console.log(`[Mercado Pago Webhook] Pago ${paymentId} aprobado y registrado.`)
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        await prisma.payment.updateMany({
          where: { providerRef: paymentId },
          data: { status: 'failed' },
        })
        console.log(`[Mercado Pago Webhook] Pago ${paymentId} rechazado/cancelado.`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Mercado Pago Webhook] Error:', error)
    return NextResponse.json({ received: true }, { status: 200 })
  }
}
