import Credentials from 'next-auth/providers/credentials'
import type { AuthOptions } from 'next-auth'
import { compare } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().trim().min(2).optional(),
})

export const authOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials)

        if (!parsed.success) {
          return null
        }

        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: parsed.data.email },
            select: { id: true, email: true, name: true, passwordHash: true, role: true },
          })

          if (!existingUser || !existingUser.passwordHash) {
            return null
          }

          const passwordMatches = await compare(parsed.data.password, existingUser.passwordHash)

          if (!passwordMatches) {
            return null
          }

          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string
      }
      return session
    },
  },
} satisfies AuthOptions
