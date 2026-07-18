import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { ApiKey } from "@prisma/client";

export const API_KEY_PREFIX = "qra_";

/** Generates a new token. Shown in full only ONCE. */
export function generateApiToken(): {
  token: string;
  prefix: string;
  keyHash: string;
} {
  const token = `${API_KEY_PREFIX}${randomBytes(32).toString("base64url")}`;
  return {
    token,
    prefix: token.slice(0, 12),
    keyHash: hashApiToken(token),
  };
}

export function hashApiToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type ApiKeyVerification =
  | { ok: true; apiKey: ApiKey }
  | { ok: false; reason: "missing" | "invalid" | "revoked" | "expired" };

/** Verifies an Authorization: Bearer qra_... header. */
export async function verifyApiToken(
  authorization: string | null,
): Promise<ApiKeyVerification> {
  if (!authorization?.startsWith("Bearer ")) {
    return { ok: false, reason: "missing" };
  }
  const token = authorization.slice(7).trim();
  if (!token.startsWith(API_KEY_PREFIX)) {
    return { ok: false, reason: "invalid" };
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hashApiToken(token) },
  });
  if (!apiKey) return { ok: false, reason: "invalid" };
  if (apiKey.revokedAt) return { ok: false, reason: "revoked" };
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }

  // Fire-and-forget stats: they never block the response
  void prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date(), requestCount: { increment: 1 } },
    })
    .catch(() => {});

  return { ok: true, apiKey };
}
