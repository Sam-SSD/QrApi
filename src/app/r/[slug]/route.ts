import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUserAgent } from "@/lib/dynamic-qr/parse-ua";
import { hashIp } from "@/lib/dynamic-qr/ip-hash";
import { SITE_URL } from "@/lib/constants";

export const runtime = "nodejs";

/**
 * Redirección de un QR dinámico: /r/{slug} → targetUrl. El registro del escaneo
 * se hace en `after()`, tras emitir el 302, para no añadir latencia perceptible
 * a la redirección.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const dynamic = await prisma.dynamicQr.findUnique({
    where: { slug },
    select: {
      id: true,
      targetUrl: true,
      active: true,
      expiresAt: true,
    },
  });

  const notFound = () => NextResponse.redirect(new URL("/es", SITE_URL), 302);

  if (!dynamic || !dynamic.active) return notFound();
  if (dynamic.expiresAt && dynamic.expiresAt < new Date()) return notFound();

  // Registrar el escaneo sin bloquear la redirección.
  const ua = request.headers.get("user-agent");
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    null;
  const rawIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const referrer = request.headers.get("referer");

  after(async () => {
    const { deviceType, os, browser } = parseUserAgent(ua);
    try {
      await prisma.$transaction([
        prisma.scanEvent.create({
          data: {
            dynamicQrId: dynamic.id,
            country,
            deviceType,
            os,
            browser,
            referrer,
            ipHash: hashIp(rawIp),
          },
        }),
        prisma.dynamicQr.update({
          where: { id: dynamic.id },
          data: { scanCount: { increment: 1 } },
        }),
      ]);
    } catch {
      // El registro es best-effort: nunca debe afectar a la redirección.
    }
  });

  return NextResponse.redirect(dynamic.targetUrl, 302);
}
