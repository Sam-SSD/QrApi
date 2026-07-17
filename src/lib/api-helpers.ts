import { NextRequest, NextResponse } from "next/server";
import { verifyApiToken } from "@/lib/api-keys";
import { checkRateLimit, type RateLimitResult } from "@/lib/rate-limit";
import type { ApiKey } from "@prisma/client";

/**
 * Andamiaje común de la API pública /api/v1/*: CORS, formato de error
 * `{error:{code,message,details?}}` (mensajes en inglés), cabeceras de rate
 * limit y autenticación Bearer con rate limiting.
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

export function rateLimitHeaders(rate: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(rate.limit),
    "X-RateLimit-Remaining": String(rate.remaining),
    "X-RateLimit-Reset": String(rate.resetAt),
  };
}

export type ApiAuth =
  | { response: NextResponse; rate?: undefined; apiKey?: undefined }
  | { response?: undefined; rate: RateLimitResult; apiKey: ApiKey };

/** Autentica el Bearer y aplica rate limiting; expone el apiKey (con userId). */
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

/** Respuesta JSON con CORS + cabeceras de rate limit. */
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
