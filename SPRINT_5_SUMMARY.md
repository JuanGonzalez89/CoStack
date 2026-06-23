# Sprint 5 Summary

## Objetivo de esta fase

Sprint 5 está enfocado en cerrar las brechas funcionales de la interfaz de usuario de CoStack, resolviendo todas las inconsistencias detectadas en la UI actual, aplicando una jerarquía visual técnica y oscura (bg-zinc-950, etc.) descrita en `UI_DESIGN.md`, y estableciendo contratos de datos limpios.

Se dejará de lado la lógica dentro de las vistas y se establecerán componentes fuertemente tipados. El objetivo final es tener la aplicación completamente navegable, coherente visualmente, y con un diseño premium y mantenible.

---

## 📋 Tareas Planificadas (Backlog Completo)

A continuación se detalla todo el alcance funcional y visual de este sprint.

### 1. Refactor de Vistas Secundarias (Jerarquía y Layout)
- [x] **Suscripciones (`components/dashboard/suscripciones-view.tsx`)**: Refactorizar de grid (catálogo) a un layout de lista. Incorporar el `RoleFilterBar` en el encabezado y usar `EmptyState` si no hay datos. Cada fila muestra progreso de asientos, cuota y status badge.
- [ ] **Asientos (`components/dashboard/gestion-asientos-view.tsx`)**: Convertir la vista actual a una tabla accesible usando un nuevo componente `SeatRow`. Ocultar credenciales a los miembros comunes y añadir botones contextuales para el organizador (`Revocar`, `Liberar`, `Publicar`).
- [ ] **Billetera (`components/dashboard/billetera-view.tsx`)**: Agregar componente `BillingHeaderCards` (saldo actual + próximo cobro). Reemplazar placeholders por lista de movimientos real usando un nuevo `HistoryTransactionRow`. Mejorar advertencias de mora con `PaymentRetryBanner`.
- [ ] **Comunidad (`components/dashboard/comunidad-view.tsx`)**: Refactor a un feed paginado (tipo lista, no grid) usando `CommunityPostRow`. Integrar el `RoleFilterBar` (Todos, Mis publicaciones, Guardados).

### 2. Creación y Consolidación de Componentes Compartidos
- [ ] **`StatusBadge`**: Unificar definitivamente todos los estados (`paid`, `pending`, `overdue`, `idle`, `blocked`) para evitar su repetición en las distintas pantallas.
- [ ] **`EmptyState`**: Componente global (con variantes `default` y `action`) para pantallas sin datos, que obligue a pasar un `LucideIcon`, un título, y CTAs de onboarding.
- [x] **`RoleFilterBar`**: Barra estándar de filtros (`Todos`, `Organizador`, `Miembro`).
- [x] **`OnboardingPrompt`**: Tarjetas o banners para guiar al usuario hacia la creación de un grupo o su primera suscripción desde el `overview` cuando está vacío.
- [ ] **`ToolCard`**: Revisar contrato; debe recibir eventos `onAction` pero no debe tener lógica de rutas ni pagos interna.

### 3. Rutas, Shells y Estados de Error (Next.js App Router)
- [x] **Aislar Landing**: Crear `app/(marketing)/layout.tsx` para separar definitivamente la UI pública de los shells del dashboard y nueva landing con 3D Spline.
- [x] **Estados de Carga (Loading)**:
  - Implementar `app/(dashboard)/loading.tsx`.
  - Implementar `app/(dashboard)/overview/loading.tsx`.
- [x] **Estados de Error**:
  - Implementar `app/(dashboard)/error.tsx`.
  - Implementar `app/not-found.tsx` con un diseño técnico y coherente.
- [ ] **Nuevas Rutas**:
  - Crear `app/(dashboard)/asientos/[toolId]/page.tsx` para vistas en detalle.
  - Crear `app/(dashboard)/billetera/historial/page.tsx` (allí irán los gráficos de Recharts).
- [ ] **Middleware**: Evaluar migración de `middleware.ts` a configuración de `proxy` recomendada por Next.js, eliminando warnings en el build.

### 4. Limpieza Arquitectónica (Separación de Preocupaciones)
- [ ] **Contratos de datos (`features/dashboard/contracts.ts`)**: Crear o actualizar una fuente única de la verdad para `ToolCard`, `Seat`, `Payment`, `CommunityPost`.
- [ ] Remover lógicas de pagos, timmers locales y callbacks huérfanos que están en la UI (ej. en `tool-cards.tsx` y `invite-member-modal.tsx`). Toda la regla de negocio pesada debe apuntar a llamar a la API o funciones de servidor.
- [ ] Actualizar las páginas principales (`app/(dashboard)/.../page.tsx`) para asegurar que pasan las props correctamente de acuerdo al `dashboard-snapshot`.

---

## 📈 Progreso de la Ejecución

- [x] Plan de Sprint 5 documentado y expandido con todos los faltantes reales de la arquitectura visual.
- [x] Creado componente `RoleFilterBar` (`components/dashboard/role-filter-bar.tsx`).
- [x] Refactor de `suscripciones-view.tsx` completado (lista, roles, estado vacío).
- [x] Landing page rediseñada y aislada en `app/(marketing)`, incluyendo modelo 3D con Spline y animaciones.
- [x] Rutas y estados de Error/Loading agregados para el dashboard (`error.tsx`, `loading.tsx`, `not-found.tsx`).
- [x] Estabilización de base de datos a entorno local con SQLite y corrección de la instanciación de Prisma y rutas conflictivas.
- [x] Componente `OnboardingPrompt` creado.
- [ ] Refactor de `gestion-asientos-view.tsx` (En espera).
- [ ] Refactor de `billetera-view.tsx` y vistas de Comunidad.
- [ ] Consolidación de StatusBadge, EmptyState, y ToolCard.

*(Este documento servirá de mapa a lo largo de toda la iteración, marcando el progreso a medida que avancen los commits).*
