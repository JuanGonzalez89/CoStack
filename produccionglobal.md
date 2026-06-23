# Arquitectura de Producción (Go-To-Market)

Este documento detalla la arquitectura diseñada para escalar la plataforma CoStack a nivel nacional/regional, resolviendo los cuellos de botella tecnológicos y financieros del Producto Mínimo Viable (MVP).

## 1. Problemas del MVP (Situación Actual)
*   **Cobros y Tarjetas:** En el MVP, utilizamos la tarjeta virtual corporativa de **Mercado Pago** administrada manualmente por los fundadores. Esto no escala porque proveedores como OpenAI o Figma bloquean cuentas si detectan la misma tarjeta en múltiples suscripciones.
*   **Infraestructura:** La base de datos (PostgreSQL) corre en Docker localmente, y la automatización de la compra se realiza manualmente (o mediante scripts locales que no escalan en la nube).

## 2. Solución Arquitectónica para Escalar (Producción)

### A. Emisión Programática de Tarjetas (Pomelo API)
Para reemplazar el uso de la tarjeta única de Mercado Pago, la plataforma se integrará con **Pomelo (pomelo.la)**, la infraestructura FinTech líder en LATAM.
*   **¿Cómo funciona?** Cuando una sala de CoStack se llena (Escrow completo), nuestro backend hace una petición a la API de Pomelo.
*   **El resultado:** Pomelo emite una **Tarjeta de Crédito Virtual (VCC) de un solo uso** fondeada con el monto exacto ($20).
*   **Beneficio:** OpenAI/Figma ven una tarjeta distinta para cada grupo. Se elimina el riesgo de fraude y de baneos por compartir métodos de pago.
*   **Cumplimiento Legal (PCI-DSS):** CoStack nunca guarda los 16 dígitos ni el CVV en su base de datos. Se mantienen en la memoria RAM solo durante la transacción.

### B. Automatización en la Nube (Playwright + Browserless)
Dado que las funciones Serverless (como Vercel) tienen límites de tamaño (50MB) que impiden ejecutar navegadores completos, la automatización del proceso de compra se delega a la nube.
*   **¿Cómo funciona?** CoStack envía un Background Job a **Browserless.io**.
*   **El proceso:** Browserless levanta una instancia de Google Chrome invisible (Headless), navega a ChatGPT/Figma, e introduce los datos de la VCC de Pomelo de forma automática.
*   **La entrega:** Extrae el Enlace de Invitación y lo envía a la base de datos de CoStack mediante un Webhook.

### C. Despliegue (Hosting y Base de Datos)
*   **Frontend y Backend (BFF):** Desplegados en **Vercel** usando Next.js App Router para escalabilidad global y protección DDoS.
*   **Base de Datos:** Migración de Docker local a **Supabase** (PostgreSQL Serverless) para garantizar alta disponibilidad y respaldos automatizados.

---
**Conclusión para la Defensa Final:**
*"El MVP de CoStack utiliza integraciones manuales de Mercado Pago para validar el modelo de negocio con bajo costo operativo (Bootstrapping). Sin embargo, la arquitectura diseñada para producción emplea la API de Pomelo y Browserless.io para garantizar una escalabilidad infinita, cumplimiento de normativas de seguridad (PCI), y una experiencia "Cero Fricción" para los usuarios."*
