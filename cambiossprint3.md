# Cambios Sprint 3 — Flujo B2C Sala de Espera + UX Completa

Fecha: 10 de junio de 2026

---

## 1. Sistema de Lobby / Sala de Espera (Nuevo Core)

### Nuevos modelos en Prisma
- **`Lobby`**: sala de espera para cada herramienta. Campos: `toolSlug`, `toolName`, `provider`, `totalSeats`, `pricePerSeat`, `fullPrice`, `status` (waiting, completed, expired), `expiresAt`, `accessToken`, `creatorId`.
- **`LobbyMember`**: cada usuario que pagó y entró a la sala. Campos: `lobbyId`, `userId`, `seatIndex`, `amount`, `status` (paid, refunded).
- **`Notification`**: notificaciones para cuando la sala se completa. Campos: `userId`, `lobbyId`, `message`, `read`.

### Nuevos enums
- `LobbyStatus`: `waiting | completed | expired`
- `MemberLobbyStatus`: `paid | refunded`

### API endpoints nuevos
| Ruta | Método | Función |
|---|---|---|
| `/api/lobby/[id]` | GET | Status del lobby + mock auto-fill cada 10s + auto-complete al llegar al total |
| `/api/lobby/[id]/notification` | PATCH | Marcar notificación como leída |
| `/api/notifications` | GET | Lista notificaciones del usuario + unreadCount |

### Componentes nuevos
| Componente | Ubicación | Función |
|---|---|---|
| `lobby-view.tsx` | `components/dashboard/` | Sala de espera: progress bar, miembros anónimos, timer 24hs, refund notice, transición a credential modal |
| `sala-espera-intro.tsx` | `components/dashboard/` | Modal explicativo antes de entrar: por qué esperar, pago protegido, anónimo |
| `lobby-mock-store.ts` | `lib/` | Store en memoria para simular miembros mock cada 10s |
| `use-lobby-polling.ts` | `hooks/` | Hook: poll cada 5s del lobby + notificaciones |
| `notification-bell.tsx` | `components/dashboard/` | Campana con badge rojo + dropdown de notificaciones |
| `screen-tour.tsx` | `components/dashboard/` | Tour con tooltips apuntando a cada pantalla del sidebar |
| `welcome-panel.tsx` | `components/dashboard/` | Modal "Como organizador/usuario" con pasos a seguir |
| `help-button.tsx` | `components/dashboard/` | Botón `?` fijo arriba a la derecha que abre ScreenTour → WelcomePanel |
| `ayuda-view.tsx` | `components/dashboard/` | Página de soporte con WhatsApp + FAQ |
| `role-guide-modal.tsx` | `components/dashboard/` | (Deprecado, reemplazado por WelcomePanel) |
| `onboarding-tour.tsx` | `components/dashboard/` | (Deprecado, reemplazado por ScreenTour) |
| `onboarding-sequence.tsx` | `components/dashboard/` | (Deprecado, reemplazado por HelpButton) |

### Nuevas rutas/páginas
| Ruta | Archivo |
|---|---|
| `/ayuda` | `app/(dashboard)/ayuda/page.tsx` |

---

## 2. Landing Page (Rediseño)

### Archivo: `components/landing/landing-page.tsx`

- Fondo `bg-zinc-950` (unificado con dashboard)
- Navbar: logo a la izquierda, links centrados (Funciones / Herramientas / Empezar), sin botones de login
- Login/Registro solo en el CTA de abajo, centrado, botón "Crear cuenta gratis" destacado
- Se eliminó el gradiente cyan inferior
- Robot 3D intacto (`HeroRobotScene`)
- Copys profesionales: "Pagá menos, accedé igual"

### Archivo: `app/(marketing)/page.tsx`
- Simplificado: ya no pasa `hasSession`, LandingPage no recibe props

---

## 3. Welcome + Onboarding (UX Primer Ingreso)

### Flujo nuevo
1. Usuario se registra → va a `/welcome` → elige rol → onboarding completion
2. `role-selector.tsx` limpia `localStorage("costack_welcome_panel")`
3. Redirect a `/suscripciones`
4. `HelpButton` se monta en el layout → detecta que no hay flag → abre `ScreenTour`
5. `ScreenTour`: 4 tooltips con flechas apuntando a cada item del sidebar (Dashboard, Suscripciones, Billetera, Ajustes)
6. Al terminar → abre `WelcomePanel`: "Como organizador" o "Como usuario" con pasos
7. Al cerrar → guarda flag en localStorage, no vuelve a aparecer

### Reapertura
- Botón `?` fijo arriba a la derecha (`HelpButton`) permite reabrir el tour en cualquier momento

---

## 4. Dashboard (Overview)

### Archivo: `app/(dashboard)/overview/page.tsx`

