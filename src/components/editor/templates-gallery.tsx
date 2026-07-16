"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TEMPLATES } from "@/lib/qr/templates";
import { buildPayload } from "@/lib/qr/payloads";
import { renderQrSvg } from "@/lib/qr/render-svg";
import { useQrStore } from "@/stores/qr-store";

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

  const previews = useMemo(
    () =>
      TEMPLATES.map((template) => {
        try {
          return {
            template,
            svg: renderQrSvg(buildPayload(template.payload), template.config),
          };
        } catch {
          return { template, svg: null };
        }
      }),
    [],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={side === "bottom" ? "max-h-[80dvh] overflow-y-auto" : "w-96 overflow-y-auto sm:max-w-md"}
      >
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("subtitle")}</SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3 p-4">
          {previews.map(({ template, svg }) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                applyTemplate(template);
                onOpenChange(false);
              }}
              className="group flex flex-col gap-2 rounded-lg border border-line bg-surface p-3 text-left transition-all duration-150 hover:border-primary/40 hover:shadow-raised"
            >
              {svg && (
                <div
                  aria-hidden="true"
                  className="overflow-hidden rounded-md [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              )}
              <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                {t(`names.${template.id}`)}
              </span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
