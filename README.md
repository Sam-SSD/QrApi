<div align="center">

# QrAPI

**Forja códigos QR que no parecen códigos QR.**
*Forge QR codes that don't look like QR codes.*

Generador de códigos QR con editor visual, exportación vectorial real y API REST para developers.

[Español](#español) · [English](#english)

</div>

---

## Español

### Características

- **Editor visual en vivo**: preview instantánea mientras escribes, con crossfade y sin parpadeos.
- **8 tipos de contenido reales**: URL, texto, email, teléfono, SMS, WiFi, vCard y crypto — cada uno con su formulario dedicado que genera el formato estándar correcto (`WIFI:T:WPA;S:...;;`, `BEGIN:VCARD`, `mailto:`, `SMSTO:`…).
- **Personalización total**: 5 estilos de puntos, esquinas configurables, gradientes lineales y radiales con presets, logo centrado con excavación de módulos, 5 marcos decorativos con texto y efectos.
- **Exportación de verdad**: SVG vectorial puro (no un PNG embebido), PNG/JPG hasta 4096 px y PDF listo para imprimir. Todo generado en tu navegador.
- **Indicador de escaneabilidad**: aviso en vivo si el contraste o el tamaño del logo comprometen la lectura.
- **Historial y biblioteca**: los últimos 20 QRs en localStorage para invitados, y biblioteca persistente + migración automática al crear cuenta.
- **API REST pública**: genera QRs con todos los estilos desde tu código, con tokens por usuario, rate limiting y errores JSON claros. Documentación en `/es/docs/api`.
- **Bilingüe (ES/EN)**, tema oscuro y claro, accesible (WCAG AA) y sin telemetría.

### Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · PostgreSQL + Prisma · better-auth · motor QR SVG propio e isomorfo (mismo código en navegador y servidor) · sharp · next-intl.

### Empezar en 5 minutos

Requisitos: Node.js 20+, Docker Desktop.

```bash
git clone https://github.com/Sam-SSD/QrApi.git
cd QrApi
npm install

# 1. Copia las variables de entorno y genera un secret
cp .env.example .env
# edita .env: BETTER_AUTH_SECRET con el resultado de:
#   node -e "console.log(crypto.randomBytes(32).toString('base64'))"

# 2. Levanta Postgres + Mailpit (SMTP de desarrollo)
npm run db:up

# 3. Aplica las migraciones
npm run db:migrate

# 4. Arranca
npm run dev
```

- App: http://localhost:3000
- Mailpit (emails de verificación en dev): http://localhost:8025

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Conexión Postgres (el compose usa el puerto **5433**) |
| `BETTER_AUTH_SECRET` | Sí | Secret de sesiones (mín. 32 chars) |
| `BETTER_AUTH_URL` | Sí | URL pública de la app |
| `NEXT_PUBLIC_SITE_URL` | No | URL base pública (default `http://localhost:3000`; cambiarla requiere rebuild) |
| `SMTP_HOST/PORT/USER/PASSWORD/FROM` | Sí (dev: Mailpit) | Envío de emails de verificación |
| `GITHUB_CLIENT_ID/SECRET` | No | Activa login con GitHub |
| `GOOGLE_CLIENT_ID/SECRET` | No | Activa login con Google |
| `RATE_LIMIT_PER_MINUTE` / `RATE_LIMIT_PER_DAY` | No | Límites de la API (default 60 / 5000) |

### API pública

```bash
curl "http://localhost:3000/api/v1/qr?data=hola&format=png&size=512&dotsStyle=rounded" \
  -H "Authorization: Bearer qra_TU_TOKEN" -o qr.png
```

Regístrate, crea tu token en **Panel → Claves API** y consulta la documentación completa en `/es/docs/api` (parámetros, estilos, errores y ejemplos en curl/JavaScript/Python).

### Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Desarrollo con Turbopack |
| `npm run build` / `start` | Build y arranque de producción |
| `npm test` | Tests (motor QR verificado con decodificación ZXing real) |
| `npm run lint` / `typecheck` / `format` | Calidad de código |
| `npm run db:up` / `db:migrate` / `db:studio` | Base de datos |

### Arquitectura (resumen)

El corazón es un **motor QR SVG isomorfo** (`src/lib/qr/`): `qrcode` aporta solo la matriz de módulos y un renderer propio la convierte en SVG (puntos, gradientes, esquinas, logo, marco). El editor inyecta ese SVG en el DOM; la API pública lo rasteriza con sharp. **Un mismo config genera exactamente el mismo QR en ambos mundos**, y el export SVG es vectorial de verdad.

---

## English

### Features

- **Live visual editor** with instant preview, crossfade and no flicker.
- **8 real content types**: URL, text, email, phone, SMS, WiFi, vCard and crypto — each with a dedicated form producing the correct standard format.
- **Full customization**: 5 dot styles, configurable corners, linear/radial gradients with presets, centered logo with module excavation, 5 decorative frames with text, and effects.
- **True export**: pure vector SVG (not an embedded PNG), PNG/JPG up to 4096 px and print-ready PDF — all generated in your browser.
- **Scanability indicator** warns when contrast or logo size may break scanning.
- **History & library**: last 20 QRs in localStorage for guests, persistent library + automatic migration when you create an account.
- **Public REST API** with per-user tokens, rate limiting and clear JSON errors. Docs at `/en/docs/api`.
- **Bilingual (ES/EN)**, dark & light themes, accessible (WCAG AA), zero telemetry.

### Quick start

Requirements: Node.js 20+, Docker Desktop.

```bash
git clone https://github.com/Sam-SSD/QrApi.git
cd QrApi
npm install
cp .env.example .env   # set BETTER_AUTH_SECRET (32+ chars)
npm run db:up          # Postgres + Mailpit
npm run db:migrate
npm run dev
```

App at http://localhost:3000 — dev verification emails at http://localhost:8025.

### Public API

```bash
curl "http://localhost:3000/api/v1/qr?data=hello&format=png&size=512&dotsStyle=rounded" \
  -H "Authorization: Bearer qra_YOUR_TOKEN" -o qr.png
```

Sign up, create a token under **Dashboard → API keys**, and read the full documentation at `/en/docs/api`.

### Architecture (summary)

The core is an **isomorphic SVG QR engine** (`src/lib/qr/`): `qrcode` provides only the module matrix; a custom renderer turns it into SVG (dots, gradients, corners, logo, frame). The editor injects that SVG into the DOM; the public API rasterizes it with sharp. **The same config renders the exact same QR in both worlds**, and SVG export is truly vector.

---

## Licencia / License

Software propietario · Todos los derechos reservados.
Proprietary software · All rights reserved.
