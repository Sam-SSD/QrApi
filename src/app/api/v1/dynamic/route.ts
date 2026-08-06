import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  CORS_HEADERS,
  authenticateApi,
  errorResponse,
  jsonResponse,
  readJsonBody,
} from "@/lib/api-helpers";
import { createUniqueDynamicQr } from "@/lib/dynamic-qr/create";
import { buildRedirectUrl, httpUrl } from "@/lib/dynamic-qr/redirect-url";

export const runtime = "nodejs";

const MAX_DYNAMIC_QRS = 100;

const createBodySchema = z.object({
  title: z.string().min(1).max(80),
  targetUrl: httpUrl,
});

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/** Creates a dynamic QR. The QR image is obtained via GET /api/v1/qr?data={redirectUrl}. */
export async function POST(request: NextRequest) {
  const auth = await authenticateApi(request);
  if (auth.response) return auth.response;

  const read = await readJsonBody(request);
  if (read.response) return read.response;

  const parsed = createBodySchema.safeParse(read.body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "invalid_body",
      "Invalid body",
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const count = await prisma.dynamicQr.count({
    where: { userId: auth.apiKey.userId },
  });
  if (count >= MAX_DYNAMIC_QRS) {
    return errorResponse(403, "limit_reached", "Dynamic QR limit reached");
  }

  const dynamic = await createUniqueDynamicQr({
    userId: auth.apiKey.userId,
    title: parsed.data.title,
    targetUrl: parsed.data.targetUrl,
  });

  return jsonResponse(
    {
      id: dynamic.id,
      slug: dynamic.slug,
      redirectUrl: buildRedirectUrl(dynamic.slug),
      targetUrl: dynamic.targetUrl,
      active: dynamic.active,
      createdAt: dynamic.createdAt.toISOString(),
    },
    auth.rate,
    201,
  );
}

/** Lists the dynamic QRs owned by the API key's user. */
export async function GET(request: NextRequest) {
  const auth = await authenticateApi(request);
  if (auth.response) return auth.response;

  const rows = await prisma.dynamicQr.findMany({
    where: { userId: auth.apiKey.userId },
    orderBy: { createdAt: "desc" },
  });

  return jsonResponse(
    {
      items: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        redirectUrl: buildRedirectUrl(row.slug),
        targetUrl: row.targetUrl,
        active: row.active,
        scanCount: row.scanCount,
        createdAt: row.createdAt.toISOString(),
      })),
    },
    auth.rate,
  );
}
