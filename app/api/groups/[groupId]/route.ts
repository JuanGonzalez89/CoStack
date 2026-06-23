import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { groupId: string } }) {
  const group = await prisma.group.findUnique({
    where: { id: params.groupId },
    include: {
      members: {
        include: { user: true },
      },
      seats: {
        include: { tool: true },
      },
      payments: true,
      botEvents: true,
    },
  })

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  return NextResponse.json({ group })
}