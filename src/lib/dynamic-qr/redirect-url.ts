import { SITE_URL } from "@/lib/constants";

/**
 * URL pública de redirección de un QR dinámico. Es lo que se codifica en la
 * matriz del QR; el destino real (targetUrl) se edita sin regenerar el código.
 * Isomórfico (solo compone un string).
 */
export function buildRedirectUrl(slug: string): string {
  return `${SITE_URL}/r/${slug}`;
}
