"use client";

import { useMemo, useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  BarChart3,
  Copy,
  Download,
  Link2,
  QrCode,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { renderQrSvg } from "@/lib/qr/render-svg";
import { exportQr } from "@/lib/qr/export";
import { qrConfigSchema } from "@/lib/qr/schema";
import { buildRedirectUrl } from "@/lib/dynamic-qr/redirect-url";
import {
  deleteDynamicQr,
  toggleDynamicActive,
  updateDynamicTarget,
} from "@/actions/dynamic-qr";

export interface DynamicQrItem {
  id: string;
  slug: string;
  title: string;
  targetUrl: string;
  active: boolean;
  scanCount: number;
  createdAt: number;
  /** Config visual del QrCode asociado (puede faltar). */
  config: unknown;
}

function useQrSvg(item: DynamicQrItem): string | null {
  return useMemo(() => {
    const parsed = qrConfigSchema.safeParse(item.config ?? {});
    if (!parsed.success) return null;
    try {
      return renderQrSvg(buildRedirectUrl(item.slug), parsed.data);
    } catch {
      return null;
    }
  }, [item.slug, item.config]);
}

function DynamicCard({ item }: { item: DynamicQrItem }) {
  const t = useTranslations("dashboard.dynamic");
  const format = useFormatter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [target, setTarget] = useState(item.targetUrl);
  const svg = useQrSvg(item);
  const redirectUrl = buildRedirectUrl(item.slug);

  function commitTarget() {
    const clean = target.trim();
    if (!clean || clean === item.targetUrl) {
      setTarget(item.targetUrl);
      return;
    }
    startTransition(async () => {
      try {
        await updateDynamicTarget(item.id, clean);
        toast.success(t("targetUpdated"));
      } catch {
        setTarget(item.targetUrl);
        toast.error(t("targetInvalid"));
      }
    });
  }

  async function handleDownload() {
    if (!svg) return;
    await exportQr(svg, "png", { width: 1024, filename: item.title });
  }

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-raised">
      <div className="flex items-start gap-3">
        {svg && (
          <div
            aria-hidden="true"
            className="w-24 shrink-0 overflow-hidden rounded-md [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold">{item.title}</span>
            <Switch
              checked={item.active}
              disabled={pending}
              aria-label={t("activeLabel")}
              onCheckedChange={(active) =>
                startTransition(async () => {
                  await toggleDynamicActive(item.id, active);
                  toast.success(active ? t("resumed") : t("paused"));
                })
              }
            />
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 truncate text-left font-mono text-xs text-primary hover:underline"
            onClick={() => {
              navigator.clipboard.writeText(redirectUrl);
              toast.success(t("linkCopied"));
            }}
          >
            <Copy className="size-3 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{redirectUrl}</span>
          </button>
          <div className="flex items-center gap-2 text-[11px] text-ink-faint">
            <Badge variant="outline" className="font-mono text-[10px]">
              {t("scanCount", { count: item.scanCount })}
            </Badge>
            <span>{format.relativeTime(item.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`target-${item.id}`}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <Link2 className="size-3.5" strokeWidth={1.75} />
          {t("targetLabel")}
        </label>
        <Input
          id={`target-${item.id}`}
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          onBlur={commitTarget}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          disabled={pending}
          className="h-8 font-mono text-xs"
          spellCheck={false}
        />
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
          asChild
        >
          <Link href={`/dashboard/dynamic/${item.id}`}>
            <BarChart3 className="size-4" strokeWidth={1.75} />
            {t("analytics")}
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={t("download")}
          onClick={handleDownload}
          disabled={!svg}
        >
          <Download className="size-4" strokeWidth={1.75} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto size-8 text-destructive hover:text-destructive"
          aria-label={t("deleteTitle")}
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="size-4" strokeWidth={1.75} />
        </Button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription", { name: item.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                startTransition(async () => {
                  await deleteDynamicQr(item.id);
                  toast.success(t("deleted"));
                })
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function DynamicQrList({ items }: { items: DynamicQrItem[] }) {
  const t = useTranslations("dashboard.dynamic");

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-primary">
          <QrCode className="size-7" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-medium">{t("empty")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("emptyHint")}</p>
        </div>
        <Button asChild>
          <Link href="/generator">{t("emptyCta")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <DynamicCard key={item.id} item={item} />
      ))}
    </div>
  );
}
