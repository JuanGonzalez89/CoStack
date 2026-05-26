# Sprint 0 - 1

## Qué hice

En esta etapa reorganicé la base del proyecto para salir del prototipo monolítico y pasar a una estructura por rutas reales del App Router.

### Sprint 0

- Eliminé la navegación interna basada en `useState` de `app/page.tsx` y dejé la landing como entrada pública real.
- Separé la navegación del dashboard en un layout propio para que cada vista viva en su ruta.
- Moví la utilidad `now()` a `lib/utils.ts` para sacar lógica de tiempo fuera del componente de UI.
- Centralicé rutas en `lib/constants/routes.ts` para evitar strings sueltos.
- Agregué `lib/env.ts` para validar variables de entorno.
- Borré `styles/globals.css` y dejé un solo archivo global activo en `app/globals.css`.

### Sprint 1

- Creé `middleware.ts` para proteger rutas por sesión, grupo, rol y estado de pago.
- Agregué una sesión demo en `app/api/session/route.ts` para probar redirecciones y estados sin auth real todavía.
- Monté rutas reales para `login`, `register`, `onboarding`, `overview`, `suscripciones`, `asientos`, `comunidad`, `billetera` y `settings`.
- Añadí layouts y error boundaries por grupo de rutas.
- Activé `PaymentTraffic` dentro del overview para que deje de ser un componente muerto.
- Endurecí la configuración básica de seguridad en `next.config.mjs` con headers.

## Resultado

La app ya no depende de un router artesanal dentro de una sola página. Ahora tiene:

- estructura de App Router por dominio,
- un shell de dashboard reutilizable,
- protección base de rutas,
- contrato de rutas y entorno,
- y un punto de partida más sólido para Sprint 2.

## Pendientes inmediatos

- Reemplazar la sesión demo por auth real.
- Persistir datos de pagos, miembros y asientos.
- Convertir los flujos visuales en formularios y acciones de negocio reales.