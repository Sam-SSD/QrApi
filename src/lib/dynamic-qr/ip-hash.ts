import { createHmac } from "node:crypto";
import { env } from "@/env";

/**
 * Hashes an IP for dedupe/analytics WITHOUT storing it in the clear. Uses
 * HMAC-SHA256 with a server secret + daily salt (YYYY-MM-DD): irreversible
 * in practice (unlike a plain SHA-256 of an IPv4, invertible by brute
 * force), and the daily salt scopes it to "unique per day". GDPR-friendly.
 *
 * Returns null when there is no IP (e.g. local development without a proxy).
 */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  return createHmac("sha256", env.SCAN_IP_SECRET)
    .update(`${ip}|${day}`)
    .digest("hex");
}
