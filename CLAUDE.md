# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — dev server (Turbopack) at http://localhost:3000
- `npm run db:up` — start Postgres (host port **5433**, avoids native Postgres clash) + Mailpit (SMTP 1025, UI http://localhost:8025) via Docker Compose
- `npm run db:migrate` — Prisma migrations (dev: creates them) · `npm run db:deploy` — applies pending migrations (production; never generates or resets) · `npm run db:studio` — Prisma Studio
- `npm test` — Vitest (QR engine tests decode real rasterized output with sharp + zxing-wasm)
- `npm run typecheck` / `lint` / `format`
- `npm run build && npm start` — production. `npm start` is `prisma migrate deploy && next start`: pending migrations are applied on every boot, so a deploy that adds one needs no manual step, and a failed migration aborts the start instead of serving against a stale schema. It is a no-op when nothing is pending. This assumes one instance runs migrations at a time; with several replicas booting at once, move `db:deploy` to the platform's release/pre-deploy step and set `start` back to plain `next start`.
- `npm start` runs with `NODE_ENV=production`, so `src/env.ts` refuses the dev defaults: to try a production build locally, pass real values, e.g. `BETTER_AUTH_URL=https://example.test NEXT_PUBLIC_SITE_URL=https://example.test SCAN_IP_SECRET=<own-secret> npm start`. `npm run build` alone works with the plain `.env`.

`.env` is required (copy `.env.example`); `src/env.ts` validates env vars with zod at boot. UI strings live in `messages/es.json` / `messages/en.json` — every user-facing string needs both.

## Architecture

Next.js 15 App Router + TypeScript + Tailwind v4 (tokens in `src/app/globals.css`, shadcn/ui in `src/components/ui`). PostgreSQL + Prisma (`prisma/schema.prisma`). Auth is better-auth (`src/lib/auth.ts`): email+password with email verification (toggle: `AUTH_REQUIRE_EMAIL_VERIFICATION`, default on; when off, new users are stored as verified); GitHub/Google OAuth activate only when their env vars exist. i18n is next-intl with `/es` `/en` routes (`src/i18n/`); dashboard is guarded twice (optimistic cookie check in `src/middleware.ts` + real `getSession` in `dashboard/layout.tsx` and in every Server Action, which also filter by `userId` for ownership).

### The isomorphic QR engine (core non-obvious pattern)

`src/lib/qr/` is pure TypeScript that runs identically in browser and Node:

- `schema.ts` — zod schemas (`QrConfig`, payload discriminated union). **Single contract** shared by the editor store, the DB `QrCode.config` JSON, and the public API validation. Change shapes here first.
- `payloads.ts` — `buildPayload()` produces standard strings (`WIFI:T:...;;`, vCard 3.0, `mailto:`, `SMSTO:`, `bitcoin:`) with escaping.
- `matrix.ts` — wraps `qrcode` for the module matrix only (no rendering).
- `render-svg.ts` — matrix + config → SVG string: 5 dot styles (neighbor-aware rounding), linear/radial gradients, 3 corner styles, logo excavation, 5 text frames (font auto-shrinks to fit), effects.
- `rasterize.ts` — **server-only**: sharp SVG→PNG/JPEG (used by the API route).
- `export.ts` — **client-only**: download SVG/PNG/JPG (canvas) and PDF (pdf-lib).

The editor preview injects the SVG string into the DOM; the public API rasterizes the same string — a saved config renders pixel-identical in both. Never reintroduce a separate client QR library.

Engine tests (`render-svg.test.ts`) assert real scanability: SVG → sharp raster → zxing-wasm decode. jsQR was rejected (fails on legitimate dot-style QRs).

### Editor

State in `src/stores/qr-store.ts` (Zustand, granular selectors; ~30 controls). `computePayload(type, fields)` returns `{data, payload, empty, issues}` — forms show zod issues inline. Preview (`components/editor/preview/qr-preview.tsx`) debounces 120ms with an incrementing token to discard stale renders, and crossfades via Motion `AnimatePresence`. Anonymous history: localStorage key `qrapi:history` (max 20); logged-in users get DB persistence (`actions/qr-codes.ts`) plus a one-time localStorage→DB migration banner in the dashboard.

### Public API `/api/v1/qr`

`src/app/api/v1/qr/route.ts`: GET (flat query params) and POST (full config; `data` XOR `payload`). Auth: `Authorization: Bearer qra_...` — tokens are 32 random bytes; DB stores only the SHA-256 hex (`ApiKey.keyHash`), full token shown once at creation (`actions/api-keys.ts`). Rate limiting (`src/lib/rate-limit.ts`): fixed windows (minute + day) via atomic raw-SQL UPSERT on `rate_limit_window`; limits from env (60/min, 5000/day); lazy cleanup. CORS `*` only on this route (Bearer, not cookies). Errors are always `{error:{code,message,details?}}` in English. Docs page: `/[locale]/docs/api`.

## Gotchas

- zod v4: `.default({})` does NOT parse the default through the schema — use `.prefault({})` when inner defaults must apply (see `qrConfigSchema.style`).
- next-intl: literal `{` `}` in message JSON break ICU parsing — avoid braces in message text.
- Constants imported by both server and client components live in `src/lib/constants.ts`; importing a value from a `"use client"` module into a server component silently yields a broken reference.
- Geist font variables must stay on `<html>` (not `<body>`): `font-sans` is applied at the html level.
- lucide-react ≥1.x removed brand icons — GitHub icon is hand-rolled in `components/brand/github-icon.tsx`.
- Windows dev: no node-gyp deps anywhere (sharp uses prebuilds); keep it that way.
