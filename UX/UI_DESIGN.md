## UX/UI Master Plan for Claude

Objetivo: convertir la interfaz actual de CoStack en un producto funcional, coherente y mantenible. La regla de trabajo es simple: primero se fija el contrato del dato y el contrato visual, después se implementa la vista. No se diseñan pantallas aisladas sin saber de dónde sale cada estado.

### Contexto real del repo

La estructura real ya tiene estas bases:

- `app/(auth)/` con login, register y onboarding.
- `app/(dashboard)/` con overview, suscripciones, asientos, billetera, comunidad y settings.
- `app/api/` con snapshot, grupos y webhooks.
- `components/dashboard/` con piezas reutilizables ya existentes.
- `lib/` con auth, env, routes, prisma y snapshot server/client.

Por lo tanto, este documento no define una app nueva. Define cómo completar la que ya existe.

### Dirección visual

La identidad debe ser oscura, técnica y densa. No es un SaaS liviano; es un dashboard de control financiero y acceso.

- Fondo principal: `bg-zinc-950`.
- Superficies: `bg-zinc-900` y `bg-zinc-900/80`.
- Bordes: `border-zinc-800` con hover `border-zinc-700`.
- Texto primario: `text-zinc-50`.
- Texto secundario: `text-zinc-400`.
- Éxito: `emerald` para pagado o activo.
- Advertencia: `amber` para pendiente.
- Error: `red` para moroso o bloqueado.
- Info: `sky` para bot y enlaces.

Tipografía y ritmo:

- Encabezados con `tracking-tight`.
- Importes, IDs y logs con `font-mono`.
- Cards principales con `rounded-xl`.
- Badges y botones con `rounded-lg`.
- Separación estable con `gap-3` entre componentes hermanos y `p-4` como padding base de superficie.

### Sistema de componentes que debe gobernar el diseño

#### `StatusBadge`

Debe ser el primero en consolidarse porque aparece en casi todas las vistas. El contrato recomendado es:

`<StatusBadge status="paid|pending|overdue|idle|blocked" label? size="sm|md" />`

Propósito:

- Unificar estados visuales.
- Evitar variantes repetidas por pantalla.
- Alinear colores, íconos y bordes.

Uso esperado:

- Tool cards.
- Tabla de asientos.
- Historial de billetera.
- Feed de comunidad.

#### `ToolCard`

Debe encapsular estado y CTA contextual, pero no lógica de pago.

Contrato recomendado:

`<ToolCard tool={...} role="organizer|member" onAction={...} />`

Reglas:

- Organizador: ve `Gestionar asientos`.
- Miembro al día: ve `Ver acceso`.
- Miembro pendiente/moroso: ve `Pagar ahora`.
- El componente no paga, no persiste y no decide rutas. Sólo dispara callbacks tipados.

#### `EmptyState`

Debe ser compartido en todas las vistas.

Contrato recomendado:

`<EmptyState icon variant="default|action" title description cta? />`

Reglas:

- Variante `default`: solo información.
- Variante `action`: botones y CTA principal/secondary.
- El ícono entra como `LucideIcon`.

### Blueprint por pantalla

#### Overview

Jerarquía recomendada:

1. Banner de alerta si hay mora.
2. 4 `SummaryCards` en grid.
3. `ToolCards` con CTA contextual.
4. `BotLog` colapsado al final, mostrando sólo los últimos 3 eventos.

Reglas de estado:

- Si no hay herramientas, no mezclar cards vacías con datos reales.
- En ese caso mostrar un `EmptyState` centrado con CTA a `/onboarding/herramienta`.

#### Suscripciones

- Layout de lista, no grid.
- Filtros: todas / como organizador / como miembro.
- Cada fila debe mostrar progreso de asientos, cuota personal y badge de estado.
- CTA principal en el header: `+ Nueva suscripción`.

Empty state:

- Ilustración simple.
- Dos CTA en paralelo: `Crear grupo` y `Tengo un código`.

#### Asientos

- Vista tipo tabla con columnas fijas: `#`, `Miembro`, `Estado`, `Acción`.
- Acciones contextuales:
  - Activo: `Revocar`.
  - Bloqueado: `Liberar`.
  - Libre: `Publicar en comunidad`.
- El organizador ve la tabla completa.
- El miembro sólo ve su `SeatAccessCard`, sin credenciales visibles.

#### Comunidad

- Feed paginado tipo lista, no grid.
- Cada ítem: avatar, usuario, herramienta, precio y CTAs `Unirme` y `Consultar`.
- Filtros: todos / mis publicaciones / guardados.
- Sin infinite scroll en MVP.
- Paginación simple con `Ver más`.

#### Billetera

- Header con dos cards: saldo y próximo cobro.
- Debajo, lista de movimientos con flechas de ingreso/egreso.
- Sin gráficos en MVP.
- Los gráficos van en `/billetera/historial`.

#### Auth y onboarding

- Login y register deben ser simples, directos y sin ruido visual.
- Onboarding debe guiar primero la creación o unión a grupo y luego la primera suscripción.
- No mezclar onboarding con dashboard.

### Estructura funcional mínima que falta o conviene completar

Estas son las piezas que hoy faltan para que la app quede realmente cerrada desde UX/UI y no sólo visualmente bonita:

#### Rutas y shells faltantes

- `app/(marketing)/layout.tsx` para aislar la landing del dashboard.
- `app/(dashboard)/loading.tsx`.
- `app/(dashboard)/error.tsx`.
- `app/(dashboard)/overview/loading.tsx`.
- `app/(dashboard)/asientos/[toolId]/page.tsx`.
- `app/(dashboard)/billetera/historial/page.tsx`.
- `app/not-found.tsx`.
- `app/middleware.ts` o migración equivalente a `proxy`.

