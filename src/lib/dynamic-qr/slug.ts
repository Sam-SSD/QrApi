import { randomBytes } from "node:crypto";

const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SLUG_LENGTH = 8;

/**
 * Slug corto base62 (8 chars, ~2e14 combinaciones) desde bytes aleatorios
 * criptográficos. Se usa como ruta pública `/r/{slug}` de un QR dinámico.
 */
export function generateSlug(length = SLUG_LENGTH): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}
