# Guía para levantar CoStack en la notebook — Presentación

## Prerequisitos
- Node.js 18+
- npm 10+
- PostgreSQL 15+ (ya lo tenés instalado)
- Git

---

## Paso 1 — Actualizar el proyecto

Si ya tenés la carpeta de CoStack en tu notebook (con Sprint 10):

```powershell
# Ir a la carpeta del proyecto
cd ruta/a/CoStack

# Traer todo lo nuevo de GitHub
git fetch origin
git checkout Sprint-13
git pull origin Sprint-13

# Instalar dependencias nuevas
npm install
```

Si **no** tenés el repo, clonarlo:

```powershell
git clone https://github.com/JuanGonzalez89/CoStack.git
cd CoStack
git checkout Sprint-13
npm install
```

---

## Paso 2 — Copiar archivos desde la PC actual a la notebook

Estos archivos **NO están en git** y son necesarios. Pasar por USB, Google Drive, o como prefieras:

### 2a. `.env.local`
- Ruta: raíz del proyecto (`CoStack/.env.local`)
- Contiene las credenciales de Mercado Pago, Stripe, GitHub, NextAuth
- Sin este archivo no funcionan pagos ni provisioning

### 2b. `.auth/` (carpeta completa)
- Ruta: `CoStack/.auth/`
- Contiene `canva.json` con la sesión viva de Canva
- Sin esto, el provisioning automático de Canva no funciona y tendrías que re-loguearte

---

## Paso 3 — Resetear la base de datos

```powershell
# Borrar la DB vieja y crear una nueva limpia
psql -U postgres -c "DROP DATABASE IF EXISTS costack;"
psql -U postgres -c "CREATE DATABASE costack;"

# Aplicar migraciones y cargar datos de prueba
npx prisma migrate dev
npm run seed
```

Si `psql` no te funciona, entrá a pgAdmin y hacelo desde ahí manualmente:
- Eliminar DB `costack`
- Crear DB `costack`
- Después correr `npx prisma migrate dev` y `npm run seed` en la terminal

---

## Paso 4 — Preparar lobby de prueba

```powershell
npx tsx scripts/reset-lobby-canva.ts
```

Esto crea un lobby con 3 miembros en estado `paid`:
1. `jpgarciamallorquin@gmail.com` (asiento 1)
2. `Juanurro27@gmail.com` (asiento 2)
3. `juanignaciogonzalez.ca@gmail.com` (asiento 3)

El lobby queda en `status: "waiting"` esperando a que completes el cupo (3/3).

---

## Paso 5 — Verificar sesión de Canva (opcional)

Si querés asegurarte de que la sesión funciona:

```powershell
npx tsx scripts/auth-setup-canva.ts
```

Se abre un browser. Si ya estás logueado, esperá 60 segundos y se guarda sola. Si no, logueate y luego presioná Enter.

---

## Paso 6 — Iniciar el servidor

```powershell
npm run dev
```

Abrir en el browser: `http://localhost:3000`

---

## Paso 7 — Probar el flujo completo

1. Registrarse con `jpgarciamallorquin@gmail.com` (o el mail que corresponda como organizer)
2. Ir al catálogo y seleccionar **Canva Pro Team**
3. Configurar grupo — se crea un lobby automáticamente
4. Compartir link del lobby con los miembros
5. Cuando los 3 paguen y se complete el cupo (3/3), el sistema automáticamente:
   - Captura los pagos
   - Abre Canva via Playwright
   - Invita a cada miembro
6. Cada miembro recibe la invitación por email de Canva

---

## Si algo falla en la presentación

**Error: no encuentra la DB**
→ Verificar que PostgreSQL esté corriendo:
```powershell
net start postgresql-x64-16
```

**Error: sesión de Canva expirada**
→ Re-ejecutar: `npx tsx scripts/auth-setup-canva.ts`

**Error: lobby no se completa**
→ Resetear lobby y probar de nuevo:
```powershell
npx tsx scripts/reset-lobby-canva.ts
```

**Error: rate limit de grupos**
→ Ya está desactivado para la presentación, no debería saltar

---

## Resumen de comandos

| Tarea | Comando |
|---|---|
| Iniciar servidor | `npm run dev` |
| Resetear DB | `psql -U postgres -c "DROP DATABASE IF EXISTS costack;"` + `psql -U postgres -c "CREATE DATABASE costack;"` + `npx prisma migrate dev` + `npm run seed` |
| Resetear lobby | `npx tsx scripts/reset-lobby-canva.ts` |
| Sesión Canva | `npx tsx scripts/auth-setup-canva.ts` |
| Migraciones | `npx prisma migrate dev` |
| Seed | `npm run seed` |

## Archivos a transferir

| Archivo | Ruta | Obligatorio |
|---|---|---|
| `.env.local` | `CoStack/.env.local` | ✅ Sí |
| `.auth/` | `CoStack/.auth/` | ✅ Sí |
