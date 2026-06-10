# SPRINT 10: Finalización B2C "Zero Friction" y Corrección de Deuda Técnica

Este sprint tiene como objetivo completar la metamorfosis del sistema hacia un modelo 100% B2C, solucionando los cuellos de botella detectados en la UX y limpiando la deuda técnica (reverts recientes).

## 1. Problemas Arquitectónicos Detectados (A corregir)

*   **Problema de Múltiples Grupos (Dashboard Ciego):**
    *   **Problema:** Actualmente el frontend está acoplado a leer `latestGroup` del backend. Si un usuario compra 3 licencias (Figma, Canva, ChatGPT), el Dashboard solo le muestra la última que compró.
    *   **Solución:** Desenganchar la dependencia de `latestGroup` e iterar con un `.map()` sobre `activeGroups`. El usuario debe ver una tarjeta (`SuccessAccessCard`) por cada herramienta activa que posee.

*   **Modelo Estricto de Prepago (Borrado de "Overdue"):**
    *   **Problema:** Existe lógica residual B2B que maneja deudas o mora (`overdue`). En un B2C de software, no existen las deudas: se paga por mes adelantado. Si falla el pago, se revoca el acceso en el acto.
    *   **Solución:** Eliminar toda lógica, endpoints y columnas de base de datos relacionadas con mora/overdue. Reemplazar por un sistema de corte estricto (Expired -> Liberar cupo).

*   **Eliminación Segura del "Rol Global" (`User.role`):**
    *   **Problema:** El sistema sigue forzando que un usuario sea `MEMBER` u `ORGANIZER` a nivel global (lo que impide que un organizador compre licencias de otros). El intento previo de removerlo rompió el build y fue revertido.
    *   **Solución:** Hacer un refactor quirúrgico para depender exclusivamente del `role` dentro de la tabla `Membership`. El rol de la sesión debe ser dinámico por grupo.

## 2. Flujos de Usuario Pendientes (Features)

*   **Flujo de Retiro de Fondos (Payouts):**
    *   Construir la pantalla transaccional para que los Organizadores puedan solicitar la extracción de su saldo ("Ganancias en Garantía") hacia su CBU/CVU o cuenta bancaria.

*   **Configuración de Credenciales Compartidas:**
    *   Si un Organizador publica una cuenta (ej: ChatGPT Plus), debe haber un modal seguro donde ingrese el usuario y la contraseña. CoStack debe guardar esto encriptado y revelarlo solo a los Miembros que pagaron su cupo activo.

*   **Toggle "Privado vs Automatch":**
    *   En la vista de Gestión de Cupos del organizador, agregar un interruptor para que decida si su grupo se expone al sistema de llenado automático (Automatch) o si lo mantiene privado por invitación.

*   **Consecuencias de Cancelación de Licencia:**
    *   Si el Organizador se da de baja, falta un modal claro de advertencia que le explique qué pasará con el dinero retenido y qué notificación se enviará a sus miembros actuales.

## 4. Bugs Críticos & Casos Borde (Descubiertos en Pre-mortem)

*   **Flujo Roto de "Compartir Herramienta" (Error 404):**
    *   **Problema:** Cuando el organizador hace clic en "Compartir herramienta" en su catálogo, intenta navegar a `/suscripciones/share/[toolId]`. Ese directorio fue eliminado durante el último revert en bloque, causando un 404 severo que corta el core loop del organizador.
    *   **Solución:** Reconstruir la página de publicación del organizador con el formulario para subir credenciales y definir el precio base de sus vacantes.

*   **Fuga de Memoria por Asientos "Pendientes" (Lazy Cleanup):**
    *   **Problema:** Si un usuario hace clic en "Pagar" pero cierra la pestaña (no completa el checkout), el asiento queda en estado `pending` por 10 minutos. Actualmente, el sistema solo limpia esos asientos muertos si *otro* usuario entra a reservar. Si hay poco tráfico, los asientos quedan bloqueados indefinidamente.
    *   **Solución:** Implementar un Serverless Cron Job (ej. Vercel Cron) que llame a `/api/cron/cleanup-seats` cada 5 minutos para asegurar que los asientos caducados vuelvan a ser `free`.

*   **Casos de Borde en Onboarding (El Organizador Fantasma):**
    *   **Problema:** Si un usuario se registra con intención de ser organizador pero todavía no creó ningún grupo ni pagó nada, el Dashboard fuerza la visualización de la tarjeta de "CoStack Studio" (SeatAccessCard) inyectando datos falsos (`COSTACK-84A2`) porque no hay datos reales.
    *   **Solución:** La vista `Overview` debe ocultar completamente todo el dashboard y mostrar de forma exclusiva el `OnboardingPrompt` si el usuario no tiene ninguna suscripción activa, sin importar su rol.

## 5. Integración Final

