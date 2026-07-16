import { headers } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ApiKeysSection,
  type ApiKeyRow,
} from "@/components/dashboard/api-keys-section";

export default async function ApiKeysPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const rows = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const keys: ApiKeyRow[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    createdAt: row.createdAt.getTime(),
    lastUsedAt: row.lastUsedAt?.getTime() ?? null,
    revoked: Boolean(row.revokedAt),
    requestCount: Number(row.requestCount),
  }));

  return <ApiKeysSection keys={keys} />;
}
