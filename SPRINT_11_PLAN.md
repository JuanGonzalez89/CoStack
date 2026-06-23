# SPRINT 11: Compra Grupal FinTech y Automatización de Acceso Contextual

## 1. Viabilidad Legal y Tecnológica (Arquitectura Final B2C)
Para que el MVP sea viable y defendible en Argentina/LATAM, la solución arquitectónica se basa en tres pilares fundamentales:

1.  **Escrow Local (Mercado Pago):** Utilizamos la API de Mercado Pago para retener fondos (Autorización) sin cobrarlos hasta que la sala se llene. Cuando se llena, capturamos el dinero.
2.  **Multi-Tenancy (Workspaces Aislados):** Para cumplir con la legalidad, NO compartimos credenciales. Usamos una "Cuenta Maestra" (ej. `admin@costack.la`) en herramientas como OpenAI/Figma y creamos Workspaces/Teams independientes para cada sala, garantizando privacidad total entre usuarios.
3.  **Bot de Automatización (Session Hijacking):** Para evadir los bloqueos de Cloudflare, usamos la arquitectura probada en `zimbio-automations`. Un humano autentica la cuenta maestra una vez, y el bot de Playwright reutiliza esa sesión persistente (`.auth`) para crear los equipos y extraer las licencias automáticamente de forma indetectable.

---

## 2. Definición del Modelo de Acceso (Categorización por Nicho)

Para evitar que a un diseñador se le dé una API Key que no entiende, vamos a implementar un sistema de **Modos de Entrega (`AccessMethod`)** a nivel base de datos y UI.

### Nuevos Estados en Base de Datos (Enum `AccessMethod`)
Cuando el Organizador crea una sala (o al definir la herramienta), debe indicar cómo se entregará el servicio:

1.  **`INVITATION_LINK` (Planes de Equipo / Colaboración):** Figma, Canva, Adobe, **ChatGPT Team**.
    *   *Cómo funciona:* Se entrega un link oficial para unirse al workspace del organizador. Esto elimina el riesgo de compartir contraseñas y cumple con los Términos de Servicio (TOS) porque se usan planes corporativos diseñados para esto.
2.  **`API_PROXY` (Para Programadores / Devs):** OpenAI API, GitHub Copilot.
    *   *Cómo funciona:* Se entrega un token en crudo (API Key) para integrar en el IDE o en el código.

### Modificación en UI de Auto-Match
El motor de emparejamiento automático debe adaptarse:
*   Al buscar herramientas de IA, el sistema le preguntará al usuario su perfil: *"¿Para uso web o para código?"*.
*   El usuario podrá elegir: *Mediante Invitación a Equipo (UI web)* o *Mediante API Key (Código)*. El Auto-Match solo lo emparejará con salas que ofrezcan ese mismo método.

---

## 3. Arquitectura del Flujo de Crowdfunding (Lobby + VCC)

El modelo cambia del "Cobro Directo" a un modelo de "Fideicomiso (Escrow) hasta completar sala".

### Fase 1: Creación y Espera (El Lobby)
*   El Organizador crea la sala (ej. 4 cupos para ChatGPT Plus a $20 total).
*   El Organizador paga su cuota ($6). En lugar de debitarle el dinero de inmediato, en Mercado Pago usamos la función de "Autorización" (`capture: false`) (Retención/Hold de fondos). La plata no se descuenta de su tarjeta, solo se "congela".
*   Entran 3 miembros. Cada uno pone su tarjeta. El sistema congela sus $6 correspondientes.

### Fase 2: Ejecución de la Compra Grupal (El Disparo)
*   La sala llega a 4/4.
*   El backend detecta que la sala está llena. 
*   **Paso A (Captura):** El backend llama a Mercado Pago y "Captura" todos los fondos congelados (ahora sí entra la plata a CoStack: $24 en total).
*   **Paso B (Emisión MVP):** Para validar el modelo sin fricción legal inicial, la compra se hace utilizando una tarjeta virtual corporativa de **Mercado Pago** gratuita asociada a nuestra cuenta. *(Nota: El paso a producción a gran escala global se detalla en el archivo `produccionglobal.md`)*.

### Fase 3: Automatización de Compra (El Bot de CoStack)
*   Se despacha un *Background Job* (cola de tareas).
*   **Inyección de Sesión:** El servidor lanza Playwright (Headless Browser) inyectando el perfil de Chrome previamente autenticado de nuestra Cuenta Maestra (Arquitectura `zimbio-automations`).
*   Al tener las cookies válidas, el bot saltea Cloudflare/CAPTCHAs y entra directo al Dashboard (ej. OpenAI Team).
*   Crea un nuevo Workspace/Equipo exclusivo para esta sala.
*   Paga el Workspace utilizando la Tarjeta Virtual Corporativa de Mercado Pago.
*   El sistema extrae el Enlace de Invitación Oficial (Team Invite) o la API Key y lo guarda en la base de datos de CoStack.

### Fase 4: Entrega Contextual al Usuario
*   Las pantallas de la "Billetera" y del "Lobby" se actualizan automáticamente en tiempo real.
*   Al entrar a su panel, el usuario recibe directamente el Enlace de Invitación Oficial (Figma/ChatGPT Team) o la API Key (Devs).
*   Misión cumplida: nadie adelantó $20, nadie se puede fugar con la plata y la experiencia es 100% legal y automática.

---

## Tareas a ejecutar en este Sprint:

