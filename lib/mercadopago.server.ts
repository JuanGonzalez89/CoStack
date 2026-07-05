/**
 * Integración con Mercado Pago API
 * Escrow: autorización (capture: false) al reservar, captura al completar la sala, cancelación al expirar.
 */

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN

/**
 * Modo demo de pago.
 *
 * En modo TEST (token `TEST-...`) NO se mueve plata real: la "autorización" de
 * Mercado Pago es dinero de sandbox. Como el rail de pagos directos de la cuenta
 * de test está devolviendo internal_error (registro pendiente en el panel de MP),
 * en modo TEST simulamos la autorización para que el flujo completo (sala de
 * espera → provisioning → invite) funcione end-to-end para la demo.
 *
 * - Con un token real (`APP_USR-...`) esto se DESACTIVA solo → pagos reales.
 * - Se puede forzar con PAYMENT_DEMO_MODE = "true" | "false".
 */
const DEMO_PAYMENT_MODE =
  process.env.PAYMENT_DEMO_MODE === 'true' ||
  (process.env.PAYMENT_DEMO_MODE !== 'false' && !!MP_ACCESS_TOKEN?.startsWith('TEST-'))

const DEMO_REF_PREFIX = 'DEMO-'

export interface PaymentIntent {
  id: string
  status: 'authorized' | 'captured' | 'cancelled' | 'rejected'
  amount: number
}

/**
 * Paso 1: Autorización (Congelar Fondos)
 * Se llama cuando el usuario ingresa su tarjeta en el Checkout. No descuenta la plata al instante.
 */
export async function authorizePayment(userId: string, amount: number, cardToken: string, payerEmail?: string): Promise<PaymentIntent> {
  console.log(`[Mercado Pago] Solicitando AUTORIZACIÓN (Retención) por $${amount} USD para el usuario ${userId}`)

  // --- Modo demo (TEST): simular la autorización sin llegar a MP ---
  if (DEMO_PAYMENT_MODE) {
    const demoId = `${DEMO_REF_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    console.log(`[Mercado Pago] ⚙️  DEMO_PAYMENT_MODE activo — autorización simulada (${demoId}). No se llama a la API real (sandbox).`)
    return { id: demoId, status: 'authorized', amount }
  }


  // El MP_ACCESS_TOKEN es la llave maestra. Define EXACTAMENTE a qué cuenta bancaria/billetera
  // va a ir a parar la plata. Si ponés el token de la cuenta de "Juancito", la plata va a Juancito.
  // Es tu identificador único de comercio (Merchant ID).
  
  try {
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `auth_${userId}_${Date.now()}`
      },
      body: JSON.stringify({
        transaction_amount: amount,
        token: cardToken,
        description: "Reserva de cupo en CoStack (Escrow)",
        installments: 1,
        payer: { email: payerEmail ?? "estudiante@uade.edu.ar" },
        capture: false,
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return { id: String(data.id), status: data.status, amount }
  } catch (error) {
    console.error("[Mercado Pago] Error en autorización:", error)
    throw error
  }
}

/**
 * Paso 2: Captura (Descontar Fondos)
 * Se llama cuando la sala llega a 4/4. Mercado Pago transfiere la plata a la cuenta de CoStack.
 */
export async function capturePayment(paymentId: string, amount: number): Promise<boolean> {
  console.log(`[Mercado Pago] CAPTURANDO fondos del pago ${paymentId} por $${amount} USD. ¡Plata asegurada!`)

  // Pagos simulados (demo/TEST): no hay nada real que capturar.
  if (DEMO_PAYMENT_MODE || paymentId.startsWith(DEMO_REF_PREFIX)) {
    console.log(`[Mercado Pago] ⚙️  Captura simulada para ${paymentId} (demo).`)
    return true
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ capture: true }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    console.log(`[Mercado Pago] Pago ${paymentId} capturado exitosamente.`)
    return true
  } catch (error) {
    console.error("[Mercado Pago] Error en captura:", error)
    return false
  }
}

/**
 * Paso Alternativo: Cancelación (Reembolso)
 * Se llama si la sala expira (pasan 24hs) y no se llenó.
 */
export async function cancelAuthorization(paymentId: string): Promise<boolean> {
  console.log(`[Mercado Pago] CANCELANDO autorización ${paymentId}. Devolviendo límite a la tarjeta del usuario.`)

  // Pagos simulados (demo/TEST): no hay nada real que cancelar.
  if (DEMO_PAYMENT_MODE || paymentId.startsWith(DEMO_REF_PREFIX)) {
    console.log(`[Mercado Pago] ⚙️  Cancelación simulada para ${paymentId} (demo).`)
    return true
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'cancelled' }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    console.log(`[Mercado Pago] Pago ${paymentId} cancelado.`)
    return true
  } catch (error) {
    console.error("[Mercado Pago] Error en cancelación:", error)
    return false
  }
}
