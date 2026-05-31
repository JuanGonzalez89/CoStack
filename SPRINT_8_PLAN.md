# Sprint 8 Plan - Segunda Parte

## Objetivo
Cerrar la segunda parte del producto separando claramente dos frentes: lo que todavía falta por producir y la capa visual final.

## Lo que ya quedó resuelto en Sprint 7
- La primera visita ya entiende CoStack sin jerga interna.
- Landing, onboarding, catálogo, checkout y overview ya quedaron alineados con la narrativa B2C.
- La navegación y el copy visible ya no dependen de frases como "CTA contextual" ni de términos demasiado técnicos.
- El dashboard de member y organizer ya tiene una lectura más clara.

## Alcance de Sprint 8
### Parte 1 - Lo que falta por producir
Objetivo: cerrar la funcionalidad que quedó pendiente en Sprint 7.

#### 1. Auto-Match real
Tareas:
- Implementar Auto-Match real con reglas de asignación claras.
- Definir el criterio de compatibilidad entre herramienta, cupo disponible y usuario.
- Persistir el estado de asignación para que sobreviva reloads y reintentos.
- Evitar carreras de concurrencia cuando varios usuarios intentan comprar el mismo cupo.

Buenas prácticas:
- Usar transacciones y bloqueo optimista o pesimista según el caso.
- Mantener la lógica de asignación en servidor, no en cliente.
- Registrar eventos de decisión para debug y auditoría.

#### 2. Reserva temporal y expiración confiable
Tareas:
- Mover la expiración del cupo a validación server-side.
- Guardar `expiresAt` y estados derivados en la base.
- Liberar cupos vencidos de forma automática.
- Mostrar estados claros de vencido, pendiente y confirmado.

Buenas prácticas:
- Nunca confiar en timers del cliente para decisiones críticas.
- Centralizar la verdad del estado en el servidor.
- Preparar cronjobs o jobs de fondo para limpieza.

#### 3. Cobro real y webhooks
Tareas:
- Integrar Stripe real para cobros.
- Procesar eventos de pago con webhook firmado.
- Sincronizar el estado de `Payment` con el evento recibido.
- Evitar duplicados e idempotencia débil.

Buenas prácticas:
- Verificar firma del webhook siempre.
- Diseñar handlers idempotentes.
- Registrar errores con contexto mínimo pero útil.

#### 4. Organizer seguro y escalable
Tareas:
- Separar aún más la UI operativa del member.
- Definir rutas y permisos por rol con claridad.
- Conectar invitaciones, acceso protegido y gestión del espacio de forma consistente.
- Revisar pagos en mora y recuperación de acceso con flujos explícitos.

Buenas prácticas:
- Feature flags por rol si hace falta.
- Principio de menor privilegio en acciones sensibles.
- Mantener naming simple para el usuario y técnico solo para el código.

#### 5. Robustez transversal
Tareas:
- Extender error boundaries a checkout, catálogo y rutas críticas.
- Mejorar observabilidad de fallos de red y fallos de servidor.
- Consolidar mensajes de error orientados a acción.
- Validar accesibilidad básica en pantallas de conversión.

Buenas prácticas:
- Un error de red no debe borrar el contexto del usuario.
- Mensajes accionables, no mensajes internos del stack.
- Revisar contraste, foco y navegación por teclado.

### Parte 2 - Visual final
Objetivo: que la segunda parte también se vea más clara, liviana y respirable.

#### Dashboard / Overview
Problemas:
- Demasiados bloques compitiendo al mismo tiempo: resumen, herramientas, pagos, acceso y actividad.
- El panel organizer sigue sintiéndose operativo antes que comprensible.
- El feed tipo bot/log todavía introduce ruido técnico.
- La jerarquía no siempre deja claro cuál es la acción principal.
- En mobile, si se apila todo, la pantalla puede sentirse más pesada de lo necesario.

