import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCipheriv, randomBytes } from 'crypto'

function encrypt(text: string) {
  const algo = 'aes-256-cbc'
  const keyStr = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef'
  const key = Buffer.from(keyStr.slice(0, 32), 'utf-8')
  const iv = randomBytes(16)
  const cipher = createCipheriv(algo, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { toolId, username, password, price } = await request.json()

    if (!toolId || !username || !password || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Para la demo, obtenemos el primer grupo o creamos uno "fake" para el share
    let group = await prisma.group.findFirst({
      where: { members: { some: { userId: user.id, role: 'organizer' } } }
    })

    if (!group) {
      group = await prisma.group.create({
        data: {
          name: 'Mi Espacio Compartido',
          inviteCode: `COSTACK-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
        }
      })

      await prisma.membership.create({
        data: {
          userId: user.id,
          groupId: group.id,
          role: 'organizer'
        }
      })
    }

    // Guardamos la contraseña encriptada
    const encryptedPassword = encrypt(password)

    await prisma.toolSubscription.create({
      data: {
        groupId: group.id,
        toolId: toolId,
        sharedPasswordEncrypted: encryptedPassword
      }
    })

    // Creamos asientos (demo)
    await prisma.seat.create({
      data: {
        groupId: group.id,
        toolId: toolId,
        assigneeId: user.id,
        status: 'assigned',
        accessToken: `COSTACK-ORG-${crypto.randomUUID().slice(0, 4)}`
      }
    })

    await prisma.seat.create({
      data: {
        groupId: group.id,
        toolId: toolId,
        status: 'free'
      }
    })

    return NextResponse.json({ success: true, groupId: group.id })
  } catch (error) {
    console.error('Error sharing tool:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
