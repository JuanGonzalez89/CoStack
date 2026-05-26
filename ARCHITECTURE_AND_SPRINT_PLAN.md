# CoStack - Análisis Arquitectónico y Plan por Sprints

## Objetivo del documento

Este archivo consolida el diagnóstico técnico del prototipo actual de CoStack y lo convierte en una hoja de ruta ejecutable. La intención es pasar de un dashboard prototipo con estado en memoria a una base arquitectónica segura, escalable y alineada con el dominio real del producto.

## Resumen ejecutivo

Hoy CoStack funciona como una demostración frontend útil para validar la idea, pero todavía no cumple con los requisitos mínimos de un producto de pagos y gestión de accesos. El mayor riesgo no es visual ni de UX: es estructural. La app mezcla navegación, lógica de negocio, estado y render en los mismos componentes, no tiene protección de rutas, no tiene backend real y no define con precisión varias reglas críticas del negocio.

La prioridad es separar el prototipo del producto real. Eso implica introducir App Router por rutas verdaderas, autenticación y autorización por rol, persistencia, APIs reales, validación de variables de entorno y flujos explícitos para pagos, morosidad y acceso ciego.

## Diagnóstico actual

### Puntos ciegos técnicos

| Riesgo | Severidad | Impacto |
| --- | --- | --- |
| Arquitectura monolítica en `app/page.tsx` | Crítico | El router vive en un solo estado local. Cada feature nueva aumenta deuda técnica y vuelve inmanejable el flujo. |
| Cero capa de autenticación | Crítico | No existe protección real de rutas ni segmentación por rol. En un producto con pagos esto es bloqueante. |
| Cero API Routes | Crítico | No hay backend real. El bot, los pagos y la persistencia no pueden integrarse de forma segura. |
| Estado 100 por ciento en memoria | Crítico | Un refresh elimina pagos, asientos, logs y cualquier evento simulado. |
| `PaymentTraffic` sin uso | Alto | Existe el componente pero no se monta en ninguna vista. Es código muerto o deuda invisible. |
| Duplicación de CSS global | Alto | Hay dos archivos de estilos globales y eso crea ambigüedad y mantenimiento innecesario. |
| `now()` exportada desde UI | Medio | Una utilidad de tiempo acoplada a un componente viola separación de responsabilidades. |
| Sin manejo de errores de pago | Alto | No hay flujos claros para pagos fallidos, rechazos de tarjeta ni timeouts. |
| Sin formularios tipados con validación | Medio | El stack incluye React Hook Form y Zod, pero los formularios no los aprovechan. |
| Sin validación tipada de env | Medio | Las claves y URLs críticas pueden quedar sin validar o hardcodeadas. |

### Regla de negocio que hoy falta definir

1. Organizador versus Miembro.
   El organizador crea el grupo, define la herramienta, el precio total y la cantidad de asientos. El miembro se suma y paga su cuota proporcional. Esta distinción tiene que existir desde el modelo y desde la UI.

2. Morosidad y gracia.
   El sistema necesita una política explícita: cuándo vence, cuánto tiempo de gracia existe, cuándo se suspende el acceso y cuándo se libera el asiento.

3. Acceso ciego.
   Las credenciales maestras no deben exponerse al usuario. El miembro debe recibir un token o enlace temporal, no la contraseña real.

4. Marketplace de asientos.
   Falta definir si los asientos liberados se anuncian, se transaccionan o ambas cosas. Esa decisión cambia la arquitectura del feed y del catálogo.

## Arquitectura objetivo

### Principios

- Cada vista debe vivir en una ruta real del App Router.
- La lógica de negocio debe salir de los componentes de UI y moverse a features, hooks, schemas y lib.
- El estado crítico debe persistir fuera del navegador.
- Las rutas protegidas deben estar controladas por middleware y por un proveedor de sesión o auth.
- Los flujos de error deben diseñarse desde el inicio, no como parche posterior.
- Las variables de entorno deben validarse antes de que la app arranque.

### Estructura propuesta

