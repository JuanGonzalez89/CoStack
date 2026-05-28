# Sprint 7 Plan

## Nombre del sprint
Storytelling B2C: Fricción Cero, Auto-Match y Simplificación de Dashboard

## Duracion sugerida
2 semanas (10 dias habiles)

## Norte del sprint
Que una persona nueva (desarrollador) pueda completar este recorrido sin fricción, sin pensar en "grupos" y sin lenguaje técnico:
1. Entender en la Landing que CoStack le ayuda a pagar menos por una licencia.
2. Registrarse e ir directo al catálogo visual de Herramientas (Copilot, JetBrains, etc).
3. Elegir una herramienta y ver un Checkout simple, usando la escasez ("quedan 2 lugares") a favor de la venta.
4. Pagar y ser asignado a un grupo de forma invisible (Auto-Match).
5. Ver su acceso listo de forma clara y directa en su Billetera de Herramientas (Dashboard).

## Resultado esperado
Al finalizar Sprint 7, el flujo deja de ser "buscar grupos y gestionar asientos" (lenguaje B2B) y pasa a ser "elegir herramienta, pagar barato, obtener credenciales" (lenguaje B2C).

## Objetivos medibles del sprint
- Eliminar por completo el tiempo de "decisión post-login", llevando al usuario directamente al catálogo.
- Reducir rebote en el flujo de Onboarding al 0% (el Onboarding desaparece para el flujo de compra directo).
- Aumentar conversión de primer pago simulado en al menos 35% al ofrecer un "Checkout Directo" por herramienta en vez de un "Detalle de Grupo".
- 0 copy técnico ("asientos", "snapshot", "organizador") en el Dashboard de usuario final.

## No objetivos de Sprint 7
- No implementar aprovisionamiento IA real end-to-end con n8n + worker productivo.
- No implementar feed social avanzado ni perfiles públicos.
- No agregar analítica avanzada de comunidad.

---

## Alcance por etapas

### Etapa 1 - Entrada "Fricción Cero" y Landing Accesible
Objetivo: Que el primer contacto fluya directo a la vitrina de compras, sin barreras ni preguntas innecesarias.

Historias incluidas:
- Como usuario, quiero poder leer la Landing Page aunque ya tenga la sesión iniciada.
- Como usuario nuevo, quiero que al registrarme me lleven directo a comprar, sin preguntarme qué quiero hacer.

Cambios UI/UX:
- Eliminar la pantalla intermedia `/empezar` (Opcion A/B). 
- Modificar Navbar de la Landing: si hay sesión, mostrar botón "Ir a mi panel" / "Catálogo", pero NO redirigir forzosamente.

Cambios tecnico-funcionales:
- Eliminar `redirect` en `app/(marketing)/page.tsx`.
- Modificar `lib/user-journey.server.ts` para que `isFirstTimeUser` redirija directo a `ROUTES.suscripciones` (el Catálogo).
- Soporte para enlaces con invitación: Si el registro trae un param `?code=XYZ`, redirigir al checkout de esa invitación particular.

Criterios de aceptacion:
- Usuario logueado puede ver la Landing.
- Usuario nuevo aterriza directo en `/suscripciones`.
- Se elimina la carpeta `/empezar`.

---

### Etapa 2 - Catálogo de Herramientas y "Auto-Match"
Objetivo: El usuario no busca "Grupos de personas", busca "Herramientas baratas". El sistema hace el emparejamiento.

Historias incluidas:
- Como desarrollador, quiero ver un catálogo de herramientas (IDEs, IAs) ordenadas por popularidad o precio.
- Como desarrollador, no quiero elegir manualmente un "grupo", quiero que el sistema me asigne al mejor disponible.

Cambios UI/UX:
- En `/suscripciones`, mostrar tarjetas de Herramientas (ej: "GitHub Copilot", "JetBrains All Products"), no de "Grupos".
- Incluir etiquetas de escasez de marketing: "🔥 Quedan 2 lugares a $5/mes".
- Botón principal de la tarjeta: "Comprar ahora".

Cambios tecnico-funcionales:
- Lógica de Auto-Match: Al hacer clic en "Comprar ahora", el backend busca el grupo activo con vacantes para esa herramienta y asigna al usuario. Si no hay grupo activo con vacantes, crea uno nuevo en estado "pending".

---

### Etapa 3 - Checkout Directo y Sentido de Urgencia
Objetivo: Transformar la decisión en pago de forma impulsiva y clara.

Cambios UI/UX:
- Reemplazar el "Detalle del Grupo" por una pantalla de "Checkout de Herramienta".
- Mostrar claramente precio final.
- "Reglas del pool" explicadas en lenguaje B2C.

Cambios tecnico-funcionales:
- Reserva temporal de cupo en la base de datos (10 mins) conectada al Auto-Match.
- Trazabilidad del pago contra pasarela mock.

---

### Etapa 4 - Primer Éxito y "Dashboard B2C"
Objetivo: Satisfacción inmediata post-pago y eliminación total de jerga B2B para el miembro.

Cambios UI/UX:
- Transformar el Dashboard `/overview` en "Tus Accesos" o "Billetera de Suscripciones".
- Cambiar Summary Cards: Licencias Activas, Ahorro Mensual Generado, Próximo Vencimiento.
- Tarjeta Principal Gigante Post-pago: Herramienta comprada con un gran botón "Ver Credenciales de Acceso".
- Relegar información densa a una pestaña secundaria o solo para el Rol de Organizador.

Cambios tecnico-funcionales:
- Reglas de visibilidad estricta por rol (Member vs Organizer).
- Calcular "Ahorro" (Precio mercado - Precio CoStack).

---

### Etapa 5 - Pulido visual y Consistencia de Copy (Storytelling)
Objetivo: Garantizar la inmersión B2C (0% lenguaje interno).

---

## Backlog priorizado Sprint 7

### P0 (Obligatorio para cierre de sprint)
1. **[Flow]** Eliminar pantalla `/empezar` y enrutar usuario nuevo directo a `/suscripciones`.
2. **[Flow]** Eliminar redirección forzada de la Landing Page para usuarios logueados.
3. **[UX]** Refactorizar Catálogo (`/suscripciones`) para mostrar Tarjetas de Herramientas.
4. **[Backend]** Crear lógica de "Auto-Match" para asignar usuarios a grupos.
5. **[UX]** Crear pantalla de "Checkout Directo de Herramienta".
6. **[Backend]** Implementar reserva temporal de cupo y pago mock.
7. **[UX]** Rediseñar Dashboard Inicial (`/overview`) B2C (mostrar credenciales, no métricas de admin).
8. **[UX]** Ocultar logs del bot y métricas B2B a usuarios con rol "Member".

---

## Definicion de Done del Sprint 7
- Storytelling B2C validado con prueba de usuario nuevo.
- Eliminación absoluta de la pantalla intermedia `/empezar`.
- Dashboard de Miembro muestra ahorro y accesos, no asientos ocupados.
- Build y rutas principales estables.

---

