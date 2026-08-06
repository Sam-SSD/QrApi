import { z } from "zod";
import { SITE_URL } from "@/lib/constants";

// http/https only: `new URL()` (and z.url()) would accept javascript:/data:,
// which must not live behind a public redirector under our domain.
export const httpUrl = z
  .string()
  .url()
  .max(2048)
  .refine((u) => /^https?:\/\//i.test(u), "URL must be http(s)");

/**
 * Public redirect URL of a dynamic QR. This is what gets encoded in the QR
 * matrix; the real destination (targetUrl) is edited without regenerating
 * the code. Isomorphic (it only composes a string).
 */
export function buildRedirectUrl(slug: string): string {
  return `${SITE_URL}/r/${slug}`;
}
