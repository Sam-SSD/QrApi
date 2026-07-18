"use client";

import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { renderQrSvg } from "@/lib/qr/render-svg";
import { useQrStore } from "@/stores/qr-store";
import type { HistoryItem } from "@/hooks/use-qr-history";

function HistoryCard({
  item,
  onLoad,
  onRemove,
}: {
  item: HistoryItem;
  onLoad: () => void;
  onRemove: () => void;
}) {
  const format = useFormatter();
  const svg = useMemo(() => {
    try {
      return renderQrSvg(item.data, item.config);
    } catch {
      return null;
    }
  }, [item]);

  return (
    <div className="group relative flex flex-col gap-2 rounded-lg border border-line bg-surface p-3">
      <button
        type="button"
        onClick={onLoad}
        className="flex flex-col gap-2 text-left"
      >
        {svg && (
          <div
            aria-hidden="true"
            className="overflow-hidden rounded-md [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="font-mono text-[10px] uppercase">
            {item.type}
          </Badge>
          <span className="text-[10px] text-ink-faint">
            {format.relativeTime(item.createdAt)}
          </span>
        </div>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 size-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        aria-label="Eliminar"
      >
        <Trash2 className="size-3.5 text-destructive" strokeWidth={1.75} />
      </Button>
    </div>
  );
}

export function HistoryDrawer({
  open,
  onOpenChange,
  side = "right",
  items,
  onRemove,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "right" | "bottom";
  items: HistoryItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const t = useTranslations("editor.history");
  const loadSnapshot = useQrStore((s) => s.loadSnapshot);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={
          side === "bottom"
            ? "max-h-[80dvh] overflow-y-auto"
            : "w-96 overflow-y-auto sm:max-w-md"
        }
      >
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("subtitle")}</SheetDescription>
        </SheetHeader>
        {items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 p-4">
              {items.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onLoad={() => {
                    loadSnapshot({
                      type: item.type,
                      fields: item.fields,
                      config: item.config,
                    });
                    onOpenChange(false);
                  }}
                  onRemove={() => onRemove(item.id)}
                />
              ))}
            </div>
            <div className="px-4 pb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
                onClick={onClear}
              >
                <Trash2 className="size-4" strokeWidth={1.75} />
                {t("clearAll")}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
