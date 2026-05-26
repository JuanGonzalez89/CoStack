import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const groupSchema = z.object({
  name: z.string().trim().min(2),
  inviteCode: z.string().trim().min(4),
})

export async function GET() {
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      members: true,
      seats: true,
    },
    take: 20,
  })

  return NextResponse.json({ groups })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = groupSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid group payload' }, { status: 400 })
  }

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      inviteCode: parsed.data.inviteCode,
    },
  })

  return NextResponse.json({ group }, { status: 201 })
}