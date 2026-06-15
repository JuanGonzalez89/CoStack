# Guía Definitiva: Conexión Real con Mercado Pago

Para que la plata que pagan los usuarios llegue **directamente a tu cuenta de Mercado Pago** (y a tu CVU), tenés que vincular tu cuenta personal/corporativa con el código que armamos. Acá está el plan exacto y completo de lo que falta para que deje de ser un simulador y sea 100% real.

## 1. Obtener tus Credenciales (El puente a tu CVU)
Actualmente en el archivo `.env` pusimos un token de prueba. Para que la plata te llegue a vos, tenés que generar tus propias llaves:

1. Entrá a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app).
2. Iniciá sesión con tu cuenta de Mercado Pago (la cuenta donde querés recibir la plata).
3. Hacé clic en **"Crear Aplicación"**.
4. En el menú de la izquierda, andá a **"Credenciales de Producción"** (o de Prueba si querés testear sin gastar plata real).
5. Ahí vas a ver dos claves fundamentales:
   *   `PUBLIC_KEY`: Se usa en el Frontend (React).
   *   `ACCESS_TOKEN`: Se usa en el Backend (Next.js).

6. Vas a tu archivo `.env` en CoStack y las pegás:
```env
NEXT_PUBLIC_MP_PUBLIC_KEY="APP_USR-tu-clave-publica..."
MP_ACCESS_TOKEN="APP_USR-tu-access-token-privado..."
```
*(Nota: Nunca subas el ACCESS_TOKEN a GitHub, por eso está en el `.env`).*

## 2. Lo que falta en el Frontend (Tokenización Segura)
En este momento, la pantalla `checkout-view.tsx` tiene un botón que simula el pago. Para que sea legal y cumpla con las normas PCI (seguridad de tarjetas), nosotros **nunca** tocamos los números de la tarjeta.
Falta implementar el **CardForm** (SDK de MercadoPago.js):

1. El usuario tipea su tarjeta en un formulario provisto por Mercado Pago.
2. El SDK de MP encripta la tarjeta y te devuelve un `card_token` seguro.
3. Tu botón de "Pagar" agarra ese `card_token` y se lo manda a nuestro backend (`/api/checkout/pay`).

## 3. Lo que falta en el Backend (El cobro real)
En nuestro archivo `lib/mercadopago.server.ts` ya dejé el código comentado para hacer el cobro real.
Cuando nuestro backend recibe el `card_token` del Frontend, usa tu `MP_ACCESS_TOKEN` para hacer un POST a la API de Mercado Pago.
*   Al usar **TU** Access Token, Mercado Pago sabe instantáneamente que la plata tiene que ir a **TU** billetera.

## 4. Configurar Webhooks (Notificaciones)
Falta crear un endpoint (`app/api/webhooks/mercadopago/route.ts`). 
En el panel de Mercado Pago, le vas a decir: *"Che, cuando se apruebe un pago, avisame a esta URL: https://costack.la/api/webhooks/mercadopago"*.
Así, nuestro sistema sabe en tiempo real si una tarjeta rebotó por falta de fondos o si el pago pasó con éxito.

---
**Resumen del Flujo Real:**
1. El usuario pone su tarjeta -> MP devuelve un Token Seguro.
2. CoStack Backend recibe el Token Seguro y le pega a la API de MP usando TU `MP_ACCESS_TOKEN`.
3. MP congela la plata (`capture: false`).
4. Cuando la sala se llena, CoStack le dice a MP: "Capturá la plata".
5. **Mercado Pago transfiere los fondos a tu CVU de forma automática y cobra su comisión.**
