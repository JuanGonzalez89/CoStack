import { z } from 'zod'

export const SESSION_COOKIE = 'costack_session'
export const SESSION_ROLE_COOKIE = 'costack_role'
export const SESSION_GROUP_COOKIE = 'costack_group'
export const SESSION_PAYMENT_COOKIE = 'costack_payment'

export const userRoleSchema = z.enum(['member', 'organizer'])
export const groupStateSchema = z.enum(['none', 'active'])
export const paymentStateSchema = z.enum(['current', 'overdue'])

export type UserRole = z.infer<typeof userRoleSchema>
export type GroupState = z.infer<typeof groupStateSchema>
export type PaymentState = z.infer<typeof paymentStateSchema>

export interface DemoSession {
  role: UserRole
  group: GroupState
  payment: PaymentState
}

const sessionSchema = z.object({
  role: userRoleSchema,
  group: groupStateSchema,
  payment: paymentStateSchema,
})

export function serializeDemoSession(session: DemoSession): string {
  return JSON.stringify(session)
}

export function parseDemoSession(value: string | undefined | null): DemoSession | null {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(value)
    const result = sessionSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}