import type { ProvisionResult, ProvisionerProvider } from '../types'
import { inviteMemberToOrg } from '@/lib/sentry-bot.server'

/**
 * SentryProvider — Provisioning de Sentry vía invitación individual por API oficial.
 *
 * A diferencia de Canva/Notion/Hugging Face (link de invitación reutilizable),
 * Sentry no tiene un link público para sumarse a una organización sin aprobación.
 * En cambio, expone una API oficial de invitación por email
 * (POST /organizations/{org}/members/) — cada miembro recibe su propia invitación
 * y Sentry le manda el email directamente (no usamos Resend acá).
 *
 * Esto es más seguro que el patrón de link compartido: no hay nada descubrible
 * públicamente, cada invitación está atada a un email específico.
 *
 * Env vars requeridas:
 *   SENTRY_API_TOKEN    — Personal Token con scope Member (read/write) + Organization (read)
 *   SENTRY_ORG_SLUG      — slug de la organización (ej: costack-fc)
 *   SENTRY_API_BASE_URL  — opcional, default https://sentry.io (usar https://de.sentry.io si la org está en la región EU)
 *
 * Nota de negocio: la demo corre sobre el trial gratuito de 14 días (Business plan
 * features, sin tarjeta). El modelo real a futuro es comprar el plan Team anual
 * ($26/mes vs $29/mes facturación mensual, ~10% de ahorro real) y trasladar ese
 * ahorro a los miembros — mismo mecanismo que Canva y Notion.
 */

const SENTRY_SLUGS = ['sentry']

export class SentryProvider implements ProvisionerProvider {
  name = 'Sentry Org Invite'

  canHandle(toolSlug: string): boolean {
    return SENTRY_SLUGS.includes(toolSlug)
  }

  async fulfill(
    lobbyId: string,
    _toolName: string,
    members: { email: string; userId: string }[],
  ): Promise<ProvisionResult> {
    if (!process.env.SENTRY_API_TOKEN || !process.env.SENTRY_ORG_SLUG) {
      console.error('[SentryProvider] SENTRY_API_TOKEN o SENTRY_ORG_SLUG no configuradas')
      return {
        status: 'failed',
        accessToken: null,
        providerName: this.name,
        inviteUrl: null,
        errors: ['SENTRY_API_TOKEN o SENTRY_ORG_SLUG no configuradas'],
      }
    }

    const errors: string[] = []
    let invitedCount = 0

    for (const member of members) {
      if (!member.email) continue
      const result = await inviteMemberToOrg(member.email)
      if (result.success) {
        invitedCount++
        console.log(`[SentryProvider] ✅ Invitación enviada a ${member.email} (lobby=${lobbyId})`)
      } else {
        const msg = `Error invitando a ${member.email}: ${result.error}`
        console.warn(`[SentryProvider] ⚠️  ${msg}`)
        errors.push(msg)
      }
    }

    if (invitedCount === 0) {
      return {
        status: 'failed',
        accessToken: null,
        providerName: this.name,
        inviteUrl: null,
        errors: errors.length > 0 ? errors : ['No se pudo invitar a ningún miembro'],
      }
    }

    const org = process.env.SENTRY_ORG_SLUG
    const orgUrl = `${process.env.SENTRY_API_BASE_URL || 'https://sentry.io'}/organizations/${org}/`

    return {
      status: errors.length > 0 ? 'partial' : 'success',
      accessToken: orgUrl,
      providerName: this.name,
      inviteUrl: orgUrl,
      errors,
    }
  }
}
