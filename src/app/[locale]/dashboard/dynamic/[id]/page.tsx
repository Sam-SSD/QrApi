import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, FileDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildRedirectUrl } from "@/lib/dynamic-qr/redirect-url";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ScanChart,
  type ScanChartPoint,
} from "@/components/dashboard/scan-chart";
import { DynamicPasswordForm } from "@/components/dashboard/dynamic-password-form";

const RANGES = [7, 30, 90] as const;

/** Aggregates timestamps per day (UTC) over the last `days` days. */
function aggregateByDay(
  timestamps: Date[],
  locale: string,
  now: Date,
  days: number,
): ScanChartPoint[] {
  const fmt = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
  });
  const counts = new Map<string, number>();
  for (const ts of timestamps) {
    const key = ts.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const points: ScanChartPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 86_400_000);
    const key = day.toISOString().slice(0, 10);
    points.push({ label: fmt.format(day), count: counts.get(key) ?? 0 });
  }
  return points;
}

function BreakdownTable({
  title,
  rows,
  total,
}: {
  title: string;
  rows: Array<{ label: string; count: number }>;
  total: number;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">—</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => {
            const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
            return (
              <li key={row.label} className="flex items-center gap-3 text-sm">
                <span className="w-24 truncate">{row.label}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas-subtle">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="w-14 text-right font-mono text-xs text-muted-foreground">
                  {row.count} · {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default async function DynamicQrDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ days?: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null; // the layout already redirects
  const t = await getTranslations("dashboard.dynamic");

  const { days: daysParam } = await searchParams;
  const days = (RANGES as readonly number[]).includes(Number(daysParam))
    ? Number(daysParam)
    : 30;

  // Ownership in the query itself: someone else's id is a 404, not a 403.
  const dynamic = await prisma.dynamicQr.findUnique({
    where: { id, userId: session.user.id },
  });
  if (!dynamic) notFound();

  const now = new Date();
  const since = new Date(now.getTime() - (days - 1) * 86_400_000);
  since.setUTCHours(0, 0, 0, 0);

  const [recentScans, byCountry, byDevice] = await Promise.all([
    prisma.scanEvent.findMany({
      where: { dynamicQrId: dynamic.id, timestamp: { gte: since } },
      select: { timestamp: true },
    }),
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

  const points = aggregateByDay(
    recentScans.map((s) => s.timestamp),
    locale,
    now,
    days,
  );
  const sortRows = (
    rows: Array<{ key: string | null; count: number }>,
  ): Array<{ label: string; count: number }> =>
    rows
      .map((r) => ({ label: r.key ?? t("unknown"), count: r.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

  const countryRows = sortRows(
    byCountry.map((r) => ({ key: r.country, count: r._count._all })),
  );
  const deviceRows = sortRows(
    byDevice.map((r) => ({ key: r.deviceType, count: r._count._all })),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/dynamic"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          {t("back")}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            {dynamic.title}
          </h2>
          <Badge variant={dynamic.active ? "default" : "outline"}>
            {dynamic.active ? t("statusActive") : t("statusPaused")}
          </Badge>
        </div>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {buildRedirectUrl(dynamic.slug)} → {dynamic.targetUrl}
        </p>
      </div>

      {/* Rango + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="radiogroup"
          aria-label={t("rangeLabel")}
          className="flex gap-1.5"
        >
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/dashboard/dynamic/${dynamic.id}?days=${r}`}
              role="radio"
              aria-checked={days === r}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                days === r
                  ? "border-primary/50 bg-brand-soft text-primary"
                  : "border-line text-muted-foreground hover:border-line-strong hover:text-foreground",
              )}
            >
              {t("rangeDays", { days: r })}
            </Link>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" asChild>
          <a href={`/api/export/scans/${dynamic.id}`} download>
            <FileDown className="size-4" strokeWidth={1.75} />
            {t("exportCsv")}
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-sm text-muted-foreground">{t("totalScans")}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {dynamic.scanCount}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-sm text-muted-foreground">
            {t("scansLastDays", { days })}
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {recentScans.length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <h3 className="mb-3 text-sm font-semibold">
          {t("chartTitle", { days })}
        </h3>
        <ScanChart points={points} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BreakdownTable
          title={t("byCountry")}
          rows={countryRows}
          total={dynamic.scanCount}
        />
        <BreakdownTable
          title={t("byDevice")}
          rows={deviceRows}
          total={dynamic.scanCount}
        />
      </div>

      <DynamicPasswordForm
        id={dynamic.id}
        hasPassword={Boolean(dynamic.passwordHash)}
      />
    </div>
  );
}
