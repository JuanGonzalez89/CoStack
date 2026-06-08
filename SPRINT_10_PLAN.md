# Sprint 10: "B2C Simplicity Core" (Refactorización de Flujos y Eliminación de Jerga)

**Objetivo:**
Limpiar la herencia de "Sistema Interno" y arquitectura compleja para transformar CoStack en un producto puramente B2C, intuitivo, directo y fácil de usar (siguiendo los requerimientos de simplicidad).

## 1. Simplificación de Navegación y UI
* **[COMPLETADO] Eliminar Pestaña "Comunidad":** Borrar la ruta y lógica de red social (`app/(dashboard)/comunidad`). El usuario viene a ahorrar compartiendo suscripciones, no a interactuar en un foro de freelancers.
* **[COMPLETADO] Limpieza de Terminología B2B (parcial):** "Escrow" traducido a "Compra Protegida" / "Ganancias en Garantía" en UI visible ✅. Sin embargo, **las rutas y componentes aún se llaman "asientos"** (ej: `app/(dashboard)/asientos/`, `gestion-asientos-view.tsx`). El término "Asientos" persiste en nombres de archivos, rutas y componentes.
* **[COMPLETADO] Ocultar Billetera para Compradores:** Un Miembro que solo gasta dinero no debería ver una "Billetera" ni términos de ingresos. Debe reemplazarse por un simple historial de "Mis Pagos".
* **[COMPLETADO] Ocultar "BotEvents" o Logs Técnicos:** El usuario nunca debe cruzarse con "Registros del Bot" o "Eventos de Sistema".

## 2. Refactor de Flujos y Lógica
* **[COMPLETADO] Eliminar el Rol Global (`UserRole`) - PARCIAL:** El layout y la mayoría de páginas ahora usan `membership.role` ✅. **Pero sigue pendiente:** El campo `role` en `User` de Prisma aún existe, `settings/page.tsx` usa `user?.role`, y `payments/request/route.ts` propaga `user.role`.
* **[COMPLETADO] Automatización del Flujo "Business Tools":** Implementado. Texto de 24hs y reembolso automático visible en `success-access-card.tsx`. Condicional `isBusiness` funciona correctamente.
* **[COMPLETADO] Carga de Credenciales Bloqueante:** Implementado. `/api/groups/toggle-automatch` valida credenciales antes de activar Automatch.
* **[COMPLETADO] Toggle Privado vs Automatch:** Implementado. UI toggle en `gestion-asientos-view.tsx` + API endpoint funcional.

## 3. Transparencia B2C vs Complejidad Backend
* **[COMPLETADO] Traducción de "Escrow":** Implementado. "Ganancias en Garantía" visible en UI. Sin texto "Escrow" visible al usuario.
* **[COMPLETADO] Modelo Estricto de Prepago (Eliminar `overdue`) - PARCIAL:** Prisma schema actualizado sin `overdue` ✅, componentes viejos eliminados ✅. **Pero la migración SQL real aún contiene `'overdue'` en los ENUMs** ❌. Hay que regenerar migración.
* **[PENDIENTE] Ocultar la complejidad de "Grupos":** La palabra "Grupo" aún aparece en **6+ lugares** de la UI (`gestion-asientos-view.tsx`, `cancel-license-modal.tsx`, `seat-access-card.tsx`, `config-credentials-modal.tsx`, etc.). Falta reemplazar por términos B2C como "espacio", "acceso", o "suscripción".
* **[COMPLETADO] Eliminar Onboarding B2B:** Implementado. Directorio `onboarding/` eliminado, formulario de auth limpio. **Ojo:** `app/sitemap.ts` aún referencia `ROUTES.onboarding` que ya no existe ❌.
* **[COMPLETADO] Corregir el "Dashboard Snapshot" Estático:** Implementado. `getDashboardSnapshot(userEmail?)` filtra correctamente por usuario logueado.
* **[COMPLETADO] Problema de Múltiples Grupos - PARCIAL:** Overview itera grupos con `.map()` ✅, billetera usa `flatMap` ✅. **Pero** `summary-cards.tsx`, `gestion-asientos-view.tsx`, y `payment-traffic.tsx` aún dependen de `latestGroup` ❌.

## 4. Inconsistencias UX Detectadas en la Auditoría Final (Para Resolver)
* **[COMPLETADO] Buscador y Filtros Ausentes:** Implementado. Search bar + filtros por categoría (AI, Design, IDE) en `suscripciones-view.tsx`.
* **[COMPLETADO] Visualización de Credenciales Confusa:** Implementado. Botón "Revelar Contraseña" con copiado en `success-access-card.tsx`.
* **[COMPLETADO] Fricción de Mail en Business Tools:** Implementado. Input de email para business tools en `checkout-view.tsx`.
* **[PENDIENTE] Checkout de Organizador Conceptualizado como "Compra":** El botón "Compartir esta cuenta" existe y apunta a `/suscripciones/share/[tool]` ✅, **pero la ruta no existe** ❌. Da 404 al hacer clic. Hay que crear el componente de página.
* **[COMPLETADO] Consecuencias de Cancelación Ocultas:** Implementado. Modal con reglas claras en `cancel-license-modal.tsx`.

