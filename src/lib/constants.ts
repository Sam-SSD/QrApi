/**
 * URL pública donde corre la app, desde NEXT_PUBLIC_SITE_URL (validada en
 * src/env.ts). Se lee process.env directamente — no `env` — porque este
 * módulo también se importa en client components y Next solo inlina las
 * NEXT_PUBLIC_* referenciadas de forma literal.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/** Límite de tamaño (bytes) para imágenes subidas (logo e imagen de fondo). */
export const MAX_IMAGE_BYTES = 500_000;
