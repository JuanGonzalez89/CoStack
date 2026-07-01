# Guía de Prueba: Flujo de Compra CoStack (Producción)

Bienvenido a CoStack. En este instructivo te mostramos paso a paso cómo probar la experiencia de un usuario real que compra el acceso a una herramienta premium compartida. 

**Entorno:** Producción (`https://co-stack.vercel.app`)  
**Duración estimada:** 3 minutos  

---

## 1. Ingreso y Registro
1. Ingresá a la plataforma desde tu navegador: [https://co-stack.vercel.app](https://co-stack.vercel.app)
2. Hacé clic en **"Empezar ahora"** o **"Registrarse"**.
3. Ingresá con una cuenta de prueba (podés usar el login social con Google/GitHub o registrarte con un email y contraseña).

## 2. Exploración del Catálogo
1. Una vez dentro del Dashboard, dirigite a la sección **"Suscripciones"** en el menú lateral.
2. Acá vas a ver el "Catálogo de herramientas" disponibles. 
3. Buscá **"Canva Pro Team"**. Vas a poder ver el ahorro frente al precio oficial y los cupos que admite cada grupo.
4. Hacé clic en el botón **"Unirse vía Automatch"** (o "Configurar Grupo y Añadir").

## 3. Checkout y Reserva de Cupo
Al seleccionar la herramienta, entrarás al flujo de Checkout seguro:
1. Verás a la derecha un panel de **"Cupo reservado"** con un contador de 10 minutos para concretar el pago y no perder tu lugar en la sala.
2. A la izquierda, completá el formulario con **Datos de Pago**. 
   *(Si el entorno de Mercado Pago está en modo Sandbox, podés usar tarjetas de prueba; si es un entorno cerrado, ingresá los datos provistos para la demostración).*
3. Hacé clic en **"Pagar"**.
4. Al confirmarse el pago, verás una pantalla de éxito informándote que **"Te uniste a la sala de espera"**.

## 4. El Lobby (Sala de Espera)
Automáticamente, vas a ser redirigido a la **Sala de Espera (Lobby)** de la herramienta seleccionada.
- Acá se agrupan los usuarios que ya pagaron su cupo. En el caso de **Canva Pro Team**, el sistema requiere que se completen **3 asientos**.
- Para acelerar la prueba y no tener que registrar 3 cuentas vos mismo, podés **compartir la URL del Lobby** con otros evaluadores para que se unan directamente al mismo grupo.
- Cada vez que alguien paga, el contador de asientos (ej. `1/3` → `2/3`) se actualiza en tiempo real en la interfaz.

## 5. Provisionamiento Automático
1. Cuando el último usuario realiza el pago y el lobby se llena (`3/3`), ocurre la automatización core de CoStack.
2. El sistema cambia el estado del lobby a **"Completado"**.
3. **Entrega del acceso:**
   - En la misma pantalla del lobby aparecerá el link de acceso a la herramienta.
   - El sistema enviará automáticamente un **email a todos los miembros** del lobby con el link de invitación oficial de Canva.
   - *Nota sobre Canva:* Este link de invitación al equipo es reutilizable durante su período de vigencia (30 días de generado) y siempre y cuando el usuario se mantenga al día con el pago de su cuota.

## 6. Gestión del Acceso (Administrador Invisible)
- Desde el panel lateral, en la sección **"Asientos activos"** (o "Inicio"), podés ver el detalle de la licencia que acabás de obtener.
- Si en el futuro un usuario deja de pagar su cuota, el sistema actuará como "Administrador Invisible" cortando su acceso de forma automática, sin fricciones ni necesidad de perseguir a los deudores.

¡Gracias por probar CoStack!