*   **Conexión Real con Stripe:**
    *   Reemplazar la actual simulación de éxito (`/api/checkout/pay`) por la generación de una `Stripe Checkout Session` real. Capturar los webhooks para confirmar el pago y aprovisionar el asiento automáticamente al recibir el `checkout.session.completed`.

---

## 6. Detalles: Estado Actual de CoStack (Evolución Sprint 8 y 9)

A continuación se documentan todos los cambios estructurales, visuales y de lógica de negocio que transformaron a CoStack desde su versión B2B inicial hasta el MVP B2C actual "Fricción Cero".

### 🔹 Cambios Visuales y de UX
*   **Adiós Jerga Financiera B2B:** Se eliminaron términos complejos. "Escrow" se convirtió en **"Ganancias en Garantía"**. "Asientos (Seats)" pasó a llamarse **"Cupos" o "Mis Suscripciones"**. "Grupo" se cambió por "Suscripción Compartida".
*   **Onboarding Dinámico:** Se creó el `OnboardingPrompt` con dos tarjetas claras: una para "Ahorrar" (Miembros) y otra para "Recuperar inversión" (Organizador), con ejemplos matemáticos reales de cuánto cuesta y cuánto se gana.
*   **Limpieza Técnica (BotLog):** Se eliminó por completo el componente `<BotLog />` (la terminal estilo Matrix) del Dashboard. La interfaz ahora es 100% limpia y orientada a usuarios finales no técnicos.
*   **Rediseño de Checkout:** Se corrigieron desbordamientos de texto, se añadieron loaders nativos, y el botón de pago muestra explícitamente el desglose antes del cobro.

### 🔹 Cambios Funcionales (Arquitectura UI)
*   **Soporte Multi-Suscripción:** El dashboard dejó de ser "ciego" (no más acoplamiento a `latestGroup`). Ahora mapea sobre la lista de `activeGroups` mostrando múltiples tarjetas de `SuccessAccessCard` o `SeatAccessCard` apiladas para usuarios con más de una herramienta.
*   **Aislamiento de Privacidad:** La función `getDashboardSnapshot` ahora exige el `email` de la sesión activa. Un usuario ya no puede ver el tráfico de pagos, la facturación ni las reservas de otros usuarios de la plataforma.
*   **Dashboard Condicional:** Si un usuario no posee suscripciones, las tarjetas y métricas de pagos desaparecen completamente para mostrar únicamente el Onboarding.

### 🔹 Cambios Lógicos y de Modelo de Negocio
*   **Eliminación del "Rol Global" (Híbridos):** Se removió el bloqueo que forzaba a un usuario a ser "Miembro" o "Organizador" globalmente. Ahora los roles viven en la tabla de relaciones (`Membership`). Un mismo usuario puede pagar por Figma (MEMBER) y alquilar su Canva (ORGANIZER) simultáneamente.
*   **Muerte de la "Mora" (Modelo Estricto Prepago):** Se erradicó la lógica de deudas (`overdue`). En el nuevo modelo B2C, la falta de pago no genera deuda, simplemente revoca el acceso al instante, protegiendo al organizador.
*   **Desacople de Endpoints de Pago:** Se resolvió el conflicto donde los pagos de licencias y el retiro de fondos (payouts) chocaban en `/api/payments/request`. Se separaron en `/api/checkout/pay` (ingreso de dinero) y `/api/payouts/route` (retiro hacia el Organizador).
*   **Tolerancia a Fallos en Demo:** Las rutas de checkout (`/reserve` y `/pay`) ahora incluyen una función `upsert` automática para herramientas. Si un usuario intenta comprar "Midjourney" y la base de datos está vacía, el sistema genera el registro en caliente y aprueba el aprovisionamiento, logrando una "Demo Indestructible".

---

## 7. Roadmap Arquitectónico de Prevención (Basado en el Pre-Mortem)

El análisis profundo (`INCONSISTENCIAS.md`) detectó vulnerabilidades críticas que, de no solucionarse, harán colapsar la plataforma a largo plazo. Se incorporan al plan de acción los siguientes bloques defensivos:

### 🛡️ Autenticación y Privacidad (Data Isolation)
*   **Masked Emails & Dominios Propios:** Implementar alias de correo (ej. `user_123@costack.app`) al invitar miembros. Esto evita que los Organizadores roben clientes por fuera de la plataforma y saltea las restricciones corporativas (ej. Notion/Google Workspace que exigen el mismo dominio).
*   **Gestión Segura de 2FA:** Requerir la Semilla TOTP (Authenticator Secret) de los Organizadores. Si el bot de Playwright intenta loguearse a las 3 AM para meter a un miembro, debe generar el token de 6 dígitos autónomamente sin despertar al dueño.

### 💸 Resiliencia Financiera (Billing)
*   **Listas de Espera (Pre-Autorización):** Cambiar el sistema "Agotado" por "Pasar Tarjeta en Espera". Si no hay Organizadores, capturar la intención de pago del Comprador sin cobrarle, y disparar el cobro automático apenas un Organizador ofrezca sus credenciales.
*   **Catálogo de Precios Rígido:** Prohibir que el Organizador decida los precios. El sistema hará un scraping de su dashboard original (ej. JetBrains) para comprobar que la suscripción existe y seteará el precio fijo por base de datos, previniendo estafas de sobreprecio.

