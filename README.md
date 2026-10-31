# Agenda de turnos · Akerum

Web de reservas para las sesiones de Akerum: tarot, numerología, astrología, biodecodificación y alquimia.

- **Clientes** (`/`): eligen un servicio (con duración y precio), ven los días y horarios libres y reservan. Al terminar pueden avisar por WhatsApp con un botón.
- **Panel** (`/admin`): confirma o rechaza reservas, edita o pausa servicios, define el horario semanal y bloquea días completos o franjas puntuales.
- **Aviso por WhatsApp**: con cada reserva nueva llega un mensaje con el link para confirmarla (vía CallMeBot, gratis).

Hecho con Next.js 15 y Postgres (Neon). Los servicios y el horario inicial (lunes a viernes de 9 a 18) están en `db/seed.sql`; todo se puede editar desde el panel. Un precio 0 se muestra como "A consultar".

## Puesta en marcha

1. **Base de datos**: en la consola de [Neon](https://console.neon.tech), abrir el *SQL Editor* del proyecto y correr `db/schema.sql` y después `db/seed.sql`. (O, con la CLI: `neon env pull` y `npm run db:setup`.)
2. **Publicar en Vercel**: importar este repositorio en [vercel.com/new](https://vercel.com/new), agregar la integración de Neon en *Storage* (carga `DATABASE_URL` sola) y el resto de las variables de `.env.example` (`ADMIN_PASSWORD`, `SESSION_SECRET`, `INSTAGRAM_URL`, `WHATSAPP_NUMBER`, `PUBLIC_URL`).
3. **Aviso por WhatsApp** (opcional): desde el WhatsApp del consultorio, seguir los pasos de [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/). La clave que responde va en `CALLMEBOT_APIKEY`.

## Desarrollo local

```bash
cp .env.example .env.local   # completar DATABASE_URL (y DATABASE_SSL=false si es un Postgres local)
npm run db:setup
npm run dev
```

## Reglas de la agenda

Se ajustan con variables de entorno: intervalo entre turnos (`SLOT_STEP_MIN`), cuántos días hacia adelante se puede reservar (`DAYS_AHEAD`) y la anticipación mínima en horas (`MIN_NOTICE_HOURS`). Las reservas pendientes ya ocupan el horario, así que nadie más puede tomarlo hasta que se rechace desde el panel.
