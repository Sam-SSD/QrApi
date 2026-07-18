import { headers } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DynamicQrList,
  type DynamicQrItem,
} from "@/components/dashboard/dynamic-qr-list";

export default async function DynamicQrPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null; // el layout ya redirige

  const rows = await prisma.dynamicQr.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { qrCode: { select: { id: true, config: true } } },
  });

  const items: DynamicQrItem[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    targetUrl: row.targetUrl,
    active: row.active,
    scanCount: row.scanCount,
    createdAt: row.createdAt.getTime(),
    // Config visual guardada como { dynamic: true, config } en QrCode.config
    config:
      (row.qrCode?.config as { config?: unknown } | null)?.config ?? null,
    // Para el enlace de edición del diseño (null si se creó por API)
    qrCodeId: row.qrCode?.id ?? null,
  }));

  return <DynamicQrList items={items} />;
}
