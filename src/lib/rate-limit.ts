import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Epoch in seconds at which the exhausted window resets. */
  resetAt: number;
  retryAfterSeconds?: number;
}

/**
 * Fixed window in Postgres with an atomic UPSERT. Self-contained (no Redis):
 * a single query per window, safe for multi-instance deployments.
 */
async function bumpWindow(
  apiKeyId: string,
  kind: "minute" | "day",
  windowStart: Date,
): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "rate_limit_window" ("id", "apiKeyId", "kind", "windowStart", "count")
    VALUES (${randomUUID()}, ${apiKeyId}, ${kind}, ${windowStart}, 1)
    ON CONFLICT ("apiKeyId", "kind", "windowStart")
    DO UPDATE SET "count" = "rate_limit_window"."count" + 1
    RETURNING "count"`;
  return rows[0]?.count ?? 1;
}

export async function checkRateLimit(
  apiKeyId: string,
): Promise<RateLimitResult> {
  const now = new Date();
  const minuteStart = new Date(Math.floor(now.getTime() / 60_000) * 60_000);
  const dayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  const [minuteCount, dayCount] = await Promise.all([
    bumpWindow(apiKeyId, "minute", minuteStart),
    bumpWindow(apiKeyId, "day", dayStart),
  ]);

  // Lazy cleanup: ~1 in 100 requests deletes old windows
  if (Math.random() < 0.01) {
    const cutoff = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    void prisma.rateLimitWindow
      .deleteMany({ where: { windowStart: { lt: cutoff } } })
      .catch(() => {});
  }

  const minuteLimit = env.RATE_LIMIT_PER_MINUTE;
  const dayLimit = env.RATE_LIMIT_PER_DAY;

  if (minuteCount > minuteLimit) {
    const resetAt = Math.ceil((minuteStart.getTime() + 60_000) / 1000);
    return {
      allowed: false,
      limit: minuteLimit,
      remaining: 0,
      resetAt,
      retryAfterSeconds: Math.max(1, resetAt - Math.ceil(now.getTime() / 1000)),
    };
  }
  if (dayCount > dayLimit) {
    const resetAt = Math.ceil(
      (dayStart.getTime() + 24 * 60 * 60 * 1000) / 1000,
    );
    return {
      allowed: false,
      limit: dayLimit,
      remaining: 0,
      resetAt,
      retryAfterSeconds: Math.max(1, resetAt - Math.ceil(now.getTime() / 1000)),
    };
  }

  return {
    allowed: true,
    limit: minuteLimit,
    remaining: Math.max(0, minuteLimit - minuteCount),
    resetAt: Math.ceil((minuteStart.getTime() + 60_000) / 1000),
  };
}
