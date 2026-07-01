import type { ProvisionResult, ProvisionerProvider } from '../types'
import { sendInviteLinkEmail } from '@/lib/mail.server'

/**
 * CanvaInviteLinkProvider — Provisioning de Canva via link de invitación al equipo.
 *
 * En vez de automatizar la invitación por email en la UI de Canva (bloqueado por
 * anti-bot PerimeterX/HUMAN), se usa un link de invitación reusable generado
 * manualmente desde Canva Settings > People.
 *
 * Env vars requeridas:
 *   CANVA_INVITE_LINK           — URL del link de invitación (ej: https://www.canva.com/brand/join?token=XXX&referrer=team-invite)
 *   CANVA_INVITE_LINK_GENERATED_AT — Fecha en que se generó el link (YYYY-MM-DD)
 *
 * ⚠️  IMPORTANTE: Este link expira a los 30 días de generado. Debe regenerarse
 *     manualmente cada ~25 días entrando a Canva con la cuenta master
 *     (costack.dev.bot@gmail.com), yendo a Settings > People > generar nuevo link
 *     de invitación al equipo, y actualizando ambas env vars en Vercel.
 */

const CANVA_SLUGS = ['canva', 'canva-pro', 'diseno']
const LINK_VALIDITY_DAYS = 30
const EXPIRY_WARNING_DAYS = 5

export class CanvaInviteLinkProvider implements ProvisionerProvider {
  name = 'Canva Invite Link'

  canHandle(toolSlug: string): boolean {
    return CANVA_SLUGS.includes(toolSlug)
  }

  async fulfill(
    _lobbyId: string,
    _toolName: string,
    members: { email: string; userId: string }[],
  ): Promise<ProvisionResult> {
    const inviteLink = process.env.CANVA_INVITE_LINK
    const generatedAtRaw = process.env.CANVA_INVITE_LINK_GENERATED_AT

    // --- Validar que las env vars existan ---
    if (!inviteLink || !generatedAtRaw) {
      console.error('[CanvaProvider] CANVA_INVITE_LINK o CANVA_INVITE_LINK_GENERATED_AT no configuradas')
      return {
        status: 'failed',
        accessToken: null,
        providerName: this.name,
        inviteUrl: null,
        errors: ['CANVA_INVITE_LINK o CANVA_INVITE_LINK_GENERATED_AT no configuradas'],
      }
    }

    // --- Calcular expiración ---
    const generatedAt = new Date(generatedAtRaw)
    if (isNaN(generatedAt.getTime())) {
      console.error('[CanvaProvider] CANVA_INVITE_LINK_GENERATED_AT no es una fecha válida:', generatedAtRaw)
      return {
        status: 'failed',
        accessToken: null,
        providerName: this.name,
        inviteUrl: null,
        errors: [`CANVA_INVITE_LINK_GENERATED_AT no es una fecha válida: ${generatedAtRaw}`],
      }
    }

    const now = new Date()
    const expiresAt = new Date(generatedAt)
    expiresAt.setDate(expiresAt.getDate() + LINK_VALIDITY_DAYS)

    const msUntilExpiry = expiresAt.getTime() - now.getTime()
    const daysUntilExpiry = msUntilExpiry / (1000 * 60 * 60 * 24)

    // --- Link vencido ---
    if (daysUntilExpiry <= 0) {
      console.error(
        `[CanvaProvider] ❌ Link de invitación VENCIDO. Generado: ${generatedAtRaw}, expiró: ${expiresAt.toISOString().split('T')[0]}. ` +
        `Regenerar manualmente en Canva Settings > People y actualizar CANVA_INVITE_LINK + CANVA_INVITE_LINK_GENERATED_AT en Vercel.`
      )
      return {
        status: 'failed',
        accessToken: null,
        providerName: this.name,
        inviteUrl: null,
        errors: [
          'canva_link_expired',
          `Link generado el ${generatedAtRaw} expiró el ${expiresAt.toISOString().split('T')[0]}. Regenerar en Canva Settings > People.`,
        ],
      }
    }

    // --- Link próximo a vencer ---
    if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) {
      console.warn(
        `[CanvaProvider] ⚠️  Link de invitación próximo a vencer. Faltan ${Math.ceil(daysUntilExpiry)} días ` +
        `(expira ${expiresAt.toISOString().split('T')[0]}). Regenerar pronto en Canva Settings > People.`
      )
    } else {
      console.log(`[CanvaProvider] ✅ Link vigente. Faltan ${Math.ceil(daysUntilExpiry)} días para expirar.`)
    }

    // --- Enviar email con el link a cada miembro ---
    const emailErrors: string[] = []

    for (const member of members) {
      if (!member.email) continue
      try {
        await sendInviteLinkEmail(member.email, 'Canva', inviteLink)
        console.log(`[CanvaProvider] Email enviado a ${member.email}`)
      } catch (err) {
        const msg = `Error enviando email a ${member.email}: ${(err as Error).message}`
        console.error(`[CanvaProvider] ${msg}`)
        emailErrors.push(msg)
      }
    }

    if (emailErrors.length === members.filter(m => m.email).length) {
      // Todos los emails fallaron
      return {
        status: 'failed',
        accessToken: null,
        providerName: this.name,
        inviteUrl: inviteLink,
        errors: emailErrors,
      }
    }

    return {
      status: emailErrors.length > 0 ? 'partial' : 'success',
      accessToken: inviteLink,
      providerName: this.name,
      inviteUrl: inviteLink,
      errors: emailErrors,
    }
  }
}
