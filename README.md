# CoStack

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.0-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-UI%20System-111827?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-Private-lightgrey?style=for-the-badge)

CoStack es una plataforma pensada para resolver las fricciones operativas y financieras que enfrentan los freelancers al compartir licencias de software premium. Funciona como un "administrador invisible" que automatiza el cobro grupal, la gestión centralizada de accesos y el bloqueo condicional para morosos, eliminando la carga administrativa y los conflictos interpersonales del modelo tradicional.

## Tabla de Contenidos

- [Descripción](#descripci%C3%B3n)
- [Problema que resuelve](#problema-que-resuelve)
- [Características principales](#caracter%C3%ADsticas-principales)
- [Stack tecnológico](#stack-tecnol%C3%B3gico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación local](#instalaci%C3%B3n-local)
- [Scripts disponibles](#scripts-disponibles)
- [Vistas del prototipo](#vistas-del-prototipo)
- [Integración con OpenClaw Bot](#integraci%C3%B3n-con-openclaw-bot)
- [Autores](#autores)

## Descripción

La plataforma está diseñada para equipos freelance que comparten herramientas costosas como ChatGPT Team, Figma o Midjourney. CoStack transforma un proceso manual, frágil y conflictivo en una orquestación automatizada con foco en control financiero, seguridad y coordinación operativa.

## Problema que resuelve

Los equipos freelance que comparten licencias suelen enfrentar tres problemas críticos:

- Fricción económica: una persona adelanta el pago y luego persigue al resto para recuperar el dinero.
- Inseguridad: credenciales expuestas o compartidas en texto plano.
- Caos operativo: coordinación informal por mensajería, con riesgo de bloqueos por uso simultáneo.

## Características principales

- Cobro automático grupal: cada integrante abona su cuota proporcional de forma fraccionada.
- Vínculo automático pago-acceso: si un usuario no paga, el sistema corta su acceso automáticamente.
- Integración con OpenClaw Bot: al confirmar el pago, el bot envía por DM un enlace privado y único para acceder al asiento.
- Gatekeeper seguro: centralización del acceso sin exponer credenciales originales.
- Transparencia financiera: visualización clara de gastos, pagos y estado de cada integrante.
- Comunidad freelance: feed interactivo para ofrecer asientos libres o buscar grupos para co-financiar herramientas.

## Stack tecnológico

- Next.js
- React
- Tailwind CSS
- shadcn/ui
- TypeScript
- Radix UI
- Recharts
- React Hook Form
- Zod
- lucide-react
- next-themes
- Vercel Analytics

## Estructura del proyecto

La base actual del proyecto sigue la organización típica de una app Next.js con App Router:

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  landing/
  dashboard/
  ui/
hooks/
lib/
public/
styles/
```

Estructura sugerida para escalar el proyecto:

```text
app/
  (marketing)/
  (dashboard)/
  api/
components/
  dashboard/
  landing/
  ui/
features/
  billing/
  access-control/
  community/
lib/
  utils/
  validations/
  constants/
```

## Instalación local

### Requisitos previos

- Node.js 18 o superior
- npm 10 o superior

### Pasos

1. Clonar el repositorio:

```bash
git clone https://github.com/JuanGonzalez89/CoStack.git
cd CoStack
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar el entorno de desarrollo:

```bash
npm run dev
```

4. Abrir la app en:

```text
http://localhost:3000
```

## Scripts disponibles

- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera la build de producción.
- `npm start`: compila la aplicación y levanta el servidor de producción.
- `npm run lint`: ejecuta el linting del proyecto.

## Vistas del prototipo

- Landing Page: presentación del producto como el "Administrador Invisible de Software".
- Dashboard de Gestión de Licencias: panel principal con métricas, estado de pagos y acciones rápidas.
- Suscripciones: marketplace visual para adquirir nuevas herramientas Enterprise y formar grupos.
- Comunidad: feed social para compartir licencias, ofrecer asientos o encontrar equipos.
- Billetera: vista financiera para seguir saldo, movimientos e inversión mensual.

## Integración con OpenClaw Bot

CoStack incorpora OpenClaw Bot para automatizar la entrega de accesos. El flujo previsto es:

1. El usuario paga su cuota.
2. El sistema valida el pago.
3. El bot entrega un enlace privado y único por mensaje directo.
4. El asiento queda asignado sin exponer credenciales reales.

## Autores

- Santiago Calderon
- Juan Pablo Garcia Mallorquin
- Juan Ignacio Gonzalez Caceres

## Estado del proyecto

Este repositorio contiene un prototipo frontend funcional construido con Next.js y preparado para demostración, iteración de producto y publicación en GitHub. 

Recientemente se completaron las implementaciones del **Sprint 8** (Refinamiento de UX/UI, inclusión de modales de retiros y credenciales, y flujo dinámico de Automatch) y se proyectó el **Sprint 9** para la migración transaccional completa.
