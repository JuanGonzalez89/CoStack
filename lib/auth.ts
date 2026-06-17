import Credentials from 'next-auth/providers/credentials'
import type { AuthOptions } from 'next-auth'
import { compare, hash } from 'bcryptjs'
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
        name: { label: 'Name', type: 'text' },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials)

        if (!parsed.success) {
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('[auth] credentials parse failed:', rawCredentials)
          }
          return null
        }

        // BYPASS EN DESARROLLO: permitir cualquier credencial
        if (process.env.NODE_ENV !== 'production') {
          return {
            id: `dev-${parsed.data.email}`,
            email: parsed.data.email,
            name: parsed.data.name || parsed.data.email,
            image: null,
            emailVerified: null,
            role: 'member',
            createdAt: new Date(),
            updatedAt: new Date(),
            passwordHash: null,
          }
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (existingUser?.passwordHash) {
          const passwordMatches = await compare(parsed.data.password, existingUser.passwordHash)

          if (!passwordMatches) {
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.warn('[auth] password mismatch for', parsed.data.email)
            }
            return null
          }

          return existingUser
        }

        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn('[auth] no matching user for', parsed.data.email)
        }

        return null
      },
    }),
  ],
} satisfies AuthOptions
