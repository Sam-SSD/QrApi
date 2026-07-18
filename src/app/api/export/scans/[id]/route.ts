import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Escapa un valor CSV (comas, comillas y saltos de línea). */
function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/**
 * Exporta el historial de escaneos de un QR dinámico propio como CSV.
 * Autenticado por sesión (se usa desde el panel).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in required" } },
      { status: 401 },
    );
  }
  const { id } = await params;

  const dynamic = await prisma.dynamicQr.findUnique({
    where: { id, userId: session.user.id }, // ownership
    select: { id: true, slug: true },
  });
  if (!dynamic) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Dynamic QR not found" } },
      { status: 404 },
    );
  }

  const scans = await prisma.scanEvent.findMany({
    where: { dynamicQrId: dynamic.id },
    orderBy: { timestamp: "desc" },
    select: {
      timestamp: true,
      country: true,
      deviceType: true,
      os: true,
      browser: true,
      referrer: true,
    },
  });

  const lines = [
    ["timestamp", "country", "deviceType", "os", "browser", "referrer"].join(","),
    ...scans.map((s) =>
      [
        s.timestamp.toISOString(),
        s.country ?? "",
        s.deviceType ?? "",
        s.os ?? "",
        s.browser ?? "",
        csvEscape(s.referrer ?? ""),
      ].join(","),
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="scans-${dynamic.slug}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
