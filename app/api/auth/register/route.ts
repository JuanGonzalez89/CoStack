import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Revisá el nombre, el email y la contraseña.' }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })

  if (existingUser) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese email.' }, { status: 409 })
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hash(parsed.data.password, 10),
    },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}