- **Eliminada** la sección "Estado operativo" / `SummaryCards` (mostraba datos B2B irrelevantes)
- Ahora muestra directamente `ToolCards` con:
  - Cards de lobby (status `lobby`) → "Ver sala de espera (X/Y)"
  - Cards de suscripciones activas (status `assigned`)
- Si no hay tools y no es organizer → página bloqueada con "Ir al catálogo" y "Cambiar de rol"
- `buildToolCards` refactorizado: procesa seats (viejo) primero, luego lobbies (nuevo) que sobreescriben
- `snapshot` declarado en scope de función (arreglado el bug de try-catch)
- Errores del try-catch logueados con `console.error`

### Fix: `buildToolCards`
- **Problema**: los lobbies se procesaban PRIMERO y los seats DESPUÉS, pisando el status `lobby` con `pending`
- **Fix**: invertido el orden. Seats primero, lobbies después (lobbies sobreescriben)

---

## 5. Flujo de Pago (Checkout → Lobby → Dashboard)

### Archivo: `app/api/checkout/pay/route.ts`
- Eliminada la lógica vieja de `seat` + `payment` (Mock Process)
- Nuevo flujo: find or create `Lobby` → create `LobbyMember`
- Rate limit: max 2 lobbies creados por día por organizer
- `totalSeats` dinámico: usa `catalogEntry.availableSeats` (no hardcodeado 10)
- Fallback si las tablas de lobby no existen en DB

### Archivo: `components/dashboard/checkout-view.tsx`
- Colores mejorados: fondo oscuro, texto blanco legible, botón cyan
- UI simplificada: pasos numerados, sin jerga B2B
- Al pagar: toast "Te uniste a la sala de espera" → redirect a `/overview?lobbyId=xxx`
- Overview detecta `lobbyId` del query param → auto-abre `SalaEsperaIntro`

### Fix: `<Toaster />`
- **Problema**: los toast de `sonner` no se veían
- **Fix**: agregado `<Toaster theme="dark" position="top-center" />` en `app/layout.tsx`

---

## 6. Auth (Registro + Login)

### Archivo: `lib/auth.ts`
- `authorize` usa `select` para devolver solo `{ id, email, name }` (antes devolvía el objeto Prisma completo con relaciones rotas → causaba `api/auth/error`)
- Eliminado `name` de las `credentials` del provider

### Archivo: `app/(auth)/layout.tsx`
- "Volver al marketing" → **"Volver al inicio"**

### Archivo: `app/welcome/page.tsx`
- Bloquea cambio de rol si el usuario tiene membresías activas
- Si no tiene → muestra `RoleSelector` con `isChangingRole`

### Archivo: `lib/user-journey.server.ts`
- Eliminada consulta a `lobbyMember.count` (causaba crash cuando la tabla no existía)

---

## 7. Soporte / Ayuda

### Nueva página: `/ayuda`
- WhatsApp arriba prominente: `+54 11 4427-6384` — botón verde con link directo
- Features: "Pago protegido", "Soporte real"
- FAQ: cómo funciona la sala, tiempos, uso del código, cancelaciones

### Sidebar
- "Ayuda" en sección Principal (no en sección separada como antes)
- Mobile-nav también incluye "Ayuda"

---

## 8. Modales (Fixes visuales)

### `license-detail-modal.tsx`
- `showCloseButton={false}` (arregla doble X del Dialog de shadcn)
- `max-w-2xl` (más ancho)
- Diseño compacto: features en 2 columnas, padding reducido

### `sala-espera-intro.tsx`
- Más ancho (`max-w-xl`)
- Cards en 2 columnas (menos altura)
- X para cerrar visible

### `subscription-detail-modal.tsx`
- Agregado `providerUrl` y botón "Ir a {provider}" que abre en nueva pestaña

---

## 9. Miscelánea

### Rate limiting
- Organizadores: máximo 2 lobbies creados cada 24hs
- Explicado en el WelcomePanel

### Cupos dinámicos
- Cada herramienta del catálogo usa su `availableSeats` (2, 4, 5, etc.)
- `lobby-mock-store.ts` recibe `totalSeats` dinámico

### Suscripciones view
- Eliminado badge "Retiros a MercadoPago / Crypto"
- Solo 2 badges: "Compra Segura" y "Sala de espera en tiempo real"

### Settings page
- "Grupos" → "Suscripciones activas" con conteo real de pagos
- Cada suscripción muestra "Renueva el DD/MM/AAAA"

### Sidebar
- Badge de Suscripciones muestra `N · renueva DD/MM`

### DB Migration
- `npx prisma db push` ejecutado exitosamente
- PostgreSQL `costack` en `localhost:5432` sincronizado

---

## Archivos tocados (total: ~30 archivos)

**Nuevos**: 16 archivos
**Modificados**: ~14 archivos
**Deprecados (sin borrar)**: `onboarding-tour.tsx`, `onboarding-sequence.tsx`, `role-guide-modal.tsx`
