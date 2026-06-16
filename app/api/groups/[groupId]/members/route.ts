import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const memberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['member', 'organizer']).default('member'),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params
  const body = await request.json().catch(() => null)
  const parsed = memberSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid member payload' }, { status: 400 })
  }

  const membership = await prisma.membership.upsert({
    where: {
      userId_groupId: {
        userId: parsed.data.userId,
        groupId: groupId,
      },
    },
    update: {
      role: parsed.data.role,
    },
    create: {
      userId: parsed.data.userId,
      groupId: groupId,
      role: parsed.data.role,
    },
  })

  return NextResponse.json({ membership }, { status: 201 })
}