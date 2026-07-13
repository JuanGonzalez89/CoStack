import type { ProvisionResult, ProvisionerProvider } from '../types'
import { sendInviteLinkEmail } from '@/lib/mail.server'

/**
 * HuggingFaceInviteProvider — Provisioning de Hugging Face vía invite link privado de la organización.
 *
 * Mismo patrón que Canva/Notion: un link de invitación reutilizable, generado desde
 * Organization Settings > Members > "Enable inviting users by sharing a link".
 *
 * ⚠️  NO usar la página pública de la organización con "Allow requests to join from
 * the organization page" + "Automatically approve join requests" — esa combinación
 * es descubrible por cualquier usuario de Hugging Face (la página del org es pública
 * e indexable), no solo por quien recibe el email. El invite link privado, en cambio,
 * solo lo conoce quien lo recibió por email, igual que el patrón de Canva/Notion.
 *
 * Env vars:
 *   HUGGINGFACE_ORG_URL — invite link privado de la organización
 *     (Organization Settings > Members > Join settings > "Enable inviting users by
 *     sharing a link" > Copy link). Ejemplo: https://huggingface.co/organizations/{org}/share/{token}
 */

const HUGGINGFACE_SLUGS = ['huggingface', 'huggingchat', 'ia']
const DEFAULT_INVITE_URL = 'https://huggingface.co/CoStack-1'

export class HuggingFaceInviteProvider implements ProvisionerProvider {
  name = 'Hugging Face Invite Link'

  canHandle(toolSlug: string): boolean {
    return HUGGINGFACE_SLUGS.includes(toolSlug)
  }

  async fulfill(
    _lobbyId: string,
    _toolName: string,
    members: { email: string; userId: string }[],
  ): Promise<ProvisionResult> {
    const orgUrl = process.env.HUGGINGFACE_ORG_URL || DEFAULT_INVITE_URL

    // --- Enviar email con el link a cada miembro (best-effort) ---
    // Si Resend no está configurado o falla, el provisioning sigue exitoso:
    // el link se muestra en la UI del lobby como accessToken.
    const emailErrors: string[] = []

    if (process.env.RESEND_API_KEY) {
      for (const member of members) {
        if (!member.email) continue
        try {
          await sendInviteLinkEmail(member.email, 'Hugging Face', orgUrl)
          console.log(`[HuggingFaceProvider] ✅ Email enviado a ${member.email}`)
        } catch (err) {
          const msg = `Error enviando email a ${member.email}: ${(err as Error).message}`
          console.warn(`[HuggingFaceProvider] ⚠️  ${msg}`)
          emailErrors.push(msg)
        }
      }
    } else {
      console.warn('[HuggingFaceProvider] ⚠️  RESEND_API_KEY no configurada — emails no enviados. El link se mostrará en la UI.')
    }

    if (emailErrors.length > 0) {
      console.warn(`[HuggingFaceProvider] ⚠️  ${emailErrors.length} email(s) fallaron, pero el link sigue disponible en la UI.`)
    }

    console.log(`[HuggingFaceProvider] ✅ Provisioning listo. Link de unión: ${orgUrl}`)

    return {
      status: 'success',
      accessToken: orgUrl,
      providerName: this.name,
      inviteUrl: orgUrl,
      errors: emailErrors,
    }
  }
}
