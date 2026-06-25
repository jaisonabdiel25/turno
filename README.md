# Turno

App web sencilla para gestionar turnos por orden de llegada en cualquier
establecimiento. Muestra en una pantalla el **turno en curso**, el cliente
**solicita su turno** con un botón (y opcionalmente deja su teléfono para que le
avisen cuando se acerque), y el **admin** avanza la cola con un botón "Siguiente".

## Características

- **Multi-establecimiento**: cada negocio tiene su propia cola y su admin.
- **Numeración**: `1 … 99 → A01 … A99 → B01 …` hasta `Z99`.
- **Reinicio diario** automático (cada día empieza en 1) + botón de reinicio manual.
- **Pantalla en tiempo real** vía Server-Sent Events (sin recargar).
- **Solo el admin se autentica** (Auth.js + contraseña con bcrypt).
- **Hook de notificación** listo (stub) para integrar SMS/WhatsApp más adelante.

## Stack

Next.js 15 (App Router, `src/`) · TypeScript · PostgreSQL · Prisma · Tailwind CSS · Auth.js v5.

## Puesta en marcha

1. **Requisitos**: Node 18+ y un PostgreSQL accesible.

2. **Configura el entorno**: copia `.env.example` a `.env` y ajusta
   `DATABASE_URL` y `AUTH_SECRET`.

   ```bash
   cp .env.example .env
   # genera un secreto:  npx auth secret
   ```

   **Opción rápida con Docker** (Postgres aislado en el puerto 5440, ya alineado
   con `.env.example`):

   ```bash
   docker compose up -d
   ```

3. **Instala dependencias y prepara la base de datos**:

   ```bash
   npm install
   npx prisma migrate dev --name init
   npm run db:seed     # crea un establecimiento "demo" y un admin de prueba
   ```

4. **Arranca**:

   ```bash
   npm run dev
   ```

## Rutas

| Ruta                    | Para qué sirve                                   |
| ----------------------- | ------------------------------------------------ |
| `/`                     | Inicio: crear establecimiento o entrar           |
| `/register`             | Alta de un establecimiento + su admin            |
| `/login`                | Login del admin                                   |
| `/e/<slug>`             | Pantalla del cliente: turno en curso + solicitar |
| `/e/<slug>/display`     | Pantalla completa para un monitor/TV             |
| `/e/<slug>/admin`       | Panel del admin (protegido): "Siguiente", reinicio |

Con el seed, el establecimiento demo es `/e/demo` y el admin entra con
`admin@demo.com` / `admin123`.

## Pruebas

```bash
npm test       # pruebas de la numeración de turnos (sequenceToCode)
```

## Notificaciones (pendiente de integrar)

El teléfono del cliente se guarda y la cola ya invoca `notifyTicketSoon()` en
`src/lib/notify.ts` cuando un cliente pasa a ser el próximo en la fila. Hoy es un
**stub** que solo registra en consola. Para enviar SMS/WhatsApp reales, implementa
el envío en esa función (p. ej. con Twilio) sin tocar el resto del sistema.
