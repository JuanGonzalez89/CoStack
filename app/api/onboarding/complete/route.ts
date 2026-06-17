import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function createInviteCode() {
  return `COSTACK-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const groupName = typeof body?.groupName === 'string' ? body.groupName.trim() : ''
  const inviteCode = typeof body?.inviteCode === 'string' ? body.inviteCode.trim() : ''
  const role = body?.role === 'organizer' ? 'organizer' : 'member'

  // BYPASS EN DESARROLLO: permitir onboarding sin BD
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json({ ok: true, groupId: 'dev-group-123' }, { status: 201 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const existingGroup = inviteCode
    ? await prisma.group.findUnique({ where: { inviteCode } })
    : null

  const group = existingGroup ?? (groupName
    ? await prisma.group.create({
        data: {
          name: groupName,
          inviteCode: createInviteCode(),
        },
      })
    : null)

  if (!group) {
    return NextResponse.json({ error: 'Missing group data' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role },
  })

  await prisma.membership.upsert({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId: group.id,
      },
    },
    update: { role },
    create: {
      userId: user.id,
      groupId: group.id,
      role,
    },
  })

  return NextResponse.json({ ok: true, groupId: group.id })
}