## 5. Fase 2 de Refactorización UI/UX (Pendientes Billetera y Dashboard)
* **[COMPLETADO] La "Billetera" no tiene sentido para los Compradores:** Implementado. Sidebar dinámico, vista separada para buyers.
* **[COMPLETADO] Jerga Técnica (Escrow) Sobreviviente:** Implementado. Reemplazado por "Ganancias en Garantía".
* **[COMPLETADO] Lógica Financiera Incorrecta:** Implementado. MRR real calculado como suma de pagos `paid`.
* **[COMPLETADO] Billetera "Ciega" a Múltiples Grupos:** Implementado. `flatMap` sobre `activeGroups`.

## 5. Fase 2 de Refactorización UI/UX (Pendientes Billetera y Dashboard)
* **[COMPLETADO] La "Billetera" no tiene sentido para los Compradores:** Vista separada implementada. Compradores ven "Historial de Pagos" sin saldo; organizadores ven la Billetera completa con MRR. El sidebar también cambia dinámicamente el nombre del link según el rol.
* **[COMPLETADO] Jerga Técnica (Escrow) Sobreviviente:** Reemplazado por "Ganancias en Garantía" en `billing-header-cards.tsx`.
* **[COMPLETADO] Lógica Financiera Incorrecta ("Próximo Cobro" vs "Ingresos Recurrentes"):** MRR ahora se calcula como suma de pagos confirmados ('paid') de todos los grupos del organizador.
* **[COMPLETADO] Billetera "Ciega" a Múltiples Grupos:** `billetera-view.tsx` ahora hace `flatMap` sobre `activeGroups` para agregar movimientos de TODOS los grupos.

## 6. Pendientes Verificados (Post-Auditoría)

### 🔴 Bugs y Flujo de Pago
* **[PENDIENTE] Error "No tienes una reserva activa" al pagar:** El checkout-view monta el reserve, pero si falla el reserve (error silencioso con `.catch(console.error)`), el pay después no encuentra la reserva. Mejorar manejo de errores encadenados.
* **[PENDIENTE] Sync DB migration - eliminar `overdue`:** El schema de Prisma ya no tiene `overdue`, pero la migración SQL real aún lo define en `PaymentStatus` y `SeatStatus`. Regenerar migración.

### 🔴 Terminología y UI Inconsistente
* **[PENDIENTE] Rutas y componentes "Asientos":** Renombrar la ruta `/asientos` a `/cupos` o `/suscripciones`, y el componente `gestion-asientos-view` a `gestion-cupos-view`. Actualizar referencias en routes.ts, sitemap.ts, sidebar, etc.
* **[PENDIENTE] Ocultar "Grupo" de la UI:** Reemplazar ~6 ocurrencias de "grupo" en UI por términos B2C (ej: "espacio", "acceso", "suscripción"). Archivos: `cancel-license-modal.tsx`, `gestion-asientos-view.tsx`, `seat-access-card.tsx`, `config-credentials-modal.tsx`.
* **[PENDIENTE] Ruta `/suscripciones/share/[tool]` no existe:** El botón "Compartir esta cuenta" redirige a una ruta que da 404. Crear la página de share para que el organizador pueda configurar credenciales sin pasar por checkout.
* **[PENDIENTE] sitemap.ts refencia `ROUTES.onboarding` eliminado:** Actualizar o eliminar la referencia en `app/sitemap.ts`.

### 🔴 Rol Global y Settings
* **[PENDIENTE] Eliminar `User.role` del schema Prisma:** El campo `role` en `User` ya no debería existir. Migrar la lógica existente a `membership.role`.
* **[PENDIENTE] Settings page usa `user?.role` global:** Cambiar a verificación por membership.
* **[PENDIENTE] payments/request/route.ts propaga `user.role`:** Cambiar a leer el rol desde membership.

### 🔴 Múltiples Grupos (Componentes Atrasados)
* **[PENDIENTE] summary-cards.tsx usa `latestGroup`:** Refactorizar para iterar sobre `activeGroups`.
* **[PENDIENTE] gestion-asientos-view.tsx usa `latestGroup`:** Refactorizar para manejar múltiples grupos.
* **[PENDIENTE] payment-traffic.tsx usa `latestGroup`:** Refactorizar para usar datos agregados.

### 🔴 Post-Purchase Flow
* **[PENDIENTE] Verificar flujo completo post-pago:** Asegurar que reserve → pay → success page funcione sin errores.
* **[PENDIENTE] Botón "Confirmar Pago" sin overflow:** Verificar que `truncate` + tamaño de texto no se desborden del contenedor blanco.
