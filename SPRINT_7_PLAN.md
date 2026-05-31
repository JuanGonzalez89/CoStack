# Sprint 7 Plan

## Objetivo
Hacer que una persona nueva entienda CoStack en la primera visita: descubrir una herramienta, pagar, ver el acceso listo y no chocar con jerga interna.

## Estado actual
- Landing, onboarding, catálogo, checkout y wallet ya quedaron bastante más claros.
- El overview de member y organizer también quedó más legible.
- El copy técnico visible se redujo mucho; ya no aparece la frase "CTA contextual".
- Sigue pendiente la parte real de Auto-Match y la reserva/pago de producción.

## Ya quedó hecho
### Etapa 1 - Entrada sin fricción
- Usuario logueado puede ver la Landing.
- Usuario nuevo entra directo al catálogo.
- Ya no hay redirección forzada desde marketing.

### Etapa 2 - Catálogo y descubrimiento
- El catálogo muestra herramientas, no grupos.
- El CTA principal es comprar o reservar.
- La navegación quedó alineada con lenguaje más simple.

### Etapa 3 - Checkout directo
- Existe checkout de herramienta.
- El flujo de reserva y pago mock ya se entiende mejor.
- La UI comunica precio, cupo y siguiente paso sin fricción.

### Etapa 4 - Primer éxito y dashboard B2C
- El overview de organizer ya suena más a vista general que a consola interna.
- Member ve accesos, wallet y valor.
- La tarjeta de cupos ya explica mejor el estado cuando hay un solo cupo.

### Etapa 5 - Copy y storytelling
- Landing, onboarding, catálogo, overview y wallet usan lenguaje más claro.
- Se limpiaron varios restos de "grupo", "asiento" y otros tecnicismos donde no sumaban.

## Todavía falta
### Etapa 2
- Auto-Match real.

### Etapa 3
- Reserva temporal real en servidor.
- Pago real con expiración confiable.

### Etapa 4
- Ajustes menores si algún texto residual interno reaparece en organizer.

### Etapa 6
- Stripe real.
- Cronjob de expiración.
- Validación server-side de urgencia.

## Done actualizado
- Storytelling B2C validado a nivel de UI.
- Eliminación de `/empezar`.
- Dashboard de miembro sin jerga innecesaria en primer plano.
- Copy del overview, onboarding, wallet y catálogo alineado con una primera visita entendible.

## Criterio de cierre
- Una persona nueva entiende qué hacer en menos de 10 segundos.
- No aparece terminología interna innecesaria en el flujo principal.
- Las rutas críticas abren limpias y con jerarquía visual clara.

## Conclusión
- Sí, los caminos de usuario principales ya están cumplidos en la capa visible: Landing, onboarding, catálogo, checkout y overview.
- Lo que falta es de ejecución real, no de relato de producto.
- El sprint puede considerarse cerrado a nivel de experiencia y narrativas de pantalla.
