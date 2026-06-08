import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const requestSchema = z.object({
  toolSlug: z.string().trim().min(1),
})

function createAccessToken() {
  const token = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  return `COSTACK-${token.slice(0, 4)}-${token.slice(4)}`
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'El pago necesita un identificador de herramienta válido.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ error: 'No encontramos el usuario autenticado.' }, { status: 404 })
  }

  const group = await prisma.group.findFirst({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!group) {
    return NextResponse.json({ error: 'Todavía no tenés una suscripción activa. Completá el onboarding primero.' }, { status: 409 })
  }

  const tool = await prisma.tool.findUnique({
    where: { slug: parsed.data.toolSlug },
  })

  if (!tool) {
    return NextResponse.json({ error: 'No encontramos la herramienta seleccionada.' }, { status: 404 })
  }

  const accessToken = createAccessToken()

  const result = await prisma.$transaction(async (tx) => {
    const existingSeat = await tx.seat.findFirst({
      where: {
        groupId: group.id,
        toolId: tool.id,
      },
    })

    const seat = existingSeat
      ? await tx.seat.update({
          where: { id: existingSeat.id },
          data: {
            assigneeId: user.id,
            status: 'assigned',
            accessToken,
          },
        })
      : await tx.seat.create({
          data: {
            groupId: group.id,
            toolId: tool.id,
            assigneeId: user.id,
            status: 'assigned',
            accessToken,
          },
        })

    const payment = await tx.payment.create({
      data: {
        userId: user.id,
        groupId: group.id,
        toolId: tool.id,
        amount: tool.monthlyCost,
        status: 'paid',
        providerRef: `demo-mail-${Date.now()}`,
      },
    })

    await tx.membership.upsert({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: group.id,
        },
      },
      update: {
        status: 'paid',
      },
      create: {
        userId: user.id,
        groupId: group.id,
        role: 'member',
        status: 'paid',
      },
    })

    const botEvent = await tx.botEvent.create({
      data: {
        groupId: group.id,
        type: 'payment',
        message: `Correo demo enviado a ${user.email} para ${tool.name}. Token: ${accessToken}`,
      },
    })

    return { seat, payment, botEvent }
  })

  return NextResponse.json(
    {
      ok: true,
      message: `Pago de ${tool.name} registrado y correo demo enviado a ${user.email}.`,
      seat: result.seat,
      payment: result.payment,
      botEvent: result.botEvent,
      accessToken,
    },
    { status: 201 },
  )
}