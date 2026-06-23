# Sprint 3 Summary

## Qué se completó

Sprint 3 cerró la base de persistencia y empezó a mover el dashboard desde UI simulada hacia datos reales respaldados por PostgreSQL y Prisma.

### Infraestructura y backend

- Se configuró Prisma 7 con `prisma.config.ts` y un datasource real por `DATABASE_URL`.
- Se creó el esquema de dominio en `prisma/schema.prisma` con usuarios, grupos, membresías, herramientas, asientos, pagos, posts y eventos del bot.
- Se agregó `lib/prisma.ts` para usar `pg` y `@prisma/adapter-pg` con reutilización del cliente en desarrollo.
- Se incorporó `lib/auth.ts` con NextAuth y Prisma Adapter.
- Se sumaron rutas API reales para auth, grupos, miembros, webhook del bot, webhook de pagos y snapshot del dashboard.
- Se agregaron `prisma/seed.ts` y el comando `npm run seed` para poblar el entorno local.

### Dashboard con datos persistidos

- Se creó `lib/dashboard-snapshot.ts` como contrato compartido de lectura.
- Se agregó `components/dashboard/use-dashboard-snapshot.ts` para consumir el snapshot desde cliente sin duplicar fetches.
- `billetera-view.tsx`, `comunidad-view.tsx` y `payment-traffic.tsx` dejaron de depender de arrays totalmente hardcodeados y pasaron a leer datos del snapshot persistido.
- `app/(dashboard)/overview/page.tsx` quedó alineado con el hook compartido para mostrar el estado persistido del grupo.

### Validación

- `npx prisma generate` funcionó con la configuración nueva de Prisma 7.
- `npx prisma db push --accept-data-loss` funcionó contra la base local.
- `npm run seed` cargó datos locales correctamente.
- `npm run build` pasó al final de la etapa.

## Qué quedó para una siguiente pasada

Hay algunas superficies que todavía usan fixtures o estado local porque no bloqueaban el cierre de Sprint 3, pero sí conviene moverlas a datos persistidos más adelante:

- `components/dashboard/tool-cards.tsx` sigue siendo un flujo demo de pago y asignación con timers locales.
- `components/dashboard/summary-cards.tsx` sigue mostrando métricas fijas.
- `components/dashboard/suscripciones-view.tsx` sigue usando un catálogo local.
- `components/dashboard/gestion-asientos-view.tsx` sigue mostrando asientos de ejemplo.
- `components/dashboard/invite-member-modal.tsx` genera códigos localmente con `Math.random()`.
- `components/dashboard/bot-log.tsx` todavía mezcla logs de seed con logs locales de interacción.

## Próximo paso sugerido

Si seguimos con el producto, el mejor siguiente sprint es reemplazar esas superficies locales por lecturas/escrituras reales sobre Prisma y exponer acciones de negocio desde APIs dedicadas en vez de sólo en UI.