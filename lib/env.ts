import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  OPENCLAW_BOT_SECRET: z.string().min(32).optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().min(32).optional(),
  DATABASE_URL: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.string().min(10).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(10).optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  MP_ACCESS_TOKEN: z.string().min(10).optional(),
  NEXT_PUBLIC_MP_PUBLIC_KEY: z.string().min(10).optional(),
  // "true"/"false" para forzar; si no se setea, se activa solo en modo TEST
  PAYMENT_DEMO_MODE: z.enum(['true', 'false']).optional(),
  GITHUB_BOT_TOKEN: z.string().min(10).optional(),
  GITHUB_ORG_NAME: z.string().min(1).optional(),
  // Canva invite link (ver README para instrucciones de regeneración)
  CANVA_INVITE_LINK: z.string().url().optional(),
  CANVA_INVITE_LINK_GENERATED_AT: z.string().optional(),
  // Hugging Face — URL de la organización con auto-approve de join
  HUGGINGFACE_ORG_URL: z.string().url().optional(),
  // Email (Resend)
  RESEND_API_KEY: z.string().min(1).optional(),
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