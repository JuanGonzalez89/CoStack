# Sprint 8 - Dudas y Definición de Flujos (Organizer UX)

## Inconsistencias Detectadas y Resueltas en UX

1. **El "Token Temporal" era confuso para el Organizador**
   - **Problema:** En el dashboard del Organizador (`CoStack Studio`), la tarjeta principal mostraba un "Token de acceso temporal" (ej: `COSTACK-74A2-9X11`). Esto confundía, ya que el Organizador gestiona el grupo, no entra a consumir una sola herramienta desde esa tarjeta.
   - **Solución:** Se transformó la tarjeta en **"Código de Invitación del Grupo"**. Ahora muestra el código real del grupo (ej: `COSTACK-84A2`) con un botón de "Copiar e Invitar", lo cual hace que el flujo de invitar a miembros sea instantáneo y obvio.

2. **Suscripciones "Agotadas" para el Organizador**
   - **Problema:** Al ir a `/suscripciones`, herramientas como Figma decían "Agotado". Pero si un Organizador va al catálogo, no está "comprando un cupo", está **adquiriendo una licencia nueva para crear un grupo**. Por ende, nunca debería estar agotado.
   - **Solución:** Se eliminó la lógica de "Agotado" para el catálogo general. Ahora muestra claramente cuántos miembros admite la herramienta y el costo "por integrante" vs el precio oficial. El CTA cambió a **"Configurar Grupo y Añadir"**.

3. **Flujo de Creación de Grupo (Dudas de Negocio a Confirmar)**
   - **¿Qué pasa al configurar la suscripción?** 
     - El Organizador selecciona una herramienta (ej: ChatGPT Team). El sistema debería mostrar el costo total que el Organizador debe adelantar o comprometer, y el desglose de cuánto recuperará por cada integrante.
   - **¿Hay una lista de espera?**
     - Sí. El grupo se crea "activo" para el Organizador, pero los cupos (seats) quedan en estado "free". A medida que el Organizador pasa el "Código de Invitación", los miembros entran a un "Onboarding / Lista de Espera".
   - **¿Cómo pagan los miembros?**
     - El miembro ingresa el código, ve qué herramienta es, paga su cuota (ej: $6), y automáticamente ese `seat` pasa a estado "assigned". 
   - **¿Hay avisos?**
     - Sí, el **Registro de Actividad del Sistema (BotLog)** en el dashboard del Organizador avisa cada vez que alguien se une y paga (ej: "Santiago pagó su cuota y ocupó un cupo"). Además de una notificación (kampanita en el top bar).

## Conclusión del Flujo de Organizador (Golden Path)
1. Entra al Dashboard y ve que no tiene herramientas activas.
2. Clickea **+ Nueva Suscripción** (CTA blanco brillante).
3. Va al **Catálogo**, elige "ChatGPT Team".
4. Pasa por un Checkout donde se le explica que él gestiona la cuenta maestra.
5. Vuelve al Dashboard, donde ahora tiene la tarjeta de "ChatGPT" en *Suscripciones Activas*.
6. Copia el **Código de Invitación** desde la tarjeta principal derecha y se lo pasa a su equipo por Slack/WhatsApp.
7. Observa el **Registro de Actividad** viendo cómo se van ocupando los cupos a medida que pagan.
