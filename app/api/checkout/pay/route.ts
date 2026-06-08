import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const userId = user.id

    const { toolSlug } = await request.json()
    if (!toolSlug) {
      return NextResponse.json({ error: "Falta el identificador de la herramienta." }, { status: 400 })
    }

    // Upsert tool: si no está en la BD la crea con datos del catálogo frontend
    const CATALOG_PRICES: Record<string, { name: string; provider: string; monthlyCost: number }> = {
      copilot:    { name: 'GitHub Copilot', provider: 'GitHub', monthlyCost: 10 },
      jetbrains:  { name: 'All Products Pack', provider: 'JetBrains', monthlyCost: 28 },
      chatgpt:    { name: 'ChatGPT Team', provider: 'OpenAI', monthlyCost: 30 },
      figma:      { name: 'Figma Org', provider: 'Figma Inc.', monthlyCost: 45 },
      midjourney: { name: 'Midjourney Pro', provider: 'Midjourney', monthlyCost: 60 },
      vercel:     { name: 'Vercel Pro', provider: 'Vercel', monthlyCost: 20 },
      canva:      { name: 'Canva Pro Team', provider: 'Canva', monthlyCost: 30 },
      claude:     { name: 'Claude Pro', provider: 'Anthropic', monthlyCost: 20 },
    }
    const catalogEntry = CATALOG_PRICES[toolSlug] ?? { name: toolSlug, provider: 'Unknown', monthlyCost: 10 }
    const tool = await prisma.tool.upsert({
      where: { slug: toolSlug },
      create: { slug: toolSlug, ...catalogEntry },
      update: {},
    })

    // Find the pending seat for this user and tool
    const pendingSeat = await prisma.seat.findFirst({
      where: {
        toolId: tool.id,
        assigneeId: userId,
        status: 'pending'
      }
    })

    if (!pendingSeat) {
      return NextResponse.json({ error: "No tienes una reserva activa o tu tiempo expiró." }, { status: 400 })
    }

    if (pendingSeat.expiresAt && pendingSeat.expiresAt < new Date()) {
      // Expired. Mark as free.
      await prisma.seat.update({
        where: { id: pendingSeat.id },
        data: { status: 'free', assigneeId: null, expiresAt: null }
      })
      return NextResponse.json({ error: "Tu reserva ha expirado. Por favor, intenta comprar de nuevo." }, { status: 400 })
    }

    // 3. Real Payment with Stripe (if configured)
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      // Update seat status to 'pending_payment' so it's locked while in checkout
      await prisma.seat.update({
        where: { id: pendingSeat.id },
        data: { status: 'pending' } // Keep it pending until webhook confirms
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Acceso a ${tool.name}`,
              description: 'Licencia compartida (1 mes)',
            },
            unit_amount: Math.round((tool.monthlyCost / 5) * 100), // in cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/overview?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/suscripciones`,
        client_reference_id: pendingSeat.id,
        metadata: {
          userId,
          toolId: tool.id,
          groupId: pendingSeat.groupId
        }
      });

      return NextResponse.json({ url: session.url }, { status: 200 })
    }

    // 4. Mock Process (Fallback para pruebas sin API keys)
    // 1. Update seat to assigned
    await prisma.seat.update({
      where: { id: pendingSeat.id },
      data: {
        status: 'assigned',
        expiresAt: null,
        accessToken: `sk_live_${Math.random().toString(36).substring(2, 15)}` // fake token
      }
    })

    // 2. Create payment record
    await prisma.payment.create({
      data: {
        userId,
        groupId: pendingSeat.groupId,
        toolId: tool.id,
        amount: tool.monthlyCost / 5, // mock splitting cost
        status: 'paid',
        providerRef: `mock_stripe_${Date.now()}`
      }
    })

    // Simulate gateway latency
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json({ success: true, message: "Pago procesado y cupo asignado." }, { status: 200 })
  } catch (error) {
    console.error("Pay error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
