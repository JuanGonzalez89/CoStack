# Análisis Pre-Mortem: Inconsistencias y Pozos Sin Fondo (CoStack)

Este documento centraliza todos los "pozos sin fondo" lógicos, arquitectónicos y de modelo de negocio que podrían hacer fracasar a CoStack si no se contemplan desde el inicio. Funciona como una guía de diseño defensivo para el equipo técnico.

---

## 1. Problemas de Identidad y Autenticación (Auth & Privacidad)

### 1.1 "Password Compartido" vs "Asignación por Email"
* **Falla a futuro:** Algunos SaaS (como Netflix o herramientas básicas) usan una única contraseña compartida. Otros (como Copilot) usan invitaciones al correo personal de cada miembro. Si CoStack asume que todos usan invitación, los sistemas de contraseña única fallarán cuando un miembro decida cambiar la contraseña por maldad o error, bloqueando a todo el grupo.
* **Solución Arquitectónica:** En Prisma, el modelo `Tool` debe tener un `authMethod` (`SEAT_INVITE` o `SHARED_CREDENTIAL`). Para los `SHARED_CREDENTIAL`, CoStack prohibirá revelar la contraseña real; los usuarios deberán usar una extensión de Chrome (CoStack Auth) que inyecte la contraseña automáticamente. Alternativamente, el Bot IA cambiará la contraseña cada semana y actualizará el dashboard del usuario para evitar robos a largo plazo.

### 1.2 Privacidad y Fuga de Datos (Data Isolation)
* **Falla a futuro:** El "Storytelling" promete anonimato, pero al entrar a plataformas como Figma Org o ChatGPT Team, los usuarios podrían ver los nombres, correos o incluso el historial de chats y diseños de otros miembros del mismo grupo.
* **Solución Arquitectónica:** CoStack no puede soportar *cualquier* SaaS. Cada integración debe estar auditada para garantizar **Data Isolation**. En herramientas donde los permisos son configurables (ej. ChatGPT), el Bot IA tiene la orden estricta (en n8n/Python) de deshabilitar la opción de "Compartir con el equipo" al momento de crear el espacio.

### 1.3 Robo de Clientes (Ransomware Interno)
* **Falla a futuro:** Un Organizador descubre quiénes son los Miembros de su grupo mirando el panel del SaaS, y les manda un mensaje directo: *"Págame directo por MercadoPago y te cobro menos que CoStack"*.
* **Solución Arquitectónica:** Uso de **Masked Emails** (Alias). CoStack nunca entrega el correo real del usuario al Organizador ni al SaaS. Cuando el Bot IA invita a un usuario, lo hace a un correo proxy (ej: `user_9f8a@alias.costack.app`) que redirige al correo real. El Organizador nunca conoce la identidad real de sus miembros.

### 1.4 El Problema del Dominio Corporativo (SaaS Domain Whitelisting)
* **Falla a futuro:** Algunos SaaS corporativos (ej. Notion Enterprise, Google Workspace) exigen que todos los invitados pertenezcan a un mismo dominio de empresa (`@tuempresa.com`). Si CoStack invita a correos `@gmail.com`, el SaaS bloquea la invitación.
* **Solución Arquitectónica:** Sistema de **Alias Propios (CoStack Domains)**. CoStack debe comprar un dominio genérico (ej. `devpool.app`). A cada miembro se le genera un alias (`juan@devpool.app`) que redirige a su Gmail. El Organizador configura su SaaS para aceptar el dominio `devpool.app`, haciendo creer al SaaS que todos son empleados de la misma empresa.

---

## 2. Problemas Financieros y de Ciclo de Facturación (Billing)

### 2.1 El Infierno del Prorrateo Mensual
* **Falla a futuro:** El Organizador paga su factura en JetBrains el día 1 de cada mes. Un Miembro se une a través del "Auto-Match" el día 20. Si las facturaciones se atan, la matemática colapsa.
* **Solución Arquitectónica:** **Desacople Financiero Absoluto**. 
  * El Miembro SIEMPRE paga 1 mes completo por adelantado al unirse (ciclo del 20 al 20).
  * CoStack acumula el dinero.
  * CoStack le paga al Organizador de forma "Prorrateada Diaria" (acumula saldo a favor por cada día que un asiento estuvo ocupado). El Organizador puede retirar sus fondos el día 1, pero solo cobrará la parte proporcional de lo que realmente proveyó.

### 2.2 Cuello de Botella de Oferta (El Modo "Agotado")
* **Falla a futuro:** Hay 100 personas queriendo comprar Copilot, pero solo 2 Organizadores ofreciendo 10 lugares. La UI dice "Agotado". Se pierden 90 ventas.
* **Solución Arquitectónica:** Checkout en modo **Pre-Autorización (Lista de Espera)**. El usuario "pasa la tarjeta" pero no se le cobra. Su estado queda en `Buscando grupo...`. Apenas un Organizador nuevo entra a CoStack y conecta una cuenta (o un Miembro se da de baja), el sistema captura el pago del primero en la lista y lo aprovisiona instantáneamente.

