/**
 * Public URL where the app runs, from NEXT_PUBLIC_SITE_URL (validated in
 * src/env.ts). process.env is read directly — not `env` — because this
 * module is also imported in client components and Next only inlines
 * NEXT_PUBLIC_* vars referenced literally.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/** Size limit (bytes) for uploaded images (logo and background image). */
export const MAX_IMAGE_BYTES = 500_000;