```text
app/
  (marketing)/
    page.tsx
    pricing/page.tsx
    layout.tsx
  (dashboard)/
    layout.tsx
    overview/page.tsx
    suscripciones/page.tsx
    asientos/page.tsx
    asientos/[toolId]/page.tsx
    comunidad/page.tsx
    billetera/page.tsx
    billetera/historial/page.tsx
    settings/page.tsx
    settings/grupo/page.tsx
  (auth)/
    login/page.tsx
    register/page.tsx
    onboarding/page.tsx
    onboarding/grupo/page.tsx
    onboarding/herramienta/page.tsx
  api/
    webhooks/payment/route.ts
    webhooks/bot/route.ts
    groups/route.ts
    groups/[groupId]/route.ts
    groups/[groupId]/members/route.ts
    seats/[seatId]/route.ts
  layout.tsx
  globals.css

components/
  dashboard/
  landing/
  ui/

features/
  auth/
  billing/
  seats/
  groups/
  bot/
  access-control/

lib/
  utils.ts
  env.ts
  constants/
  validations/

middleware.ts
```

## Reglas de navegación por rol

### Usuario no autenticado

- Acceso a landing.
- Acceso a login y registro.
- Sin acceso a dashboard.

### Usuario autenticado sin grupo

- Redirección obligatoria a onboarding.
- No debe poder saltar pasos.
- Debe crear grupo o unirse con código.
- Debe completar la primera suscripción antes de entrar al dashboard completo.

### Usuario autenticado y al día

- Acceso a overview.
- Acceso a suscripciones, asientos, comunidad y billetera.

### Usuario moroso

- Acceso limitado.
- Puede ver overview con alerta.
- Solo puede entrar a billetera para regularizar.
- El resto de rutas deben redirigir a una vista de bloqueo o a billetera con estado overdue.

### Usuario organizador

- Acceso a todo lo anterior.
- Acceso a settings de grupo.
- Acceso a herramientas y asientos con acciones administrativas.

## Inventario de componentes

### Componentes existentes que conviene conservar y reubicar

- LandingPage: buen candidato para separar en subcomponentes de marketing.
- Sidebar: debería vivir en el layout del dashboard, no en la página principal.
- MobileNav: mismo criterio que Sidebar.
- SummaryCards: conservar, pero alimentado por datos reales.
- ToolCards: necesita dejar de simular lógica de pago y pasar a datos y acciones reales.
- BotLog: debe dividir UI y lógica; la lógica de polling debe ir a un hook.
- BilleteraView: necesita persistencia, estados vacíos y fuente de datos real.
- GestionAsientosView: necesita acciones de bloqueo y liberación de asiento.
- SuscripcionesView: necesita catálogo real y conexión con API.
- ComunidadView: necesita paginación, persistencia y sanitización de inputs.
- PaymentTraffic: hoy está muerto; debe montarse en el dashboard del organizador o eliminarse.

### Componentes faltantes prioritarios

#### Auth y onboarding

- LoginForm.
- RegisterForm.
- OnboardingWizard.

#### Billing

- PaymentFailureModal.
- PaymentRetryBanner.
- PaymentSuccessToast.
- InvoiceCard.

#### Acceso y seguridad

- AccessRevokedScreen.
- SeatAccessCard.
- GlobalErrorBoundary.
- middleware.ts.

#### Grupos

- CreateGroupForm.
- InviteMemberModal.
- MemberRoleSelector.
- GroupSettingsPanel.

## Base de utilidades y contratos

### lib/env.ts

Validar variables de entorno desde el arranque. Como mínimo deben quedar tipadas y chequeadas las credenciales del bot, la URL pública, el webhook de pagos y la base de datos.

### lib/constants/routes.ts

Definir rutas como contratos tipados para evitar strings sueltos y facilitar redirecciones consistentes.

### lib/constants/tools.ts

Centralizar el catálogo de herramientas para evitar duplicación entre suscripciones, asientos y cards de dashboard.

### lib/utils.ts

Mover allí utilidades transversales como formato de tiempo, formatters y funciones genéricas que hoy están acopladas a componentes.

## Seguridad y no funcionales

### Prioridades críticas

1. Middleware con protección real de rutas.
2. Validación de webhooks de pago.
3. Rate limiting en endpoints públicos o sensibles.
4. Aislamiento de secretos en backend בלבד.
5. Headers de seguridad en la configuración de Next.

### Prioridades altas

1. Sanitización de inputs del feed de comunidad.
2. Eliminación del anti patrón de navegación interna con useState.
3. Lazy loading de vistas pesadas como bot log y comunidad.
4. Un solo archivo global de estilos.

