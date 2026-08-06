import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { RateLimitResult } from "@/lib/rate-limit";
import {
  CORS_HEADERS,
  authenticateApi,
  errorResponse,
  rateLimitHeaders,
  readJsonBody,
} from "@/lib/api-helpers";
import { renderQrSvg } from "@/lib/qr/render-svg";
import { rasterizeSvg } from "@/lib/qr/rasterize";
import { buildPayload } from "@/lib/qr/payloads";
import {
  DOT_STYLES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
  FRAME_STYLES,
  FRAME_POSITIONS,
  MAX_QR_DATA_LENGTH,
  hexColor,
  qrConfigSchema,
} from "@/lib/qr/schema";
import { formatSchema, postBodySchema, sizeSchema } from "@/lib/qr/api-schema";

export const runtime = "nodejs";

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
  // Frame (optional): applied only when frameStyle is present.
  frameStyle: z.enum(FRAME_STYLES).optional(),
  frameText: z.string().max(30).optional(),
  frameColor: hexColor.optional(),
  frameTextColor: hexColor.optional(),
  framePosition: z.enum(FRAME_POSITIONS).optional(),
});

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

  let buffer: Buffer;
  try {
    buffer = await rasterizeSvg(svg, format);
  } catch {
    // sharp rejects oversized embedded images and times out on expensive ones.
    // Without this the throw escapes as HTML with no CORS headers, so browser
    // clients see an opaque CORS failure instead of the documented error shape.
    return errorResponse(
      422,
      "render_failed",
      "The QR could not be rasterized: the embedded logo or background image is too large",
    );
  }
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
  const auth = await authenticateApi(request);
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
      ...(p.cornersDotStyle
        ? { cornersDot: { style: p.cornersDotStyle } }
        : {}),
      background: { color: p.bgColor, transparent: p.transparent ?? false },
    },
    ...(p.frameStyle
      ? {
          frame: {
            style: p.frameStyle,
            ...(p.frameText !== undefined ? { text: p.frameText } : {}),
            ...(p.frameColor ? { color: p.frameColor } : {}),
            ...(p.frameTextColor ? { textColor: p.frameTextColor } : {}),
            ...(p.framePosition ? { position: p.framePosition } : {}),
          },
        }
      : {}),
  });

  return respondWithQr(p.data, config, p.format, p.size, auth.rate);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApi(request);
  if (auth.response) return auth.response;

  const read = await readJsonBody(request);
  if (read.response) return read.response;

  const parsed = postBodySchema.safeParse(read.body);
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
