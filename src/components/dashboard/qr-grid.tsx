"use client";

import { useMemo, useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Copy, Pencil, QrCode, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrExportMenu } from "./qr-export-menu";
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
import {
  payloadSchema,
  qrConfigSchema,
  type QrConfig,
} from "@/lib/qr/schema";
import { ApiRequestDialog } from "@/components/qr/api-request-dialog";
import {
  deleteQrCode,
  duplicateQrCode,
  renameQrCode,
} from "@/actions/qr-codes";

export interface SavedQr {
  id: string;
  name: string;
  type: string;
  data: string;
  /** { payload, config } exactly as stored in the DB. */
  config: { payload?: unknown; config?: unknown };
  createdAt: number;
}

function parseConfig(saved: SavedQr): QrConfig | null {
  const result = qrConfigSchema.safeParse(saved.config?.config ?? {});
  return result.success ? result.data : null;
}

function QrCardPreview({ item }: { item: SavedQr }) {
  const svg = useMemo(() => {
    const config = parseConfig(item);
    if (!config) return null;
    try {
      return renderQrSvg(item.data, config);
    } catch {
      return null;
    }
  }, [item]);

  if (!svg) return null;
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-md [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function QrCard({ item }: { item: SavedQr }) {
  const t = useTranslations("dashboard.qr");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [name, setName] = useState(item.name);

  const apiRequest = useMemo(() => {
    const config = parseConfig(item);
    if (!config) return null;
    const parsed = payloadSchema.safeParse(item.config?.payload);
    return { config, payload: parsed.success ? parsed.data : null };
  }, [item]);

  function commitRename() {
    const clean = name.trim();
    if (!clean || clean === item.name) {
      setName(item.name);
      return;
    }
    startTransition(async () => {
      try {
        await renameQrCode(item.id, clean);
        toast.success(t("renamed"));
      } catch {
        setName(item.name);
      }
    });
  }

  function getSvg(): string | null {
    const config = parseConfig(item);
    if (!config) return null;
    try {
      return renderQrSvg(item.data, config);
    } catch {
      return null;
    }
  }

  return (
    <div className="group flex flex-col gap-2.5 rounded-xl border border-line bg-surface p-3.5 transition-all duration-150 hover:border-line-strong hover:shadow-raised">
      <QrCardPreview item={item} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commitRename}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="w-full rounded-sm bg-transparent text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={item.name}
        disabled={pending}
      />
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="font-mono text-[10px]">
          {item.type}
        </Badge>
        <span className="text-[11px] text-ink-faint">
          {format.relativeTime(item.createdAt)}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 max-lg:opacity-100">
        <QrExportMenu
          getSvg={getSvg}
          filename={item.name}
          onCopyApiRequest={
            apiRequest ? () => setApiDialogOpen(true) : undefined
          }
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={t("edit")}
          asChild
        >
          <Link href={`/generator?edit=${item.id}`}>
            <Pencil className="size-4" strokeWidth={1.75} />
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={t("duplicate")}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await duplicateQrCode(item.id);
              toast.success(t("duplicated"));
            })
          }
        >
          <Copy className="size-4" strokeWidth={1.75} />
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

      {apiRequest && (
        <ApiRequestDialog
          open={apiDialogOpen}
          onOpenChange={setApiDialogOpen}
          payload={apiRequest.payload}
          data={item.data}
          config={apiRequest.config}
        />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription", { name: item.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                startTransition(async () => {
                  await deleteQrCode(item.id);
                  toast.success(t("deleted"));
                })
              }
            >
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function QrGrid({ items }: { items: SavedQr[] }) {
  const t = useTranslations("dashboard.qr");

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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <QrCard key={item.id} item={item} />
      ))}
    </div>
  );
}
