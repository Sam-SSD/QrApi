import { createHmac } from "node:crypto";
import { env } from "@/env";

/**
 * Hashea una IP para dedupe/analytics SIN almacenarla en claro. Usa HMAC-SHA256
 * con un secreto de servidor + salt diario (YYYY-MM-DD): irreversible en la
 * práctica (a diferencia de un SHA-256 plano de una IPv4, invertible por fuerza
 * bruta), y el salt diario limita el alcance a "único por día". GDPR-friendly.
 *
 * Devuelve null si no hay IP (p. ej. en desarrollo local sin proxy).
 */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  return createHmac("sha256", env.SCAN_IP_SECRET)
    .update(`${ip}|${day}`)
    .digest("hex");
}
