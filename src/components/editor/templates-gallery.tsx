"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TEMPLATE_CATEGORIES, TEMPLATES } from "@/lib/qr/templates";
import type { QrTemplate } from "@/lib/qr/templates";
import { buildPayload } from "@/lib/qr/payloads";
import { renderQrSvg } from "@/lib/qr/render-svg";
import { useQrStore } from "@/stores/qr-store";

interface TemplatePreview {
  template: QrTemplate;
  svg: string | null;
}

export function TemplatesGallery({
  open,
  onOpenChange,
  side = "right",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "right" | "bottom";
}) {
  const t = useTranslations("editor.templates");
  const applyTemplate = useQrStore((s) => s.applyTemplate);

  const groups = useMemo(() => {
    const previews: TemplatePreview[] = TEMPLATES.map((template) => {
      try {
        return {
          template,
          svg: renderQrSvg(buildPayload(template.payload), template.config),
        };
      } catch {
        return { template, svg: null };
      }
    });
    return TEMPLATE_CATEGORIES.map((category) => ({
      category,
      items: previews.filter(({ template }) => template.category === category),
    })).filter((group) => group.items.length > 0);
  }, []);

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
        <div className="flex flex-col gap-6 p-4">
          {groups.map(({ category, items }) => (
            <section key={category} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t(`categories.${category}`)}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {items.map(({ template, svg }) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      applyTemplate(template);
                      onOpenChange(false);
                    }}
                    className="group flex flex-col gap-2 rounded-lg border border-line bg-surface p-3 text-left transition-all duration-150 hover:border-primary/40 hover:ring-1 hover:shadow-raised hover:ring-primary/30"
                  >
                    {svg && (
                      <div
                        aria-hidden="true"
                        className="aspect-square overflow-hidden rounded-md bg-white transition-transform duration-150 group-hover:scale-[1.02] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: svg }}
                      />
                    )}
                    <span className="flex items-center justify-between gap-1">
                      <span className="truncate text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                        {t(`names.${template.id}`)}
                      </span>
                      <Badge
                        variant="outline"
                        className="shrink-0 font-mono text-[10px] uppercase"
                      >
                        {template.payload.type}
                      </Badge>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
