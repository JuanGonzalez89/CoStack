import type { ProvisionResult, ProvisionerProvider } from '../types'
import { sendInviteLinkEmail } from '@/lib/mail.server'

/**
 * NotionInviteLinkProvider — Provisioning de Notion via link de invitación al workspace.
 *
 * Notion tiene una feature nativa de invite link reutilizable para workspaces
 * (Settings → Members → Invite link), soportada oficialmente por la plataforma.
 * A diferencia de Canva, no hace falta ningún workaround: no hay anti-bot que
 * bloquee este mecanismo porque es el flujo de invitación estándar de Notion.
 *
 * Env vars requeridas:
 *   NOTION_INVITE_LINK           — URL del link de invitación al workspace
 *   NOTION_INVITE_LINK_GENERATED_AT — Fecha en que se generó el link (YYYY-MM-DD)
 *
 * El link de Notion no expira por sí solo, pero se mantiene la misma validación
 * de antigüedad que Canva por si el workspace lo desactiva/regenera manualmente
 * (ej: al remover a alguien y querer invalidar el link anterior).
 */

const NOTION_SLUGS = ['notion']
const LINK_VALIDITY_DAYS = 30
const EXPIRY_WARNING_DAYS = 5

export class NotionInviteLinkProvider implements ProvisionerProvider {
  name = 'Notion Invite Link'

  canHandle(toolSlug: string): boolean {
    return NOTION_SLUGS.includes(toolSlug)
  }

  async fulfill(
    lobbyId: string,
    _toolName: string,
    members: { email: string; userId: string }[],
  ): Promise<ProvisionResult> {
    const inviteLink = process.env.NOTION_INVITE_LINK
    const generatedAtRaw = process.env.NOTION_INVITE_LINK_GENERATED_AT

    // --- Validar que las env vars existan ---
    if (!inviteLink || !generatedAtRaw) {
      console.error('[NotionProvider] NOTION_INVITE_LINK o NOTION_INVITE_LINK_GENERATED_AT no configuradas')
      return {
        status: 'failed',
        accessToken: null,
        providerName: this.name,
        inviteUrl: null,
        errors: ['NOTION_INVITE_LINK o NOTION_INVITE_LINK_GENERATED_AT no configuradas'],
      }
    }

    // --- Calcular expiración ---
    const generatedAt = new Date(generatedAtRaw)
    if (isNaN(generatedAt.getTime())) {
      console.error('[NotionProvider] NOTION_INVITE_LINK_GENERATED_AT no es una fecha válida:', generatedAtRaw)
      return {
        status: 'failed',
        accessToken: null,
        providerName: this.name,
        inviteUrl: null,
        errors: [`NOTION_INVITE_LINK_GENERATED_AT no es una fecha válida: ${generatedAtRaw}`],
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
        `[NotionProvider] ❌ Link de invitación VENCIDO. Generado: ${generatedAtRaw}, expiró: ${expiresAt.toISOString().split('T')[0]}. ` +
        `Regenerar manualmente en Notion Settings > Members > Invite link y actualizar NOTION_INVITE_LINK + NOTION_INVITE_LINK_GENERATED_AT en Vercel.`
      )
      return {
        status: 'failed',
        accessToken: null,
        providerName: this.name,
        inviteUrl: null,
        errors: [
          'notion_link_expired',
          `Link generado el ${generatedAtRaw} expiró el ${expiresAt.toISOString().split('T')[0]}. Regenerar en Notion Settings > Members.`,
        ],
      }
    }

    // --- Link próximo a vencer ---
    if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) {
      console.warn(
        `[NotionProvider] ⚠️  Link de invitación próximo a vencer. Faltan ${Math.ceil(daysUntilExpiry)} días ` +
        `(expira ${expiresAt.toISOString().split('T')[0]}). Regenerar pronto en Notion Settings > Members.`
      )
    } else {
      console.log(`[NotionProvider] ✅ Link vigente. Faltan ${Math.ceil(daysUntilExpiry)} días para expirar.`)
    }

    // --- Enviar email con el link a cada miembro (best-effort) ---
    // Si el servicio de email no está configurado o falla, el provisioning
    // sigue exitoso — el link se muestra en la UI del lobby como accessToken.
    const emailErrors: string[] = []

    if (process.env.RESEND_API_KEY) {
      for (const member of members) {
        if (!member.email) continue
        try {
          await sendInviteLinkEmail(member.email, 'Notion', inviteLink)
          // Log de auditoría: quién recibió el link de invitación y en qué sala.
          // Mitiga el riesgo de reenvío no autorizado del link compartido —
          // permite rastrear a quién se le envió si aparece un miembro no pagador.
          console.log(`[NotionProvider] ✅ Email enviado a ${member.email} (lobby=${lobbyId}, userId=${member.userId})`)
        } catch (err) {
          const msg = `Error enviando email a ${member.email}: ${(err as Error).message}`
          console.warn(`[NotionProvider] ⚠️  ${msg}`)
          emailErrors.push(msg)
        }
      }
    } else {
      console.warn('[NotionProvider] ⚠️  RESEND_API_KEY no configurada — emails no enviados. El link se mostrará en la UI.')
    }

    if (emailErrors.length > 0) {
      console.warn(`[NotionProvider] ⚠️  ${emailErrors.length} email(s) fallaron, pero el link sigue disponible en la UI.`)
    }

    return {
      status: 'success',
      accessToken: inviteLink,
      providerName: this.name,
      inviteUrl: inviteLink,
      errors: emailErrors,
    }
  }
}
