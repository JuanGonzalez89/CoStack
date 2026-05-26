import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  OPENCLAW_BOT_SECRET: z.string().min(32).optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().min(32).optional(),
  DATABASE_URL: z.string().url().optional(),
})

const parsedEnv = envSchema.safeParse(process.env)

export const env = parsedEnv.success ? parsedEnv.data : null

export function assertEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    throw new Error('Missing or invalid environment variables for CoStack.')
  }

  return result.data
}