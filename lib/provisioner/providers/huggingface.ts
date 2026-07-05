import type { ProvisionResult, ProvisionerProvider } from '../types'
import { sendInviteLinkEmail } from '@/lib/mail.server'

/**
 * HuggingFaceInviteProvider — Provisioning de Hugging Face vía link de unión a la organización.
 *
 * En vez de automatizar la invitación con Playwright (que solo corre en local/headed y
 * no funciona en Vercel ni en el worker headless), se usa el link público de la
 * organización 'CoStack-1', que tiene activadas las opciones:
 *   [x] Allow requests to join
 *   [x] Automatically approve join requests
 *
 * Con esa configuración, cualquier usuario que abra la URL se une al instante con un
 * click — no hace falta enviar invitaciones una por una ni tocar el DOM.
 *
 * Env vars:
 *   HUGGINGFACE_ORG_URL — URL de la organización (default: https://huggingface.co/CoStack-1)
 */

const HUGGINGFACE_SLUGS = ['huggingface', 'huggingchat', 'ia']
const DEFAULT_ORG_URL = 'https://huggingface.co/CoStack-1'

export class HuggingFaceInviteProvider implements ProvisionerProvider {
  name = 'Hugging Face Join Link'

  canHandle(toolSlug: string): boolean {
    return HUGGINGFACE_SLUGS.includes(toolSlug)
  }

  async fulfill(
    _lobbyId: string,
    _toolName: string,
    members: { email: string; userId: string }[],
  ): Promise<ProvisionResult> {
    const orgUrl = process.env.HUGGINGFACE_ORG_URL || DEFAULT_ORG_URL

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
