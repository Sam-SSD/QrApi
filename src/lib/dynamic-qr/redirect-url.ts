import { SITE_URL } from "@/lib/constants";

/**
 * Public redirect URL of a dynamic QR. This is what gets encoded in the QR
 * matrix; the real destination (targetUrl) is edited without regenerating
 * the code. Isomorphic (it only composes a string).
 */
export function buildRedirectUrl(slug: string): string {
  return `${SITE_URL}/r/${slug}`;
}
