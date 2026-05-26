import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare, hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().trim().min(2).optional(),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials)

        if (!parsed.success) {
          return null
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (existingUser?.passwordHash) {
          const passwordMatches = await compare(parsed.data.password, existingUser.passwordHash)

          if (!passwordMatches) {
            return null
          }

          return existingUser
        }

        if (parsed.data.name) {
          const createdUser = await prisma.user.create({
            data: {
              name: parsed.data.name,
              email: parsed.data.email,
              passwordHash: await hash(parsed.data.password, 10),
            },
          })

          return createdUser
        }

        return null
      },
    }),
  ],
})