### 2.3 Prevención de Fraude de Precios
* **Falla a futuro:** Un Organizador declara que su licencia de ChatGPT vale $1000/mes para estafar a los miembros cobrándoles de más.
* **Solución Arquitectónica:** **Catálogo Centralizado**. El Organizador no puede tipear precios. CoStack impone el precio oficial en la base de datos basándose en el costo real del SaaS. Además, el Bot IA, al verificar las credenciales del Organizador por primera vez, hace scraping de la sección "Billing" del SaaS para confirmar que el plan pagado existe y no es una cuenta gratuita o crackeada.

### 2.4 El Fraude de las Devoluciones (Chargebacks)
* **Falla a futuro:** Un miembro compra un asiento, usa la herramienta 20 días, y luego desconoce el cargo en su banco (Chargeback). El Organizador ya recibió dinero de CoStack. CoStack pierde la plata del asiento y paga multas al banco.
* **Solución Arquitectónica:** Bloqueo y Garantía. CoStack debe tener protección (como Stripe Radar) para puntuar transacciones. Si hay un Chargeback, el Worker IA revoca *inmediatamente* el asiento y se banea al Miembro por "Hardware Fingerprint" e IP. CoStack asume la pérdida frente al Organizador con un fondo de garantía, asegurándole al Organizador riesgo cero.

### 2.5 Fluctuación Cambiaria y FX Risk (Riesgo de Divisas)
* **Falla a futuro:** CoStack cobra a un usuario de LATAM en moneda local (ARS) pero le liquida al Organizador en USD. Si la moneda local se devalúa un 20% en un mes, CoStack absorbe la pérdida y quiebra.
* **Solución Arquitectónica:** **Pegging estricto a Moneda Dura**. Todos los cálculos en la base de datos se hacen en USD. Si el checkout soporta monedas locales, debe aplicar un tipo de cambio en tiempo real (Spot FX rate) con un *markup* de cobertura (ej. +5% por riesgo de conversión). A los Organizadores siempre se les liquida en USD/USDT.

---

## 3. Riesgos Operativos y del "Motor IA" (Automatización)

### 3.1 El Síndrome del "Organizador Caído" (Orphan Members)
* **Falla a futuro:** El Organizador deja de pagar su tarjeta de crédito. JetBrains cancela la cuenta raíz. Los Miembros que le pagaron a CoStack pierden el acceso de un día para otro y exigen reembolsos.
* **Solución Arquitectónica:** **Auto-Migración (Health Checks)**. El Bot de CoStack hace un *ping* semanal a la cuenta de facturación del Organizador. Si detecta la cuenta caída, el Backend dispara el protocolo de emergencia: mueve virtualmente a los Miembros afectados al grupo de *otro* Organizador que tenga vacantes, y el Bot re-invita a esos usuarios sin que ellos tengan que hacer nada.

### 3.2 El Infierno del 2FA para el Bot
* **Falla a futuro:** El Bot IA (Playwright) intenta iniciar sesión de madrugada para expulsar a un moroso, pero GitHub le pide un código SMS al celular del Organizador. El Bot falla, el moroso sigue usando el servicio gratis.
* **Solución Arquitectónica:** Al registrar un grupo como Organizador, es obligatorio proporcionar la **Semilla TOTP** (Authenticator Secret). CoStack almacena esta semilla cifrada y el Worker de Python genera los tokens de 6 dígitos en tiempo real para saltarse el 2FA de forma autónoma.

### 3.3 Caída Global del Bot IA (Cambio de CAPTCHAs y Bloqueos)
* **Falla a futuro:** Cloudflare o el SaaS actualizan su seguridad anti-bots. Los scripts de Playwright de CoStack son bloqueados al 100%. Nadie puede recibir invitaciones ni ser revocado.
* **Solución Arquitectónica:** **Degradación Graciosa (Modo Semiautomático)**. Si el Bot falla por un bloqueo o 403, el sistema no crashea, sino que cambia el estado a "Manual". El sistema envía automáticamente un correo de emergencia a los Organizadores afectados: *"El aprovisionamiento automático está pausado. Por favor, invita a [alias@costack.app] a tu panel en las próximas 12hs para seguir cobrando"*. El fallback de la IA rota es el administrador humano original.

### 3.4 Concurrencia Masiva (Race Conditions en Auto-Match)
* **Falla a futuro:** Hay 1 vacante de JetBrains. 5 usuarios hacen clic en "Pagar" en el mismo milisegundo. Los 5 pagos se procesan y el sistema intenta meter a 5 personas en 1 solo asiento.
* **Solución Arquitectónica:** **Pessimistic Locking (Bloqueo transaccional)**. En Prisma o en una cola Redis, el asiento debe recibir un bloqueo duro `SELECT FOR UPDATE` en cuanto alguien inicia el checkout (durante 10 minutos). Si el pago falla o el tiempo expira, se libera. Nunca se permite "sobrevender" asientos.