#### Componentes de producto que faltan cerrar

- `OnboardingPrompt` para estados vacíos del overview.
- `BillingHeaderCards` para saldo y próximo cobro.
- `SeatRow` o `SeatTableRow` para la tabla de asientos.
- `CommunityPostRow` para el feed de comunidad.
- `HistoryTransactionRow` para billetera/historial.
- `RoleFilterBar` para suscripciones y comunidad.

### Qué herramientas faltan incorporar para que funcione de verdad

Estas son las herramientas o capas que todavía faltan, separadas por prioridad:

#### Críticas

- `features/` como capa real de dominio para billing, seats, groups y access-control.
- Un contrato de datos definitivo para `ToolCard`, `Seat`, `Payment` y `CommunityPost`.
- Una fuente única de estados de acceso y pago para no duplicar lógica en componentes.
- `loading.tsx` y `error.tsx` por rutas principales.
- `not-found.tsx`.
- Migración de middleware a `proxy` cuando toque la actualización recomendada por Next.

#### Muy importantes

- `EmptyState` compartido.
- `StatusBadge` unificado en todo el sistema.
- `ToolCard` con callbacks tipados.
- `RoleFilterBar`.
- `OnboardingPrompt`.
- `BotLog` completo en una ruta propia si se necesita histórico real.

#### Para la siguiente iteración visual

- `Recharts` sólo para `/billetera/historial`.
- Componentes de detalle por herramienta en `/asientos/[toolId]`.
- Mejoras de microcopys y estados de error específicos.

### Instrucción para Claude

Si se usa Claude para implementar, la regla es:

1. Revisar primero el contrato de datos.
2. Luego crear o ajustar el componente reusable.
3. Después montar la pantalla.
4. No meter lógica de negocio dentro de la vista si esa lógica puede vivir en `features/` o `lib/`.

La prioridad técnica no es cubrir todas las pantallas al mismo tiempo. La prioridad es dejar una base coherente para que cada pantalla nueva reutilice el mismo lenguaje visual y los mismos contratos.

## Plan de acción (implementación inmediata)

Objetivo: aplicar la misma lógica visual y de jerarquía usada en `overview` a las pantallas secundarias principales: `suscripciones`, `asientos` y `billetera`, dejando componentes reutilizables y contratos claros.

Alcance de esta iteración:
- Homologar encabezados, cards y estados vacíos usando los componentes compartidos (`StatusBadge`, `EmptyState`, `ToolCard`, `SeatAccessCard`, `SummaryCards`).
- Convertir `suscripciones` a layout de lista con filtros y CTA principal en header.
- Convertir `asientos` a vista tipo tabla con `SeatRow` reusable y acciones contextuales por estado.
- En `billetera` añadir `BillingHeaderCards` (saldo + próximo cobro) y una lista de movimientos mínima; mantener `PaymentTraffic` como apoyo.

Tareas concretas (archivos a tocar):
- `components/dashboard/suscripciones-view.tsx`: refactor a lista; añadir `RoleFilterBar` en header; usar `EmptyState` para vacío.
- `components/dashboard/gestion-asientos-view.tsx`: extraer `SeatRow` y cambiar a tabla accesible; añadir botones contextuales para organizador.
- `components/dashboard/billetera-view.tsx` (y `billetera-page-client.tsx`): agregar `BillingHeaderCards` y `HistoryTransactionRow` para movimientos; mejorar el flujo de mora ya existente con `PaymentRetryBanner`.
- `app/(dashboard)/suscripciones/page.tsx`, `app/(dashboard)/asientos/page.tsx`, `app/(dashboard)/billetera/page.tsx`: nos aseguramos que montan las views refactorizadas y reciben `searchParams` / props necesarias.
- `components/*` compartidos: consolidar `StatusBadge` y `EmptyState` si es necesario.

Criterios de aceptación (al terminar esta iteración):
- Cada pantalla renderiza con la misma jerarquía visual (header → métricas o cards principales → listado/tabla → actividad secundaria).
- Las vistas vacías muestran un `EmptyState` con CTA de onboarding.
- No se introduce lógica de negocio en vistas; derivar datos desde `lib/` o `features/` cuando aplique.

Branch y entregable:
- Nombre de la rama local: `ux/secondary-screens`.
- Contenido: cambios en `UX/UI_DESIGN.md`, ajustes de imports menores y refactor ligero en las views para aplicar la nueva jerarquía.
- Al terminar se debe commitear y empujar la rama al remoto. Si la subida falla por permisos, documentar el error en el commit message y entrego instrucción para subir manualmente.

Siguientes pasos sugeridos (iteración posterior):
- Implementar `RoleFilterBar` y `OnboardingPrompt` como componentes reutilizables.
- Añadir `loading.tsx` y `error.tsx` para rutas del dashboard.
- Refactor deeper en `features/` para mover reglas de negocio a backend/servicios (billing, seats, groups).

---

### Resumen breve de los cambios aplicados ahora

- Se limpió código de `components/dashboard/*` y se aplicó la jerarquía en `overview`.
- Archivos modificados en esta pasada:  
  - [app/(dashboard)/overview/page.tsx](app/(dashboard)/overview/page.tsx)  
  - [components/dashboard/summary-cards.tsx](components/dashboard/summary-cards.tsx)  
  - [components/dashboard/tool-cards.tsx](components/dashboard/tool-cards.tsx)  

Estos cambios ya fueron compilados y validados con `npm run build` localmente; el servidor fue reiniciado y la pantalla `overview` muestra la nueva composición.

Cuando confirmes, empiezo con el refactor de `suscripciones`, `asientos` y `billetera` siguiendo este plan.

  