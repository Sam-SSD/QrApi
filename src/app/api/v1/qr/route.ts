import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyApiToken } from "@/lib/api-keys";
import { checkRateLimit, type RateLimitResult } from "@/lib/rate-limit";
import { renderQrSvg } from "@/lib/qr/render-svg";
import { rasterizeSvg } from "@/lib/qr/rasterize";
import { buildPayload } from "@/lib/qr/payloads";
import {
  DOT_STYLES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
  MAX_QR_DATA_LENGTH,
  hexColor,
  payloadSchema,
  qrConfigSchema,
} from "@/lib/qr/schema";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 1_000_000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

const formatSchema = z
  .enum(["png", "svg", "jpeg", "jpg"])
  .default("png")
  .transform((f) => (f === "jpg" ? "jpeg" : f));

const sizeSchema = z.coerce.number().int().min(64).max(2048).default(512);

const getQuerySchema = z.object({
  data: z.string().min(1).max(MAX_QR_DATA_LENGTH),
  format: formatSchema,
  size: sizeSchema,
  ecLevel: z.enum(["L", "M", "Q", "H"]).default("M"),
  margin: z.coerce.number().int().min(0).max(10).default(2),
  dotsStyle: z.enum(DOT_STYLES).default("square"),
  dotsColor: hexColor.default("#18181b"),
  bgColor: hexColor.default("#ffffff"),
  cornersSquareStyle: z.enum(CORNER_SQUARE_STYLES).optional(),
  cornersDotStyle: z.enum(CORNER_DOT_STYLES).optional(),
  transparent: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

const postBodySchema = z
  .object({
    data: z.string().min(1).max(MAX_QR_DATA_LENGTH).optional(),
    payload: payloadSchema.optional(),
    format: formatSchema,
    size: sizeSchema,
    ecLevel: qrConfigSchema.shape.ecLevel,
    margin: qrConfigSchema.shape.margin,
    style: qrConfigSchema.shape.style,
    logo: qrConfigSchema.shape.logo,
    frame: qrConfigSchema.shape.frame,
    effects: qrConfigSchema.shape.effects,
  })
  .refine((body) => Boolean(body.data) !== Boolean(body.payload), {
    message: "Provide exactly one of `data` or `payload`",
    path: ["data"],
  });

// ---------- Helpers de respuesta ----------

function errorResponse(
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

function rateLimitHeaders(rate: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(rate.limit),
    "X-RateLimit-Remaining": String(rate.remaining),
    "X-RateLimit-Reset": String(rate.resetAt),
  };
}

async function authenticate(request: NextRequest) {
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

  return { rate };
}

async function respondWithQr(
  data: string,
  config: z.infer<typeof qrConfigSchema>,
  format: "png" | "svg" | "jpeg",
  size: number,
  rate: RateLimitResult,
) {
  let svg: string;
  try {
    svg = renderQrSvg(data, config, { width: size });
  } catch {
    return errorResponse(
      422,
      "data_too_long",
      "The data does not fit in a QR code with the selected error correction level",
    );
  }

  const headers = {
    ...CORS_HEADERS,
    ...rateLimitHeaders(rate),
    "Cache-Control": "no-store",
  };

  if (format === "svg") {
    return new NextResponse(svg, {
      status: 200,
      headers: { ...headers, "Content-Type": "image/svg+xml" },
    });
  }

  const buffer = await rasterizeSvg(svg, format);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      ...headers,
      "Content-Type": format === "png" ? "image/png" : "image/jpeg",
      "Content-Length": String(buffer.byteLength),
    },
  });
}

// ---------- Handlers ----------

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (auth.response) return auth.response;

  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = getQuerySchema.safeParse(query);
  if (!parsed.success) {
    return errorResponse(
      400,
      "invalid_params",
      "Invalid query parameters",
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const p = parsed.data;
  const config = qrConfigSchema.parse({
    ecLevel: p.ecLevel,
    margin: p.margin,
    style: {
      dots: { style: p.dotsStyle, color: p.dotsColor },
      ...(p.cornersSquareStyle
        ? { cornersSquare: { style: p.cornersSquareStyle } }
        : {}),
      ...(p.cornersDotStyle ? { cornersDot: { style: p.cornersDotStyle } } : {}),
      background: { color: p.bgColor, transparent: p.transparent ?? false },
    },
  });

  return respondWithQr(p.data, config, p.format, p.size, auth.rate);
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return errorResponse(413, "body_too_large", "Body must be under 1 MB");
  }

  const auth = await authenticate(request);
  if (auth.response) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(415, "invalid_json", "Body must be valid JSON");
  }

  const parsed = postBodySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "invalid_body",
      "Invalid request body",
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const p = parsed.data;
  const data = p.payload ? buildPayload(p.payload) : p.data!;
  if (data.length > MAX_QR_DATA_LENGTH) {
    return errorResponse(
      422,
      "data_too_long",
      "Encoded payload exceeds QR capacity",
    );
  }

  const config = qrConfigSchema.parse({
    ecLevel: p.ecLevel,
    margin: p.margin,
    style: p.style,
    logo: p.logo,
    frame: p.frame,
    effects: p.effects,
  });

  return respondWithQr(data, config, p.format, p.size, auth.rate);
}
