import { headers } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QrGrid, type SavedQr } from "@/components/dashboard/qr-grid";
import { MigrateHistoryBanner } from "@/components/dashboard/migrate-history-banner";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null; // el layout ya redirige

  const rows = await prisma.qrCode.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const items: SavedQr[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    data: row.data,
    config: row.config as SavedQr["config"],
    createdAt: row.createdAt.getTime(),
  }));

  return (
    <>
      <MigrateHistoryBanner />
      <QrGrid items={items} />
    </>
  );
}
