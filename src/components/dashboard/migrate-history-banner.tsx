"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpFromLine, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { importHistory } from "@/actions/qr-codes";
import type { HistoryItem } from "@/hooks/use-qr-history";

const STORAGE_KEY = "qrapi:history";
// pre-rebrand key: read as a fallback and cleared on migration
const LEGACY_STORAGE_KEY = "qrforge:history";
const DISMISS_KEY = "qrapi:history-migration-dismissed";

export function MigrateHistoryBanner() {
  const t = useTranslations("dashboard.migrate");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
      const raw =
        localStorage.getItem(STORAGE_KEY) ??
        localStorage.getItem(LEGACY_STORAGE_KEY);
      const parsed: HistoryItem[] = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setItems(parsed);
        setVisible(true);
      }
    } catch {
      /* no history */
    }
  }, []);

  if (!visible) return null;

  function migrate() {
    startTransition(async () => {
      const payloadItems = items
        .map((item) => {
          const fieldValues = item.fields[item.type] ?? {};
          return {
            name: `${item.type} · ${new Date(item.createdAt).toLocaleDateString()}`,
            payload: { type: item.type, ...fieldValues },
            config: item.config,
          };
        })
        .filter(Boolean);
      const { imported } = await importHistory(payloadItems);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.setItem(DISMISS_KEY, "1");
      setVisible(false);
      toast.success(t("done", { count: imported }));
    });
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-brand-soft px-4 py-3">
      <p className="text-sm font-medium">
        {t("title", { count: items.length })}
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={migrate}>
          <ArrowUpFromLine className="size-4" strokeWidth={1.75} />
          {t("action")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={t("dismiss")}
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, "1");
            setVisible(false);
          }}
        >
          <X className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  );
}