- [x] Modificar el esquema de Prisma (`schema.prisma`) para eliminar `SHARED_CREDENTIALS` y dejar `INVITATION_LINK` / `API_PROXY`.
- [x] Refactorizar la UI del Detalle de Suscripción y Checkout para soportar Mercado Pago CardPayment y Filtros de Método de Acceso.
- [x] Diagramar el motor FinTech de Escrow (Autorización y Captura) con Mercado Pago (`lib/mercadopago.server.ts`).
- [x] Integrar el diseño arquitectónico de **Session Hijacking** para el bot de Playwright (basado en `zimbio-automations`).
- [x] **(Operativo)** Crear la "Master Account" de administrador (ej. `admin@costack.la`) en OpenAI/Figma y guardar el perfil de Chrome (.auth) para el worker.
- [x] **(Integración MP)** Generar credenciales reales en Mercado Pago Developers y actualizar `MP_ACCESS_TOKEN` y `NEXT_PUBLIC_MP_PUBLIC_KEY` en el archivo `.env`.
- [x] **(Master Account GitHub)** Crear cuenta GitHub + GitHub org + Personal Access Token para el bot.
- [x] **(MVP Pago)** Integración de pago real con tarjeta vía Mercado Pago Payments API (tokenización directa, sin Bricks).
- [x] **(Escrow completo)** `paymentRef` real guardado en DB, `capturePayment` y `cancelAuthorization` conectados a la API de MP.
- [x] **(Cron expiración)** Endpoint `/api/cron/expire-lobbies` para liberar fondos de salas vencidas.
- [ ] Preparar la presentación (Diapositivas) documentando:
      1. El modelo FinTech **"Autorización y Captura"** de Mercado Pago (Escrow Cero Riesgo).
      2. El aislamiento de licencias **"Multi-Tenancy"** (Workspaces independientes por sala).
      3. El patrón **"Master Account & Session Hijacking"** para evadir antibots (Cloudflare) legalmente.
- [ ] Unificar la automatización del bot en un solo agente (vs 15 scripts individuales).
- [ ] Conectar `inviteMemberToTeam` en `github-bot.server.ts` al flujo de lobby completado.

---

## Desviaciones del plan original

| Item | Plan original | Realidad |
|---|---|---|
| **Playwright Session Hijacking** | Bot con perfil Chrome autenticado vía `zimbio-automations` | Se implementó vía **GitHub PAT + Octokit API** (más simple, sin browser, sin CAPTCHA). Para herramientas que no sean GitHub, se usará el bot de Playwright más adelante. |
| **Mercado Pago Bricks (CardPayment)** | Integración con `@mercadopago/sdk-react` CardPayment brick | Se descartó por incompatibilidad con CSP y React DOM. Reemplazado por **tokenización directa** con `MercadoPago.createCardToken()` + Payments API. |
| **Checkout Pro (redirect)** | Se intentó como alternativa a Bricks | Se descartó porque `auto_return` requiere HTTPS público y el sandbox de MP no devolvía bien los query params al redirect. |
| **Presentación diapositivas** | Preparar slides del modelo FinTech | No se realizó. Pendiente. |

## Archivos creados/modificados en esta sesión

| Archivo | Cambio |
|---|---|
| `prisma/schema.prisma` | Agregado `paymentRef String?` a `LobbyMember` |
| `lib/env.ts` | Agregadas vars `MP_ACCESS_TOKEN`, `NEXT_PUBLIC_MP_PUBLIC_KEY`, `GITHUB_BOT_TOKEN`, `GITHUB_ORG_NAME` |
| `lib/mercadopago.server.ts` | `authorizePayment`, `capturePayment`, `cancelAuthorization` reales. Eliminado `createPreference` (Checkout Pro) |
| `lib/github-bot.server.ts` | **(Nuevo)** Octokit client: `createTeamForLobby`, `inviteMemberToTeam` |
| `lib/headless.server.ts` | Rewired para usar GitHub API en `INVITATION_LINK`, mock en `API_PROXY` |
| `proxy.ts` | **(Renombrado de `middleware.ts`)** CSP con dominios MP para el SDK |
| `app/api/checkout/pay/route.ts` | Acepta `cardToken` real, guarda `paymentRef` en `LobbyMember` |
| `app/api/checkout/preference/route.ts` | **(Eliminado)** Ya no se usa |
| `app/api/checkout/confirm/route.ts` | **(Nuevo)** Confirma lobby member post-redirect MP (legacy) |
| `app/api/lobby/[id]/route.ts` | Usa `paymentRef` real en capture, llama `cancelAuthorization` al expirar, crea notificaciones |
| `app/api/cron/expire-lobbies/route.ts` | **(Nuevo)** Endpoint GET para expirar salas stale + liberar fondos |
| `app/api/webhooks/mercadopago/route.ts` | Webhook para eventos de pago MP |
| `components/dashboard/checkout-view.tsx` | Card form con tokenización directa vía MP SDK, layout mejorado |
| `app/(dashboard)/suscripciones/success/page.tsx` | Maneja redirect de MP con confirmación de pago |

## Datos de prueba

- **Tarjeta:** `5031 7557 3453 0604` (Mastercard) / `4235 6477 2802 5682` (Visa)
- **CVV:** `123`
- **Vencimiento:** fecha futura (ej. `12/28`)
- **Titular:** `APRO`
- **Documento:** DNI `12345678`
