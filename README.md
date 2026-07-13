# CoStack

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.0-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-UI%20System-111827?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-Private-lightgrey?style=for-the-badge)

CoStack es una plataforma pensada para resolver las fricciones operativas y financieras que enfrentan los freelancers al compartir licencias de software premium. Funciona como un "administrador invisible" que automatiza el cobro grupal, la gestión centralizada de accesos y el bloqueo condicional para morosos, eliminando la carga administrativa y los conflictos interpersonales del modelo tradicional.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Problema que resuelve](#problema-que-resuelve)
- [Características principales](#características-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación local](#instalación-local)
- [Scripts disponibles](#scripts-disponibles)
- [Vistas del prototipo](#vistas-del-prototipo)
- [Entrega automática de acceso (Provisioning)](#entrega-automática-de-acceso-provisioning)
- [Provisioning de Canva](#provisioning-de-canva-invite-link)
- [Provisioning de Notion](#provisioning-de-notion-invite-link)
- [Provisioning de Hugging Face](#provisioning-de-hugging-face-join-link)
- [Autores](#autores)
- [Estado del proyecto](#estado-del-proyecto)

## Descripción

La plataforma está diseñada para equipos freelance que comparten herramientas costosas como ChatGPT Team, Figma o Midjourney. CoStack transforma un proceso manual, frágil y conflictivo en una orquestación automatizada con foco en control financiero, seguridad y coordinación operativa.

## Problema que resuelve

Los equipos freelance que comparten licencias suelen enfrentar tres problemas críticos:

- Fricción económica: una persona adelanta el pago y luego persigue al resto para recuperar el dinero.
- Inseguridad: credenciales expuestas o compartidas en texto plano.
- Caos operativo: coordinación informal por mensajería, con riesgo de bloqueos por uso simultáneo.

## Características principales

- Cobro automático grupal: cada integrante abona su cuota proporcional de forma fraccionada.
- Escrow de pago: Mercado Pago autoriza (retiene) el pago de cada miembro apenas se suma a la sala, y recién se captura cuando el grupo se completa — nadie adelanta plata ni corre el riesgo de no cobrarle al resto.
- Entrega automática de acceso: al completarse el grupo, el sistema provisiona el acceso (link de invitación al equipo/workspace de la herramienta) y lo envía por email a cada miembro automáticamente, sin intervención manual del organizador.
- Gatekeeper seguro: centralización del acceso sin exponer credenciales originales.
- Transparencia financiera: visualización clara de gastos, pagos y estado de cada integrante.
- ~~Comunidad freelance~~ — el código existe (`app/(dashboard)/comunidad`, feed social con posts/likes/rankings) pero **no está expuesto en la navegación del panel** (no aparece en el menú lateral, ver `components/dashboard/sidebar.tsx`) y los posts no persisten. No forma parte del MVP visible hoy; queda como roadmap.

## Stack tecnológico

**Frontend**
- Next.js (App Router) / React / TypeScript
- Tailwind CSS / shadcn/ui / Radix UI
- Recharts, React Hook Form, Zod, lucide-react, next-themes, Vercel Analytics

**Backend**
- Next.js API Routes (`app/api/**`)
- Prisma ORM + PostgreSQL (`prisma/schema.prisma`)
- NextAuth (Credentials provider, sesión JWT)
- Mercado Pago (autorización/captura de pagos, modelo de escrow)
- Resend (envío de emails transaccionales)
- Playwright (worker externo de provisioning, ver `workers/provision-worker`)

> Nota: el proyecto también tiene código de Stripe (`app/api/webhooks/payment/route.ts`) de una integración anterior que no está conectada al flujo de compra actual (que usa Mercado Pago). Se mantiene en el repo pero no forma parte del flujo activo.

## Estructura del proyecto

```text
app/
  (dashboard)/       # rutas autenticadas: overview, suscripciones, asientos, lobby, comunidad, billetera, settings
  api/                # endpoints: checkout, lobby, groups, webhooks, cron
  login/, register/
components/
  dashboard/, landing/, suscripciones/, onboarding/, ui/
features/
  dashboard/          # contratos/tipos compartidos entre server y UI
lib/
  provisioner/        # lógica de aprovisionamiento (providers por herramienta)
  auth.ts, catalog.ts, mercadopago.server.ts, mail.server.ts, env.ts
prisma/
  schema.prisma, migrations/, seed.ts
scripts/              # utilidades de desarrollo/testing (seed, debug, provisioning manual)
workers/
  provision-worker/   # worker Node/Express + Playwright, deploy separado (Render)
hooks/
public/
```

## Instalación local

### Requisitos previos

- Node.js 18 o superior
- npm 10 o superior
- Una base de datos PostgreSQL (por ejemplo, un proyecto gratuito en [Neon](https://neon.tech))

### Pasos

1. Clonar el repositorio:

```bash
git clone https://github.com/JuanGonzalez89/CoStack.git
cd CoStack
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear un archivo `.env.local` en la raíz con, como mínimo:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="una-clave-random-de-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
MP_ACCESS_TOKEN="TEST-..."               # Mercado Pago (modo TEST activa el pago demo)
NEXT_PUBLIC_MP_PUBLIC_KEY="TEST-..."
RESEND_API_KEY=""                         # opcional en local; sin esto los emails se saltean (best-effort)
```

Ver también las secciones de Provisioning de Canva, Notion y Hugging Face (más abajo, y en la Tabla de Contenidos) para las env vars específicas de cada herramienta.

4. Generar el cliente de Prisma y aplicar el schema:

```bash
npx prisma generate
npx prisma db push
```

5. Ejecutar el entorno de desarrollo:

```bash
npm run dev
```

6. Abrir la app en:

```text
http://localhost:3000
```

## Scripts disponibles

- `npm run dev`: inicia el servidor de desarrollo (corre `prisma generate` antes).
- `npm run build`: genera la build de producción.
- `npm start`: compila la aplicación y levanta el servidor de producción.
- `npm run lint`: ejecuta el linting del proyecto.
- `npm run generate`: regenera el cliente de Prisma.
- `npm run seed`: corre `prisma/seed.ts` para poblar datos de prueba.

## Vistas del prototipo

- Landing Page: presentación del producto como el "Administrador Invisible de Software".
- Dashboard de Gestión de Licencias: panel principal con métricas, estado de pagos y acciones rápidas.
- Suscripciones: marketplace visual para adquirir nuevas herramientas Enterprise y formar grupos.
- Billetera: vista financiera para seguir saldo, movimientos e inversión mensual.

> La vista de Comunidad (`/comunidad`) existe en el código pero no está linkeada en el menú del panel — no es parte de las vistas visibles del MVP actual.

## Entrega automática de acceso (Provisioning)

La entrega de acceso **no depende de un bot de mensajería** (Discord/Telegram/DM) — se resuelve enteramente en el backend cuando la sala (lobby) se completa:

1. Cada miembro se suma a la sala y Mercado Pago **autoriza** (retiene) su pago — sin cobrar todavía.
2. Cuando se llenan todos los cupos, el sistema **captura** los fondos de todos los miembros.
3. Se ejecuta el **provisioner** correspondiente a la herramienta (`lib/provisioner`), que genera/recupera el link de acceso (invite link al equipo/workspace de la herramienta).
4. El link se manda automáticamente por **email (Resend)** a cada miembro, y también queda visible en la UI del lobby/dashboard de cada uno.
5. El asiento queda asignado sin exponer nunca la credencial real de la cuenta master.

Cada herramienta tiene su propio *provider* (`lib/provisioner/providers/*.ts`) que implementa esta lógica; ver el detalle de cada una más abajo.

## Provisioning de Canva (Invite Link)

El acceso a Canva se provisiona mediante un **link de invitación al equipo** generado manualmente desde la cuenta master (`costack.dev.bot@gmail.com`). Este link es **reutilizable durante su período de vigencia (30 días de generado) y siempre y cuando el usuario esté al día con su pago**.

Cuando un lobby de Canva se completa, el sistema envía automáticamente un email a cada miembro con el link de invitación.

### Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `CANVA_INVITE_LINK` | URL del link de invitación al equipo | `https://www.canva.com/brand/join?token=XXX&referrer=team-invite` |
| `CANVA_INVITE_LINK_GENERATED_AT` | Fecha en que se generó (YYYY-MM-DD) | `2026-07-01` |
| `RESEND_API_KEY` | API key de Resend para envío de emails | `re_XXXXXXXXX` |

### ⚠️ Regeneración del link (cada ~25 días)

El link expira a los 30 días. El sistema loguea un warning cuando faltan menos de 5 días. Para regenerarlo:

1. Iniciar sesión en [Canva](https://www.canva.com) con la cuenta master (`costack.dev.bot@gmail.com`)
2. Ir a **Settings** → **People** (o Configuración → Personas)
3. Buscar la opción de **link de invitación al equipo** y generar uno nuevo
4. Copiar la URL generada
5. En el [dashboard de Vercel](https://vercel.com), actualizar:
   - `CANVA_INVITE_LINK` → pegar la nueva URL
   - `CANVA_INVITE_LINK_GENERATED_AT` → poner la fecha de hoy (`YYYY-MM-DD`)
6. Redesplegar la aplicación para que tome los nuevos valores

## Provisioning de Notion (Invite Link)

El acceso a Notion se provisiona con el mismo patrón que Canva: un **link de invitación al workspace**, generado desde la cuenta del workspace (Settings → Members → Invite link). A diferencia de Canva, este es un mecanismo oficial de Notion (no un workaround), así que no está sujeto a bloqueos anti-bot.

Cuando un lobby de Notion se completa, el sistema envía automáticamente un email a cada miembro con el link de invitación (mismo servicio de Resend que usa Canva).

### Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NOTION_INVITE_LINK` | URL del link de invitación al workspace | `https://www.notion.so/invite/XXXXXXXX` |
| `NOTION_INVITE_LINK_GENERATED_AT` | Fecha en que se generó (YYYY-MM-DD) | `2026-07-01` |

### Regeneración del link

El sistema aplica la misma validación de antigüedad (30 días, warning a los 5 días) que Canva por consistencia, aunque el link de Notion no expira automáticamente. Si se regenera manualmente en Notion (Settings → Members → Invite link → desactivar/generar nuevo), actualizar ambas env vars en Vercel y redesplegar.

## Provisioning de Hugging Face (Join Link)

El acceso a HuggingChat Premium se provisiona con el link público de la organización `CoStack-1` en Hugging Face, que tiene activadas las opciones **"Allow requests to join"** y **"Automatically approve join requests"**. Con esa configuración, cualquiera que abra el link se une al instante — no hace falta invitar a cada miembro individualmente ni hay expiración que gestionar.

### Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `HUGGINGFACE_ORG_URL` | URL de la organización (opcional, default `https://huggingface.co/CoStack-1`) | `https://huggingface.co/CoStack-1` |

## Autores

- Santiago Calderon
- Juan Pablo Garcia Mallorquin
- Juan Ignacio Gonzalez Caceres

## Estado del proyecto

CoStack ya tiene un flujo de compra transaccional real de punta a punta (no solo un prototipo visual): creación/matching de salas (lobbies), escrow de pago con Mercado Pago (autorización → captura), provisioning automático y entrega de acceso por email.

Herramientas con provisioning **live** (se pueden comprar hoy): Hugging Face, Canva, Notion. El resto del catálogo (GitHub Copilot, JetBrains, ChatGPT, Figma, Midjourney, Vercel) está marcado como "Próximamente" hasta tener un provider escalable para cada una.

Ver `SPRINT_*.md` en la raíz del repo para el detalle de cada iteración; las últimas incorporadas fueron el modo demo de pago (para poder demostrar el checkout en modo TEST de Mercado Pago) y el desglose de la comisión de CoStack en el checkout.
