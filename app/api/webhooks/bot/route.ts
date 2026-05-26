import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const botEventSchema = z.object({
  groupId: z.string().min(1),
  type: z.string().min(1),
  message: z.string().min(1),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = botEventSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid bot payload' }, { status: 400 })
  }

  const event = await prisma.botEvent.create({
    data: parsed.data,
  })

  return NextResponse.json({ event }, { status: 201 })
}