Propuesta visual:
- Separar la experiencia por rol con progressive disclosure real.
- Member: una sola historia visual, qué tengo activo, qué acceso tengo, qué sigue.
- Organizer: vista general con tarjeta principal y actividad secundaria colapsable.
- Reemplazar el bot log visible por un feed de actividad simple, narrado en lenguaje humano.
- Reducir la cantidad de módulos visibles por defecto; lo secundario debería vivir en tabs o drawers.
- Cada pantalla debería tener 1 CTA dominante, no 3 o 4 a la vez.

Estructura sugerida:
- DashboardShell
- RoleHeader
- PrimaryStatusCard
- MemberSnapshotCard o OrganizerSnapshotCard
- ActivityFeed
- PaymentsPanel
- AccessCard
- SecondaryDrawer o MoreDetailsSheet

Layout visual:
- Desktop: grid de 2 columnas, con una columna principal ancha y una secundaria más liviana.
- Mobile: stack simple, con PrimaryStatusCard primero y lo demás debajo.
- ActivityFeed al final o dentro de un collapse.
- Spacing generoso, evitando bloques densos.

#### Billetera
Problemas:
- Puede sentirse como una mezcla de saldo, historial y cobros sin una narrativa clara.
- Si se muestran demasiados datos al mismo nivel, el usuario no entiende cuál es el estado importante.
- El empty state o el historial vacío suelen resolverse con texto genérico.
- Los estados de cobro vencido o próximo vencimiento deben ser obvios a primera vista.

Propuesta visual:
- La billetera debería contar una sola historia: qué tengo activo, cuánto pago, qué vence y qué pasó.
- Arriba: tarjeta principal con saldo, próximo cobro y estado del acceso.
- Abajo: historial como timeline, no como tabla fría si no aporta más valor.
- Si no hay movimientos, mostrar una guía útil que explique el siguiente paso.
- Los estados deben ser semánticos y consistentes: listo, pendiente, vencido.

Estructura sugerida:
- WalletHeader
- BalanceSummaryCard
- NextChargeCard
- AccessStatusCard
- MovementTimeline
- EmptyState
- StatusBadge

Layout visual:
- Desktop: hero arriba, luego dos columnas con resumen y actividad.
- Mobile: una sola columna, con el estado más importante primero.
- El timeline debe tener aire visual, con separación entre ítems.
- Los badges de estado deben tener contraste suficiente y un ícono contextual.

#### Catálogo / Suscripciones
Problemas:
- Si el card tiene demasiados datos técnicos, parece catálogo de e-commerce genérico y no decisión guiada.
- Los estados agotado, pendiente y vencido necesitan ser obvios con color y forma, no sólo con texto.
- Un buscador + varios filtros puede saturar si no se prioriza.
- El usuario nuevo necesita entender rápido por qué una herramienta conviene.

Propuesta visual:
- Convertir el catálogo en un descubridor de herramientas.
- Arriba: buscador simple + chips de filtro.
- Cada card debe responder tres preguntas: qué es, cuánto cuesta, cuántos cupos hay.
- CTA único y directo: comprar / reservar.
- Cuando una herramienta esté agotada, mostrar un estado claro y no un botón ambiguo.
- El card no debería competir con más de 4 datos al mismo tiempo.

Estructura sugerida:
- CatalogHeader
- SearchBar
- FilterChips
- SortMenu
- ToolGrid
- ToolCard
- ToolCardStatus
- EmptyState

Layout visual:
- Header compacto, buscador dominante.
- Grid responsive de cards con suficiente spacing.
- La etiqueta de disponibilidad debe vivir arriba a la derecha del card.
- En mobile, filtros en scroll horizontal y cards de una columna.

#### Gestión de Asientos
Problemas:
- Esta es la pantalla más propensa a parecer backend expuesto.
- Una tabla densa con demasiados números, badges y acciones puede intimidar.
- Asientos ocupados, liberar, revocar y similares necesitan jerarquía y contexto.
- Si el organizer ve todo al mismo nivel, termina escaneando en vez de decidir.