### 🤖 Infraestructura del "Motor IA"
*   **Job Queues & Serverless (Bot Scaling):** Mudar la ejecución del Bot de Playwright fuera del ciclo de vida del Request HTTP (`route.ts`). Usar SQS/RabbitMQ para poner las tareas de altas/bajas en cola, evitando que el servidor colapse si 100 personas compran el día 1 del mes.
*   **Auto-Migración (Health Checks):** Crear un cron job semanal que haga ping a las cuentas maestras de los Organizadores. Si la tarjeta de crédito de un Organizador rebota y su cuenta es suspendida por el proveedor, CoStack debe detectar la falla y migrar automáticamente a los Miembros hacia otro Organizador sano.

---

## 8. Flujos de Usuario Completos (User Journeys)

El siguiente es el mapa detallado de cómo interactúan los usuarios con el sistema hoy en día, separando a los dos perfiles principales de CoStack:

### 🎭 Flujo 1: El Organizador (Vendedor / Inversor)
El organizador es el usuario que posee una suscripción activa (ej. Netflix, ChatGPT Plus, Figma) y decide alquilar sus vacantes libres para recuperar su inversión.

**A. Lo que ya funciona:**
1.  **Onboarding:** Ingresa a CoStack. El sistema detecta que no tiene suscripciones y le presenta el `OnboardingPrompt` dual. Elige "Recuperar lo que gastás".
2.  **Catálogo:** Navega a `/suscripciones`. El sistema reconoce su intención y le muestra las herramientas con el cálculo de ROI (cuánto ganaría al alquilar).
3.  **Checkout / Aprovisionamiento:** Al confirmar, el sistema le genera automáticamente un "Grupo Falso de Demo" y aprovisiona las vacantes usando el Mock de B2C (`/api/checkout/reserve`).
4.  **Activación:** Regresa al `/overview`. El dashboard identifica que es Organizador y le muestra la `SeatAccessCard` con su código privado (ej. `COSTACK-84A2`) para compartir.
5.  **Monitoreo (Gestión):** Puede ir a la pestaña "Cupos" para ver quiénes ocupan sus vacantes, y a "Billetera" para auditar sus Ganancias en Garantía.

**B. Lo que le falta (Pendiente):**
*   **Publicación Real:** La vista donde el Organizador carga su contraseña o elige el precio de sus vacantes al crear el grupo (`/suscripciones/share/[toolId]`) da error 404 porque fue revertida.
*   **Toggle Privado vs Automatch:** Un switch para decidir si quiere que CoStack le busque clientes automáticamente o si prefiere invitar a sus conocidos con su código privado.
*   **Retiro de Dinero:** Una pantalla conectada a Stripe/CVU donde pueda retirar lo acumulado en su Billetera.
*   **Cancelación del Grupo:** Un botón de pánico para disolver el grupo a fin de mes si ya no quiere seguir prestando el servicio.

### 🛒 Flujo 2: El Comprador (Miembro / B2C)
El comprador es el consumidor final que busca acceder a herramientas premium de la forma más barata y rápida posible, con Fricción Cero.

**A. Lo que ya funciona:**
1.  **Onboarding:** Ingresa a la plataforma y en el `OnboardingPrompt` elige "Acceder a software" para comprar un cupo.
2.  **Catálogo:** Ve las suscripciones compartidas a un precio fragmentado (ej. Canva a $6/mes en lugar de $30/mes).
3.  **Checkout (Pre-pago Estricto):** Ingresa los datos de pago y abona por adelantado el mes en curso, con un desglose claro del costo sin sobrecargas raras.
4.  **Acceso Inmediato:** Es redirigido al `/overview` y la `SuccessAccessCard` le revela de inmediato las credenciales que necesita usar (si es herramienta compartida) o le indica que ya fue invitado a su mail (si es herramienta corporativa).
5.  **Billetera Pasiva:** En `/billetera`, simplemente ve el historial de los pagos que hizo ("Mis Facturas"). Si deja de pagar, el acceso se corta en el acto sin generar mora.

**B. Lo que le falta (Pendiente):**
*   **Botón Anti-Estafas:** Prometemos "Garantía", pero si la contraseña que se le entregó no funciona, le falta un botón de "Reportar Problema" que congele el pago al Organizador instantáneamente.
*   **Cancelación de Cuota:** Necesita un botón "Dar de Baja" para liberar su asiento a fin de mes.
*   **Estado de Espera:** Para cuentas que requieren invitación (ej. Figma), falta un estado en la tarjeta que diga: *"Esperando que el Organizador te invite. Si demora más de 24hs se te reintegra el dinero"*.
