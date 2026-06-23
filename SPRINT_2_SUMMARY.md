# Sprint 2 Summary

## Qué se completó

En Sprint 2 se trabajaron los flujos de negocio que convierten la base arquitectónica en una experiencia de producto más completa. El foco estuvo en onboarding, acceso, morosidad e invitaciones dentro del dashboard.

### Cambios principales

- Se evolucionó la sesión demo hacia un flujo de dos pasos con validación y persistencia local en `components/auth/demo-session-form.tsx`.
- Se conectaron las páginas de `login`, `register` y `onboarding` al nuevo flujo para simular alta, acceso y activación de grupo.
- Se agregaron estados explícitos para pago fallido y acceso revocado en la billetera.
- Se incorporó un banner de reintento de pago y un modal de fallo para recuperar el flujo cuando la cuenta queda bloqueada.
- Se sumó un componente de acceso ciego para mostrar tokens temporales sin exponer credenciales maestras.
- Se añadió un modal de invitación de miembros para generar códigos de acceso al grupo.
- Se integró el acceso ciego y la invitación dentro de la pantalla de settings del grupo.
- Se montó el estado de acceso ciego en el dashboard para que el usuario vea su situación operativa desde el overview.

## Resultado

Sprint 2 deja una experiencia mucho más cercana al comportamiento real del producto:

- el usuario puede iniciar sesión, registrarse u onboardearse con pasos claros,
- el sistema representa estados de grupo, pago y bloqueo,
- el organizador puede invitar miembros,
- y el dashboard ya expone estados de acceso sin mostrar credenciales reales.

## Pendientes para Sprint 3

- Reemplazar la sesión demo por autenticación real.
- Persistir grupos, miembros, asientos y pagos en una base de datos.
- Convertir los estados visuales en reglas transaccionales reales.
- Validar webhooks y contratos de integración externos.