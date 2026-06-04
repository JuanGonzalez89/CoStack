# Sprint 9: El Motor Transaccional (De UI a Producto Real)

Con la interfaz (UI/UX) cerrada y testeada para cubrir absolutamente todos los escenarios de Organizadores y Miembros, el objetivo del **Sprint 9** es "des-mockear" el sistema. 

Pasaremos de un prototipo interactivo a una plataforma 100% funcional. Las siguientes implementaciones de backend, bases de datos y pasarelas de pago son el requisito final para lanzar al mercado.

---

## 1. Integración de Base de Datos (Prisma)

El esquema de la base de datos necesita ampliarse para soportar los flujos complejos que construimos en el Dashboard:

* **Roles y Permisos:**
  Asegurar la validación de servidor (Server Actions) de `isOrganizer` verificando directamente `prisma.user.role`.
* **Soporte `isBusiness` y Modales de Herramientas:**
  Modificar el modelo `Tool` agregando:
  - `isBusiness (Boolean)`: Define si es una herramienta de Token Compartido o de invitación manual (Figma).
  - `category (String)`: Para renderizar la herramienta en la sección correcta.
* **Credenciales Encriptadas (OAuth + Manual):**
  Añadir soporte en el modelo `Group` o `ToolSubscription` para guardar:
  - `oauthTokenId`: Para cuando los organizadores enlazan su Google Workspace.
  - `sharedPasswordEncrypted`: Para la carga manual de claves maestras.
* **Control de Automatch y Cancelaciones:**
  - `automatchEnabled (Boolean)` en la entidad `Group`.
  - `cancellationScheduledFor (DateTime)` para manejar el flujo de "Cancelar Licencia Maestra".

---

## 2. Lógica del "Automatch Engine"

Reemplazar la asignación ficticia por un algoritmo real y concurrente:
1. **Búsqueda Inteligente:** Cuando un usuario paga por una fracción de Midjourney, el sistema busca en la DB un Grupo que tenga `toolId = 'midjourney'`, `automatchEnabled = true`, y `freeSeats > 0`.
2. **Race Conditions:** Implementar `prisma.$transaction` con bloqueos a nivel de fila (`SELECT ... FOR UPDATE`) para evitar que dos usuarios compren el mismo asiento libre exacto al mismo tiempo.
3. **Escrow Congelado:** Si el asiento falla, se dispara el reembolso automático.

---

## 3. Pagos, Retiros y Billetera Real (Stripe Connect)

* **Cobros Dinámicos (Checkout):** 
  En vez de simular un pago, `/api/checkout` debe crear una sesión de `Stripe Checkout`.
* **Webhooks:** 
  Crear el listener `/api/webhooks/stripe` para escuchar los eventos `checkout.session.completed` y `invoice.paid`. Solo cuando llega el webhook, el asiento pasa a estado `assigned`.
* **Retiro de Fondos (Payouts):** 
  Conectar el modal de "Retirar Fondos" con **Stripe Connect** (o una API de MercadoPago). El Backend creará una solicitud de extracción (`PayoutRequest`) que deducirá el `balance` disponible del organizador.

---

## 4. Validación OAuth de Licencias (Google / Supabase Auth)

Para darle validez al Modal de **Configurar Credenciales**:
* Integrar Google OAuth / Supabase.
* Cuando el organizador presiona "Conectar con Google", solicitamos los permisos estrictamente necesarios (`scopes`) para leer la facturación o la suscripción de su cuenta (ej: Validar si la cuenta conectada es Trial de 7 días o Premium).
* Esto erradicará el 90% de las estafas o licencias falsas subidas manualmente a CoStack.

---

## 5. Notificaciones de Eventos Críticos (Emails)

Sustituir los "Toasts" por acciones reales:
* **Email de Onboarding:** *"Tus credenciales están listas"*.
* **Email de Retiro Exitoso:** *"Tu retiro a MercadoPago por $45.00 está en camino"*.
* **Email Business:** *"Tenes un nuevo miembro para Figma, por favor agregalo en tu panel: juan@mail.com"*.
* **Email de Conflicto Escrow:** *"Un miembro reportó tu grupo. Tus fondos están temporalmente congelados"*.

---

### Hito de Finalización del Sprint 9
Al terminar estas tareas, se podrá ejecutar un flujo completo donde la tarjeta de crédito real es debitada, el dinero entra al Escrow de CoStack, el usuario recibe acceso dinámico a la base de datos, y el Organizador puede retirar sus fondos reales. **Producto listo para producción.**
