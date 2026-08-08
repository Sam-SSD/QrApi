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
import { buildRedirectUrl, httpUrl } from "@/lib/dynamic-qr/redirect-url";

export const runtime = "nodejs";

const patchBodySchema = z
  .object({
    targetUrl: httpUrl.optional(),
    active: z.boolean().optional(),
  })
  .refine((b) => b.targetUrl !== undefined || b.active !== undefined, {
    message: "Provide targetUrl and/or active",
  });

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/** Detail + analytics summary of an owned dynamic QR. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApi(request);
  if (auth.response) return auth.response;
  const { id } = await params;

  // Ownership in the query: someone else's id is a 404.
  const dynamic = await prisma.dynamicQr.findUnique({
    where: { id, userId: auth.apiKey.userId },
  });
  if (!dynamic) {
    return errorResponse(404, "not_found", "Dynamic QR not found");
  }

  const [byCountry, byDevice] = await Promise.all([
    prisma.scanEvent.groupBy({
      by: ["country"],
      where: { dynamicQrId: dynamic.id },
      _count: { _all: true },
    }),
    prisma.scanEvent.groupBy({
      by: ["deviceType"],
      where: { dynamicQrId: dynamic.id },
      _count: { _all: true },
    }),
  ]);

  const toRecord = (rows: Array<{ key: string | null; count: number }>) =>
    Object.fromEntries(
      rows
        .sort((a, b) => b.count - a.count)
        .map((r) => [r.key ?? "unknown", r.count]),
    );

  return jsonResponse(
    {
      id: dynamic.id,
      slug: dynamic.slug,
      title: dynamic.title,
      redirectUrl: buildRedirectUrl(dynamic.slug),
      targetUrl: dynamic.targetUrl,
      active: dynamic.active,
      createdAt: dynamic.createdAt.toISOString(),
      analytics: {
        totalScans: dynamic.scanCount,
        byCountry: toRecord(
          byCountry.map((r) => ({ key: r.country, count: r._count._all })),
        ),
        byDevice: toRecord(
          byDevice.map((r) => ({ key: r.deviceType, count: r._count._all })),
        ),
      },
    },
    auth.rate,
  );
}

/** Edits destination and/or active state without regenerating the code. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApi(request);
  if (auth.response) return auth.response;
  const { id } = await params;

  const read = await readJsonBody(request);
  if (read.response) return read.response;

  const parsed = patchBodySchema.safeParse(read.body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "invalid_body",
      "Invalid body",
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const result = await prisma.dynamicQr.updateMany({
    where: { id, userId: auth.apiKey.userId }, // ownership
    data: {
      ...(parsed.data.targetUrl !== undefined
        ? { targetUrl: parsed.data.targetUrl }
        : {}),
      ...(parsed.data.active !== undefined
        ? { active: parsed.data.active }
        : {}),
    },
  });
  if (result.count === 0) {
    return errorResponse(404, "not_found", "Dynamic QR not found");
  }

  const updated = await prisma.dynamicQr.findUnique({ where: { id } });
  return jsonResponse(
    {
      id,
      targetUrl: updated?.targetUrl,
      active: updated?.active,
    },
    auth.rate,
  );
}

/** Deletes an owned dynamic QR (and its scan history, by cascade). */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApi(request);
  if (auth.response) return auth.response;
  const { id } = await params;

  const result = await prisma.dynamicQr.deleteMany({
    where: { id, userId: auth.apiKey.userId },
  });
  if (result.count === 0) {
    return errorResponse(404, "not_found", "Dynamic QR not found");
  }
  return jsonResponse({ deleted: true }, auth.rate);
}
