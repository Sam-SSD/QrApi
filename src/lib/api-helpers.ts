import { NextRequest, NextResponse } from "next/server";
import { verifyApiToken } from "@/lib/api-keys";
import { checkRateLimit, type RateLimitResult } from "@/lib/rate-limit";
import { MAX_BODY_BYTES } from "@/lib/qr/api-schema";
import type { ApiKey } from "@prisma/client";

/**
 * Shared scaffolding for the public API /api/v1/*: CORS, error format
 * `{error:{code,message,details?}}` (messages in English), rate limit
 * headers and Bearer authentication with rate limiting.
 */

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
  extraHeaders: Record<string, string> = {},
) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status, headers: { ...CORS_HEADERS, ...extraHeaders } },
  );
}

export function rateLimitHeaders(
  rate: RateLimitResult,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(rate.limit),
    "X-RateLimit-Remaining": String(rate.remaining),
    "X-RateLimit-Reset": String(rate.resetAt),
  };
}

/**
 * Reads and parses the JSON body, enforcing the size cap on the bytes actually
 * received. The Content-Length header alone is not a control: it is absent
 * under chunked transfer encoding and `Number(null)` / `Number("abc")` compare
 * falsely against any limit.
 */
export async function readJsonBody(
  request: NextRequest,
): Promise<{ body: unknown; response?: undefined } | { response: NextResponse }> {
  const raw = await request.arrayBuffer().catch(() => null);
  if (!raw) {
    return { response: errorResponse(400, "invalid_body", "Unreadable body") };
  }
  if (raw.byteLength > MAX_BODY_BYTES) {
    return {
      response: errorResponse(413, "body_too_large", "Body must be under 1 MB"),
    };
  }
  try {
    return { body: JSON.parse(new TextDecoder().decode(raw)) };
  } catch {
    return {
      response: errorResponse(415, "invalid_json", "Body must be valid JSON"),
    };
  }
}

export type ApiAuth =
  | { response: NextResponse; rate?: undefined; apiKey?: undefined }
  | { response?: undefined; rate: RateLimitResult; apiKey: ApiKey };

/** Authenticates the Bearer and applies rate limiting; exposes the apiKey (with userId). */
export async function authenticateApi(request: NextRequest): Promise<ApiAuth> {
  const verification = await verifyApiToken(
    request.headers.get("authorization"),
  );
  if (!verification.ok) {
    const responses = {
      missing: errorResponse(
        401,
        "missing_token",
        "Provide your API key: Authorization: Bearer qra_...",
      ),
      invalid: errorResponse(401, "invalid_token", "The API key is not valid"),
      revoked: errorResponse(403, "revoked_token", "This API key was revoked"),
      expired: errorResponse(403, "expired_token", "This API key has expired"),
    } as const;
    return { response: responses[verification.reason] };
  }

  const rate = await checkRateLimit(verification.apiKey.id);
  if (!rate.allowed) {
    return {
      response: errorResponse(
        429,
        "rate_limited",
        "Rate limit exceeded",
        { limit: rate.limit, resetAt: rate.resetAt },
        {
          ...rateLimitHeaders(rate),
          "Retry-After": String(rate.retryAfterSeconds ?? 60),
        },
      ),
    };
  }

  return { rate, apiKey: verification.apiKey };
}

/** JSON response with CORS + rate limit headers. */
export function jsonResponse(
  body: unknown,
  rate: RateLimitResult,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
    headers: { ...CORS_HEADERS, ...rateLimitHeaders(rate) },
  });
}
