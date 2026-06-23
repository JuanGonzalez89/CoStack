# SPRINT 10: Sala de Espera B2C + UX Completa + Deuda Técnica

**Estado: EN PROGRESO** | Fecha: 10 de junio de 2026

Este sprint transformó el modelo de compra de "pago → acceso inmediato" a un sistema de **salas de espera colaborativas** donde los usuarios se agrupan hasta completar los cupos de una licencia y recién ahí se activa.

---

## ✅ COMPLETADO

### Sistema de Lobby / Sala de Espera
- [x] Modelos Prisma: `Lobby`, `LobbyMember`, `Notification` (creados y migrados)
- [x] API `GET /api/lobby/[id]` con mock auto-fill cada 10s y auto-complete
- [x] Componente `lobby-view.tsx`: progress bar, miembros anónimos, timer 24hs, refund notice
- [x] Componente `sala-espera-intro.tsx`: modal explicativo antes de entrar
- [x] Hook `use-lobby-polling.ts`: poll cada 5s
- [x] Store `lobby-mock-store.ts`: simulación de miembros mock en memoria
- [x] Campana de notificaciones `notification-bell.tsx` con badge + dropdown
- [x] API `GET /api/notifications` + `PATCH /api/lobby/[id]/notification`
- [x] Cupos dinámicos por herramienta (`availableSeats` del catálogo, no hardcodeado 10)

### Flujo de Compra (Checkout → Lobby → Dashboard)
- [x] `POST /api/checkout/pay` refactorizado: crea/une a Lobby en vez de Seat+Payment
- [x] Rate limit: max 2 lobbies/día para organizers
- [x] Checkout redirige a `/overview?lobbyId=xxx`
- [x] Overview auto-abre SalaEsperaIntro al detectar lobbyId del query param
- [x] `buildToolCards` procesa lobbies después de seats (sobreescribe correctamente)
- [x] `<Toaster />` agregado al layout raíz (toasts ahora visibles)
- [x] `snapshot` declarado en scope de función (bug de try-catch arreglado)

### Landing Page
- [x] Rediseño completo: fondo `zinc-950`, acentos cyan
- [x] Navbar: logo izquierda, links centrados (Funciones / Herramientas / Empezar)
- [x] Login/Registro solo en CTA de abajo
- [x] Eliminado gradiente cyan inferior
- [x] Robot 3D intacto
- [x] Copys profesionales

### Onboarding / Primer Ingreso
- [x] `ScreenTour`: 4 tooltips con flechas apuntando a cada pantalla del sidebar
- [x] `WelcomePanel`: modal "Como organizador/usuario" con pasos claros
- [x] HelpButton `?` fijo arriba derecha (reabre el tour en cualquier momento)
- [x] Secuencia: ScreenTour → WelcomePanel → guardar flag → no repetir
- [x] `role-selector.tsx` limpia flag al completar onboarding

### Dashboard
- [x] Eliminada sección "Estado operativo" / `SummaryCards` (datos B2B irrelevantes)
- [x] ToolCards unificado para organizer y member
- [x] Página bloqueada si no hay tools (con botones catálogo + cambiar rol)
- [x] Overview no crashea (try-catch + scope fixes)

### Auth
- [x] `authorize` en `lib/auth.ts` usa `select` para evitar objeto Prisma completo
- [x] "Volver al marketing" → "Volver al inicio"
- [x] Welcome page bloquea cambio de rol si hay membresías activas
- [x] `user-journey.server.ts` sin consultas a lobbyMember (evita crash sin DB)

### Soporte / Ayuda
- [x] Nueva página `/ayuda`: WhatsApp prominente + FAQ + features
- [x] Sidebar: "Ayuda" en Principal
- [x] Mobile-nav: incluye Ayuda

### Fixes Visuales
- [x] `LicenseDetailModal`: `showCloseButton={false}` (X doble), `max-w-2xl`, más compacto
- [x] `SalaEsperaIntro`: más ancho, 2 columnas, X visible
- [x] `SubscriptionDetailModal`: botón "Ir a {provider}" con `providerUrl`
- [x] Suscripciones view: sin badge "MercadoPago/Crypto"
- [x] Settings: "Grupos" → "Suscripciones activas" con renovación
- [x] Sidebar badge: `N · renueva DD/MM`

### DB
- [x] `npx prisma db push` ejecutado — PostgreSQL `costack` sincronizado

---

## 🔄 EN PROGRESO

### Simulación de sala de espera
- [ ] Verificar que el mock auto-fill funcione correctamente en producción
- [ ] Ajustar intervalo de mock (actualmente 10s) según feedback
- [ ] Probar transición completa: pago → lobby → completado → notificación

### UX post-compra
- [ ] La notificación debe mostrar claramente el nombre de la herramienta
- [ ] Verificar que el modal de credencial aparece al completarse la sala
- [ ] Probar el flujo como organizador y como miembro

---

## 📋 PENDIENTE (del plan original)

### Flujo de Retiro de Fondos (Payouts)
- Construir pantalla para que Organizadores retiren saldo a CBU/CVU

### Configuración de Credenciales Compartidas
- Modal seguro para que el Organizador ingrese usuario/contraseña
- Guardar encriptado, revelar solo a miembros que pagaron

### Toggle "Privado vs Automatch"
- Switch en Gestión de Cupos para exponer o mantener privado el grupo

### Consecuencias de Cancelación
- Modal de advertencia al darse de baja como organizador

### Flujo Roto de "Compartir Herramienta" (404)
- Reconstruir `/suscripciones/share/[toolId]`

### Limpieza de Asientos Pendientes (Cron Job)
- `/api/cron/cleanup-seats` cada 5 minutos

### Conexión Real con Stripe
- Reemplazar `MOCK_PAYMENT = true` por Stripe Checkout Session real
- Capturar webhooks `checkout.session.completed`

### Eliminación del "Rol Global"
- Refactor quirúrgico para roles por Membership, no por User

### Eliminación de "Overdue"
- Borrar lógica de mora, solo corte estricto (Expired → Liberar cupo)
