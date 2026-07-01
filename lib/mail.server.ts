import { Resend } from 'resend'

/**
 * Servicio genérico de envío de emails para CoStack.
 *
 * Usa Resend (https://resend.com) como provider.
 * Env var requerida: RESEND_API_KEY
 *
 * El remitente está centralizado en EMAIL_FROM para poder
 * cambiarlo fácilmente al verificar un dominio propio.
 */

// ─── Configuración ──────────────────────────────────────────────
// Cambiar esto cuando se verifique un dominio propio en Resend
// (ej: 'CoStack <no-reply@costack.dev>')
const EMAIL_FROM = 'CoStack <onboarding@resend.dev>'

// ─── Cliente ────────────────────────────────────────────────────
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('[Mail] RESEND_API_KEY no configurada')
  }
  return new Resend(apiKey)
}

// ─── Funciones de envío ─────────────────────────────────────────

/**
 * Envía un email de invitación con un link para unirse al equipo de una herramienta.
 *
 * Diseñado para ser reutilizable: funciona con Canva, ChatGPT, Hugging Face,
 * o cualquier herramienta que use el patrón de invite link.
 *
 * @param to        - Email del destinatario
 * @param toolName  - Nombre de la herramienta (ej: "Canva", "ChatGPT")
 * @param inviteLink - URL del link de invitación
 */
export async function sendInviteLinkEmail(
  to: string,
  toolName: string,
  inviteLink: string,
): Promise<void> {
  const resend = getResendClient()

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Sumate al equipo de ${toolName} de CoStack`,
    html: buildInviteEmailHtml(toolName, inviteLink),
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }
}

// ─── Templates ──────────────────────────────────────────────────

function buildInviteEmailHtml(toolName: string, inviteLink: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 32px 24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                🎉 ¡Tu acceso a ${toolName} está listo!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
                ¡Hola! Tu grupo de compra en <strong>CoStack</strong> se completó exitosamente.
              </p>
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Hacé click en el botón de abajo para unirte al equipo de <strong>${toolName}</strong>:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${inviteLink}"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;">
                      Unirme al equipo de ${toolName}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.5;">
                <strong>¿Qué hacer?</strong>
              </p>
              <ol style="margin:0 0 24px;padding-left:20px;color:#6b7280;font-size:13px;line-height:1.8;">
                <li>Hacé click en el botón de arriba</li>
                <li>Iniciá sesión con tu cuenta de ${toolName} (o creá una si no tenés)</li>
                <li>Aceptá la invitación al equipo</li>
                <li>¡Listo! Ya podés usar ${toolName} con tu licencia compartida</li>
              </ol>

              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
                Si el botón no funciona, copiá y pegá este link en tu navegador:<br />
                <a href="${inviteLink}" style="color:#6366f1;word-break:break-all;">${inviteLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                Este email fue enviado por CoStack. Si no esperabas este mensaje, podés ignorarlo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