Propuesta visual:
- Transformarla en una vista operativa más humana: lista + detalle, no tabla plana como base principal.
- En lugar de exponer todo, mostrar 3 cosas: estado del cupo, quién lo usa y acción recomendada.
- Si hay creación o configuración, eso debería ir por wizard, no por formulario largo.
- La acción más común debería ser una sola, por ejemplo gestionar acceso.
- La parte delicada debería vivir en detalle o drawer.

Estructura sugerida:
- SeatsPage
- SeatsToolbar
- SeatList
- SeatRow
- SeatDetailDrawer
- SeatActionMenu
- SeatWizard si hay flujo de alta/configuración
- StatusBadge

Layout visual:
- Desktop: lista a la izquierda, detalle a la derecha.
- Mobile: lista como cards apiladas, detalle en drawer o modal full-screen.
- La acción primaria debe estar arriba, visible y sin competencia.
- Los estados deben usar color + texto + ícono, no sólo color.

#### Onboarding / Wizards
Problemas:
- El onboarding tipo formulario largo se siente como carga administrativa.
- Pedir demasiadas cosas de entrada baja conversión.
- Si el sistema pregunta todo junto, el usuario no sabe por dónde empezar.
- La experiencia debe sentirse conversacional, no como una pantalla de base de datos.

Propuesta visual:
- Rediseñarlo como wizard de una pregunta por vez.
- Primero intención, luego herramienta, luego capacidad, luego confirmación.
- Si el usuario viene con código, entrar directo a ese paso, no repetirlo todo.
- Mostrar progreso claro, pero sin parecer un formulario corporativo.
- Cerrar con una pantalla de éxito que explique el siguiente paso.

Estructura sugerida:
- WizardShell
- WizardProgress
- StepIntro
- StepToolSelection
- StepCapacity
- StepInviteCode
- StepReview
- SuccessView
- WizardFooterActions

Layout visual:
- Card centrada, ancho controlado, mucho aire.
- Una sola pregunta por pantalla.
- Barra de progreso arriba.
- Botones claros: continuar, volver, cancelar.
- No meter bloques laterales si el wizard ya es de por sí complejo.

#### Principios visuales transversales
- Cero ruido visual: eliminar elementos técnicos innecesarios para usuario final.
- Jerarquía y contraste: asegurar legibilidad y un CTA dominante por pantalla.
- Progresive disclosure: lo secundario va en drawer, tabs o collapse.
- Estados semánticos: listo, pendiente, vencido, agotado.
- Una sola intención por vista.

Tareas:
- Ajustar densidad visual en dashboard, billetera, catálogo y wizard de onboarding.
- Reforzar jerarquía tipográfica, contraste y espaciado de componentes críticos.
- Unificar estados vacíos, badges y llamadas a la acción.
- Revisar que la versión organizer siga siendo clara sin sentirse cargada.

Buenas prácticas:
- Menos bloques simultáneos, más foco por pantalla.
- Una sola acción principal por vista.
- Estados visuales consistentes entre member y organizer.

## Prioridad
### P0
1. Auto-Match real.
2. Reserva temporal server-side.
3. Expiración confiable de cupos.
4. Stripe real con webhooks.
5. Idempotencia de cobros y asignaciones.

### P1
1. Separación más fuerte entre member y organizer.
2. Gestión de invitaciones y acceso protegido.
3. Mejoras de errores y observabilidad.

### P2
1. Ajustes finos de copy si reaparece jerga interna.
2. Pulido visual adicional en pantallas secundarias.
3. Documentación de decisiones técnicas y de producto.

## Definición de Done
- El Auto-Match persiste y se recupera después de refresh o reinicio.
- La reserva expira del lado del servidor y libera el cupo correctamente.
- El pago real se confirma por webhook y queda reflejado en la base.
- La UI muestra estados claros sin depender del cliente para la verdad del negocio.
- Las rutas críticas mantienen UX estable con errores controlados.
- El organizer sigue siendo funcional sin contaminar la primera visita.

## Dependencias
- Variables de entorno para Stripe y webhooks.
- Jobs de fondo o cron para limpieza de cupos.
- Modelo de datos listo para estados transicionales y auditoría.
- Reglas claras de permisos por rol.