### Prioridades medias

1. Optimización del logo con un componente centralizado.
2. Reducción de pesos de la fuente a lo estrictamente necesario.
3. Metadata dinámica por ruta.
4. Sitemap, robots y OG images para SEO técnico.

## Sprint 0 - Limpieza estructural

Objetivo: dejar la base lista para trabajar sin ambigüedades.

Entregables:

- Eliminar la navegación monolítica dentro de `app/page.tsx`.
- Dejar un solo archivo global de estilos.
- Mover `now()` fuera del componente de bot.
- Definir el catálogo único de herramientas.
- Crear `lib/env.ts` con validación de variables.
- Instalar o dejar listos los contratos básicos de rutas.

Criterio de salida:

- No hay lógica de navegación interna que simule páginas.
- No hay duplicación de estilos globales.
- No quedan secretos ni URLs críticas sin validar.

## Sprint 1 - Bloqueantes de arquitectura

Objetivo: introducir seguridad, rutas reales y protección base.

Entregables:

- `middleware.ts` con control de acceso por sesión, rol y estado de pago.
- Grupo de rutas App Router separado en marketing, auth y dashboard.
- API routes para grupos, asientos y webhooks.
- GlobalErrorBoundary o equivalente por grupo de rutas.
- Activación del componente `PaymentTraffic` en la vista correcta.

Criterio de salida:

- Un usuario no autenticado no puede entrar al dashboard.
- Un usuario sin grupo no puede saltarse onboarding.
- Un moroso no puede navegar libremente por rutas bloqueadas.

## Sprint 2 - Flujos de negocio críticos

Objetivo: completar los caminos que convierten la idea en producto funcional.

Entregables:

- OnboardingWizard multi step con persistencia de estado.
- LoginForm y RegisterForm con validación de Zod.
- PaymentFailureModal y PaymentRetryBanner.
- AccessRevokedScreen para estado de bloqueo.
- InviteMemberModal con generación de código de grupo.
- SeatAccessCard para exponer estado de acceso sin revelar credenciales.

Criterio de salida:

- Un usuario puede registrarse, crear o unirse a un grupo y completar su primer flujo de suscripción.
- El sistema muestra estados explícitos para pago fallido, morosidad y acceso revocado.

## Sprint 3 - Persistencia y dominio operativo

Objetivo: pasar de prototipo a sistema transaccional con datos reales.

Entregables:

- Persistencia real para pagos, asientos, logs y miembros.
- Integración de webhooks de pago con validación de firma.
- Modelo de acceso ciego con tokens efímeros.
- Feed de comunidad persistente con sanitización y paginación.
- Billetera con historial y estados vacíos.
- Vistas administrativas por herramienta y por asiento.

Criterio de salida:

- Un refresh no destruye el estado crítico.
- Los eventos de pago y acceso pueden auditarse.
- La lógica de bot y pagos no depende del cliente para existir.

## Sprint 4 - Pulido, observabilidad y SEO

Objetivo: cerrar brechas de producción y preparar crecimiento.

Entregables:

- Metadata dinámica por ruta.
- Sitemap y robots.
- OG images.
- Observabilidad básica de errores y eventos.
- Ajustes de performance y carga diferida en componentes pesados.

Criterio de salida:

- La app está lista para indexación, monitoreo y escalado progresivo.

## Decisiones que conviene cerrar antes de avanzar

1. Auth provider.
   Definir si se usará NextAuth, Clerk u otra solución equivalente.

2. Persistencia.
   Definir base de datos y estrategia de modelo para grupos, miembros, pagos, asientos y eventos.

3. Motor de pago.
   Definir Stripe, Mercado Pago o un adaptador interno que permita soporte múltiple.

4. Bot de entrega.
   Definir contrato del webhook, TTL de invitación y mecanismo de revocación.

5. Reglas de morosidad.
   Definir si el estado overdue suspende acceso o solo degrada la experiencia.

## Próximo paso recomendado

Tomar este documento como backlog principal y ejecutar primero el Sprint 0 y el Sprint 1. Ese orden reduce riesgo, limpia la base del repo y evita construir flujos nuevos sobre una arquitectura que todavía no protege ni persiste nada.