### 3.5 Gestión de Sesiones Concurrentes (Bot Scaling Limit)
* **Falla a futuro:** El día 1 del mes, el sistema necesita procesar 1,000 altas y 500 bajas. Si el orquestador lanza 1,500 navegadores Chromium en tu servidor de bajo costo, la CPU llega al 100% y el sistema entero se cae.
* **Solución Arquitectónica:** **Job Queues & Serverless Workers**. Nunca ejecutar acciones de Playwright de forma síncrona en el request web. Toda alta o baja va a un Message Queue (RabbitMQ / AWS SQS). Se configuran *Serverless Functions* o contenedores escalables que procesan la cola controlando la concurrencia máxima (ej. procesar de a 50 a la vez). Al usuario se le muestra `En proceso (ETA: 3 mins)`.

---

## 4. Riesgos Legales y de Soporte (TOS & Helpdesk)

### 4.1 La Trampa del "Uso Compartido" (Rate Limits en APIs)
* **Falla a futuro:** SaaS como ChatGPT u OpenAI API comparten un límite de uso entre todos los miembros de un Workspace (ej. 100 consultas por hora para todo el pool). Si un miembro inyecta un script y agota los recursos, los demás miembros del grupo se quedan sin servicio y piden reembolso a CoStack.
* **Solución Arquitectónica:** **Auditoría de Integraciones Estricta**. CoStack NO debe dar soporte a herramientas que no permitan fijar cuotas/límites por asiento ("Rate Limiting"). Si una herramienta usa un pool compartido sin límites duros individuales, entra automáticamente en una "Lista Negra de Integración" y no se ofrece en CoStack.

### 4.2 El Peligro de la Propiedad Intelectual (Code Ownership)
* **Falla a futuro:** Un usuario desarrolla una aplicación usando JetBrains provisto por un Organizador en CoStack. El Organizador (dueño de la cuenta raíz) reclama los derechos de propiedad intelectual sobre el código del Miembro.
* **Solución Arquitectónica:** **Cross-TOS (Términos Cruzados)**. Al registrarse como Organizador, este renuncia explícitamente a los derechos de propiedad intelectual de los assets generados por los Miembros. CoStack desalentará la integración de herramientas que fuercen transferencias de IP irrevocables a los administradores del Workspace.

### 4.3 Soporte Técnico Cruzado (Quién es el Helpdesk)
* **Falla a futuro:** Copilot se cae globalmente. Los miembros saturan a CoStack con tickets de soporte enfurecidos exigiendo reembolsos por "una app que no funciona".
* **Solución Arquitectónica:** **Status Page Integration**. El Dashboard (`Mis Herramientas`) debe conectarse a las APIs públicas de estado de cada SaaS (ej. `githubstatus.com`). Si Copilot se cae, la tarjeta en CoStack muestra inmediatamente: ⚠️ *Incidencia en los servidores de GitHub (Ver detalles)*. Esto desvía la culpa hacia el proveedor original y frena el 90% de los tickets de soporte.

### 4.4 Toxicidad de Organizadores (The "Bait and Switch")
* **Falla a futuro:** Un Organizador recibe a 5 Miembros en su cuenta de SaaS. Para ahorrarse créditos (o por maldad), entra a la herramienta y le baja los permisos a los miembros a `Read-Only`, inutilizando la herramienta.
* **Solución Arquitectónica:** **Monitoreo de Permisos (Audit Logs)**. El Bot IA no solo renueva asientos, sino que lee aleatoriamente los Roles de los usuarios en el SaaS. Si detecta que un Organizador alteró los permisos a algo por debajo del estándar contratado, el sistema suspende los pagos del Organizador automáticamente y reembolsa a los Miembros.

### 4.5 El Límite Legal y Fiscal (Riesgo KYC del Organizador)
* **Falla a futuro:** Un Organizador conecta múltiples cuentas empresariales y empieza a cobrar $10,000 USD al mes mediante retiros de CoStack. El proveedor de pagos (ej. Stripe) congela la cuenta maestra de CoStack por sospecha de lavado de dinero, hundiendo todo el sistema.
* **Solución Arquitectónica:** Integración obligatoria de **Stripe Connect (Express/Custom)** para los Organizadores. CoStack no les paga manualmente desde su caja bancaria; CoStack orquesta la división del pago en tiempo real y Stripe les exige a los Organizadores subir su documento de identidad (KYC) e información fiscal antes de retirar $1 dólar. CoStack se exime del riesgo fiscal corporativo.
