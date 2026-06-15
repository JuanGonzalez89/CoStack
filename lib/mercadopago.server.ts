/**
 * Integración con Mercado Pago API (Custom Checkout)
 * Permite manejar la lógica de Escrow (Autorización y Captura) para el modelo de Crowdfunding.
 */

// NOTA: Para producción real, se necesita el ACCESS_TOKEN de Mercado Pago
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "TEST-mock-token-12345"

export interface PaymentIntent {
  id: string
  status: 'authorized' | 'captured' | 'cancelled' | 'rejected'
  amount: number
}

/**
 * Paso 1: Autorización (Congelar Fondos)
 * Se llama cuando el usuario ingresa su tarjeta en el Checkout. No descuenta la plata al instante.
 */
export async function authorizePayment(userId: string, amount: number, cardToken: string): Promise<PaymentIntent> {
  console.log(`[Mercado Pago] Solicitando AUTORIZACIÓN (Retención) por $${amount} USD para el usuario ${userId}`)
  
  // El MP_ACCESS_TOKEN es la llave maestra. Define EXACTAMENTE a qué cuenta bancaria/billetera
  // va a ir a parar la plata. Si ponés el token de la cuenta de "Juancito", la plata va a Juancito.
  // Es tu identificador único de comercio (Merchant ID).
  
  try {
    /* 
    Descomentar para usar la API Real de Mercado Pago:
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `auth_${userId}_${Date.now()}` // Evita cobros duplicados
      },
      body: JSON.stringify({
        transaction_amount: amount,
        token: cardToken, // El token seguro generado en el frontend por el SDK de Mercado Pago
        description: "Reserva de cupo en CoStack (Escrow)",
        installments: 1,
        payment_method_id: "visa",
        payer: { email: "estudiante@uade.edu.ar" },
        capture: false, // CLAVE FINTECH: true cobra al instante. false solo congela el saldo.
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return { id: data.id, status: data.status, amount }
    */

    // Simulación para entorno de desarrollo local (MVP sin tarjeta real)
    await new Promise(resolve => setTimeout(resolve, 800))

    return {
      id: `pay_${Math.random().toString(36).substring(2, 12)}`,
      status: 'authorized',
      amount
    }
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
  
  // En producción, esto es un PUT a https://api.mercadopago.com/v1/payments/{paymentId}
  // enviando el campo "capture": true
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return true
}

/**
 * Paso Alternativo: Cancelación (Reembolso)
 * Se llama si la sala expira (pasan 24hs) y no se llenó.
 */
export async function cancelAuthorization(paymentId: string): Promise<boolean> {
  console.log(`[Mercado Pago] CANCELANDO autorización ${paymentId}. Devolviendo límite a la tarjeta del usuario.`)
  await new Promise(resolve => setTimeout(resolve, 500))
  return true
}
